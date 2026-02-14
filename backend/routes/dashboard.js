const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { cacheMiddleware } = require('../middleware/cache');

/**
 * @route   GET /api/dashboard
 * @desc    Obtener resumen de estadísticas y progreso para el usuario
 * @access  Private
 */
router.get('/', authMiddleware, cacheMiddleware(300, true), async (req, res) => {
    try {
        const userId = req.user.id;
        const isStudentView = req.headers['x-view-as-student'] === 'true';
        const isAdmin = req.user.role === 'admin' && !isStudentView;

        // 1. Obtener todos los módulos (Admins ven todos, estudiantes solo publicados)
        const modules = await db.query(
            `SELECT m.id, m.title, m.order_index
             FROM modules m
             WHERE 1=1 ${isAdmin ? '' : 'AND m.is_published = TRUE AND (m.release_date IS NULL OR m.release_date <= NOW())'}
             ORDER BY m.order_index ASC`
        );

        let completedModulesCount = 0;
        let totalMandatoryItemsGlobally = 0;
        let completedMandatoryItemsGlobally = 0;
        const totalModulesCount = modules.length;
        const modulesWithProgress = [];

        for (const m of modules) {
            // Contar lecciones totales (SOLO OBLIGATORIAS) y completadas (SOLO OBLIGATORIAS)
            const [lessonsData] = await db.query(
                `SELECT 
                    COUNT(CASE WHEN l.is_optional = FALSE THEN 1 END) as total,
                    COUNT(CASE WHEN up.status = 'completed' AND l.is_optional = FALSE THEN 1 END) as completed
                 FROM lessons l
                 LEFT JOIN user_progress up ON l.id = up.lesson_id AND up.user_id = ?
                 WHERE l.module_id = ? ${isAdmin ? '' : 'AND l.is_published = TRUE'}`,
                [userId, m.id]
            );

            // Contar quizzes totales y aprobados
            const [quizzesData] = await db.query(
                `SELECT 
                    COUNT(*) as total,
                    (SELECT COUNT(DISTINCT quiz_id) FROM quiz_attempts qa 
                     WHERE qa.user_id = ? AND qa.passed = TRUE 
                     AND qa.quiz_id IN (SELECT id FROM quizzes WHERE module_id = ? ${isAdmin ? '' : 'AND is_published = TRUE'})) as completed
                 FROM quizzes q
                 WHERE q.module_id = ? ${isAdmin ? '' : 'AND q.is_published = TRUE'}`,
                [userId, m.id, m.id]
            );

            const totalItems = (lessonsData.total || 0) + (quizzesData.total || 0);
            const completedItems = (lessonsData.completed || 0) + (quizzesData.completed || 0);

            totalMandatoryItemsGlobally += totalItems;
            completedMandatoryItemsGlobally += completedItems;

            const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
            const isFullyCompleted = totalItems > 0 && completedItems === totalItems;

            if (isFullyCompleted) completedModulesCount++;

            // Determinar siguiente lección
            const [nextLesson] = await db.query(
                `SELECT l.id FROM lessons l
                 LEFT JOIN user_progress up ON l.id = up.lesson_id AND up.user_id = ?
                 WHERE l.module_id = ? AND l.is_published = TRUE 
                 AND (up.status IS NULL OR up.status != 'completed')
                 ORDER BY l.order_index ASC LIMIT 1`,
                [userId, m.id]
            );

            modulesWithProgress.push({
                id: m.id,
                title: m.title,
                order_index: m.order_index,
                progress: progress,
                status: isFullyCompleted ? 'completed' : (completedItems > 0 ? 'in_progress' : 'not_started'),
                next_lesson_id: nextLesson?.id || null
            });
        }

        // 2. Obtener puntos y nivel del usuario
        const [userPoints] = await db.query(
            `SELECT points, level FROM user_points WHERE user_id = ?`,
            [userId]
        );

        // 3. Rankings
        const [userData] = await db.query(`SELECT email, department FROM users WHERE id = ?`, [userId]);
        const email = userData?.email;
        const dept = userData?.department;

        const globalRanking = await db.query(
            `SELECT LOWER(sd.email) as email, RANK() OVER (ORDER BY COALESCE(up.points, -1) DESC, sd.full_name ASC) as pos
             FROM staff_directory sd
             LEFT JOIN users u ON sd.email = u.email
             LEFT JOIN user_points up ON u.id = up.user_id`
        );

        const userEmailLower = (email || '').toLowerCase();
        const userGlobalRankRaw = globalRanking.find(r => r.email.toLowerCase() === userEmailLower);
        const institutionalRank = userGlobalRankRaw ? userGlobalRankRaw.pos : (globalRanking.length + 1);

        let departmentalRank = null;
        let totalInDepartment = 0;
        if (dept) {
            const deptRanking = await db.query(
                `SELECT LOWER(sd.email) as email, RANK() OVER (ORDER BY COALESCE(up.points, -1) DESC, sd.full_name ASC) as pos
                 FROM staff_directory sd
                 LEFT JOIN users u ON sd.email = u.email
                 LEFT JOIN user_points up ON u.id = up.user_id
                 WHERE sd.department = ?`,
                [dept]
            );
            const userDeptRankRaw = deptRanking.find(r => r.email.toLowerCase() === userEmailLower);
            departmentalRank = userDeptRankRaw ? userDeptRankRaw.pos : null;
            totalInDepartment = deptRanking.length;
        }

        const stats = {
            completedModules: completedModulesCount,
            totalModules: totalModulesCount,
            points: userPoints?.points || 0,
            level: userPoints?.level || 'Novato',
            rank: institutionalRank,
            departmentRank: departmentalRank,
            totalInDepartment,
            totalUsers: globalRanking.length,
            completionPercentage: totalMandatoryItemsGlobally > 0
                ? Math.round((completedMandatoryItemsGlobally / totalMandatoryItemsGlobally) * 100)
                : 0
        };

        res.json({
            success: true,
            stats,
            modules: modulesWithProgress
        });
    } catch (error) {
        console.error('Error en dashboard:', error);
        res.status(500).json({ error: 'Error al cargar datos del dashboard' });
    }
});

/**
 * @route   GET /api/dashboard/admin-stats
 * @desc    Obtener estadísticas globales para el panel de administración
 * @access  Private/Admin
 */
router.get('/admin-stats', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const [userStats] = await db.query('SELECT COUNT(*) as count FROM users');
        const [moduleStats] = await db.query('SELECT COUNT(*) as count FROM modules');

        // Mejor enfoque: Parallel queries
        const stats = {
            users: userStats?.count || 0,
            modules: moduleStats?.count || 0,
            campaigns: 0
        };

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Error in admin stats:', error);
        res.status(500).json({ error: 'Error al cargar estadísticas de admin' });
    }
});

module.exports = router;
