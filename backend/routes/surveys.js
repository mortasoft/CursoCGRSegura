const express = require('express');
const router = express.Router();
const surveyController = require('../controllers/surveyController');
const { authMiddleware, adminMiddleware, analystMiddleware } = require('../middleware/auth');
const { submitSurvey, createSurvey, updateSurvey, addSurveyQuestion, updateSurveyQuestion } = require('../validators/schemas');
const { validateRequest } = require('../middleware/validator');

// --- Rutas de Usuario ---

/**
 * @route   GET /api/surveys/:id
 * @desc    Obtener una encuesta con sus preguntas y opciones
 * @access  Private
 */
router.get('/:id', authMiddleware, surveyController.getSurveyById);

/**
 * @route   POST /api/surveys/:id/submit
 * @desc    Enviar respuestas de una encuesta
 * @access  Private
 */
router.post('/:id/submit', authMiddleware, submitSurvey, validateRequest, surveyController.submitSurvey);


// --- Rutas de Admin / Analyst ---

/**
 * @route   GET /api/surveys
 * @desc    Obtener todas las encuestas con estadísticas de respuestas
 * @access  Private/Analyst
 */
router.get('/', authMiddleware, analystMiddleware, surveyController.getAllSurveys);

/**
 * @route   POST /api/surveys
 * @desc    Crear una encuesta
 * @access  Private/Admin
 */
router.post('/', authMiddleware, adminMiddleware, createSurvey, validateRequest, surveyController.createSurvey);

/**
 * @route   GET /api/surveys/:id/admin
 * @desc    Obtener configuración de encuesta (Admin)
 * @access  Private/Admin
 */
router.get('/:id/admin', authMiddleware, adminMiddleware, surveyController.getQuizAdmin);

/**
 * @route   PUT /api/surveys/:id
 * @desc    Actualizar encuesta (Admin)
 * @access  Private/Admin
 */
router.put('/:id', authMiddleware, adminMiddleware, updateSurvey, validateRequest, surveyController.updateSurvey);

/**
 * @route   POST /api/surveys/:id/questions
 * @desc    Agregar pregunta (Admin)
 * @access  Private/Admin
 */
router.post('/:id/questions', authMiddleware, adminMiddleware, addSurveyQuestion, validateRequest, surveyController.addQuestion);

/**
 * @route   PUT /api/surveys/questions/:questionId
 * @desc    Actualizar pregunta (Admin)
 * @access  Private/Admin
 */
router.put('/questions/:questionId', authMiddleware, adminMiddleware, updateSurveyQuestion, validateRequest, surveyController.updateQuestion);

/**
 * @route   DELETE /api/surveys/questions/:questionId
 * @desc    Eliminar pregunta (Admin)
 * @access  Private/Admin
 */
router.delete('/questions/:questionId', authMiddleware, adminMiddleware, surveyController.deleteQuestion);

/**
 * @route   GET /api/surveys/questions/:questionId/text-answers
 * @desc    Obtener respuestas de texto paginadas para una pregunta
 * @access  Private/Analyst
 */
router.get('/questions/:questionId/text-answers', authMiddleware, analystMiddleware, surveyController.getTextAnswers);

/**
 * @route   DELETE /api/surveys/:id
 * @desc    Eliminar encuesta (Admin)
 * @access  Private/Admin
 */
router.delete('/:id', authMiddleware, adminMiddleware, surveyController.deleteSurvey);


// --- Rutas de Analíticas e Informes ---

/**
 * @route   GET /api/surveys/lesson/:lessonId/analytics
 * @desc    Obtener analíticas de encuesta asociadas a una lección
 * @access  Private/Analyst
 */
router.get('/lesson/:lessonId/analytics', authMiddleware, analystMiddleware, surveyController.getSurveyAnalyticsByLesson);

/**
 * @route   GET /api/surveys/lesson/:lessonId/export
 * @desc    Exportar resultados de encuesta asociada a una lección a CSV
 * @access  Private/Analyst
 */
router.get('/lesson/:lessonId/export', authMiddleware, analystMiddleware, surveyController.exportSurveyByLesson);

/**
 * @route   GET /api/surveys/:id/analytics
 * @desc    Obtener analíticas de una encuesta
 * @access  Private/Analyst
 */
router.get('/:id/analytics', authMiddleware, analystMiddleware, surveyController.getSurveyAnalytics);

/**
 * @route   GET /api/surveys/:id/export
 * @desc    Exportar resultados de encuesta a CSV
 * @access  Private/Analyst
 */
router.get('/:id/export', authMiddleware, analystMiddleware, surveyController.exportSurveyCSV);

module.exports = router;
