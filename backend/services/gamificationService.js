const db = require('../config/database');
const logger = require('../config/logger');
const redisClient = require('../config/redis');
const notificationService = require('./notificationService');

class GamificationService {
    constructor() {
        this.cachedLevels = null;
        this.cachedSettings = null;
        this.getSystemSettings = this.getSystemSettings.bind(this);
        this.getLevels = this.getLevels.bind(this);
        this.calculateLevel = this.calculateLevel.bind(this);
        this.getUserRank = this.getUserRank.bind(this);
        this.calculateDynamicModuleBonus = this.calculateDynamicModuleBonus.bind(this);
        this.syncUserLevel = this.syncUserLevel.bind(this);
        this.checkAndRecordModuleCompletion = this.checkAndRecordModuleCompletion.bind(this);
        this.updateUserScore = this.updateUserScore.bind(this);
        this.refreshLeaderboardCache = this.refreshLeaderboardCache.bind(this);
        this.syncAllUsersLevels = this.syncAllUsersLevels.bind(this);
    }

    /**
     * Obtiene los ajustes del sistema (puntos por lección, etc)
     */
    async getSystemSettings(forceRefresh = false) {
        try {
            if (!this.cachedSettings || forceRefresh) {
                const settingsRaw = await db.query('SELECT setting_key, setting_value FROM system_settings');
                const settings = {};
                settingsRaw.forEach(s => {
                    settings[s.setting_key] = s.setting_value;
                });
                this.cachedSettings = {
                    points_per_lesson: parseInt(settings.points_per_lesson) || 10,
                    points_per_quiz: parseInt(settings.points_per_quiz) || 50,
                    bonus_perfect_score: parseInt(settings.bonus_perfect_score) || 25,
                    ranking_limit_global: settings.ranking_limit_global !== undefined ? parseInt(settings.ranking_limit_global) : 100,
                    ranking_limit_department: settings.ranking_limit_department !== undefined ? parseInt(settings.ranking_limit_department) : 10,
                    allow_theme_change: settings.allow_theme_change !== undefined ? settings.allow_theme_change === 'true' : false,
                    maintenance_mode: settings.maintenance_mode === 'true'
                };
            }
            return this.cachedSettings;
        } catch (error) {
            logger.error('Error fetching system settings:', error);
            return {
                points_per_lesson: 10,
                points_per_quiz: 50,
                bonus_perfect_score: 25,
                ranking_limit_global: 100,
                ranking_limit_department: 10,
                allow_theme_change: false,
                maintenance_mode: false
            };
        }
    }

    /**
     * Obtiene los niveles definidos en el sistema (desde BD o fallback)
     */
    async getLevels(forceRefresh = false) {
        try {
            if (!this.cachedLevels || forceRefresh) {
                const levels = await db.query('SELECT name, min_points as minPoints, icon FROM gamification_levels ORDER BY min_points ASC');
                if (levels && levels.length > 0) {
                    this.cachedLevels = levels;
                } else {
                    // Fallback por si la tabla está vacía
                    this.cachedLevels = [
                        { name: 'Novato', minPoints: 0, icon: 'Award' },
                        { name: 'Defensor', minPoints: 100, icon: 'Shield' },
                        { name: 'Guardián', minPoints: 500, icon: 'ShieldAlert' },
                        { name: 'CISO Honorario', minPoints: 1000, icon: 'Trophy' }
                    ];
                }
            }
            return this.cachedLevels;
        } catch (error) {
            logger.error('Error fetching gamification levels:', error);
            return [
                { name: 'Novato', minPoints: 0, icon: 'Award' },
                { name: 'Defensor', minPoints: 100, icon: 'Shield' },
                { name: 'Guardián', minPoints: 500, icon: 'ShieldAlert' },
                { name: 'CISO Honorario', minPoints: 1000, icon: 'Trophy' }
            ];
        }
    }

    /**
     * Calcula el nivel actual basado en los puntos
     */
    async calculateLevel(points) {
        const levels = await this.getLevels();
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
    }

