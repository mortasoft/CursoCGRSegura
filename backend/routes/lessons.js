const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { syncUserLevel, getSystemSettings } = require('../utils/gamification');

/**
 * @route   GET /api/lessons/:id
 * @desc    Obtener detalles de una lección y progreso del usuario
 * @access  Private
 */
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const lessonId = req.params.id;
        const userId = req.user.id;
        const isAdmin = req.user.role === 'admin' && req.headers['x-view-as-student'] !== 'true';

        // 1. Obtener la lección
        const [lesson] = await db.query(
            `SELECT l.*, m.title as module_title,
                (SELECT SUM(points) FROM lesson_contents WHERE lesson_id = l.id) as total_points
             FROM lessons l 
             JOIN modules m ON l.module_id = m.id 
             WHERE l.id = ? ${isAdmin ? '' : 'AND l.is_published = TRUE'}`,
            [lessonId]
        );

        if (!lesson) {
            return res.status(404).json({ error: 'Lección no encontrada' });
        }

        // 1.1 Validar si la lección está bloqueada (si hay lecciones obligatorias previas no completadas)
        const [prevMandatoryIncomplete] = await db.query(
            `SELECT l.id, l.title 
             FROM lessons l
             LEFT JOIN user_progress up ON l.id = up.lesson_id AND up.user_id = ?
             WHERE l.module_id = ? 
             AND l.order_index < ? 
             AND l.is_published = TRUE 
             AND l.is_optional = FALSE 
             AND (up.status IS NULL OR up.status != 'completed')
             ORDER BY l.order_index ASC LIMIT 1`,
            [userId, lesson.module_id, lesson.order_index]
        );

        if (prevMandatoryIncomplete && !isAdmin) {
            return res.status(403).json({
                error: 'Lección bloqueada',
                message: `Debes completar la lección "${prevMandatoryIncomplete.title}" para continuar.`,
                moduleId: lesson.module_id
            });
        }

        // 2. Obtener o crear progreso
        let [progress] = await db.query(
            'SELECT * FROM user_progress WHERE user_id = ? AND lesson_id = ?',
            [userId, lessonId]
        );

        if (!progress) {
            await db.query(
                `INSERT INTO user_progress (user_id, module_id, lesson_id, status, last_accessed) 
                 VALUES (?, ?, ?, 'in_progress', NOW())`,
                [userId, lesson.module_id, lessonId]
            );
            [progress] = await db.query(
                'SELECT * FROM user_progress WHERE user_id = ? AND lesson_id = ?',
                [userId, lessonId]
            );
        } else {
            // Actualizar última visita
            await db.query(
                'UPDATE user_progress SET last_accessed = NOW() WHERE id = ?',
                [progress.id]
            );
        }

        // 3. Obtener lección anterior y siguiente
        const [prevLesson] = await db.query(
            `SELECT id FROM lessons 
             WHERE module_id = ? AND order_index < ? ${isAdmin ? '' : 'AND is_published = TRUE'} 
             ORDER BY order_index DESC LIMIT 1`,
            [lesson.module_id, lesson.order_index]
        );

        const [nextLesson] = await db.query(
            `SELECT id FROM lessons 
             WHERE module_id = ? AND order_index > ? ${isAdmin ? '' : 'AND is_published = TRUE'} 
             ORDER BY order_index ASC LIMIT 1`,
            [lesson.module_id, lesson.order_index]
        );

        // 4. Obtener todas las lecciones del módulo con progreso
        const moduleLessons = await db.query(
            `SELECT l.id, l.title, l.order_index, l.is_optional, up.status,
                (SELECT SUM(points) FROM lesson_contents WHERE lesson_id = l.id) as total_points
             FROM lessons l
             LEFT JOIN user_progress up ON l.id = up.lesson_id AND up.user_id = ?
             WHERE l.module_id = ? ${isAdmin ? '' : 'AND l.is_published = TRUE'}
             ORDER BY l.order_index ASC`,
            [userId, lesson.module_id]
        );

        res.json({
            success: true,
            lesson,
            progress,
            moduleLessons,
            navigation: {
                prev: prevLesson?.id || null,
                next: nextLesson?.id || null
            }
        });
    } catch (error) {
        console.error('Error en lección:', error);
        res.status(500).json({ error: 'Error al cargar la lección' });
    }
});

/**
 * @route   POST /api/lessons/:id/complete
 * @desc    Marcar lección como completada
 * @access  Private
 */
