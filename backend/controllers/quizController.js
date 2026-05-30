const quizService = require('../services/quizService');
const { clearCache } = require('../middleware/cache');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

class QuizController {
    /**
     * Obtener una evaluación (quiz) por su ID con sus preguntas correspondientes
     */
    getQuizById = catchAsync(async (req, res, next) => {
        const quizId = req.params.id;
        const userId = req.user.id;
        // Recupera la informacion del quiz y sus preguntas
        const result = await quizService.getQuizById(quizId, userId);
        if (!result) return next(new AppError('Evaluación no encontrada', 404));
        res.json({ success: true, ...result });
    });

    /**
     * Obtener el último intento completado de un quiz por el usuario logueado
     */
    getLastAttempt = catchAsync(async (req, res, next) => {
        const userId = req.user.id;
        const quizId = req.params.id;
        // Busca las respuestas previas y la puntuacion del ultimo intento
        const result = await quizService.getLastAttempt(quizId, userId);
        if (!result) return res.json({ success: false, message: 'No hay intentos previos' });
        res.json({ success: true, results: result });
    });

    /**
     * Enviar y calificar un cuestionario
     */
    submitQuiz = catchAsync(async (req, res, next) => {
        const quizId = req.params.id;
        const userId = req.user.id;
        const isAdminView = req.user.role === 'admin' && req.headers['x-view-as-student'] !== 'true';

        // Limpiar caches de progreso, tableros y del propio cuestionario para el usuario
        await clearCache(`cache:/api/dashboard*u${userId}*`);
        await clearCache(`cache:/api/gamification/leaderboard*`);
        await clearCache(`cache:/api/modules*u${userId}*`);
        await clearCache(`cache:/api/lessons/*u${userId}*`);
        await clearCache(`cache:/api/quizzes/${quizId}*u${userId}*`);

        try {
            // Procesa y califica las respuestas del usuario
            const result = await quizService.submitQuiz(quizId, userId, req.body, isAdminView);
            res.json({ success: true, ...result });
        } catch (error) {
            return next(new AppError(error.message || 'Error al procesar los resultados', 400));
        }
    });

    /**
     * Crear un nuevo cuestionario vacío (Admin)
     */
    createQuiz = catchAsync(async (req, res, next) => {
        const quizId = await quizService.createQuiz(req.body);

        // Invalidar caches globales
        await clearCache('cache:/api/modules*');
        await clearCache('cache:/api/dashboard*');
        await clearCache('cache:/api/lessons*');

        res.status(201).json({ success: true, message: 'Quiz creado', quizId });
    });

    /**
     * Obtener el detalle de configuración de un quiz para el panel de administración (Admin)
     */
    getQuizAdmin = catchAsync(async (req, res, next) => {
        const quizId = req.params.id;
        // Recupera la configuracion del quiz junto con las respuestas correctas
        const result = await quizService.getQuizAdmin(quizId);
        if (!result) return next(new AppError('Quiz no encontrado', 404));
        res.json({ success: true, ...result });
    });

    /**
     * Actualizar la configuración general de un quiz (Admin)
     */
    updateQuiz = catchAsync(async (req, res, next) => {
        const quizId = req.params.id;
        await quizService.updateQuiz(quizId, req.body);

        // Limpiar caches
        await clearCache(`cache:/api/quizzes/${quizId}*`);
        await clearCache('cache:/api/modules*');
        await clearCache('cache:/api/dashboard*');
        await clearCache('cache:/api/lessons*');

        res.json({ success: true, message: 'Quiz actualizado' });
    });

    /**
     * Agregar una nueva pregunta a un quiz existente (Admin)
     */
    addQuestion = catchAsync(async (req, res, next) => {
        const quizId = req.params.id;
        // Inserta la pregunta y sus opciones correspondientes
        const questionId = await quizService.addQuestion(quizId, req.body);
        res.status(201).json({ success: true, questionId });
    });

    /**
     * Actualizar los datos de una pregunta específica (Admin)
     */
    updateQuestion = catchAsync(async (req, res, next) => {
        const questionId = req.params.questionId;
        // Actualiza el texto, puntaje, explicacion y opciones de la pregunta
        await quizService.updateQuestion(questionId, req.body);
        res.json({ success: true, message: 'Pregunta actualizada' });
    });

    /**
     * Eliminar una pregunta de un quiz (Admin)
     */
    deleteQuestion = catchAsync(async (req, res, next) => {
        const questionId = req.params.questionId;
        // Elimina la pregunta especifica (las opciones se eliminan por CASCADE en la BD)
        await quizService.deleteQuestion(questionId);
        res.json({ success: true, message: 'Pregunta eliminada' });
    });

    /**
     * Eliminar un quiz por completo (Admin)
     */
    deleteQuiz = catchAsync(async (req, res, next) => {
        const quizId = req.params.id;
        await quizService.deleteQuiz(quizId);

        // Limpiar caches
        await clearCache(`cache:/api/quizzes/${quizId}*`);
        await clearCache('cache:/api/modules*');
        await clearCache('cache:/api/dashboard*');
        await clearCache('cache:/api/lessons*');

        res.json({ success: true, message: 'Quiz eliminado' });
    });
}

module.exports = new QuizController();