    /**
     * Obtiene el rango institucional y departamental de un usuario de forma consistente.
     */
    async getUserRank(userId, email, department) {
        const userEmailLower = (email || '').toLowerCase();
        let institutionalRank = null;
        let departmentalRank = null;
        let totalUsersCount = 0;
        let totalInDepartment = 0;

        try {
            if (redisClient && redisClient.isOpen) {
                const cachedInst = await redisClient.get('leaderboard:institutional');
                if (cachedInst) {
                    const institutionalLeaderboard = JSON.parse(cachedInst);
                    totalUsersCount = institutionalLeaderboard.length;

                    const userEntry = institutionalLeaderboard.find(r => (r.email || '').toLowerCase() === userEmailLower);
                    if (userEntry) {
                        institutionalRank = userEntry.rank_position;
                    }

                    if (department) {
                        const deptUsers = institutionalLeaderboard.filter(r => r.department === department);
                        totalInDepartment = deptUsers.length;
                        const myDeptIndex = deptUsers.findIndex(r => (r.email || '').toLowerCase() === userEmailLower);
                        departmentalRank = myDeptIndex !== -1 ? myDeptIndex + 1 : null;
                    }
                }

                if (institutionalRank === null) {
                    const zRank = await redisClient.zRevRank('leaderboard:points', userId.toString());
                    if (zRank !== null) {
                        institutionalRank = zRank + 1;
                    }
                }
            }
        } catch (error) {
            logger.error('Error fetching rank from Redis:', error);
        }

        if (institutionalRank === null) {
            try {
                const globalRanking = await db.query(
                    `SELECT LOWER(sd.email) as email, RANK() OVER (ORDER BY COALESCE(up.points, -1) DESC, sd.full_name ASC) as pos
                     FROM staff_directory sd
                     LEFT JOIN users u ON sd.email = u.email
                     LEFT JOIN user_points up ON u.id = up.user_id`
                );
                const userGlobalRankRaw = globalRanking.find(r => (r.email || '').toLowerCase() === userEmailLower);
                institutionalRank = userGlobalRankRaw ? userGlobalRankRaw.pos : (globalRanking.length + 1);
                totalUsersCount = globalRanking.length;

                if (department) {
                    const deptRanking = await db.query(
                        `SELECT LOWER(sd.email) as email, RANK() OVER (ORDER BY COALESCE(up.points, -1) DESC, sd.full_name ASC) as pos
                         FROM staff_directory sd
                         LEFT JOIN users u ON sd.email = u.email
                         LEFT JOIN user_points up ON u.id = up.user_id
                         WHERE sd.department = ?`,
                        [department]
                    );
                    const userDeptRankRaw = deptRanking.find(r => (r.email || '').toLowerCase() === userEmailLower);
                    departmentalRank = userDeptRankRaw ? userDeptRankRaw.pos : null;
                    totalInDepartment = deptRanking.length;
                }
            } catch (dbError) {
                logger.error('Error fetching rank from DB:', dbError);
            }
        }

        return {
            institutionalRank,
            departmentalRank,
            totalUsersCount,
            totalInDepartment
        };
    }

