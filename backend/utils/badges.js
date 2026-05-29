const db = require('../config/database');
const logger = require('../config/logger');
const notificationService = require('../services/notificationService');

/**
 * Automáticamente revisa y asigna insignias según criterios específicos.
 */
async function awardBadge(userId, badgeId, shouldNotify = false) {
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
            
            // Otorgar puntos extra por insignia ganada según su configuración (default 10)
            const pointsToAward = badge.points !== undefined && badge.points !== null ? badge.points : 10;
            
            await notificationService.createNotification(
                userId,
                '¡Nueva Insignia!',
                `Has ganado la insignia: ${badge.name}. +${pointsToAward} pts de experiencia. ${badge.description || ''}`,
                'info',
                '/profile'
            );

            // Obtener datos del usuario para el correo
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

            // Enviar notificación por correo (ahora esperamos el resultado para informar al admin)
            let emailSent = false;
            let emailError = null;

            if (shouldNotify && userEmail) {
                const emailService = require('../services/emailService');
                try {
                    await emailService.sendBadgeNotification(userEmail, userName || 'Usuario', badge);
                    emailSent = true;
                } catch (err) {
                    emailError = err.message;
                    logger.error('Error en trigger de email de insignia:', err);
                }
            }

            // Sincronizar Nivel y Ranking (CRITICAL: Asegura que el nombre del nivel en DB esté actualizado)
            try {
                const { syncUserLevel } = require('./gamification');
                await syncUserLevel(userId);
            } catch (syncError) {
                logger.error('Error sincronizando nivel tras insignia:', syncError);
            }

            // --- INVALIDAR CACHÉ ---
            // Invalidad caché del perfil y leaderboard para que se refleje de inmediato
            try {
                const { clearCache } = require('../middleware/cache');
                const { refreshLeaderboardCache } = require('./gamification');
                
                // 1. Recalcular el ranking global
                await refreshLeaderboardCache();
                
                // 2. Limpiar versiones cacheadas
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
 * Lógica para la insignia "Arcade Replay"
 * (Se gana al completar un repaso con éxito)
 */
async function checkReplayBadge(userId) {
    try {
        const [badge] = await db.query("SELECT id FROM badges WHERE name = 'Arcade Replay' LIMIT 1");
        if (badge) {
            return await awardBadge(userId, badge.id);
        }
        return null;
    } catch (error) {
        logger.error(`Error en checkReplayBadge para usuario ${userId}:`, error);
        return null;
    }
}

/**
 * Lógica para la insignia "Combo x5"
 * (5 días seguidos entrando)
 */
async function checkComboX5Badge(userId) {
    try {
        // 1. Obtener datos de racha del usuario
        const [user] = await db.query('SELECT login_streak, last_streak_date FROM users WHERE id = ?', [userId]);
        if (!user) return null;

        // Configurar formateador para Costa Rica (YYYY-MM-DD)
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
            // Asegurar formato YYYY-MM-DD independientemente de si la DB lo entrega como string o objeto Date
            lastDate = (typeof user.last_streak_date === 'string') 
                ? user.last_streak_date.split('T')[0] 
                : crFormatter.format(new Date(user.last_streak_date));
        }

        if (lastDate === today) {
            // Ya contó la racha para hoy
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

        // 2. Actualizar racha en DB
        await db.query('UPDATE users SET login_streak = ?, last_streak_date = ? WHERE id = ?', [newStreak, today, userId]);

        // 3. Evaluar insignia
        if (newStreak >= 5) {
            const [badge] = await db.query("SELECT id FROM badges WHERE name = 'Combo x5' LIMIT 1");
            if (badge) {
                return await awardBadge(userId, badge.id);
            }
        }
        return null;
    } catch (error) {
        logger.error(`Error en checkComboX5Badge para usuario ${userId}:`, error);
        return null;
    }
}

/**
 * Lógica para la insignia "Equipo Élite: Módulo X"
 * Se otorga masivamente a un área cuando TODOS sus integrantes completan un módulo con certificado.
 */
async function checkEliteTeamBadge(userId, moduleId) {
    try {
        // 1. Obtener el área (departamento) del usuario actual
        const [user] = await db.query('SELECT department FROM users WHERE id = ?', [userId]);
        if (!user || !user.department) return null;
        
        const area = user.department;

        // 2. Obtener datos del módulo
        const [moduleData] = await db.query('SELECT module_number, generates_certificate FROM modules WHERE id = ?', [moduleId]);
        if (!moduleData || moduleData.generates_certificate === 0) return null;
        
        const modNum = moduleData.module_number;

        // 3. Contar usuarios activos en el área
        const [areaUsers] = await db.query(
            'SELECT COUNT(*) as total FROM users WHERE department = ? AND is_active = TRUE',
            [area]
        );
        
        if (areaUsers.total === 0) return null;

        // 4. Contar cuántos han completado este módulo en el área
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

        // 5. Verificar si el equipo está completo (100%)
        if (completions.completed_count >= areaUsers.total) {
            logger.info(`¡Sincronización de Equipo Élite! Área: ${area}, Módulo: ${modNum}`);
            
            const badgeName = 'Equipo Élite';
            
            // Buscar si ya existe la versión específica
            let [badge] = await db.query('SELECT id FROM badges WHERE name = ?', [badgeName]);
            
            if (badge) {
                // 6. Asignación masiva a todo el departamento
                const usersToAward = await db.query('SELECT id FROM users WHERE department = ? AND is_active = TRUE', [area]);
                
                const awardedBadges = [];
                for (const u of usersToAward) {
                    const res = await awardBadge(u.id, badge.id, true);
                    if (res && res.awarded) {
                        awardedBadges.push(res.badge);
                    }
                }
                
                // Retornar información para el feedback del usuario actual
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
 * (Realizar 5 aportes en foros de discusión)
 */
async function checkForumBadge(userId) {
    try {
        const [result] = await db.query(
            'SELECT COUNT(*) as count FROM forum_posts WHERE user_id = ?',
            [userId]
        );

        if (result && result.count >= 5) {
            const [badge] = await db.query("SELECT id FROM badges WHERE name = 'Maestro del Co-Op' LIMIT 1");
            if (badge) {
                return await awardBadge(userId, badge.id);
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
 * (Rango de Leyenda en Modo Difícil de Data Tetris)
 */
async function checkTetrisBadge(userId) {
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
                return await awardBadge(userId, badge.id);
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
 * (Superar un cuestionario en el último intento permitido)
 */
async function checkContinueBadge(userId) {
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
                return await awardBadge(userId, badge.id);
            }
        }
        return null;
    } catch (error) {
        logger.error(`Error en checkContinueBadge para usuario ${userId}:`, error);
        return null;
    }
}

/**
 * Revisa todas las insignias automáticas para un usuario.
 * @returns Un objeto con 'awarded' (boolean) y 'badges' (array de insignias otorgadas)
 */
async function checkAllBadges(userId, extraData = {}) {
    const awardedBadges = [];
    try {
        // 1. Racha (Streak)
        const streak = await checkStreakBadge(userId);
        if (streak && streak.awarded) awardedBadges.push(streak.badge);

        // 2. Descarga de recursos
        const resource = await checkResourceBadge(userId);
        if (resource && resource.awarded) awardedBadges.push(resource.badge);

        // 2b. Aportes en foros (Maestro del Co-Op)
        const forum = await checkForumBadge(userId);
        if (forum && forum.awarded) awardedBadges.push(forum.badge);

        // 2c. Data Tetris Grandmaster
        const tetris = await checkTetrisBadge(userId);
        if (tetris && tetris.awarded) awardedBadges.push(tetris.badge);

        // 2d. El Último Continue
        const retryBadge = await checkContinueBadge(userId);
        if (retryBadge && retryBadge.awarded) awardedBadges.push(retryBadge.badge);

        // 3. Velocidad e Insignias de Módulo Específico (solo si es el momento de completitud)
        if (extraData.moduleId && extraData.isModuleCompletion) {
            // Club de la Velocidad
            const speed = await checkSpeedBadge(userId, extraData.moduleId);
            if (speed && speed.awarded) awardedBadges.push(speed.badge);

            // Lo mejor de la Sabana (2 módulos en un día)
            const sabana = await checkSabanaBadge(userId);
            if (sabana && sabana.awarded) awardedBadges.push(sabana.badge);

            // Módulo 1: Un gran poder...
            const mod1 = await checkModuleOneBadge(userId, extraData.moduleId);
            if (mod1 && mod1.awarded) awardedBadges.push(mod1.badge);

            // Equipo Élite (Grupal)
            const elite = await checkEliteTeamBadge(userId, extraData.moduleId);
            if (elite && elite.awarded) {
                elite.badges.forEach(b => {
                    // Solo añadir a la lista de retorno si no está ya (evitar duplicados visuales)
                    if (!awardedBadges.find(existing => existing.id === b.id)) {
                        awardedBadges.push(b);
                    }
                });
            }
        }

        // 4. Inicio de seguridad (al entrar a un módulo > 0)
        if (extraData.moduleId) {
            const start = await checkFirstModuleBadge(userId, extraData.moduleId);
            if (start && start.awarded) awardedBadges.push(start.badge);
        }

        // 5. Replay (solo si se pasa un repaso)
        if (extraData.isReplay && extraData.passed) {
            const replay = await checkReplayBadge(userId);
            if (replay && replay.awarded) awardedBadges.push(replay.badge);
        }

        return {
            awarded: awardedBadges.length > 0,
            badges: awardedBadges,
            badge: awardedBadges[0] // Para compatibilidad
        };
    } catch (error) {
        logger.error(`Error en checkAllBadges para usuario ${userId}:`, error);
        return { awarded: false, badges: [], badge: null };
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
    checkReplayBadge,
    checkComboX5Badge,
    checkEliteTeamBadge,
    checkForumBadge,
    checkTetrisBadge,
    checkContinueBadge,
    checkAllBadges
};
