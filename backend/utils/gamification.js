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
    let currentRank = 1;

    for (let i = 0; i < levels.length; i++) {
        if (points >= levels[i].minPoints) {
            currentLevel = levels[i].name;
            currentRank = i + 1;
        } else {
            break;
        }
    }
    return { name: currentLevel, rank: currentRank };
};

/**
 * Sincroniza el nivel del usuario en la base de datos
 */
const syncUserLevel = async (userId) => {
    try {
        const [userData] = await db.query('SELECT points, level FROM user_points WHERE user_id = ?', [userId]);
        if (!userData) return null;

        const oldLevel = userData.level;
        const levelInfo = await calculateLevel(userData.points);
        const newLevel = levelInfo.name;

        if (oldLevel !== newLevel) {
            await db.query('UPDATE user_points SET level = ?, last_updated = NOW() WHERE user_id = ?', [newLevel, userId]);
            return {
                leveledUp: true,
                oldLevel: oldLevel,
                newLevel: newLevel,
                levelNumber: levelInfo.rank
            };
        }

        return {
            leveledUp: false,
            currentLevel: newLevel,
            levelNumber: levelInfo.rank
        };
    } catch (error) {
        console.error('Error syncing user level:', error);
        return null;
    }
};

module.exports = {
    getLevels,
    calculateLevel,
    syncUserLevel,
    getSystemSettings
};
