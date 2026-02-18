const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { getLevels } = require('../utils/gamification');

// Helper function to get full profile data
const getUserProfileData = async (userId) => {
    // 1. Datos básicos del usuario
    const [user] = await db.query(
        `SELECT id, first_name, last_name, email, profile_picture, role, department, position, created_at, is_active 
         FROM users WHERE id = ?`,
        [userId]
    );

    if (!user) return null;

    // 2. Estadísticas de puntos y nivel + Rankings
    const [stats] = await db.query(
        `SELECT points, level 
         FROM user_points WHERE user_id = ?`,
        [userId]
    );

    // 2.1 Obtener insignias reales de la tabla user_badges
    const userBadges = await db.query(
        `SELECT b.id, b.name, b.description, b.image_url, b.icon_name, ub.earned_at
         FROM user_badges ub
         JOIN badges b ON ub.badge_id = b.id
         WHERE ub.user_id = ?
         ORDER BY ub.earned_at DESC`,
        [userId]
    );

    // Calculate rankings
    const email = user?.email;
    const dept = user?.department;
    const userEmailLower = email ? email.toLowerCase() : '';

    const globalRanking = await db.query(
        `SELECT LOWER(sd.email) as email, RANK() OVER (ORDER BY COALESCE(up.points, -1) DESC, sd.full_name ASC) as pos
         FROM staff_directory sd
         LEFT JOIN users u ON sd.email = u.email
         LEFT JOIN user_points up ON u.id = up.user_id`
    );
    const userGlobalRankRaw = globalRanking.find(r => r.email === userEmailLower);
    const rank = userGlobalRankRaw ? userGlobalRankRaw.pos : (globalRanking.length + 1);

    let departmentRank = null;
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

    // Force refresh of levels to ensure we have the newly migrated data
    const levels = await getLevels(true);
    const currentPoints = Number(stats?.points || 0);

    // Find current level and next level
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
    let pointsInCurrentLevel = 0;
    let levelProgressPercentage = 0;

    if (nextLevel) {
        const nextLevelMinPoints = Number(nextLevel.minPoints ?? nextLevel.min_points ?? 0);
        const currentLevelMinPoints = Number(currentLevel.minPoints ?? currentLevel.min_points ?? 0);

        pointsForNext = Math.max(0, nextLevelMinPoints - currentPoints);
        const levelRange = Math.max(1, nextLevelMinPoints - currentLevelMinPoints);
        pointsInCurrentLevel = Math.max(0, currentPoints - currentLevelMinPoints);
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
        totalUsers: globalRanking.length
    };

    // 3. Resumen de progreso (Módulos completados)
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
         ORDER BY 
            DATE_FORMAT(ga.created_at, '%Y-%m-%d %H:%i') DESC,
            (CASE 
                WHEN ga.activity_type = 'module_completed' THEN 3
                WHEN ga.activity_type = 'quiz_passed' THEN 2
                WHEN ga.activity_type = 'lesson_completed' THEN 1
                ELSE 0 
            END) DESC,
            ga.created_at DESC,
            ga.id DESC
         LIMIT 50`,
        [userId]
    );

    // 5. Certificados obtenidos
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
};

/**
 * @route   GET /api/users/:id/full-profile
 * @desc    Obtener perfil completo de cualquier funcionario (Admin)
 * @access  Private/Admin
 */
router.get('/:id/full-profile', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        console.log(`[ADMIN] Solicitando perfil completo de usuario ID: ${req.params.id} por admin: ${req.user.email}`);
        const profileData = await getUserProfileData(req.params.id);
        if (!profileData) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json({ success: true, ...profileData });
    } catch (error) {
        console.error('Error detallado obteniendo perfil de usuario:', error);
        res.status(500).json({ error: 'Error al cargar el perfil del usuario' });
    }
});

const { cacheMiddleware, clearCache } = require('../middleware/cache');

/**
 * @route   GET /api/users/profile
 * @desc    Obtener perfil completo del funcionario (datos, estadísticas, insignias)
 * @access  Private
 */
router.get('/profile', authMiddleware, cacheMiddleware(300, true), async (req, res) => {
    try {
        const profileData = await getUserProfileData(req.user.id);
        if (!profileData) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json({ success: true, ...profileData });
    } catch (error) {
        console.error('Error detallado obteniendo perfil:', error);
        res.status(500).json({ error: 'Error al cargar el perfil', details: error.message });
    }
});

/**
 * @route   GET /api/users
 * @desc    Obtener todos los usuarios (Admin)
 * @access  Private/Admin
 */
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await db.query(
            `SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.department, u.position, u.is_active, u.created_at, u.last_login,
                    up.points, up.level
             FROM users u
             LEFT JOIN user_points up ON u.id = up.user_id
             ORDER BY u.created_at DESC`
        );

        res.json({
            success: true,
            users
        });
    } catch (error) {
        console.error('Error obteniendo usuarios:', error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

/**
 * @route   GET /api/users/:id
 * @desc    Obtener un usuario específico (Admin)
 * @access  Private/Admin
 */
router.get('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const [user] = await db.query(
            'SELECT id, first_name, last_name, email, role, department, position, is_active FROM users WHERE id = ?',
            [req.params.id]
        );

        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

        res.json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el usuario' });
    }
});

/**
 * @route   PUT /api/users/:id
 * @desc    Actualizar un usuario (Admin)
 * @access  Private/Admin
 */
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { role, department, position, is_active } = req.body;
        const userId = req.params.id;

        await db.query(
            `UPDATE users 
             SET role = ?, department = ?, position = ?, is_active = ?
             WHERE id = ?`,
            [role, department, position, is_active, userId]
        );

        res.json({ success: true, message: 'Usuario actualizado correctamente' });
    } catch (error) {
        console.error('Error actualizando usuario:', error);
        res.status(500).json({ error: 'Error al actualizar usuario' });
    }
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Eliminar un usuario permanentemente (Admin)
 * @access  Private/Admin
 */
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const userId = req.params.id;

        // Evitar que un admin se elimine a sí mismo
        if (userId == req.user.id) {
            return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta administrativa.' });
        }

        await db.query('DELETE FROM users WHERE id = ?', [userId]);

        res.json({ success: true, message: 'Usuario eliminado permanentemente' });
    } catch (error) {
        console.error('Error eliminando usuario:', error);
        res.status(500).json({ error: 'Error al eliminar el usuario' });
    }
});

/**
 * @route   POST /api/users/:id/reset
 * @desc    Reiniciar todo el progreso de un usuario (Admin)
 * @access  Private/Admin
 */
router.post('/:id/reset', authMiddleware, adminMiddleware, async (req, res) => {
    const connection = await db.pool.getConnection();
    try {
        const userId = req.params.id;

        // Invalida el caché (incluyendo vista de estudiante)
        await clearCache(`cache:/api/dashboard*u${userId}*`);
        await clearCache(`cache:/api/users/profile*u${userId}*`);
        await clearCache(`cache:/api/gamification/leaderboard*`);
        await clearCache(`cache:/api/modules*u${userId}*`);
        await clearCache(`cache:/api/lessons/*u${userId}*`);

        await connection.beginTransaction();

        // 1. Eliminar progreso de lecciones
        await connection.query('DELETE FROM user_progress WHERE user_id = ?', [userId]);

        // 2. Eliminar historial de actividades
        await connection.query('DELETE FROM gamification_activities WHERE user_id = ?', [userId]);

        // 3. Eliminar intentos de quiz
        await connection.query('DELETE FROM quiz_attempts WHERE user_id = ?', [userId]);

        // 4. Eliminar certificados
        await connection.query('DELETE FROM certificates WHERE user_id = ?', [userId]);

        // 5. Eliminar insignias (Badges)
        await connection.query('DELETE FROM user_badges WHERE user_id = ?', [userId]);

        // 6. Reiniciar puntos y nivel
        // Obtenemos el nombre del primer nivel para el reset
        const levels = await getLevels();
        const initialLevel = levels[0]?.name || 'Novato';

        await connection.query(
            'UPDATE user_points SET points = 0, level = ?, last_updated = NOW() WHERE user_id = ?',
            [initialLevel, userId]
        );

        await connection.commit();
        res.json({ success: true, message: 'El progreso del usuario ha sido reiniciado completamente' });
    } catch (error) {
        await connection.rollback();
        console.error('Error al reiniciar usuario:', error);
        res.status(500).json({ error: 'Error al reiniciar el progreso del usuario' });
    } finally {
        connection.release();
    }
});

module.exports = router;
