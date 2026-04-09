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
            `SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.department, u.position, u.is_active, u.created_at, u.last_login,
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
            'SELECT id, first_name, last_name, email, role, department, position, is_active FROM users WHERE id = ?',
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
            `SELECT id, first_name, last_name, email, profile_picture, role, department, position, created_at, is_active 
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

        // Logic for Rankings (Redis with Fallback)
        let rank = null;
        let departmentRank = null;
        let totalUsersCount = 0;
        const userEmailLower = user.email ? user.email.toLowerCase() : '';
        const dept = user.department;

        if (redisClient && redisClient.isOpen) {
            try {
                const zRank = await redisClient.zRevRank('leaderboard:points', userId.toString());
                const cachedInst = await redisClient.get('leaderboard:institutional');
                if (cachedInst) {
                    const institutionalLeaderboard = JSON.parse(cachedInst);
                    totalUsersCount = institutionalLeaderboard.length;
                    if (zRank !== null) {
                        rank = zRank + 1;
                    } else {
                        const userEntry = institutionalLeaderboard.find(r => r.email?.toLowerCase() === userEmailLower);
                        rank = userEntry ? userEntry.rank_position : (totalUsersCount + 1);
                    }
                    if (dept) {
                        const deptUsers = institutionalLeaderboard.filter(r => r.department === dept);
                        const myDeptIndex = deptUsers.findIndex(r => r.email?.toLowerCase() === userEmailLower);
                        departmentRank = myDeptIndex !== -1 ? myDeptIndex + 1 : null;
                    }
                }
            } catch (redisError) {
                logger.error('Redis error in profile ranking:', redisError);
            }
        }

        if (rank === null) {
            const globalRanking = await db.query(
                `SELECT LOWER(sd.email) as email, RANK() OVER (ORDER BY COALESCE(up.points, -1) DESC, sd.full_name ASC) as pos
                 FROM staff_directory sd
                 LEFT JOIN users u ON sd.email = u.email
                 LEFT JOIN user_points up ON u.id = up.user_id`
            );
            const userGlobalRankRaw = globalRanking.find(r => r.email === userEmailLower);
            rank = userGlobalRankRaw ? userGlobalRankRaw.pos : (globalRanking.length + 1);
            totalUsersCount = globalRanking.length;

            if (dept) {
                const deptRanking = await db.query(
                    `SELECT LOWER(sd.email) as email, RANK() OVER (ORDER BY COALESCE(up.points, -1) DESC, sd.full_name ASC) as pos
                     FROM staff_directory sd
                     LEFT JOIN users u ON sd.email = u.email
                     LEFT JOIN user_points up ON u.id = up.user_id
                     WHERE sd.department = ?`,
                    [dept]
                );
                const userDeptRankRaw = deptRanking.find(r => r.email === userEmailLower);
                departmentRank = userDeptRankRaw ? userDeptRankRaw.pos : null;
            }
        }

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
            level: `Nivel ${currentLevelIdx + 1}: ${stats?.level || currentLevel.name}`,
            next_level_name: nextLevel ? `Nivel ${currentLevelIdx + 2}: ${nextLevel.name}` : 'Nivel Máximo',
            next_level_min_points: nextLevel ? Number(nextLevel.minPoints ?? nextLevel.min_points ?? 0) : null,
            points_for_next: pointsForNext,
            level_progress_percentage: levelProgressPercentage,
            badges: userBadges,
            rank: rank,
            departmentRank: departmentRank,
            totalUsers: totalUsersCount
        };

        // 3. Progreso de módulos
        const [progressResult] = await db.query(
            `SELECT 
                COUNT(DISTINCT module_id) as completed_modules,
                (SELECT COUNT(*) FROM modules WHERE is_published = TRUE) as total_modules
             FROM user_progress 
             WHERE user_id = ? AND status = 'completed'`,
            [userId]
        );

        // 4. Actividad reciente
        const activities = await db.query(
            `SELECT ga.activity_type as type, ga.points_earned, ga.created_at, ga.reference_id,
                CASE 
                    WHEN ga.activity_type = 'lesson_completed' THEN (SELECT title FROM lessons WHERE id = ga.reference_id)
                    WHEN ga.activity_type = 'quiz_passed' THEN (SELECT title FROM quizzes WHERE id = ga.reference_id)
                    WHEN ga.activity_type = 'module_completed' THEN (SELECT title FROM modules WHERE id = ga.reference_id)
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

        // 5. Certificados
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
                completed: progressResult.completed_modules || 0,
                total: progressResult.total_modules || 0,
                percentage: progressResult.total_modules > 0 ? Math.round((progressResult.completed_modules / progressResult.total_modules) * 100) : 0
            },
            activities,
            certificates
        };
    }

    /**
     * Reinicia el progreso completo de un usuario
     */
    async resetUserProgress(userId) {
        const connection = await db.pool.getConnection();
        try {
            await connection.beginTransaction();

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

            const levels = await getLevels();
            const initialLevel = levels[0]?.name || 'Novato';

            await connection.query(
                `INSERT INTO user_points (user_id, points, level) 
                 VALUES (?, 0, ?) 
                 ON DUPLICATE KEY UPDATE points = 0, level = ?`,
                [userId, initialLevel, initialLevel]
            );

            await connection.commit();
            return { initialLevel };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = new UserService();
