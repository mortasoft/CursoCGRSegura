const db = require('../config/database');

/**
 * Caché de niveles y settings para evitar consultas constantes a la BD
 */
let cachedLevels = null;
let cachedSettings = null;

/**
 * Obtiene los ajustes del sistema (puntos por lección, etc)
 */
const getSystemSettings = async (forceRefresh = false) => {
    try {
        if (!cachedSettings || forceRefresh) {
            const settingsRaw = await db.query('SELECT setting_key, setting_value FROM system_settings');
            const settings = {};
            settingsRaw.forEach(s => {
                settings[s.setting_key] = s.setting_value;
            });
            cachedSettings = {
                points_per_lesson: parseInt(settings.points_per_lesson) || 10,
                points_per_quiz: parseInt(settings.points_per_quiz) || 50,
                bonus_perfect_score: parseInt(settings.bonus_perfect_score) || 25
            };
        }
        return cachedSettings;
    } catch (error) {
        console.error('Error fetching system settings:', error);
        return {
            points_per_lesson: 10,
            points_per_quiz: 50,
            bonus_perfect_score: 25
        };
    }
};

/**
 * Obtiene los niveles definidos en el sistema (desde BD o fallback)
 */
const getLevels = async (forceRefresh = false) => {
    try {
        if (!cachedLevels || forceRefresh) {
            const levels = await db.query('SELECT name, min_points as minPoints, icon FROM gamification_levels ORDER BY min_points ASC');
            if (levels && levels.length > 0) {
                cachedLevels = levels;
            } else {
                // Fallback por si la tabla está vacía
                cachedLevels = [
                    { name: 'Novato', minPoints: 0, icon: 'Award' },
                    { name: 'Defensor', minPoints: 100, icon: 'Shield' },
                    { name: 'Guardián', minPoints: 500, icon: 'ShieldAlert' },
                    { name: 'CISO Honorario', minPoints: 1000, icon: 'Trophy' }
                ];
            }
        }
        return cachedLevels;
    } catch (error) {
        console.error('Error fetching gamification levels:', error);
        return [
            { name: 'Novato', minPoints: 0, icon: 'Award' },
            { name: 'Defensor', minPoints: 100, icon: 'Shield' },
            { name: 'Guardián', minPoints: 500, icon: 'ShieldAlert' },
            { name: 'CISO Honorario', minPoints: 1000, icon: 'Trophy' }
        ];
    }
};

/**
 * Calcula el nivel actual basado en los puntos
 */
const calculateLevel = async (points) => {
    const levels = await getLevels();
    let currentLevel = levels[0].name;
    for (const level of levels) {
        if (points >= level.minPoints) {
            currentLevel = level.name;
        } else {
            break;
        }
    }
    return currentLevel;
};

/**
 * Sincroniza el nivel del usuario en la base de datos
 */
const syncUserLevel = async (userId) => {
    try {
        const [userData] = await db.query('SELECT points FROM user_points WHERE user_id = ?', [userId]);
        if (!userData) return;

        const newLevel = await calculateLevel(userData.points);
        await db.query('UPDATE user_points SET level = ?, last_updated = NOW() WHERE user_id = ?', [newLevel, userId]);
        return newLevel;
    } catch (error) {
        console.error('Error syncing user level:', error);
    }
};

module.exports = {
    getLevels,
    calculateLevel,
    syncUserLevel,
    getSystemSettings
};
