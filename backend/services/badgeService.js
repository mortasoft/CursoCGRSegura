const db = require('../config/database');
const logger = require('../config/logger');
const notificationService = require('./notificationService');

class BadgeService {
    constructor() {
        this.getAllBadges = this.getAllBadges.bind(this);
        this.getBadgeById = this.getBadgeById.bind(this);
        this.createBadge = this.createBadge.bind(this);
        this.updateBadge = this.updateBadge.bind(this);
        this.deleteBadge = this.deleteBadge.bind(this);
        this.getUserBadges = this.getUserBadges.bind(this);
        this.getTotalPublicBadgesCount = this.getTotalPublicBadgesCount.bind(this);
        this.awardBadge = this.awardBadge.bind(this);
        this.checkResourceBadge = this.checkResourceBadge.bind(this);
        this.checkStreakBadge = this.checkStreakBadge.bind(this);
        this.checkSpeedBadge = this.checkSpeedBadge.bind(this);
        this.checkFirstModuleBadge = this.checkFirstModuleBadge.bind(this);
        this.checkSabanaBadge = this.checkSabanaBadge.bind(this);
        this.checkModuleOneBadge = this.checkModuleOneBadge.bind(this);
        this.checkReplayBadge = this.checkReplayBadge.bind(this);
        this.checkComboX5Badge = this.checkComboX5Badge.bind(this);
        this.checkEliteTeamBadge = this.checkEliteTeamBadge.bind(this);
        this.checkForumBadge = this.checkForumBadge.bind(this);
        this.checkTetrisBadge = this.checkTetrisBadge.bind(this);
        this.checkContinueBadge = this.checkContinueBadge.bind(this);
        this.checkAllBadges = this.checkAllBadges.bind(this);
    }

    async getAllBadges() {
        return await db.query('SELECT * FROM badges ORDER BY created_at DESC');
    }

    async getBadgeById(id) {
        const badges = await db.query('SELECT * FROM badges WHERE id = ?', [id]);
        return badges[0];
    }

    async createBadge(badgeData) {
        const { name, description, icon_name, image_url, criteria_type, criteria_value, points, is_public } = badgeData;
        
        const result = await db.query(
            'INSERT INTO badges (name, description, icon_name, image_url, criteria_type, criteria_value, points, is_public) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, description, icon_name || 'Award', image_url || null, criteria_type || 'manual', criteria_value || null, points ?? 10, is_public ?? true]
        );
        
        return result.insertId;
    }

    async updateBadge(id, badgeData) {
        const { name, description, icon_name, image_url, criteria_type, criteria_value, points, is_public } = badgeData;
        
        return await db.query(
            `UPDATE badges SET 
                name = COALESCE(?, name), 
                description = COALESCE(?, description), 
                icon_name = COALESCE(?, icon_name), 
                image_url = COALESCE(?, image_url),
                criteria_type = COALESCE(?, criteria_type), 
                criteria_value = COALESCE(?, criteria_value),
                points = COALESCE(?, points),
                is_public = COALESCE(?, is_public)
            WHERE id = ?`,
            [name ?? null, description ?? null, icon_name ?? null, image_url ?? null, criteria_type ?? null, criteria_value ?? null, points ?? null, is_public ?? null, id]
        );
    }

    async deleteBadge(id) {
        return await db.query('DELETE FROM badges WHERE id = ?', [id]);
    }

    async getUserBadges(userId) {
        return await db.query(`
            SELECT b.*, ub.earned_at 
            FROM badges b
            JOIN user_badges ub ON b.id = ub.badge_id
            WHERE ub.user_id = ?
            ORDER BY ub.earned_at DESC
        `, [userId]);
    }

    async getTotalPublicBadgesCount() {
        const [result] = await db.query('SELECT COUNT(*) as total FROM badges WHERE is_public = 1');
        return result.total || 0;
    }

