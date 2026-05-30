const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { sendMassNotification } = require('../validators/schemas');
const { validateRequest } = require('../middleware/validator');

/**
 * @route   GET /api/notifications
 * @desc    Obtener todas las notificaciones del usuario
 * @access  Private
 */
router.get('/', authMiddleware, notificationController.getNotifications);

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Obtener conteo de notificaciones no leídas
 * @access  Private
 */
router.get('/unread-count', authMiddleware, notificationController.getUnreadCount);

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Marcar una notificación como leída
 * @access  Private
 */
router.put('/:id/read', authMiddleware, notificationController.markAsRead);

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Marcar todas las notificaciones como leídas
 * @access  Private
 */
router.put('/read-all', authMiddleware, notificationController.markAllAsRead);

/**
 * @route   POST /api/notifications/send
 * @desc    Enviar notificaciones masivas (Admin)
 * @access  Private/Admin
 */
router.post('/send', authMiddleware, adminMiddleware, sendMassNotification, validateRequest, notificationController.sendMassNotification);

module.exports = router;