    /**
     * Calcula un bonus dinámico al completar un módulo
     */
    async calculateDynamicModuleBonus(userId, moduleId) {
        try {
            const [user] = await db.query('SELECT department FROM users WHERE id = ?', [userId]);
            const dept = user?.department || 'General';

            const [completions] = await db.query(
                `SELECT COUNT(*) as count FROM gamification_activities ga
                 JOIN users u ON ga.user_id = u.id
                 WHERE ga.activity_type = 'module_completed' AND ga.reference_id = ? AND u.department = ?`,
                [moduleId, dept]
            );
            const rankPoints = Math.max(1, 10 - (completions.count || 0));

            const quizzes = await db.query('SELECT id FROM quizzes WHERE module_id = ? AND is_published = 1', [moduleId]);
            let performancePoints = 0;

            if (quizzes.length > 0) {
                let totalWeightedScore = 0;
                for (const q of quizzes) {
                    const [attempt] = await db.query(
                        'SELECT score, attempt_number FROM quiz_attempts WHERE user_id = ? AND quiz_id = ? AND passed = 1 ORDER BY created_at ASC LIMIT 1',
                        [userId, q.id]
                    );

                    if (attempt) {
                        let attemptWeight = 0;
                        if (attempt.attempt_number === 1) attemptWeight = 1.0;
                        else if (attempt.attempt_number === 2) attemptWeight = 0.6;
                        else if (attempt.attempt_number === 3) attemptWeight = 0.3;

                        totalWeightedScore += (attempt.score / 100) * attemptWeight;
                    }
                }
                performancePoints = Math.round((totalWeightedScore / quizzes.length) * 10);
            }

            const [mod] = await db.query('SELECT duration_minutes FROM modules WHERE id = ?', [moduleId]);
            let estimated = mod?.duration_minutes || 0;

            if (estimated === 0) {
                const [lessonSum] = await db.query('SELECT SUM(duration_minutes) as sum FROM lessons WHERE module_id = ? AND is_optional = 0', [moduleId]);
                estimated = lessonSum.sum || 30;
            }

            const [spentLessons] = await db.query('SELECT SUM(time_spent_minutes) as sum FROM user_progress WHERE user_id = ? AND module_id = ?', [userId, moduleId]);
            const [spentQuizzes] = await db.query(
                'SELECT SUM(qa.time_spent_minutes) as sum FROM quiz_attempts qa JOIN quizzes q ON qa.quiz_id = q.id WHERE qa.user_id = ? AND q.module_id = ?',
                [userId, moduleId]
            );

            const actual = (spentLessons.sum || 0) + (spentQuizzes.sum || 0);
            const ratio = actual / estimated;

            let timePoints = 0;
            if (ratio >= 0.9 && ratio <= 1.1) timePoints = 10;
            else if ((ratio >= 0.7 && ratio < 0.9) || (ratio > 1.1 && ratio <= 1.3)) timePoints = 7;
            else if ((ratio >= 0.5 && ratio < 0.7) || (ratio > 1.3 && ratio <= 1.6)) timePoints = 3;

            const [survey] = await db.query(
                `SELECT COUNT(*) as count FROM survey_responses sr 
                 JOIN surveys s ON sr.survey_id = s.id 
                 WHERE s.module_id = ? AND sr.user_id = ?`,
                [moduleId, userId]
            );
            const surveyBonus = survey.count > 0 ? 3 : 0;

            return rankPoints + performancePoints + timePoints + surveyBonus;
        } catch (error) {
            logger.error('Error calculating dynamic bonus:', error);
            return 0;
        }
    }

