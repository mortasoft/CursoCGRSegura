const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de Multer para subida de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/course_content/';
        // Crear directorio si no existe
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Nombre único: timestamp-nombreOriginal
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB límite
    fileFilter: (req, file, cb) => {
        // Permitir documentos, imágenes y videos básicos
        const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx|ppt|pptx|xls|xlsx|mp4|webm|mp3|zip|rar/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Tipo de archivo no soportado.'));
    }
});

/**
 * @route   GET /api/content/lesson/:lessonId
 * @desc    Obtener todos los items de contenido de una lección
 * @access  Private
 */
router.get('/lesson/:lessonId', authMiddleware, async (req, res) => {
    try {
        const { lessonId } = req.params;
        const userId = req.user.id;
        const contents = await db.query(
            `SELECT lc.*, 
                asub.id as asub_id,
                asub.file_url as asub_file_url,
                asub.status as asub_status,
                asub.grade as asub_grade,
                asub.feedback as asub_feedback,
                asub.submitted_at as asub_submitted_at
             FROM lesson_contents lc
             LEFT JOIN assignment_submissions asub ON asub.content_id = lc.id AND asub.user_id = ?
             WHERE lc.lesson_id = ?
             ORDER BY lc.order_index ASC`,
            [userId, lessonId]
        );

        // Obtener IDs de quizzes aprobados por el usuario
        const passedQuizzes = await db.query(
            'SELECT DISTINCT quiz_id FROM quiz_attempts WHERE user_id = ? AND passed = TRUE',
            [userId]
        );
        const passedQuizIds = passedQuizzes.map(q => q.quiz_id);

        // Obtener intentos de quizzes
        const quizAttemptCounts = await db.query(
            'SELECT quiz_id, COUNT(*) as count FROM quiz_attempts WHERE user_id = ? GROUP BY quiz_id',
            [userId]
        );
        const attemptsMap = {};
        quizAttemptCounts.forEach(q => {
            attemptsMap[q.quiz_id] = q.count;
        });

        // Obtener max_attempts de los quizzes
        const quizMaxAttempts = await db.query('SELECT id, max_attempts FROM quizzes');
        const maxAttemptsMap = {};
        quizMaxAttempts.forEach(q => {
            maxAttemptsMap[q.id] = q.max_attempts;
        });

        // Parsear el campo JSON 'data'
        const parsedContents = contents.map(item => {
            let userSubmission = null;
            if (item.asub_id) {
                userSubmission = {
                    id: item.asub_id,
                    file_url: item.asub_file_url,
                    status: item.asub_status,
                    grade: item.asub_grade,
                    feedback: item.asub_feedback,
                    submitted_at: item.asub_submitted_at
                };
            }

            const itemData = typeof item.data === 'string' ? JSON.parse(item.data) : (item.data || {});

            // Determinar si este elemento específico está completado
            let isCompleted = false;
            let attemptsMade = 0;
            let maxAttempts = 3;

            if (item.content_type === 'quiz' && itemData.quiz_id) {
                const qId = parseInt(itemData.quiz_id);
                isCompleted = passedQuizIds.includes(qId);
                attemptsMade = attemptsMap[qId] || 0;
                maxAttempts = maxAttemptsMap[qId] || 3;
            } else if (item.content_type === 'assignment') {
                isCompleted = item.asub_status === 'approved';
            }

            return {
                id: item.id,
                lesson_id: item.lesson_id,
                title: item.title,
                content_type: item.content_type,
                data: itemData,
                order_index: item.order_index,
                points: item.points,
                is_required: item.is_required,
                submission: userSubmission,
                isCompleted,
                attemptsMade,
                maxAttempts
            };
        });

        res.json({ success: true, contents: parsedContents });
    } catch (error) {
        console.error('Error obteniendo contenidos:', error);
        res.status(500).json({ error: 'Error al cargar contenidos' });
    }
});

