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

/**
 * Verifica si un usuario ha completado todo el contenido de un módulo
 * y registra la actividad si es necesario.
 */
const checkAndRecordModuleCompletion = async (userId, moduleId, isAdmin = false) => {
    try {
        // 1. Verificar si ya tiene el certificado (lo que realmente importa)
        const [existingCert] = await db.query(
            "SELECT id FROM certificates WHERE user_id = ? AND module_id = ?",
            [userId, moduleId]
        );
        if (existingCert) return { completed: true, alreadyRecorded: true };

        // 2. Verificar si ya se registró la actividad previamente (para backfill)
        const [existingActivity] = await db.query(
            "SELECT id FROM gamification_activities WHERE user_id = ? AND activity_type = 'module_completed' AND reference_id = ?",
            [userId, moduleId]
        );

        // 3. Si NO hay actividad previa, verificar requisitos (lecciones y quizzes)
        if (!existingActivity) {
            // Verificar lecciones obligatorias no completadas
            const [incompleteLessons] = await db.query(
                `SELECT COUNT(*) as count FROM lessons l
                 LEFT JOIN user_progress up ON l.id = up.lesson_id AND up.user_id = ?
                 WHERE l.module_id = ? 
                 ${isAdmin ? '' : 'AND l.is_published = TRUE'} 
                 AND l.is_optional = FALSE
                 AND (up.status IS NULL OR up.status != 'completed')`,
                [userId, moduleId]
            );
            if (incompleteLessons.count > 0) return { completed: false };

            // Verificar quizzes obligatorios no aprobados
            const [incompleteQuizzes] = await db.query(
                `SELECT COUNT(*) as count FROM quizzes q
                 WHERE q.module_id = ? 
                 ${isAdmin ? '' : 'AND q.is_published = TRUE'}
                 AND q.id NOT IN (
                    SELECT quiz_id FROM quiz_attempts WHERE user_id = ? AND passed = TRUE
                 )`,
                [userId, moduleId, userId]
            );
            if (incompleteQuizzes.count > 0) return { completed: false };
        }

        // 4. Si llegamos aquí, el módulo está completo (o ya estaba registrado).
        // Verificar si el módulo debe generar certificado
        const [moduleData] = await db.query("SELECT generates_certificate FROM modules WHERE id = ?", [moduleId]);
        const shouldGenerate = moduleData ? !!moduleData.generates_certificate : true;

        if (shouldGenerate) {
            // Generar Certificado
            const certificateCode = `CERT-${userId}-${moduleId}-${Date.now()}`;
            await db.query(
                `INSERT INTO certificates (user_id, module_id, issued_at, certificate_code) 
                 VALUES (?, ?, NOW(), ?)`,
                [userId, moduleId, certificateCode]
            );
        }

        // 5. Registrar actividad y dar puntos (solo si es nuevo)
        let bonusPoints = 0;
        if (!existingActivity) {
            const settings = await getSystemSettings();
            bonusPoints = 50; // Bonus fijo por ahora

            await db.query(
                `INSERT INTO gamification_activities (user_id, activity_type, points_earned, reference_id) 
                 VALUES (?, 'module_completed', ?, ?)`,
                [userId, bonusPoints, moduleId]
            );

            // Sumar puntos al balance
            await db.query(
                `INSERT INTO user_points (user_id, points) VALUES (?, ?) 
                 ON DUPLICATE KEY UPDATE points = points + ?`,
                [userId, bonusPoints, bonusPoints]
            );
        }

        return {
            completed: true,
            newlyRecorded: !existingActivity,
            bonusPoints,
            certificateGenerated: shouldGenerate,
            generatesCertificate: shouldGenerate,
            id: moduleId
        };
    } catch (error) {
        console.error('Error checking module completion:', error);
        return { error: true };
    }
};

module.exports = {
    getLevels,
    calculateLevel,
    syncUserLevel,
    getSystemSettings,
    checkAndRecordModuleCompletion
};
