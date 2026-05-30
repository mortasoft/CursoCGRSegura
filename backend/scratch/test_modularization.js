const db = require('../config/database');
const notificationService = require('../services/notificationService');
const notificationController = require('../controllers/notificationController');
const surveyService = require('../services/surveyService');
const surveyController = require('../controllers/surveyController');
const reportsService = require('../services/reportsService');
const reportsController = require('../controllers/reportsController');
const AppError = require('../utils/appError');

async function runTests() {
    console.log('Iniciando pruebas de modularizacion (Paso 2)...');

    // Obtener un usuario de prueba
    const users = await db.query('SELECT id, role, email, department FROM users LIMIT 1');
    if (users.length === 0) {
        throw new Error('No hay usuarios en la base de datos para realizar las pruebas');
    }
    const testUser = users[0];
    console.log(`Usuario de prueba seleccionado: ID ${testUser.id}, Email ${testUser.email}`);

    // --- TEST 1: Notificaciones ---
    console.log('\n--- 1. Pruebas de Notificaciones ---');
    
    // Crear una notificacion para el usuario
    const created = await notificationService.createNotification(
        testUser.id,
        'Prueba de notificacion',
        'Mensaje de prueba para verificar modularizacion',
        'info'
    );
    if (!created) throw new Error('Error al crear notificacion de prueba');
    console.log('Notificacion de prueba creada correctamente');

    // Obtener notificaciones de usuario mediante controlador
    await new Promise((resolve, reject) => {
        const req = { user: { id: testUser.id } };
        const res = {
            json: (data) => {
                if (data.success && Array.isArray(data.notifications)) {
                    console.log(`OK: getNotifications retorno ${data.notifications.length} notificaciones`);
                    resolve();
                } else {
                    reject(new Error('getNotifications retorno estructura incorrecta'));
                }
            }
        };
        const next = (err) => reject(err || new Error('next() llamado con error'));
        notificationController.getNotifications(req, res, next);
    });

    // Obtener unread count mediante controlador
    await new Promise((resolve, reject) => {
        const req = { user: { id: testUser.id } };
        const res = {
            json: (data) => {
                if (data.success && typeof data.count === 'number') {
                    console.log(`OK: getUnreadCount retorno ${data.count} notificaciones no leidas`);
                    resolve();
                } else {
                    reject(new Error('getUnreadCount retorno estructura incorrecta'));
                }
            }
        };
        const next = (err) => reject(err || new Error('next() llamado con error'));
        notificationController.getUnreadCount(req, res, next);
    });

    // Enviar notificacion masiva filtrada (admin)
    await new Promise((resolve, reject) => {
        const req = {
            body: {
                title: 'Notificacion Masiva Test',
                message: 'Mensaje masivo de prueba',
                type: 'warning',
                filters: { role: testUser.role }
            }
        };
        const res = {
            json: (data) => {
                if (data.success && typeof data.targetCount === 'number') {
                    console.log(`OK: sendMassNotification enviada a ${data.targetCount} usuarios`);
                    resolve();
                } else {
                    reject(new Error('sendMassNotification retorno estructura incorrecta'));
                }
            }
        };
        const next = (err) => reject(err || new Error('next() llamado con error'));
        notificationController.sendMassNotification(req, res, next);
    });

    // --- TEST 2: Encuestas ---
    console.log('\n--- 2. Pruebas de Encuestas ---');

    // Obtener todas las encuestas
    await new Promise((resolve, reject) => {
        const req = {};
        const res = {
            json: (data) => {
                if (data.success && Array.isArray(data.surveys)) {
                    console.log(`OK: getAllSurveys retorno ${data.surveys.length} encuestas`);
                    resolve();
                } else {
                    reject(new Error('getAllSurveys retorno estructura incorrecta'));
                }
            }
        };
        const next = (err) => reject(err || new Error('next() llamado con error'));
        surveyController.getAllSurveys(req, res, next);
    });

    // Crear una encuesta temporal para probar el flujo de respuesta
    const surveyId = await surveyService.createSurvey({
        module_id: null,
        lesson_id: null,
        title: 'Encuesta Temporal de Prueba',
        description: 'Descripcion de prueba',
        points: 10
    });
    console.log(`Encuesta temporal creada con ID ${surveyId}`);

    // Agregar una pregunta a la encuesta
    const questionId = await surveyService.addQuestion(surveyId, {
        question_text: 'Como te parecio la leccion?',
        question_type: 'rating',
        is_required: true,
        order_index: 1,
        options: []
    });
    console.log(`Pregunta agregada con ID ${questionId}`);

    // Obtener encuesta por ID
    await new Promise((resolve, reject) => {
        const req = { params: { id: surveyId }, user: { id: testUser.id } };
        const res = {
            json: (data) => {
                if (data.success && data.survey && Array.isArray(data.questions)) {
                    console.log(`OK: getSurveyById retorno la encuesta "${data.survey.title}" con ${data.questions.length} preguntas`);
                    resolve();
                } else {
                    reject(new Error('getSurveyById retorno estructura incorrecta'));
                }
            }
        };
        const next = (err) => reject(err || new Error('next() llamado con error'));
        surveyController.getSurveyById(req, res, next);
    });

    // Enviar respuestas
    await new Promise((resolve, reject) => {
        const req = {
            params: { id: surveyId },
            user: { id: testUser.id },
            body: {
                answers: {
                    [questionId]: { text: '5', optionId: null }
                }
            }
        };
        const res = {
            json: (data) => {
                if (data.success && typeof data.pointsAwarded === 'number') {
                    console.log(`OK: submitSurvey procesado. Puntos otorgados: ${data.pointsAwarded}`);
                    resolve();
                } else {
                    reject(new Error('submitSurvey retorno estructura incorrecta'));
                }
            }
        };
        const next = (err) => {
            // Si ya la respondio en una corrida anterior, es aceptable
            if (err instanceof AppError && err.statusCode === 400 && err.message === 'Ya has completado esta encuesta') {
                console.log('OK: submitSurvey evito duplicacion correctamente');
                resolve();
            } else {
                reject(err || new Error('next() llamado con error'));
            }
        };
        surveyController.submitSurvey(req, res, next);
    });

    // Obtener analiticas de la encuesta
    await new Promise((resolve, reject) => {
        const req = { params: { id: surveyId } };
        const res = {
            json: (data) => {
                if (data.success && data.survey && Array.isArray(data.analytics)) {
                    console.log(`OK: getSurveyAnalytics retorno analiticas para la encuesta`);
                    resolve();
                } else {
                    reject(new Error('getSurveyAnalytics retorno estructura incorrecta'));
                }
            }
        };
        const next = (err) => reject(err || new Error('next() llamado con error'));
        surveyController.getSurveyAnalytics(req, res, next);
    });

    // Limpieza de encuesta temporal
    await db.query('DELETE FROM survey_answers WHERE question_id = ?', [questionId]);
    await db.query('DELETE FROM survey_questions WHERE id = ?', [questionId]);
    await db.query('DELETE FROM survey_responses WHERE survey_id = ?', [surveyId]);
    await db.query('DELETE FROM surveys WHERE id = ?', [surveyId]);
    console.log('Encuesta temporal y sus respuestas eliminadas.');

    // --- TEST 3: Reportes ---
    console.log('\n--- 3. Pruebas de Reportes ---');

    // Refrescar cache de reportes
    await new Promise((resolve, reject) => {
        const req = {};
        const res = {
            json: (data) => {
                if (data.success && data.summary) {
                    console.log('OK: refreshComplianceReport actualizo la cache de reportes');
                    resolve();
                } else {
                    reject(new Error('refreshComplianceReport retorno estructura incorrecta'));
                }
            }
        };
        const next = (err) => reject(err || new Error('next() llamado con error'));
        reportsController.refreshComplianceReport(req, res, next);
    });

    // Obtener reporte de cumplimiento
    await new Promise((resolve, reject) => {
        const req = {};
        const res = {
            json: (data) => {
                if (data.success && data.summary && Array.isArray(data.departments)) {
                    console.log(`OK: getComplianceReport retorno resumen. Total Staff: ${data.summary.totalStaff}`);
                    resolve();
                } else {
                    reject(new Error('getComplianceReport retorno estructura incorrecta'));
                }
            }
        };
        const next = (err) => reject(err || new Error('next() llamado con error'));
        reportsController.getComplianceReport(req, res, next);
    });

    console.log('\nTODAS LAS PRUEBAS DE MODULARIZACION SE COMPLETARON CON EXITO');
    process.exit(0);
}

runTests().catch(err => {
    console.error('\nERROR EN EJECUCION DE PRUEBAS:', err);
    process.exit(1);
});