router.post('/:id/complete', authMiddleware, async (req, res) => {
    try {
        const lessonId = req.params.id;
        const userId = req.user.id;

        const [lesson] = await db.query('SELECT module_id FROM lessons WHERE id = ?', [lessonId]);
        if (!lesson) return res.status(404).json({ error: 'Lección no encontrada' });

        // 1. Calcular puntos totales de la lección
        // (Suma de puntos de cada contenido + puntos base desde settings)
        const [contentPoints] = await db.query(
            'SELECT SUM(points) as total FROM lesson_contents WHERE lesson_id = ?',
            [lessonId]
        );

        const pointsAwarded = (parseInt(contentPoints?.total) || 0);

        // 2. Actualizar progreso con puntos ganados
        await db.query(
            `UPDATE user_progress 
             SET status = 'completed', 
                 progress_percentage = 100, 
                 completed_at = NOW(),
                 points_earned = ?
             WHERE user_id = ? AND lesson_id = ?`,
            [pointsAwarded, userId, lessonId]
        );

        // 3. Sumar puntos al balance total del usuario
        await db.query(
            `INSERT INTO user_points (user_id, points) 
             VALUES (?, ?) 
             ON DUPLICATE KEY UPDATE points = points + ?`,
            [userId, pointsAwarded, pointsAwarded]
        );

        await db.query(
            `INSERT INTO gamification_activities (user_id, activity_type, points_earned, reference_id) 
             VALUES (?, 'lesson_completed', ?, ?)`,
            [userId, pointsAwarded, lessonId]
        );

        // Sincronizar nivel
        const levelSync = await syncUserLevel(userId);

        // Obtener balance actualizado
        const [updatedStats] = await db.query(
            'SELECT points, level FROM user_points WHERE user_id = ?',
            [userId]
        );

        res.json({
            success: true,
            message: 'Lección completada',
            pointsAwarded,
            newBalance: updatedStats?.points || 0,
            newLevel: updatedStats?.level || 'Novato',
            levelUp: levelSync?.leveledUp || false,
            levelData: levelSync
        });
    } catch (error) {
        console.error('Error al completar lección:', error);
        res.status(500).json({ error: 'Error al registrar progreso' });
    }
});

/**
 * @route   POST /api/lessons
 * @desc    Crear nueva lección
 * @access  Private/Admin
 */
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { module_id, title, content, lesson_type, video_url, duration_minutes, order_index, is_published, is_optional } = req.body;

        const result = await db.query(
            `INSERT INTO lessons (module_id, title, content, lesson_type, video_url, duration_minutes, order_index, is_published, is_optional)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [module_id, title, content || null, lesson_type || 'reading', video_url || null, duration_minutes || 15, order_index, is_published || false, is_optional || false]
        );

        res.status(201).json({ success: true, lessonId: result.insertId });
    } catch (error) {
        console.error('Error creando lección:', error);
        res.status(500).json({ error: 'Error al crear lección' });
    }
});

/**
 * @route   PUT /api/lessons/:id
 * @desc    Actualizar lección
 * @access  Private/Admin
 */
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const {
            title,
            content = null,
            lesson_type = 'reading',
            video_url = null,
            duration_minutes = 15,
            order_index = 0,
            is_published = false,
            is_optional = false
        } = req.body;
        const lessonId = req.params.id;

        // Validar que los campos críticos no sean undefined
        if (!title || order_index === undefined || !lessonId) {
            return res.status(400).json({ error: 'Faltan campos obligatorios para actualizar la lección' });
        }

        await db.query(
            `UPDATE lessons 
             SET title = ?, content = ?, lesson_type = ?, video_url = ?, duration_minutes = ?, order_index = ?, is_published = ?, is_optional = ?
             WHERE id = ?`,
            [
                title,
                content ?? null,
                lesson_type ?? 'reading',
                video_url ?? null,
                duration_minutes ?? 15,
                order_index,
                is_published ?? false,
                is_optional ?? false,
                lessonId
            ]
        );

        res.json({ success: true, message: 'Lección actualizada' });
    } catch (error) {
        console.error('Error actualizando lección:', error);
        res.status(500).json({ error: 'Error al actualizar lección' });
    }
});

/**
 * @route   DELETE /api/lessons/:id
 * @desc    Eliminar lección
 * @access  Private/Admin
 */
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const lessonId = req.params.id;
        await db.query('DELETE FROM lessons WHERE id = ?', [lessonId]);
        res.json({ success: true, message: 'Lección eliminada' });
    } catch (error) {
        console.error('Error eliminando lección:', error);
        res.status(500).json({ error: 'Error al eliminar lección' });
    }
});

module.exports = router;
