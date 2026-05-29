const db = require('../config/database');
const redisClient = require('../config/redis');
const { getLevels } = require('../utils/gamification');
const logger = require('../config/logger');

class UserService {
    /**
     * Obtiene todos los usuarios con sus puntos y nivel (Admin)
     */
    async getAllUsers() {
        return await db.query(
            `SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.department, u.position, u.is_active, u.created_at, u.last_login, u.login_streak,
                    up.points, up.level
             FROM users u
             LEFT JOIN user_points up ON u.id = up.user_id
             ORDER BY u.created_at DESC`
        );
    }

    /**
     * Obtiene un usuario por ID
     */
    async getUserById(userId) {
        const [user] = await db.query(
            'SELECT id, first_name, last_name, email, role, department, position, is_active, login_streak FROM users WHERE id = ?',
            [userId]
        );
        return user;
    }

    /**
     * Actualiza un usuario (Admin) - Implementación con soporte de actualización parcial (Hardening)
     */
    async updateUser(userId, data) {
        // En MySQL/MariaDB, COALESCE(?, column) mantendrá el valor actual si el primer parámetro es NULL
        // El driver mysql2 mapea 'undefined' a NULL automáticamente.
        await db.query(
            `UPDATE users 
             SET role = COALESCE(?, role), 
                 department = COALESCE(?, department), 
                 position = COALESCE(?, position), 
                 is_active = COALESCE(?, is_active)
             WHERE id = ?`,
            [
                data.role !== undefined ? data.role : null,
                data.department !== undefined ? data.department : null,
                data.position !== undefined ? data.position : null,
                data.is_active !== undefined ? data.is_active : null,
                userId
            ]
        );
    }

    /**
     * Permite que el usuario actualice sus propios datos permitidos (Hardening)
     */
    async updateOwnProfile(userId, data) {
        const { profile_picture } = data;
        await db.query(
            `UPDATE users SET profile_picture = COALESCE(?, profile_picture) WHERE id = ?`,
            [profile_picture !== undefined ? profile_picture : null, userId]
        );
    }

    /**
     * Elimina un usuario
     */
    async deleteUser(userId) {
        await db.query('DELETE FROM users WHERE id = ?', [userId]);
    }

