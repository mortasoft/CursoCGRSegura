const express = require('express');
const router = express.Router();
const lessonContentController = require('../controllers/lessonContentController');
const { authMiddleware, adminMiddleware, analystMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(process.cwd(), 'uploads', 'course_content');
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, crypto.randomUUID() + path.extname(file.originalname).toLowerCase());
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|svg|pdf|doc|docx|ppt|pptx|xls|xlsx|mp4|webm|mp3|zip|rar/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Tipo de archivo no soportado.'));
    }
});

/**
 * @route   GET /api/content/lesson/:lessonId
 * @desc    Obtener todos los items de contenido de una lección
 * @access  Private
 */
router.get('/lesson/:lessonId', authMiddleware, lessonContentController.getLessonContents);

/**
 * @route   POST /api/content/assignment/:contentId/submit
 * @desc    Submit an assignment file for a lesson content
 * @access  Private
 */
router.post('/assignment/:contentId/submit', authMiddleware, upload.single('file'), lessonContentController.submitAssignment);

/**
 * @route   POST /api/content/:id/trace
 * @desc    Registrar progreso de un contenido (video/link)
 * @access  Private
 */
router.post('/:id/trace', authMiddleware, lessonContentController.trackProgress);

/**
 * @route   GET /api/content/assignments/all-submissions
 * @desc    Get all assignment submissions across all lessons
 * @access  Private/Admin
 */
router.get('/assignments/all-submissions', authMiddleware, adminMiddleware, lessonContentController.getAllSubmissions);

/**
 * @route   GET /api/content/interactions/all
 * @desc    Get all interactive responses from lessons
 * @access  Private/Analyst
 */
router.get('/interactions/all', authMiddleware, analystMiddleware, lessonContentController.getAllInteractions);

/**
 * @route   GET /api/content/assignment/:contentId/submissions
 * @desc    Get all submissions for an assignment
 * @access  Private/Admin
 */
router.get('/assignment/:contentId/submissions', authMiddleware, adminMiddleware, lessonContentController.getSubmissionsByContent);

/**
 * @route   PUT /api/content/assignment/submission/:submissionId
 * @desc    Grade an assignment submission
 * @access  Private/Admin
 */
router.put('/assignment/submission/:submissionId', authMiddleware, adminMiddleware, lessonContentController.gradeSubmission);

/**
 * @route   POST /api/content
 * @desc    Crear un nuevo item de contenido
 * @access  Private/Admin
 */
router.post('/', authMiddleware, adminMiddleware, upload.single('file'), lessonContentController.createContent);

/**
 * @route   PUT /api/content/:id
 * @desc    Actualizar un item de contenido
 * @access  Private/Admin
 */
router.put('/:id', authMiddleware, adminMiddleware, upload.single('file'), lessonContentController.updateContent);

/**
 * @route   DELETE /api/content/:id
 * @desc    Eliminar un item de contenido
 * @access  Private/Admin
 */
router.delete('/:id', authMiddleware, adminMiddleware, lessonContentController.deleteContent);

/**
 * @route   POST /api/content/reorder
 * @desc    Reordenar items
 * @access  Private/Admin
 */
router.post('/reorder', authMiddleware, adminMiddleware, lessonContentController.reorderContents);

/**
 * @route   GET /api/content/interactions/stats
 * @desc    Get aggregated statistics for multiple choice questions
 * @access  Private/Analyst
 */
router.get('/interactions/stats', authMiddleware, analystMiddleware, lessonContentController.getInteractionStats);


module.exports = router;
