const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

/**
 * @route   GET /api/notifications
 * @desc    Obtener todas las notificaciones del usuario
 * @access  Private
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await db.query(
            `SELECT * FROM notifications 
             WHERE user_id = ? 
             ORDER BY created_at DESC 
             LIMIT 50`,
            [userId]
        );

        res.json({
            success: true,
            notifications
        });
    } catch (error) {
        console.error('Error obteniendo notificaciones:', error);
        res.status(500).json({ error: 'Error al cargar notificaciones' });
    }
});

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Obtener conteo de notificaciones no leídas
 * @access  Private
 */
router.get('/unread-count', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const [result] = await db.query(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
            [userId]
        );

        res.json({
            success: true,
            count: result.count
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener conteo' });
    }
});

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Marcar una notificación como leída
 * @access  Private
 */
router.put('/:id/read', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const notificationId = req.params.id;

        await db.query(
            'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = ? AND user_id = ?',
            [notificationId, userId]
        );

        res.json({ success: true, message: 'Notificación marcada como leída' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar notificación' });
    }
});

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Marcar todas las notificaciones como leídas
 * @access  Private
 */
router.put('/read-all', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        await db.query(
            'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE user_id = ? AND is_read = FALSE',
            [userId]
        );

        res.json({ success: true, message: 'Todas las notificaciones marcadas como leídas' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar notificaciones' });
    }
});

module.exports = router;
