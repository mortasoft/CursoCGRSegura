const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { createNotification } = require('../utils/notifications');

/**
 * @route   GET /api/lessons/:id
 * @desc    Obtener detalles de una lección y progreso del usuario
 * @access  Private
 */
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const lessonId = req.params.id;
        const userId = req.user.id;

        // 1. Obtener la lección
        const [lesson] = await db.query(
            `SELECT l.*, m.title as module_title 
             FROM lessons l 
             JOIN modules m ON l.module_id = m.id 
             WHERE l.id = ? AND l.is_published = TRUE`,
            [lessonId]
        );

        if (!lesson) {
            return res.status(404).json({ error: 'Lección no encontrada' });
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
            'SELECT id FROM lessons WHERE module_id = ? AND order_index < ? AND is_published = TRUE ORDER BY order_index DESC LIMIT 1',
            [lesson.module_id, lesson.order_index]
        );

        const [nextLesson] = await db.query(
            'SELECT id FROM lessons WHERE module_id = ? AND order_index > ? AND is_published = TRUE ORDER BY order_index ASC LIMIT 1',
            [lesson.module_id, lesson.order_index]
        );

        res.json({
            success: true,
            lesson,
            progress,
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

        // Actualizar progreso
        await db.query(
            `UPDATE user_progress 
             SET status = 'completed', progress_percentage = 100, completed_at = NOW() 
             WHERE user_id = ? AND lesson_id = ?`,
            [userId, lessonId]
        );

        // Sumar puntos al usuario (Gamificación básica: 10 pts por lección)
        const pointsAwarded = 10;
        await db.query(
            `INSERT INTO user_points (user_id, points) 
             VALUES (?, ?) 
             ON DUPLICATE KEY UPDATE points = points + ?`,
            [userId, pointsAwarded, pointsAwarded]
        );

        await db.query(
            `INSERT INTO gamification_activities (user_id, type, points, reference_id) 
             VALUES (?, 'lesson_completed', ?, ?)`,
            [userId, pointsAwarded, lessonId]
        );

        // Generar notificación
        const [lessonInfo] = await db.query('SELECT title FROM lessons WHERE id = ?', [lessonId]);
        await createNotification(
            userId,
            'Lección Completada 📚',
            `Has finalizado con éxito: ${lessonInfo?.title}. ¡Sumaste ${pointsAwarded} puntos!`,
            'success',
            `/lessons/${lessonId}`
        );

        res.json({
            success: true,
            message: 'Lección completada',
            pointsAwarded
        });
    } catch (error) {
        console.error('Error al completar lección:', error);
        res.status(500).json({ error: 'Error al registrar progreso' });
    }
});

module.exports = router;