    /**
     * Obtiene el perfil completo (datos, stats, rankings, insignias, progreso, certificados, actividad)
     */
    async getUserProfileData(userId) {
        // 1. Datos básicos
        const [user] = await db.query(
            `SELECT id, first_name, last_name, email, profile_picture, role, department, position, created_at, is_active, login_streak 
             FROM users WHERE id = ?`,
            [userId]
        );

        if (!user) return null;

        // 2. Stats e insignias
        const [stats] = await db.query(
            'SELECT points, level FROM user_points WHERE user_id = ?',
            [userId]
        );

        const userBadges = await db.query(
            `SELECT b.id, b.name, b.description, b.image_url, b.icon_name, ub.earned_at
             FROM user_badges ub
             JOIN badges b ON ub.badge_id = b.id
             WHERE ub.user_id = ?
             ORDER BY ub.earned_at DESC`,
            [userId]
        );

        // Logic for Rankings (Consistent Logic)
        const { getUserRank } = require('../utils/gamification');
        const badgeService = require('./badgeService');
        
        const rankData = await getUserRank(userId, user.email, user.department);
        const totalBadgesAvailable = await badgeService.getTotalPublicBadgesCount();
        
        const rank = rankData.institutionalRank;
        const departmentRank = rankData.departmentalRank;
        const totalUsersCount = rankData.totalUsersCount;

        // Gamification levels logic
        const levels = await getLevels(true);
        const currentPoints = Number(stats?.points || 0);
        let currentLevelIdx = -1;
        for (let i = 0; i < levels.length; i++) {
            const levelPoints = Number(levels[i].minPoints ?? levels[i].min_points ?? 0);
            if (currentPoints >= levelPoints) {
                currentLevelIdx = i;
            } else {
                break;
            }
        }

        const currentLevel = currentLevelIdx >= 0 ? levels[currentLevelIdx] : { name: 'Novato', minPoints: 0 };
        const nextLevel = (currentLevelIdx + 1 < levels.length) ? levels[currentLevelIdx + 1] : null;

        let pointsForNext = 0;
        let levelProgressPercentage = 0;

        if (nextLevel) {
            const nextLevelMinPoints = Number(nextLevel.minPoints ?? nextLevel.min_points ?? 0);
            const currentLevelMinPoints = Number(currentLevel.minPoints ?? currentLevel.min_points ?? 0);
            pointsForNext = Math.max(0, nextLevelMinPoints - currentPoints);
            const levelRange = Math.max(1, nextLevelMinPoints - currentLevelMinPoints);
            const pointsInCurrentLevel = Math.max(0, currentPoints - currentLevelMinPoints);
            levelProgressPercentage = Math.round((pointsInCurrentLevel / levelRange) * 100);
        } else {
            levelProgressPercentage = 100;
        }

        const statsWithRank = {
            points: currentPoints,
            level: `Nivel ${currentLevelIdx + 1}: ${currentLevel.name}`,
            next_level_name: nextLevel ? `Nivel ${currentLevelIdx + 2}: ${nextLevel.name}` : 'Nivel Máximo',
            next_level_min_points: nextLevel ? Number(nextLevel.minPoints ?? nextLevel.min_points ?? 0) : null,
            points_for_next: pointsForNext,
            level_progress_percentage: levelProgressPercentage,
            badges: userBadges,
            badges_count: userBadges.length,
            total_badges_available: totalBadgesAvailable,
            rank: rank,
            departmentRank: departmentRank,
            totalUsers: totalUsersCount
        };

        // 4. Actividad reciente
        const activities = await db.query(
            `SELECT ga.activity_type as type, ga.points_earned, ga.created_at, ga.reference_id,
                CASE 
                    WHEN ga.activity_type = 'lesson_completed' THEN CONCAT('¡Completaste la lección: ', (SELECT title FROM lessons WHERE id = ga.reference_id), '!')
                    WHEN ga.activity_type = 'quiz_passed' THEN CONCAT('¡Aprobaste el cuestionario: ', (SELECT title FROM quizzes WHERE id = ga.reference_id), '!')
                    WHEN ga.activity_type = 'module_completed' THEN CONCAT('¡Completaste el módulo: ', (SELECT title FROM modules WHERE id = ga.reference_id), '!')
                    WHEN ga.activity_type = 'badge_earned' THEN CONCAT('🏆 ¡Ganaste la insignia: ', (SELECT name FROM badges WHERE id = ga.reference_id), '!')
                    WHEN ga.activity_type = 'resource_downloaded' THEN CONCAT('📥 Descargaste: ', (SELECT title FROM resources WHERE id = ga.reference_id))
                    WHEN ga.activity_type = 'task_approved' THEN CONCAT('✅ Tarea aprobada: ', (SELECT title FROM lesson_contents WHERE id = ga.reference_id))
                    ELSE 'Actividad general'
                END as reference_title,
                CASE 
                    WHEN ga.activity_type = 'lesson_completed' THEN (SELECT module_id FROM lessons WHERE id = ga.reference_id)
                    WHEN ga.activity_type = 'quiz_passed' THEN (SELECT module_id FROM quizzes WHERE id = ga.reference_id)
                    WHEN ga.activity_type = 'module_completed' THEN ga.reference_id
                    ELSE NULL
                END as module_id
             FROM gamification_activities ga
             WHERE ga.user_id = ?
             ORDER BY ga.created_at DESC LIMIT 50`,
            [userId]
        );

        // 6. Progreso detallado por módulo
        const moduleService = require('./moduleService');
        // Obtener módulos detallados asegurando que no somos admin para que solo tome los publicados
        const detailedProgress = await moduleService.getModulesWithProgress(userId, false);

        let globalTotalItems = 0;
        let globalCompletedItems = 0;
        let fullyCompletedModulesCount = 0;

        let activeModulesCount = 0;

        const gamification = require('../utils/gamification');

        for (const mod of detailedProgress) {
            // Ignorar módulos cuya fecha de lanzamiento es en el futuro
            if (mod.release_date && new Date(mod.release_date) > new Date()) {
                continue;
            }

            activeModulesCount++;

            const total = mod.userProgress?.total_items || 0;
            // Limitamos completados al total para evitar sumar lecciones opcionales extras
            const completed = Math.min(mod.userProgress?.completed_items || 0, total);

            globalTotalItems += total;
            globalCompletedItems += completed;

            if (mod.completionPercentage >= 100) {
                fullyCompletedModulesCount++;
                // Auto-corrección: Si tiene 100% pero no se le otorgó el certificado en su momento (por algún bug previo o backfill), forzar la verificación.
                await gamification.checkAndRecordModuleCompletion(userId, mod.id);
            }
        }

        let globalPercentage = globalTotalItems > 0
            ? Math.round((globalCompletedItems / globalTotalItems) * 100)
            : 0;

        if (globalPercentage > 100) {
            globalPercentage = 100;
        }

        // 5. Certificados (consultados después de la auto-corrección para asegurar que se retornen)
        const certificates = await db.query(
            `SELECT c.*, m.title as module_title 
             FROM certificates c
             JOIN modules m ON c.module_id = m.id
             WHERE c.user_id = ?`,
            [userId]
        );

        return {
            user,
            stats: statsWithRank,
            progress: {
                completed: fullyCompletedModulesCount,
                total: activeModulesCount,
                percentage: globalPercentage,
                detailed: detailedProgress
            },
            activities,
            certificates
        };
    }