/**
 * @route   POST /api/content/assignment/:contentId/submit
 * @desc    Submit an assignment file for a lesson content
 * @access  Private
 */
router.post('/assignment/:contentId/submit', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        const { contentId } = req.params;
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({ error: 'Se requiere un archivo para la tarea' });
        }

        const fileUrl = `/uploads/course_content/${req.file.filename}`;

        // Verificar si ya existe un envío
        const [existing] = await db.query(
            'SELECT id FROM assignment_submissions WHERE content_id = ? AND user_id = ?',
            [contentId, userId]
        );

        if (existing) {
            // Actualizar envío existente
            await db.query(
                `UPDATE assignment_submissions 
                 SET file_url = ?, status = 'pending', submitted_at = NOW()
                 WHERE id = ?`,
                [fileUrl, existing.id]
            );
        } else {
            // Crear nuevo envío
            await db.query(
                `INSERT INTO assignment_submissions (content_id, user_id, file_url, status)
                 VALUES (?, ?, ?, 'pending')`,
                [contentId, userId, fileUrl]
            );
        }

        res.json({ success: true, message: 'Tarea enviada correctamente', file_url: fileUrl });
    } catch (error) {
        console.error('Error enviando tarea:', error);
        res.status(500).json({ error: 'Error al enviar tarea' });
    }
});

/**
 * @route   GET /api/content/assignments/all-submissions
 * @desc    Get all assignment submissions across all lessons
 * @access  Private/Admin
 */
router.get('/assignments/all-submissions', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const query = `
            SELECT 
                asub.id, asub.status, asub.grade, asub.feedback, asub.file_url, asub.submitted_at,
                u.first_name, u.last_name, u.email,
                lc.title as assignment_title, lc.id as content_id,
                l.title as lesson_title, l.id as lesson_id,
                m.title as module_title, m.id as module_id
            FROM assignment_submissions asub
            JOIN users u ON asub.user_id = u.id
            JOIN lesson_contents lc ON asub.content_id = lc.id
            JOIN lessons l ON lc.lesson_id = l.id
            JOIN modules m ON l.module_id = m.id
            ORDER BY asub.submitted_at DESC
        `;
        const submissions = await db.query(query);
        res.json({ success: true, submissions });
    } catch (error) {
        console.error('Error obteniendo todas las entregas:', error);
        res.status(500).json({ error: 'Error al cargar las entregas' });
    }
});

/**
 * @route   GET /api/content/assignment/:contentId/submissions
 * @desc    Get all submissions for an assignment
 * @access  Private/Admin
 */
router.get('/assignment/:contentId/submissions', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { contentId } = req.params;
        const submissions = await db.query(
            `SELECT asub.*, u.first_name, u.last_name, u.email 
             FROM assignment_submissions asub
             JOIN users u ON asub.user_id = u.id
             WHERE asub.content_id = ?
             ORDER BY asub.submitted_at DESC`,
            [contentId]
        );
        res.json({ success: true, submissions });
    } catch (error) {
        console.error('Error obteniendo entregas:', error);
        res.status(500).json({ error: 'Error al cargar entregas' });
    }
});

/**
 * @route   PUT /api/content/assignment/submission/:submissionId
 * @desc    Grade an assignment submission
 * @access  Private/Admin
 */
router.put('/assignment/submission/:submissionId', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { status, grade, feedback } = req.body;

        await db.query(
            `UPDATE assignment_submissions 
             SET status = ?, grade = ?, feedback = ?
             WHERE id = ?`,
            [status || 'pending', grade || 0, feedback || null, submissionId]
        );

        res.json({ success: true, message: 'Entrega evaluada correctamente' });
    } catch (error) {
        console.error('Error evaluando entrega:', error);
        res.status(500).json({ error: 'Error al evaluar entrega' });
    }
});

/**
 * @route   POST /api/content
 * @desc    Crear un nuevo item de contenido
 * @access  Private/Admin
 */
