const surveyService = require('../services/surveyService');
const { clearCache } = require('../middleware/cache');
const { syncUserLevel } = require('../services/gamificationService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

class SurveyController {
    /**
     * Obtener una encuesta por su ID
     */
    getSurveyById = catchAsync(async (req, res, next) => {
        const surveyId = req.params.id;
        const userId = req.user.id;

        const result = await surveyService.getSurveyById(surveyId, userId);
        if (!result) return next(new AppError('Encuesta no encontrada', 404));

        res.json({ success: true, ...result });
    });

    /**
     * Enviar respuestas de una encuesta
     */
    submitSurvey = catchAsync(async (req, res, next) => {
        const surveyId = req.params.id;
        const userId = req.user.id;
        const { answers } = req.body;

        const result = await surveyService.submitSurvey(surveyId, userId, answers);

        if (!result.success) {
            if (result.reason === 'already_completed') {
                return next(new AppError('Ya has completado esta encuesta', 400));
            }
            return next(new AppError('Error al procesar la encuesta', 500));
        }

        // Limpiar caché
        await clearCache(`cache:/api/lessons/*u${userId}*`);
        await clearCache(`cache:/api/dashboard*u${userId}*`);
        await clearCache(`cache:/api/modules*u${userId}*`);
        await clearCache('cache:/api/gamification/leaderboard*');

        // Sincronizar nivel
        const levelSync = await syncUserLevel(userId);

        res.json({
            success: true,
            message: 'Encuesta enviada correctamente',
            pointsAwarded: result.pointsAwarded,
            levelUp: levelSync?.leveledUp || false,
            newLevel: levelSync?.leveledUp ? levelSync.newLevel : levelSync?.currentLevel
        });
    });

    /**
     * Obtener todas las encuestas (Admin/Analyst)
     */
    getAllSurveys = catchAsync(async (req, res, next) => {
        const surveys = await surveyService.getAllSurveys();
        res.json({ success: true, surveys });
    });

    /**
     * Crear una encuesta (Admin)
     */
    createSurvey = catchAsync(async (req, res, next) => {
        const surveyId = await surveyService.createSurvey(req.body);
        res.status(201).json({ success: true, surveyId });
    });

    /**
     * Obtener encuesta y preguntas configuradas (Admin)
     */
    getQuizAdmin = catchAsync(async (req, res, next) => {
        const surveyId = req.params.id;
        const result = await surveyService.getQuizAdmin(surveyId);
        if (!result) return next(new AppError('Encuesta no encontrada', 404));

        res.json({ success: true, ...result });
    });

    /**
     * Actualizar una encuesta (Admin)
     */
    updateSurvey = catchAsync(async (req, res, next) => {
        const surveyId = req.params.id;
        await surveyService.updateSurvey(surveyId, req.body);
        res.json({ success: true, message: 'Encuesta actualizada' });
    });

    /**
     * Agregar una pregunta a una encuesta (Admin)
     */
    addQuestion = catchAsync(async (req, res, next) => {
        const surveyId = req.params.id;
        const questionId = await surveyService.addQuestion(surveyId, req.body);
        res.status(201).json({ success: true, questionId });
    });

    /**
     * Actualizar una pregunta (Admin)
     */
    updateQuestion = catchAsync(async (req, res, next) => {
        const questionId = req.params.questionId;
        await surveyService.updateQuestion(questionId, req.body);
        res.json({ success: true });
    });

    /**
     * Eliminar una pregunta (Admin)
     */
    deleteQuestion = catchAsync(async (req, res, next) => {
        const questionId = req.params.questionId;
        await surveyService.deleteQuestion(questionId);
        res.json({ success: true });
    });

    /**
     * Obtener respuestas de texto paginadas para una pregunta (Analyst/Admin)
     */
    getTextAnswers = catchAsync(async (req, res, next) => {
        const { questionId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';

        const result = await surveyService.getTextAnswers(questionId, page, limit, search);
        res.json({
            success: true,
            answers: result.answers,
            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages
            }
        });
    });

    /**
     * Eliminar una encuesta (Admin)
     */
    deleteSurvey = catchAsync(async (req, res, next) => {
        await surveyService.deleteSurvey(req.params.id);
        res.json({ success: true });
    });

    /**
     * Obtener analíticas de una encuesta (Analyst/Admin)
     */
    getSurveyAnalytics = catchAsync(async (req, res, next) => {
        const surveyId = req.params.id;
        const result = await surveyService.getSurveyAnalytics(surveyId);
        if (!result) return next(new AppError('Encuesta no encontrada', 404));

        res.json({
            success: true,
            survey: result.survey,
            analytics: result.analytics
        });
    });

    /**
     * Exportar resultados de encuesta a CSV (Analyst/Admin)
     */
    exportSurveyCSV = catchAsync(async (req, res, next) => {
        const surveyId = req.params.id;
        const data = await surveyService.getSurveyExportData(surveyId);

        if (!data) return next(new AppError('Encuesta no encontrada', 404));

        const responsesMap = {};
        data.rows.forEach(row => {
            if (!responsesMap[row.response_id]) {
                responsesMap[row.response_id] = {
                    usuario: row.usuario,
                    fecha: new Date(row.fecha).toISOString().split('T')[0],
                    respuestas: {}
                };
            }
            responsesMap[row.response_id].respuestas[row.question_id] = row.respuesta;
        });

        const BOM = '\ufeff';
        const headers = ['Usuario', 'Fecha', ...data.questions.map(q => q.question_text)];
        let csvContent = BOM + headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',') + '\n';

        Object.values(responsesMap).forEach(resp => {
            const rowData = [
                `"${resp.usuario}"`,
                `"${resp.fecha}"`,
                ...data.questions.map(q => {
                    const val = (resp.respuestas[q.id] || '').toString();
                    return `"${val.replace(/"/g, '""')}"`;
                })
            ];
            csvContent += rowData.join(',') + '\n';
        });

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=resultados_${data.title.replace(/[^a-z0-9]/gi, '_')}.csv`);
        res.status(200).send(csvContent);
    });

    /**
     * Obtener analíticas de encuesta asociadas a una lección
     */
    getSurveyAnalyticsByLesson = catchAsync(async (req, res, next) => {
        const lessonId = req.params.lessonId;
        const surveyId = await surveyService.getSurveyIdByLesson(lessonId);

        if (!surveyId) {
            return next(new AppError('No se encontró encuesta para esta lección', 404));
        }

        const result = await surveyService.getSurveyAnalytics(surveyId);
        if (!result) return next(new AppError('Encuesta no encontrada', 404));

        res.json({
            success: true,
            survey: result.survey,
            analytics: result.analytics
        });
    });

    /**
     * Exportar resultados de encuesta asociada a una lección a CSV
     */
    exportSurveyByLesson = catchAsync(async (req, res, next) => {
        const lessonId = req.params.lessonId;
        const surveyId = await surveyService.getSurveyIdByLesson(lessonId);

        if (!surveyId) {
            return next(new AppError('No se encontró encuesta para esta lección', 404));
        }

        req.params.id = surveyId;
        return this.exportSurveyCSV(req, res, next);
    });
}

module.exports = new SurveyController();