    /**
     * Reinicia el progreso de un usuario (todo o un módulo específico)
     */
    async resetUserProgress(userId, moduleId = null) {
        const connection = await db.pool.getConnection();
        try {
            await connection.beginTransaction();

            if (moduleId) {
                // REINICIO SELECTIVO POR MÓDULO
                // 1. Obtener IDs de lecciones del módulo
                const [lessons] = await connection.query('SELECT id FROM lessons WHERE module_id = ?', [moduleId]);
                const lessonIds = lessons.map(l => l.id);

                if (lessonIds.length > 0) {
                    // 2. Eliminar progreso de contenido
                    await connection.query(`
                        DELETE FROM user_content_progress 
                        WHERE user_id = ? AND content_id IN (
                            SELECT id FROM lesson_contents WHERE lesson_id IN (?)
                        )`, [userId, lessonIds]);
                    
                    // 3. Eliminar intentos de quices
                    await connection.query(`
                        DELETE FROM quiz_attempts 
                        WHERE user_id = ? AND quiz_id IN (
                            SELECT JSON_VALUE(data, '$.quiz_id') 
                            FROM lesson_contents 
                            WHERE lesson_id IN (?) AND content_type = 'quiz'
                        )`, [userId, lessonIds]);

                    // 4. Eliminar tareas enviadas
                    await connection.query(`
                        DELETE FROM assignment_submissions 
                        WHERE user_id = ? AND content_id IN (
                            SELECT id FROM lesson_contents WHERE lesson_id IN (?)
                        )`, [userId, lessonIds]);

                    // 5. Eliminar respuestas de encuestas
                    await connection.query(`
                        DELETE FROM survey_answers 
                        WHERE response_id IN (
                            SELECT id FROM survey_responses 
                            WHERE user_id = ? AND survey_id IN (
                                SELECT id FROM surveys WHERE lesson_id IN (?)
                            )
                        )`, [userId, lessonIds]);

                    await connection.query(`
                        DELETE FROM survey_responses 
                        WHERE user_id = ? AND survey_id IN (
                            SELECT id FROM surveys WHERE lesson_id IN (?)
                        )`, [userId, lessonIds]);
                }

                // 6. Eliminar progreso de lecciones
                await connection.query('DELETE FROM user_progress WHERE user_id = ? AND module_id = ?', [userId, moduleId]);

                // 7. Eliminar certificados y insignias del módulo
                await connection.query('DELETE FROM certificates WHERE user_id = ? AND module_id = ?', [userId, moduleId]);
                await connection.query(`
                    DELETE FROM user_badges 
                    WHERE user_id = ? AND badge_id IN (
                        SELECT id FROM badges 
                        WHERE criteria_type = 'module_completion' AND criteria_value = ?
                    )`, [userId, moduleId.toString()]);
                
                // 8. Eliminar actividades de gamificación relacionadas al módulo o sus lecciones
                await connection.query(`
                    DELETE FROM gamification_activities 
                    WHERE user_id = ? AND (
                        (activity_type = 'module_completed' AND reference_id = ?) OR
                        (activity_type = 'lesson_completed' AND reference_id IN (?)) OR
                        (activity_type = 'quiz_passed' AND reference_id IN (SELECT id FROM quizzes WHERE lesson_id IN (?))) OR
                        (activity_type = 'task_approved' AND reference_id IN (SELECT id FROM lesson_contents WHERE lesson_id IN (?))) OR
                        (activity_type = 'survey_completed' AND reference_id IN (SELECT id FROM surveys WHERE module_id = ? OR lesson_id IN (?))) OR
                        (activity_type IN ('forum_post', 'forum_reply') AND reference_id IN (SELECT id FROM lesson_contents WHERE lesson_id IN (?))) OR
                        (activity_type = 'badge_earned' AND reference_id IN (SELECT id FROM badges WHERE criteria_type = 'module_completion' AND criteria_value = ?)) OR
                        (activity_type = 'resource_downloaded' AND (
                            reference_id IN (SELECT id FROM resources WHERE module_id = ?) OR
                            reference_id IN (SELECT id FROM lesson_contents WHERE lesson_id IN (?))
                        ))
                    )`, [
                        userId, 
                        moduleId, 
                        lessonIds.length > 0 ? lessonIds : [0], 
                        lessonIds.length > 0 ? lessonIds : [0], 
                        lessonIds.length > 0 ? lessonIds : [0],
                        moduleId,
                        lessonIds.length > 0 ? lessonIds : [0],
                        lessonIds.length > 0 ? lessonIds : [0],
                        moduleId.toString(),
                        moduleId,
                        lessonIds.length > 0 ? lessonIds : [0]
                    ]);

            } else {
                // REINICIO TOTAL (Existente)
                await connection.query('DELETE FROM user_progress WHERE user_id = ?', [userId]);
                await connection.query('DELETE FROM user_content_progress WHERE user_id = ?', [userId]);
                await connection.query('DELETE FROM gamification_activities WHERE user_id = ?', [userId]);
                await connection.query('DELETE FROM quiz_attempts WHERE user_id = ?', [userId]);
                await connection.query(
                    'DELETE FROM survey_answers WHERE response_id IN (SELECT id FROM survey_responses WHERE user_id = ?)',
                    [userId]
                );
                await connection.query('DELETE FROM survey_responses WHERE user_id = ?', [userId]);
                await connection.query('DELETE FROM assignment_submissions WHERE user_id = ?', [userId]);
                await connection.query('DELETE FROM certificates WHERE user_id = ?', [userId]);
                await connection.query('DELETE FROM user_badges WHERE user_id = ?', [userId]);
            }

            // RECALCULAR PUNTOS TOTALES basándose en lo que quedó en gamification_activities
            const [totalPointsRows] = await connection.query(
                'SELECT SUM(points_earned) as total FROM gamification_activities WHERE user_id = ?',
                [userId]
            );
            const newTotalPoints = totalPointsRows[0]?.total || 0;

            // Actualizar el balance oficial en la tabla de puntos
            await connection.query(
                `INSERT INTO user_points (user_id, points) VALUES (?, ?) 
                 ON DUPLICATE KEY UPDATE points = ?, last_updated = NOW()`,
                [userId, newTotalPoints, newTotalPoints]
            );

            const { syncUserLevel } = require('../utils/gamification');
            // Ahora sí, sincronizamos el nivel basándonos en los puntos ya actualizados
            const levelData = await syncUserLevel(userId, connection);

            await connection.commit();
            return { 
                newPoints: newTotalPoints,
                newLevel: levelData?.newLevel || 'Novato'
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = new UserService();
