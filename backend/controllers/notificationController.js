const notificationService = require('../services/notificationService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

class NotificationController {
    /**
     * @route   GET /api/notifications
     * @desc    Obtener todas las notificaciones del usuario
     */
    getNotifications = catchAsync(async (req, res, next) => {
        const userId = req.user.id;
        const notifications = await notificationService.getUserNotifications(userId);
        res.json({
            success: true,
            notifications
        });
    });

    /**
     * @route   GET /api/notifications/unread-count
     * @desc    Obtener conteo de notificaciones no leídas
     */
    getUnreadCount = catchAsync(async (req, res, next) => {
        const userId = req.user.id;
        const count = await notificationService.getUnreadCount(userId);
        res.json({
            success: true,
            count
        });
    });

    /**
     * @route   PUT /api/notifications/:id/read
     * @desc    Marcar una notificación como leída
     */
    markAsRead = catchAsync(async (req, res, next) => {
        const userId = req.user.id;
        const notificationId = req.params.id;
        await notificationService.markAsRead(notificationId, userId);
        res.json({ success: true, message: 'Notificación marcada como leída' });
    });

    /**
     * @route   PUT /api/notifications/read-all
     * @desc    Marcar todas las notificaciones como leídas
     */
    markAllAsRead = catchAsync(async (req, res, next) => {
        const userId = req.user.id;
        await notificationService.markAllAsRead(userId);
        res.json({ success: true, message: 'Todas las notificaciones marcadas como leídas' });
    });

    /**
     * @route   POST /api/notifications/send
     * @desc    Enviar notificaciones masivas (Admin)
     */
    sendMassNotification = catchAsync(async (req, res, next) => {
        const { title, message, type, link_url, filters } = req.body;

        if (!title || !message) {
            return next(new AppError('Título y mensaje son requeridos', 400));
        }

        const result = await notificationService.sendFilteredNotifications({
            title,
            message,
            type,
            link_url,
            filters
        });

        if (!result.success) {
            if (result.reason === 'no_users') {
                return next(new AppError('No se encontraron usuarios que coincidan con los filtros', 404));
            }
            return next(new AppError('Error al enviar las notificaciones', 500));
        }

        res.json({
            success: true,
            message: `Notificación enviada a ${result.count} usuarios`,
            targetCount: result.count
        });
    });
}

module.exports = new NotificationController();
