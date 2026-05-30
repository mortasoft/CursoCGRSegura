const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { submitQuiz, createQuiz, updateQuiz, addQuizQuestion, updateQuizQuestion } = require('../validators/schemas');
const { validateRequest } = require('../middleware/validator');

/**
 * @route   GET /api/quizzes/:id
 * @desc    Obtener un quiz con sus preguntas y opciones
 * @access  Private
 */
router.get('/:id', authMiddleware, quizController.getQuizById);

/**
 * @route   GET /api/quizzes/:id/last-attempt
 * @desc    Obtener el último intento del usuario para un quiz
 * @access  Private
 */
router.get('/:id/last-attempt', authMiddleware, quizController.getLastAttempt);

/**
 * @route   POST /api/quizzes/:id/submit
 * @desc    Enviar respuestas de un quiz y calificar
 * @access  Private
 */
router.post('/:id/submit', authMiddleware, submitQuiz, validateRequest, quizController.submitQuiz);

// --- Admin Routes ---

/**
 * @route   POST /api/quizzes
 * @desc    Crear un nuevo quiz vinculado a una lección
 * @access  Private/Admin
 */
router.post('/', authMiddleware, adminMiddleware, createQuiz, validateRequest, quizController.createQuiz);

/**
 * @route   GET /api/quizzes/:id/admin
 * @desc    Obtener quiz completo para edición
 * @access  Private/Admin
 */
router.get('/:id/admin', authMiddleware, adminMiddleware, quizController.getQuizAdmin);

/**
 * @route   PUT /api/quizzes/:id
 * @desc    Actualizar datos básicos del quiz
 * @access  Private/Admin
 */
router.put('/:id', authMiddleware, adminMiddleware, updateQuiz, validateRequest, quizController.updateQuiz);

/**
 * @route   POST /api/quizzes/:id/questions
 * @desc    Agregar una pregunta a un quiz
 * @access  Private/Admin
 */
router.post('/:id/questions', authMiddleware, adminMiddleware, addQuizQuestion, validateRequest, quizController.addQuestion);

/**
 * @route   PUT /api/quizzes/questions/:questionId
 * @desc    Actualizar pregunta y sus opciones
 * @access  Private/Admin
 */
router.put('/questions/:questionId', authMiddleware, adminMiddleware, updateQuizQuestion, validateRequest, quizController.updateQuestion);

/**
 * @route   DELETE /api/quizzes/questions/:questionId
 * @desc    Eliminar pregunta
 * @access  Private/Admin
 */
router.delete('/questions/:questionId', authMiddleware, adminMiddleware, quizController.deleteQuestion);

/**
 * @route   DELETE /api/quizzes/:id
 * @desc    Eliminar quiz
 * @access  Private/Admin
 */
router.delete('/:id', authMiddleware, adminMiddleware, quizController.deleteQuiz);

module.exports = router;
