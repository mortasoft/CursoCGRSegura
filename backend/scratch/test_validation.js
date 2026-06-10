const { validationResult } = require('express-validator');
const schemas = require('../validators/schemas');
const { validateRequest } = require('../middleware/validator');
const AppError = require('../utils/appError');

// Helper para correr las cadenas de validacion sobre requests de prueba
async function runValidation(schema, req) {
    for (const middleware of schema) {
        await new Promise((resolve) => middleware(req, {}, resolve));
    }
    return validationResult(req);
}

async function runTests() {
    console.log('Iniciando pruebas unitarias de esquemas de validacion (Paso 3)...');

    // --- TEST 1: googleAuth (Auth) ---
    console.log('\n--- 1. Pruebas de Auth (googleAuth) ---');
    {
        // Caso Invalido: Credential vacia
        const req = { body: { credential: '' } };
        const errors = await runValidation(schemas.googleAuth, req);
        if (errors.isEmpty()) {
            throw new Error('googleAuth debio fallar con credential vacia');
        }
        console.log('OK: googleAuth rechazo correctamente credential vacia. Errores:', errors.array().map(e => e.msg));

        // Caso Valido
        const reqValid = { body: { credential: 'token_valido_123' } };
        const errorsValid = await runValidation(schemas.googleAuth, reqValid);
        if (!errorsValid.isEmpty()) {
            throw new Error('googleAuth debio pasar con credential valida');
        }
        console.log('OK: googleAuth acepto credential valida');
    }

    // --- TEST 2: sendMassNotification (Notifications) ---
    console.log('\n--- 2. Pruebas de Notificaciones (sendMassNotification) ---');
    {
        // Caso Invalido: sin titulo ni mensaje, y tipo invalido
        const req = { body: { type: 'invalido', link_url: 'no-es-url' } };
        const errors = await runValidation(schemas.sendMassNotification, req);
        const messages = errors.array().map(e => e.msg);
        if (errors.isEmpty() || messages.length < 4) {
            throw new Error('sendMassNotification debio fallar por multiples campos invalidos');
        }
        console.log('OK: sendMassNotification detecto multiples errores. Errores:', messages);

        // Caso Valido
        const reqValid = { 
            body: { 
                title: 'Alerta', 
                message: 'Mensaje de prueba', 
                type: 'info', 
                link_url: 'https://cgr.go.cr',
                filters: { department: 'Auditoria' }
            } 
        };
        const errorsValid = await runValidation(schemas.sendMassNotification, reqValid);
        if (!errorsValid.isEmpty()) {
            throw new Error('sendMassNotification debio pasar con campos validos');
        }
        console.log('OK: sendMassNotification acepto payload valido');
    }

    // --- TEST 3: createSurvey (Surveys) ---
    console.log('\n--- 3. Pruebas de Encuestas (createSurvey) ---');
    {
        // Caso Invalido: sin titulo, puntos negativos, y module_id no entero
        const req = { body: { points: -5, module_id: 'no-entero' } };
        const errors = await runValidation(schemas.createSurvey, req);
        const messages = errors.array().map(e => e.msg);
        if (errors.isEmpty() || messages.length < 3) {
            throw new Error('createSurvey debio fallar con puntos negativos y module_id invalido');
        }
        console.log('OK: createSurvey detecto errores correctamente. Errores:', messages);

        // Caso Valido
        const reqValid = { body: { title: 'Encuesta Clima', points: 15, module_id: 1 } };
        const errorsValid = await runValidation(schemas.createSurvey, reqValid);
        if (!errorsValid.isEmpty()) {
            throw new Error('createSurvey debio pasar con datos validos');
        }
        console.log('OK: createSurvey acepto payload valido');
    }

    // --- TEST 4: submitQuiz (Quizzes) ---
    console.log('\n--- 4. Pruebas de Evaluaciones (submitQuiz) ---');
    {
        // Caso Invalido: sin respuestas, tiempo negativo
        const req = { body: { timeSpent: -10 } };
        const errors = await runValidation(schemas.submitQuiz, req);
        const messages = errors.array().map(e => e.msg);
        if (errors.isEmpty() || messages.length < 2) {
            throw new Error('submitQuiz debio fallar por respuestas faltantes y tiempo negativo');
        }
        console.log('OK: submitQuiz detecto errores correctamente. Errores:', messages);

        // Caso Valido
        const reqValid = { body: { answers: { 1: 'A' }, timeSpent: 120, is_replay: false } };
        const errorsValid = await runValidation(schemas.submitQuiz, reqValid);
        if (!errorsValid.isEmpty()) {
            throw new Error('submitQuiz debio pasar con respuestas validas');
        }
        console.log('OK: submitQuiz acepto respuestas validas');
    }

    // --- TEST 5: remindIndividualAtRisk (Reports) ---
    console.log('\n--- 5. Pruebas de Reportes (remindIndividualAtRisk) ---');
    {
        // Caso Invalido: email invalido, progreso no numerico
        const req = { body: { email: 'no-email', progress: 'cincuenta' } };
        const errors = await runValidation(schemas.remindIndividualAtRisk, req);
        const messages = errors.array().map(e => e.msg);
        if (errors.isEmpty() || messages.length < 2) {
            throw new Error('remindIndividualAtRisk debio fallar por email y progreso invalidos');
        }
        console.log('OK: remindIndividualAtRisk detecto errores. Errores:', messages);

        // Caso Valido
        const reqValid = { body: { email: 'usuario@cgr.go.cr', progress: 15 } };
        const errorsValid = await runValidation(schemas.remindIndividualAtRisk, reqValid);
        if (!errorsValid.isEmpty()) {
            throw new Error('remindIndividualAtRisk debio pasar con email y progreso validos');
        }
        console.log('OK: remindIndividualAtRisk acepto payload valido');
    }

    // --- TEST 6: updateUserAdmin (Users) ---
    console.log('\n--- 6. Pruebas de Usuarios (updateUserAdmin) ---');
    {
        // Caso Invalido: rol invalido, is_active no booleano
        const req = { body: { role: 'invalido', is_active: 'si' } };
        const errors = await runValidation(schemas.updateUserAdmin, req);
        const messages = errors.array().map(e => e.msg);
        if (errors.isEmpty() || messages.length < 2) {
            throw new Error('updateUserAdmin debio fallar por rol e is_active invalidos');
        }
        console.log('OK: updateUserAdmin detecto errores. Errores:', messages);

        // Caso Valido
        const reqValid = { body: { role: 'analyst', is_active: true, first_name: 'Juan' } };
        const errorsValid = await runValidation(schemas.updateUserAdmin, reqValid);
        if (!errorsValid.isEmpty()) {
            throw new Error('updateUserAdmin debio pasar con rol e is_active validos');
        }
        console.log('OK: updateUserAdmin acepto payload valido');
    }

    // --- TEST 7: validateRequest Middleware ---
    console.log('\n--- 7. Prueba del Middleware validateRequest ---');
    {
        // 1. Crear un request invalido y correr la validacion para poblar los errores reales de express-validator
        const req = { body: { credential: '' } };
        await runValidation(schemas.googleAuth, req);

        // 2. Correr validateRequest y verificar que llame a next() con AppError 400 conteniendo los errores
        let nextCalledWithError = false;
        const res = {};
        validateRequest(req, res, (err) => {
            if (err instanceof AppError && err.statusCode === 400 && err.message.includes('credential: El token de credencial es requerido')) {
                nextCalledWithError = true;
            }
        });

        if (!nextCalledWithError) {
            throw new Error('validateRequest debio llamar a next() con un AppError 400 conteniendo los errores');
        }
        console.log('OK: validateRequest convirtio correctamente los errores de validacion en AppError 400');
    }

    console.log('\nTODAS LAS PRUEBAS DE ESQUEMAS DE VALIDACION SE COMPLETARON CON EXITO');
    process.exit(0);
}

runTests().catch(err => {
    console.error('\nERROR EN EJECUCION DE PRUEBAS:', err);
    process.exit(1);
});
