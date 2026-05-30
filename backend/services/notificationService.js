const db = require('../config/database');
const logger = require('../config/logger');

/**
 * Servicio para enviar notificaciones in-app
 */
class NotificationService {
    /**
     * Crea una notificación para un usuario
     * @param {number} userId - ID del usuario destino
     * @param {string} title - Título breve de la notificación
     * @param {string} message - Mensaje detallado
     * @param {string} type - 'info', 'success', 'warning', 'danger'
     * @param {string} linkUrl - URL opcional a donde redirige al hacer clic
     */
    async createNotification(userId, title, message, type = 'info', linkUrl = null) {
        try {
            await db.query(
                `INSERT INTO notifications (user_id, title, message, notification_type, link_url) 
                 VALUES (?, ?, ?, ?, ?)`,
                [userId, title, message, type, linkUrl]
            );
            return true;
        } catch (error) {
            logger.error('Error creating notification:', error);
            return false;
        }
    }

    /**
     * Crea notificaciones masivas
     * @param {Array<number>} userIds - Arreglo de IDs de usuarios
     */
    async createMassiveNotification(userIds, title, message, type = 'info', linkUrl = null) {
        if (!userIds || userIds.length === 0) return false;
        try {
            const values = userIds.map(id => [id, title, message, type, linkUrl]);
            await db.query(
                `INSERT INTO notifications (user_id, title, message, notification_type, link_url) 
                 VALUES ?`,
                [values]
            );
            return true;
        } catch (error) {
            logger.error('Error creating massive notifications:', error);
            return false;
        }
    }

    /**
     * Obtener todas las notificaciones de un usuario
     * @param {number} userId - ID del usuario
     */
    async getUserNotifications(userId) {
        return await db.query(
            `SELECT * FROM notifications 
             WHERE user_id = ? 
             ORDER BY created_at DESC 
             LIMIT 10`,
            [userId]
        );
    }

    /**
     * Obtener conteo de notificaciones no leídas de un usuario
     * @param {number} userId - ID del usuario
     */
    async getUnreadCount(userId) {
        const [result] = await db.query(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
            [userId]
        );
        return result ? result.count : 0;
    }

    /**
     * Marcar una notificación como leída
     * @param {number} notificationId - ID de la notificación
     * @param {number} userId - ID del usuario
     */
    async markAsRead(notificationId, userId) {
        return await db.query(
            'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = ? AND user_id = ?',
            [notificationId, userId]
        );
    }

    /**
     * Marcar todas las notificaciones como leídas
     * @param {number} userId - ID del usuario
     */
    async markAllAsRead(userId) {
        return await db.query(
            'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE user_id = ? AND is_read = FALSE',
            [userId]
        );
    }

    /**
     * Enviar notificaciones masivas filtradas
     * @param {object} params - Parámetros de envío
     */
    async sendFilteredNotifications({ title, message, type, link_url, filters }) {
        const connection = await db.pool.getConnection();
        try {
            await connection.beginTransaction();

            // Construir la consulta de usuarios basada en filtros
            let userQuery = 'SELECT id FROM users WHERE is_active = TRUE';
            let queryParams = [];

            if (filters) {
                if (filters.userIds && filters.userIds.length > 0) {
                    userQuery += ' AND id IN (?)';
                    queryParams.push(filters.userIds);
                } else {
                    if (filters.department) {
                        userQuery += ' AND department = ?';
                        queryParams.push(filters.department);
                    }
                    if (filters.role) {
                        userQuery += ' AND role = ?';
                        queryParams.push(filters.role);
                    }
                }
            }

            const [users] = await connection.query(userQuery, queryParams);

            if (users.length === 0) {
                await connection.rollback();
                return { success: false, reason: 'no_users' };
            }

            // Insertar notificaciones para cada usuario
            const insertQuery = `
                INSERT INTO notifications (user_id, title, message, notification_type, link_url, created_at)
                VALUES ?
            `;

            const now = new Date();
            const values = users.map(user => [
                user.id,
                title,
                message,
                type || 'info',
                link_url || null,
                now
            ]);

            await connection.query(insertQuery, [values]);

            await connection.commit();
            return { success: true, count: users.length };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = new NotificationService();
