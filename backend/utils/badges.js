const db = require('../config/database');
const logger = require('../config/logger');

/**
 * Automáticamente revisa y asigna insignias según criterios específicos.
 */
async function awardBadge(userId, badgeId) {
    try {
        const [badge] = await db.query('SELECT * FROM badges WHERE id = ?', [badgeId]);
        if (!badge) return null;

        // Intentar insertar la insignia (el UNIQUE KEY evitará duplicados)
        const result = await db.query(
            'INSERT IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)',
            [userId, badgeId]
        );

        if (result.affectedRows > 0) {
            logger.info(`Insignia otorgada: ${badge.name} al usuario ${userId}`);
            return { awarded: true, badge };
        }

        return { awarded: false, message: 'Ya tiene la insignia' };
    } catch (error) {
        logger.error(`Error al otorgar insignia ${badgeId} a usuario ${userId}:`, error);
        return { error: true };
    }
}

/**
 * Lógica para la insignia "Seguridad sin igual" 
 * (Descarga 1 recurso adicional)
 */
async function checkResourceBadge(userId) {
    try {
        // 1. Contar descargas del usuario
        const [downloads] = await db.query(
            "SELECT COUNT(*) as count FROM gamification_activities WHERE user_id = ? AND activity_type = 'resource_downloaded'",
            [userId]
        );

        if (downloads.count >= 1) {
            // Buscar la insignia por nombre o identificador único si lo tuviéramos
            const [badge] = await db.query("SELECT id FROM badges WHERE name = 'Seguridad sin igual' LIMIT 1");
            if (badge) {
                return await awardBadge(userId, badge.id);
            }
        }
        return null;
    } catch (error) {
        logger.error(`Error en checkResourceBadge para usuario ${userId}:`, error);
        return null;
    }
}

module.exports = {
    awardBadge,
    checkResourceBadge
};