router.post('/', authMiddleware, adminMiddleware, upload.single('file'), async (req, res) => {
    try {
        const { lesson_id, title, content_type, data, order_index, is_required, points } = req.body;
        let contentData = data ? JSON.parse(data) : {};

        // Si hay archivo subido, agregarlo a contentData
        if (req.file) {
            contentData.file_url = `/uploads/course_content/${req.file.filename}`;
            contentData.original_name = req.file.originalname;
            contentData.mime_type = req.file.mimetype;
            contentData.size = req.file.size;
        }

        const result = await db.query(
            `INSERT INTO lesson_contents (lesson_id, title, content_type, data, order_index, is_required, points)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [lesson_id, title, content_type, JSON.stringify(contentData), order_index || 0, is_required ? 1 : 0, points || 0]
        );

        res.status(201).json({
            success: true,
            message: 'Contenido agregado correctamente',
            contentId: result.insertId,
            fileUrl: contentData.file_url
        });
    } catch (error) {
        console.error('Error creando contenido:', error);
        res.status(500).json({ error: 'Error al crear contenido' });
    }
});

/**
 * @route   PUT /api/content/:id
 * @desc    Actualizar un item de contenido
 * @access  Private/Admin
 */
router.put('/:id', authMiddleware, adminMiddleware, upload.single('file'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content_type, data, order_index, is_required, points } = req.body;

        // Obtener data existente para no perder lo que había si no se envía todo
        const [current] = await db.query('SELECT data FROM lesson_contents WHERE id = ?', [id]);
        if (!current) return res.status(404).json({ error: 'Contenido no encontrado' });

        let contentData = current.data ? (typeof current.data === 'string' ? JSON.parse(current.data) : current.data) : {};

        // Merge nueva data
        if (data) {
            const newData = JSON.parse(data);
            contentData = { ...contentData, ...newData };
        }

        // Si hay archivo nuevo, reemplazar
        if (req.file) {
            // TODO: Podríamos borrar el archivo anterior aquí
            contentData.file_url = `/uploads/course_content/${req.file.filename}`;
            contentData.original_name = req.file.originalname;
            contentData.mime_type = req.file.mimetype;
            contentData.size = req.file.size;
        }

        await db.query(
            `UPDATE lesson_contents 
             SET title = ?, content_type = ?, data = ?, order_index = ?, is_required = ?, points = ?
             WHERE id = ?`,
            [title, content_type, JSON.stringify(contentData), order_index, is_required ? 1 : 0, points || 0, id]
        );

        res.json({ success: true, message: 'Contenido actualizado correctamente' });
    } catch (error) {
        console.error('Error actualizando contenido:', error);
        res.status(500).json({ error: 'Error al actualizar contenido' });
    }
});

/**
 * @route   DELETE /api/content/:id
 * @desc    Eliminar un item de contenido
 * @access  Private/Admin
 */
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // Opcional: Borrar archivo físico si existe
        // const [item] = await db.query('SELECT data FROM lesson_contents WHERE id = ?', [id]);
        // ... lógica de borrado de archivo ...

        await db.query('DELETE FROM lesson_contents WHERE id = ?', [id]);
        res.json({ success: true, message: 'Contenido eliminado correctamente' });
    } catch (error) {
        console.error('Error eliminando contenido:', error);
        res.status(500).json({ error: 'Error al eliminar contenido' });
    }
});

/**
 * @route   POST /api/content/reorder
 * @desc    Reordenar items
 * @access  Private/Admin
 */
router.post('/reorder', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { items } = req.body; // Array de { id, order_index }

        for (const item of items) {
            await db.query('UPDATE lesson_contents SET order_index = ? WHERE id = ?', [item.order_index, item.id]);
        }

        res.json({ success: true, message: 'Orden actualizado' });
    } catch (error) {
        console.error('Error reordenando contenido:', error);
        res.status(500).json({ error: 'Error al reordenar' });
    }
});

module.exports = router;
