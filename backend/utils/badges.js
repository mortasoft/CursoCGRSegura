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

/**
 * Lógica para la insignia "Se enciende la Racha" 
 * (Actividad por 2 días seguidos)
 */
async function checkStreakBadge(userId) {
    try {
        // Contar días distintos de actividad en los últimos 2 días (Hoy y Ayer)
        const [result] = await db.query(
            `SELECT COUNT(DISTINCT DATE(created_at)) as active_days 
             FROM gamification_activities 
             WHERE user_id = ? 
             AND DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 1 DAY)`,
            [userId]
        );

        if (result.active_days >= 2) {
            const [badge] = await db.query("SELECT id FROM badges WHERE name = 'Se enciende la Racha' LIMIT 1");
            if (badge) {
                return await awardBadge(userId, badge.id);
            }
        }
        return null;
    } catch (error) {
        logger.error(`Error en checkStreakBadge para usuario ${userId}:`, error);
        return null;
    }
}

/**
 * Lógica para la insignia "Club de la Velocidad"
 * (Terminar un módulo en X minutos)
 */
async function checkSpeedBadge(userId, moduleId) {
    try {
        // 1. Calcular el tiempo total desde que empezó la primera lección/actividad hasta ahora
        const [timeInfo] = await db.query(
            `SELECT MIN(created_at) as first_start FROM user_progress 
             WHERE user_id = ? AND module_id = ?`,
            [userId, moduleId]
        );

        if (!timeInfo || !timeInfo.first_start) return null;

        const startTime = new Date(timeInfo.first_start);
        const endTime = new Date();
        const diffMinutes = Math.abs(endTime - startTime) / (1000 * 60);

        logger.info(`Usuario ${userId} completó módulo ${moduleId} en ${diffMinutes.toFixed(2)} minutos`);

        // 2. Evaluar umbrales (según sugerencia del usuario)
        // Club I: <= 5 min
        // Club II: <= 10 min
        if (diffMinutes <= 5) {
            const [badge] = await db.query("SELECT id FROM badges WHERE name = 'Club de la Velocidad I' LIMIT 1");
            if (badge) return await awardBadge(userId, badge.id);
        } else if (diffMinutes <= 10) {
            const [badge] = await db.query("SELECT id FROM badges WHERE name = 'Club de la Velocidad II' LIMIT 1");
            if (badge) return await awardBadge(userId, badge.id);
        } else if (diffMinutes <= 20) {
            const [badge] = await db.query("SELECT id FROM badges WHERE name = 'Club de la Velocidad III' LIMIT 1");
            if (badge) return await awardBadge(userId, badge.id);
        }

        return null;
    } catch (error) {
        logger.error(`Error en checkSpeedBadge para usuario ${userId}:`, error);
        return null;
    }
}

/**
 * Lógica para la insignia "El inicio de la seguridad"
 * (Iniciar un módulo que no sea el 0)
 */
async function checkFirstModuleBadge(userId, moduleId) {
    try {
        // 1. Verificar si el módulo actual NO es el módulo 0
        const [moduleData] = await db.query("SELECT module_number FROM modules WHERE id = ?", [moduleId]);
        if (!moduleData || moduleData.module_number === 0) return null;

        // 2. Si es un módulo > 0, otorgar la insignia (awardBadge ya maneja duplicados)
        const [badge] = await db.query("SELECT id FROM badges WHERE name = 'El inicio de la seguridad' LIMIT 1");
        if (badge) {
            return await awardBadge(userId, badge.id);
        }
        return null;
    } catch (error) {
        logger.error(`Error en checkFirstModuleBadge para usuario ${userId}:`, error);
        return null;
    }
}

/**
 * Lógica para la insignia "Lo mejor de la Sabana"
 * (Completar 2 módulos en un mismo día, excluyendo el módulo 0)
 */
async function checkSabanaBadge(userId) {
    try {
        const [result] = await db.query(
            `SELECT COUNT(DISTINCT ga.reference_id) as count 
             FROM gamification_activities ga
             JOIN modules m ON ga.reference_id = m.id
             WHERE ga.user_id = ? 
             AND ga.activity_type = 'module_completed'
             AND DATE(ga.created_at) = CURDATE()
             AND m.module_number > 0`,
            [userId]
        );

        if (result.count >= 2) {
            const [badge] = await db.query("SELECT id FROM badges WHERE name = 'Lo mejor de la Sabana' LIMIT 1");
            if (badge) {
                return await awardBadge(userId, badge.id);
            }
        }
        return null;
    } catch (error) {
        logger.error(`Error en checkSabanaBadge para usuario ${userId}:`, error);
        return null;
    }
}

/**
 * Lógica para la insignia "Un gran poder lleva una gran seguridad"
 * (Terminar el módulo 1)
 */
async function checkModuleOneBadge(userId, moduleId) {
    try {
        const [moduleData] = await db.query("SELECT module_number FROM modules WHERE id = ?", [moduleId]);
        if (!moduleData || moduleData.module_number !== 1) return null;

        const [badge] = await db.query("SELECT id FROM badges WHERE name = 'Un gran poder lleva una gran seguridad' LIMIT 1");
        if (badge) {
            return await awardBadge(userId, badge.id);
        }
        return null;
    } catch (error) {
        logger.error(`Error en checkModuleOneBadge para usuario ${userId}:`, error);
        return null;
    }
}

/**
 * Revisa todas las insignias automáticas para un usuario.
 * @returns La primera insignia otorgada o null
 */
async function checkAllBadges(userId, extraData = {}) {
    try {
        // 1. Racha (Streak)
        const streak = await checkStreakBadge(userId);
        if (streak && streak.awarded) return streak;

        // 2. Descarga de recursos
        const resource = await checkResourceBadge(userId);
        if (resource && resource.awarded) return resource;

        // 3. Velocidad e Insignias de Módulo Específico (solo si es el momento de completitud)
        if (extraData.moduleId && extraData.isModuleCompletion) {
            // Club de la Velocidad
            const speed = await checkSpeedBadge(userId, extraData.moduleId);
            if (speed && speed.awarded) return speed;

            // Lo mejor de la Sabana (2 módulos en un día)
            const sabana = await checkSabanaBadge(userId);
            if (sabana && sabana.awarded) return sabana;

            // Módulo 1: Un gran poder...
            const mod1 = await checkModuleOneBadge(userId, extraData.moduleId);
            if (mod1 && mod1.awarded) return mod1;
        }

        // 4. Inicio de seguridad (al entrar a un módulo > 0)
        if (extraData.moduleId) {
            const start = await checkFirstModuleBadge(userId, extraData.moduleId);
            if (start && start.awarded) return start;
        }

        return null;
    } catch (error) {
        logger.error(`Error en checkAllBadges para usuario ${userId}:`, error);
        return null;
    }
}

module.exports = {
    awardBadge,
    checkResourceBadge,
    checkStreakBadge,
    checkSpeedBadge,
    checkFirstModuleBadge,
    checkSabanaBadge,
    checkModuleOneBadge,
    checkAllBadges
};
