const db = require('../config/database');
const logger = require('../config/logger');

/**
 * Crea una notificación para un usuario
 * @param {number} userId - ID del usuario
 * @param {string} title - Título de la notificación
 * @param {string} message - Mensaje detallado
 * @param {string} type - 'info', 'success', 'warning', 'danger'
 * @param {string} link - URL opcional para navegar al hacer clic
 */
const createNotification = async (userId, title, message, type = 'info', link = null) => {
    try {
        await db.query(
            `INSERT INTO notifications (user_id, title, message, notification_type, link_url) 
             VALUES (?, ?, ?, ?, ?)`,
            [userId, title, message, type, link]
        );
        logger.debug(`Notificación creada para usuario ${userId}: ${title}`);
        return true;
    } catch (error) {
        logger.error('Error al crear notificación:', error);
        return false;
    }
};

module.exports = {
    createNotification
};