    /**
     * Sincroniza el nivel del usuario en la base de datos
     */
    async syncUserLevel(userId, connection = null) {
        try {
            const executor = connection || db;
            let userData;
            if (connection) {
                const [rows] = await connection.query('SELECT points, level FROM user_points WHERE user_id = ?', [userId]);
                userData = rows && rows[0];
            } else {
                const rows = await db.query('SELECT points, level FROM user_points WHERE user_id = ?', [userId]);
                userData = rows && rows[0];
            }
            if (!userData) return null;

            const currentPoints = userData.points;
            const oldLevel = userData.level;
            
            const levelInfo = await this.calculateLevel(currentPoints);
            const newLevel = levelInfo.name;

            await this.updateUserScore(userId, currentPoints);

            if (oldLevel !== newLevel) {
                await executor.query('UPDATE user_points SET level = ?, last_updated = NOW() WHERE user_id = ?', [newLevel, userId]);
                
                if (oldLevel) {
                    await notificationService.createNotification(
                        userId,
                        '¡Has subido de nivel!',
                        `Felicidades, has alcanzado el rango de ${newLevel}. Sigue así para escalar en el ranking institucional.`,
                        'success',
                        '/profile'
                    );
                }

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
            logger.error('Error syncing user level:', error);
            return null;
        }
    }

    /**
     * Verifica si un usuario ha completado todo el contenido de un módulo
     */
    async checkAndRecordModuleCompletion(userId, moduleId, isAdmin = false) {
        try {
            const [existingCert] = await db.query(
                "SELECT id FROM certificates WHERE user_id = ? AND module_id = ?",
                [userId, moduleId]
            );
            if (existingCert) return { completed: true, alreadyRecorded: true };

            const [existingActivity] = await db.query(
                "SELECT id FROM gamification_activities WHERE user_id = ? AND activity_type = 'module_completed' AND reference_id = ?",
                [userId, moduleId]
            );

            if (!existingActivity) {
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

                const [incompleteQuizzes] = await db.query(
                    `SELECT COUNT(*) as count FROM quizzes q
                     WHERE q.module_id = ? 
                     AND q.lesson_id IS NULL
                     ${isAdmin ? "" : "AND q.is_published = TRUE"}
                     AND q.id NOT IN (
                        SELECT quiz_id FROM quiz_attempts WHERE user_id = ? AND passed = TRUE
                     )`,
                    [userId, moduleId, userId]
                );
                if (incompleteQuizzes.count > 0) return { completed: false };
            }

            const [moduleData] = await db.query("SELECT generates_certificate FROM modules WHERE id = ?", [moduleId]);
            const shouldGenerate = moduleData ? !!moduleData.generates_certificate : true;

            if (shouldGenerate) {
                const [existingCertCheck] = await db.query(
                    "SELECT id FROM certificates WHERE user_id = ? AND module_id = ?",
                    [userId, moduleId]
                );

                if (!existingCertCheck) {
                    const certificateCode = `CERT-${userId}-${moduleId}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
                    await db.query(
                        `INSERT INTO certificates (user_id, module_id, issued_at, certificate_code) 
                         VALUES (?, ?, NOW(), ?)`,
                        [userId, moduleId, certificateCode]
                    );
                }
            }

            let bonusPoints = 0;
            let levelingUp = null;

            if (!existingActivity) {
                bonusPoints = await this.calculateDynamicModuleBonus(userId, moduleId);

                await db.query(
                    `INSERT INTO gamification_activities (user_id, activity_type, points_earned, reference_id) 
                     VALUES (?, 'module_completed', ?, ?)`,
                    [userId, bonusPoints, moduleId]
                );

                await db.query(
                    `INSERT INTO user_points (user_id, points) VALUES (?, ?) 
                     ON DUPLICATE KEY UPDATE points = points + ?`,
                    [userId, bonusPoints, bonusPoints]
                );

                levelingUp = await this.syncUserLevel(userId);

                try {
                    const { clearCache } = require('../middleware/cache');
                    await clearCache('cache:/api/gamification/leaderboard*');
                    this.refreshLeaderboardCache().catch(err => logger.error('Error in background refresh after module:', err));
                } catch (cacheErr) {
                    logger.error('Error invalidando caché tras módulo:', cacheErr);
                }

                const [modInfo] = await db.query("SELECT module_number, title FROM modules WHERE id = ?", [moduleId]);
                const modDisplay = modInfo ? `Módulo ${modInfo.module_number}: ${modInfo.title}` : `Módulo ${moduleId}`;

                await notificationService.createNotification(
                    userId,
                    '¡Módulo Completado!',
                    `Has finalizado con éxito el ${modDisplay} y ganaste ${bonusPoints} puntos de experiencia.`,
                    'success',
                    '/modules'
                );
            }

            return {
                completed: true,
                newlyRecorded: !existingActivity,
                bonusPoints,
                levelingUp,
                certificateGenerated: shouldGenerate,
                generatesCertificate: shouldGenerate,
                id: moduleId
            };
        } catch (error) {
            logger.error('Error checking module completion:', error);
            return { error: true };
        }
    }

    /**
     * Actualiza el puntaje del usuario en Redis para el ranking en tiempo real
     */
    async updateUserScore(userId, points) {
        try {
            if (redisClient && redisClient.isOpen) {
                await redisClient.zAdd('leaderboard:points', {
                    score: points,
                    value: userId.toString()
                });
                return true;
            }
        } catch (error) {
            logger.error('Error updating user score in Redis:', error);
        }
        return false;
    }

    /**
     * Función para recalcular y cachear el Leaderboard global
     */
    async refreshLeaderboardCache() {
        try {
            if (!redisClient || !redisClient.isOpen) return;

            const instRanking = await db.query(
                `SELECT 
                    sd.full_name, u.first_name, u.last_name, u.profile_picture, sd.department, LOWER(sd.email) as email, u.id as user_id,
                    COALESCE(up.points, 0) as points, 
                    COALESCE(up.level, 'Novato') as level,
                    RANK() OVER (ORDER BY COALESCE(up.points, -1) DESC, sd.full_name ASC) as rank_position
                 FROM staff_directory sd
                 LEFT JOIN users u ON sd.email = u.email
                 LEFT JOIN user_points up ON u.id = up.user_id
                 ORDER BY points DESC, sd.full_name ASC`
            );

            const allBadges = await db.query(
                `SELECT ub.user_id, b.image_url, b.name, b.icon_name 
                 FROM user_badges ub 
                 JOIN badges b ON ub.badge_id = b.id
                 ORDER BY ub.earned_at DESC`
            );

            const userBadgesMap = {};
            if (Array.isArray(allBadges)) {
                allBadges.forEach(b => {
                    if (!userBadgesMap[b.user_id]) userBadgesMap[b.user_id] = [];
                    userBadgesMap[b.user_id].push(b);
                });
            }

            const levels = await this.getLevels(true);
            const levelMap = {};
            levels.forEach((l, idx) => {
                levelMap[l.name] = idx + 1;
            });

            const sysSettings = await this.getSystemSettings(true);
            const globalLimit = sysSettings.ranking_limit_global;
            const deptLimit = sysSettings.ranking_limit_department;

            let institutionalLeaderboard = instRanking.map(r => ({
                ...r,
                id: r.email,
                first_name: r.first_name || r.full_name.split(' ')[0],
                last_name: r.last_name || r.full_name.split(' ').slice(1).join(' '),
                rank_position: r.rank_position,
                level: `Nivel ${levelMap[r.level] || 1}: ${r.level}`,
                badges: r.user_id ? (userBadgesMap[r.user_id] || []) : []
            }));

            const departmentRanking = await db.query(
                `SELECT 
                    sd.department, 
                    SUM(COALESCE(up.points, 0)) as total_points, ROUND(SUM(COALESCE(up.points, 0)) / COUNT(sd.email), 1) as average_points, 
                    COUNT(sd.email) as staff_count,
                    (SELECT sd2.full_name 
                     FROM staff_directory sd2
                     LEFT JOIN users u2 ON sd2.email = u2.email
                     LEFT JOIN user_points up2 ON u2.id = up2.user_id
                     WHERE sd2.department = sd.department 
                     ORDER BY COALESCE(up2.points, -1) DESC, sd2.full_name ASC LIMIT 1) as top_performer,
                    (SELECT COALESCE(up3.points, 0) 
                     FROM staff_directory sd3
                     LEFT JOIN users u3 ON sd3.email = u3.email
                     LEFT JOIN user_points up3 ON u3.id = up3.user_id
                     WHERE sd3.department = sd.department 
                     ORDER BY COALESCE(up3.points, -1) DESC LIMIT 1) as top_points
                 FROM staff_directory sd
                 LEFT JOIN users u ON sd.email = u.email
                 LEFT JOIN user_points up ON u.id = up.user_id
                 WHERE sd.department IS NOT NULL
                 GROUP BY sd.department
                 ORDER BY average_points DESC, total_points DESC`
            );
            
            const limitedDepartmentRanking = deptLimit > 0 ? departmentRanking.slice(0, deptLimit) : departmentRanking;

            const allPoints = await db.query('SELECT user_id, points FROM user_points WHERE points > 0');
            if (allPoints.length > 0) {
                const zSetData = allPoints.map(p => ({
                    score: p.points,
                    value: p.user_id.toString()
                }));
                await redisClient.del('leaderboard:points');
                await redisClient.zAdd('leaderboard:points', zSetData);
            }

            await redisClient.setEx('leaderboard:institutional', 1800, JSON.stringify(institutionalLeaderboard));
            await redisClient.setEx('leaderboard:departments', 1800, JSON.stringify(limitedDepartmentRanking));
            logger.info('✅ Leaderboard cache refreshed in Redis');
        } catch (err) {
            logger.error('❌ Error refreshing leaderboard cache:', err);
        }
    }

    /**
     * Sincronizar niveles de todos los usuarios
     */
    async syncAllUsersLevels() {
        try {
            const users = await db.query('SELECT user_id FROM user_points');
            logger.info(`Iniciando sincronización masiva para ${users.length} usuarios...`);
            
            let updatedCount = 0;
            for (const user of users) {
                const result = await this.syncUserLevel(user.user_id);
                if (result && result.leveledUp) {
                    updatedCount++;
                }
            }
            
            await this.refreshLeaderboardCache();
            logger.info(`✅ Sincronización masiva completada. ${updatedCount} usuarios actualizaron su nombre de nivel.`);
            return { total: users.length, updated: updatedCount };
        } catch (error) {
            logger.error('Error en syncAllUsersLevels:', error);
            throw error;
        }
    }
}

module.exports = new GamificationService();