    /**
     * Otorgar una insignia a un usuario
     */
    async awardBadge(userId, badgeId, shouldNotify = false) {
        try {
            const [badge] = await db.query('SELECT * FROM badges WHERE id = ?', [badgeId]);
            if (!badge) return null;

            const result = await db.query(
                'INSERT IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)',
                [userId, badgeId]
            );

            if (result.affectedRows > 0) {
                logger.info(`Insignia otorgada: ${badge.name} al usuario ${userId}`);
                
                const pointsToAward = badge.points !== undefined && badge.points !== null ? badge.points : 10;
                
                await notificationService.createNotification(
                    userId,
                    '¡Nueva Insignia!',
                    `Has ganado la insignia: ${badge.name}. +${pointsToAward} pts de experiencia. ${badge.description || ''}`,
                    'info',
                    '/profile'
                );

                let userEmail = null;
                let userName = null;
                try {
                    const [userData] = await db.query('SELECT email, first_name FROM users WHERE id = ?', [userId]);
                    if (userData) {
                        userEmail = userData.email;
                        userName = userData.first_name;
                    }
                } catch (userError) {
                    logger.error('Error obteniendo datos de usuario para email de insignia:', userError);
                }

                if (pointsToAward > 0) {
                    await db.query(
                        `INSERT INTO gamification_activities (user_id, activity_type, points_earned, reference_id) 
                         VALUES (?, 'badge_earned', ?, ?)`,
                        [userId, pointsToAward, badgeId]
                    );

                    await db.query(
                        `INSERT INTO user_points (user_id, points) VALUES (?, ?) 
                         ON DUPLICATE KEY UPDATE points = points + ?`,
                        [userId, pointsToAward, pointsToAward]
                    );
                }

                let emailSent = false;
                let emailError = null;

                if (shouldNotify && userEmail) {
                    const emailService = require('./emailService');
                    try {
                        await emailService.sendBadgeNotification(userEmail, userName || 'Usuario', badge);
                        emailSent = true;
                    } catch (err) {
                        emailError = err.message;
                        logger.error('Error en trigger de email de insignia:', err);
                    }
                }

                try {
                    const gamificationService = require('./gamificationService');
                    await gamificationService.syncUserLevel(userId);
                } catch (syncError) {
                    logger.error('Error sincronizando nivel tras insignia:', syncError);
                }

                try {
                    const { clearCache } = require('../middleware/cache');
                    const gamificationService = require('./gamificationService');
                    
                    await gamificationService.refreshLeaderboardCache();
                    await clearCache(`cache:/api/users/profile:u${userId}*`);
                    await clearCache(`cache:/api/gamification/leaderboard*`);
                } catch (cacheError) {
                    logger.error('Error invalidando caché tras insignia:', cacheError);
                }

                return { awarded: true, badge, emailSent, emailError };
            }

            return { awarded: false, message: 'Ya tiene la insignia' };
        } catch (error) {
            logger.error(`Error al otorgar insignia ${badgeId} a usuario ${userId}:`, error);
            return { error: true };
        }
    }

    /**
     * Lógica para la insignia "Seguridad sin igual" (Descarga 1 recurso)
     */
    async checkResourceBadge(userId) {
        try {
            const [downloads] = await db.query(
                "SELECT COUNT(*) as count FROM gamification_activities WHERE user_id = ? AND activity_type = 'resource_downloaded'",
                [userId]
            );

            if (downloads.count >= 1) {
                const [badge] = await db.query("SELECT id FROM badges WHERE name = 'Seguridad sin igual' LIMIT 1");
                if (badge) {
                    return await this.awardBadge(userId, badge.id);
                }
            }
            return null;
        } catch (error) {
            logger.error(`Error en checkResourceBadge para usuario ${userId}:`, error);
            return null;
        }
    }

    /**
     * Lógica para la insignia "Se enciende la Racha" (Actividad por 2 días seguidos)
     */
    async checkStreakBadge(userId) {
        try {
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
                    return await this.awardBadge(userId, badge.id);
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
     */
    async checkSpeedBadge(userId, moduleId) {
        try {
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

            if (diffMinutes <= 5) {
                const [badge] = await db.query("SELECT id FROM badges WHERE name = 'Club de la Velocidad I' LIMIT 1");
                if (badge) return await this.awardBadge(userId, badge.id);
            } else if (diffMinutes <= 10) {
                const [badge] = await db.query("SELECT id FROM badges WHERE name = 'Club de la Velocidad II' LIMIT 1");
                if (badge) return await this.awardBadge(userId, badge.id);
            } else if (diffMinutes <= 20) {
                const [badge] = await db.query("SELECT id FROM badges WHERE name = 'Club de la Velocidad III' LIMIT 1");
                if (badge) return await this.awardBadge(userId, badge.id);
            }

            return null;
        } catch (error) {
            logger.error(`Error en checkSpeedBadge para usuario ${userId}:`, error);
            return null;
        }
    }

    /**
     * Lógica para la insignia "El inicio de la seguridad"
     */
    async checkFirstModuleBadge(userId, moduleId) {
        try {
            const [moduleData] = await db.query("SELECT module_number FROM modules WHERE id = ?", [moduleId]);
            if (!moduleData || moduleData.module_number === 0) return null;

            const [badge] = await db.query("SELECT id FROM badges WHERE name = 'El inicio de la seguridad' LIMIT 1");
            if (badge) {
                return await this.awardBadge(userId, badge.id);
            }
            return null;
        } catch (error) {
            logger.error(`Error en checkFirstModuleBadge para usuario ${userId}:`, error);
            return null;
        }
    }

    /**
     * Lógica para la insignia "Lo mejor de la Sabana"
     */
    async checkSabanaBadge(userId) {
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
                    return await this.awardBadge(userId, badge.id);
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
     */
    async checkModuleOneBadge(userId, moduleId) {
        try {
            const [moduleData] = await db.query("SELECT module_number FROM modules WHERE id = ?", [moduleId]);
            if (!moduleData || moduleData.module_number !== 1) return null;

            const [badge] = await db.query("SELECT id FROM badges WHERE name = 'Un gran poder lleva una gran seguridad' LIMIT 1");
            if (badge) {
                return await this.awardBadge(userId, badge.id);
            }
            return null;
        } catch (error) {
            logger.error(`Error en checkModuleOneBadge para usuario ${userId}:`, error);
            return null;
        }
    }

    /**
     * Lógica para la insignia "Arcade Replay"
     */
    async checkReplayBadge(userId) {
        try {
            const [badge] = await db.query("SELECT id FROM badges WHERE name = 'Arcade Replay' LIMIT 1");
            if (badge) {
                return await this.awardBadge(userId, badge.id);
            }
            return null;
        } catch (error) {
            logger.error(`Error en checkReplayBadge para usuario ${userId}:`, error);
            return null;
        }
    }

    /**
     * Lógica para la insignia "Combo x5"
     */
    async checkComboX5Badge(userId) {
        try {
            const [user] = await db.query('SELECT login_streak, last_streak_date FROM users WHERE id = ?', [userId]);
            if (!user) return null;

            const crFormatter = new Intl.DateTimeFormat('en-CA', { 
                timeZone: 'America/Costa_Rica', 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit' 
            });

            const now = new Date();
            const today = crFormatter.format(now);
            
            let lastDate = null;
            if (user.last_streak_date) {
                lastDate = (typeof user.last_streak_date === 'string') 
                    ? user.last_streak_date.split('T')[0] 
                    : crFormatter.format(new Date(user.last_streak_date));
            }

            if (lastDate === today) {
                return null;
            }

            let newStreak = 1;
            if (lastDate) {
                const yesterdayDate = new Date(now);
                yesterdayDate.setDate(yesterdayDate.getDate() - 1);
                const yesterdayStr = crFormatter.format(yesterdayDate);

                if (lastDate === yesterdayStr) {
                    newStreak = (user.login_streak || 0) + 1;
                }
            }

            await db.query('UPDATE users SET login_streak = ?, last_streak_date = ? WHERE id = ?', [newStreak, today, userId]);

            if (newStreak >= 5) {
                const [badge] = await db.query("SELECT id FROM badges WHERE name = 'Combo x5' LIMIT 1");
                if (badge) {
                    return await this.awardBadge(userId, badge.id);
                }
            }
            return null;
        } catch (error) {
            logger.error(`Error en checkComboX5Badge para usuario ${userId}:`, error);
            return null;
        }
    }

    /**
     * Lógica para la insignia "Equipo Élite"
     */
    async checkEliteTeamBadge(userId, moduleId) {
        try {
            const [user] = await db.query('SELECT department FROM users WHERE id = ?', [userId]);
            if (!user || !user.department) return null;
            
            const area = user.department;

            const [moduleData] = await db.query('SELECT module_number, generates_certificate FROM modules WHERE id = ?', [moduleId]);
            if (!moduleData || moduleData.generates_certificate === 0) return null;
            
            const modNum = moduleData.module_number;

            const [areaUsers] = await db.query(
                'SELECT COUNT(*) as total FROM users WHERE department = ? AND is_active = TRUE',
                [area]
            );
            
            if (areaUsers.total === 0) return null;

            const [completions] = await db.query(
                `SELECT COUNT(DISTINCT ga.user_id) as completed_count 
                 FROM gamification_activities ga
                 JOIN users u ON ga.user_id = u.id
                 WHERE ga.activity_type = 'module_completed' 
                 AND ga.reference_id = ? 
                 AND u.department = ?
                 AND u.is_active = TRUE`,
                [moduleId, area]
            );

            if (completions.completed_count >= areaUsers.total) {
                logger.info(`¡Sincronización de Equipo Élite! Área: ${area}, Módulo: ${modNum}`);
                
                const badgeName = 'Equipo Élite';
                let [badge] = await db.query('SELECT id FROM badges WHERE name = ?', [badgeName]);
                
                if (badge) {
                    const usersToAward = await db.query('SELECT id FROM users WHERE department = ? AND is_active = TRUE', [area]);
                    const awardedBadges = [];
                    for (const u of usersToAward) {
                        const res = await this.awardBadge(u.id, badge.id, true);
                        if (res && res.awarded) {
                            awardedBadges.push(res.badge);
                        }
                    }
                    return { awarded: awardedBadges.length > 0, badges: awardedBadges };
                }
            }
            
            return null;
        } catch (error) {
            logger.error(`Error en checkEliteTeamBadge para usuario ${userId}:`, error);
            return null;
        }
    }

    /**
     * Lógica para la insignia "Maestro del Co-Op"
     */
    async checkForumBadge(userId) {
        try {
            const [result] = await db.query(
                'SELECT COUNT(*) as count FROM forum_posts WHERE user_id = ?',
                [userId]
            );

            if (result && result.count >= 5) {
                const [badge] = await db.query("SELECT id FROM badges WHERE name = 'Maestro del Co-Op' LIMIT 1");
                if (badge) {
                    return await this.awardBadge(userId, badge.id);
                }
            }
            return null;
        } catch (error) {
            logger.error(`Error en checkForumBadge para usuario ${userId}:`, error);
            return null;
        }
    }

    /**
     * Lógica para la insignia "Data Tetris Grandmaster"
     */
    async checkTetrisBadge(userId) {
        try {
            const attempts = await db.query(
                `SELECT qa.answers, qq.id as question_id, qq.data as question_data 
                 FROM quiz_attempts qa
                 JOIN quiz_questions qq ON qq.quiz_id = qa.quiz_id
                 WHERE qa.user_id = ? AND qq.question_type = 'data_tetris'`,
                [userId]
            );

            let qualified = false;
            for (const attempt of attempts) {
                const answers = typeof attempt.answers === 'string' ? JSON.parse(attempt.answers) : (attempt.answers || {});
                const userAnswer = answers[attempt.question_id];
                if (!userAnswer) continue;

                const qData = typeof attempt.question_data === 'string' ? JSON.parse(attempt.question_data) : (attempt.question_data || {});
                
                const finalScore = parseInt(userAnswer.score) || 0;
                const minScore = parseInt(qData.min_score) || 500;
                const difficulty = userAnswer.difficulty || qData.difficulty || 'easy';

                if (difficulty === 'hard' && finalScore >= minScore * 3) {
                    qualified = true;
                    break;
                }
            }

            if (qualified) {
                const [badge] = await db.query("SELECT id FROM badges WHERE name = 'Data Tetris Grandmaster' LIMIT 1");
                if (badge) {
                    return await this.awardBadge(userId, badge.id);
                }
            }
            return null;
        } catch (error) {
            logger.error(`Error en checkTetrisBadge para usuario ${userId}:`, error);
            return null;
        }
    }

    /**
     * Lógica para la insignia "El Último Continue"
     */
    async checkContinueBadge(userId) {
        try {
            const attempts = await db.query(
                `SELECT qa.attempt_number, q.max_attempts 
                 FROM quiz_attempts qa
                 JOIN quizzes q ON qa.quiz_id = q.id
                 WHERE qa.user_id = ? AND qa.passed = 1`,
                [userId]
            );

            let qualified = false;
            for (const attempt of attempts) {
                if (attempt.attempt_number >= attempt.max_attempts) {
                    qualified = true;
                    break;
                }
            }

            if (qualified) {
                const [badge] = await db.query("SELECT id FROM badges WHERE name = 'El Último \"Continue\"' LIMIT 1");
                if (badge) {
                    return await this.awardBadge(userId, badge.id);
                }
            }
            return null;
        } catch (error) {
            logger.error(`Error en checkContinueBadge para usuario ${userId}:`, error);
            return null;
        }
    }

    /**
     * Revisa todas las insignias automáticas para un usuario
     */
    async checkAllBadges(userId, extraData = {}) {
        const awardedBadges = [];
        try {
            const streak = await this.checkStreakBadge(userId);
            if (streak && streak.awarded) awardedBadges.push(streak.badge);

            const resource = await this.checkResourceBadge(userId);
            if (resource && resource.awarded) awardedBadges.push(resource.badge);

            const forum = await this.checkForumBadge(userId);
            if (forum && forum.awarded) awardedBadges.push(forum.badge);

            const tetris = await this.checkTetrisBadge(userId);
            if (tetris && tetris.awarded) awardedBadges.push(tetris.badge);

            const retryBadge = await this.checkContinueBadge(userId);
            if (retryBadge && retryBadge.awarded) awardedBadges.push(retryBadge.badge);

            if (extraData.moduleId && extraData.isModuleCompletion) {
                const speed = await this.checkSpeedBadge(userId, extraData.moduleId);
                if (speed && speed.awarded) awardedBadges.push(speed.badge);

                const sabana = await this.checkSabanaBadge(userId);
                if (sabana && sabana.awarded) awardedBadges.push(sabana.badge);

                const mod1 = await this.checkModuleOneBadge(userId, extraData.moduleId);
                if (mod1 && mod1.awarded) awardedBadges.push(mod1.badge);

                const elite = await this.checkEliteTeamBadge(userId, extraData.moduleId);
                if (elite && elite.awarded) {
                    elite.badges.forEach(b => {
                        if (!awardedBadges.find(existing => existing.id === b.id)) {
                            awardedBadges.push(b);
                        }
                    });
                }
            }

            if (extraData.moduleId) {
                const start = await this.checkFirstModuleBadge(userId, extraData.moduleId);
                if (start && start.awarded) awardedBadges.push(start.badge);
            }

            if (extraData.isReplay && extraData.passed) {
                const replay = await this.checkReplayBadge(userId);
                if (replay && replay.awarded) awardedBadges.push(replay.badge);
            }

            return {
                awarded: awardedBadges.length > 0,
                badges: awardedBadges,
                badge: awardedBadges[0]
            };
        } catch (error) {
            logger.error(`Error en checkAllBadges para usuario ${userId}:`, error);
            return { awarded: false, badges: [], badge: null };
        }
    }
}

module.exports = new BadgeService();
