const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

/**
 * @route   GET /api/dashboard
 * @desc    Obtener resumen de estadísticas y progreso para el usuario
 * @access  Private
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Obtener estadísticas de módulos
        const [moduleStats] = await db.query(
            `SELECT 
                (SELECT COUNT(*) FROM modules WHERE is_published = TRUE) as totalModules,
                (SELECT COUNT(DISTINCT module_id) FROM user_progress WHERE user_id = ? AND status = 'completed') as completedModules
            `,
            [userId]
        );

        // 2. Obtener puntos y rango del usuario
        const [userPoints] = await db.query(
            `SELECT points, level, rank_position FROM user_points WHERE user_id = ?`,
            [userId]
        );

        // 3. Obtener total de usuarios para el ranking
        const [totalUsersData] = await db.query('SELECT COUNT(*) as total FROM users WHERE is_active = TRUE');

        // 4. Obtener módulos recientes (con los que ha interactuado o los más nuevos)
        const recentModules = await db.query(
            `SELECT 
                m.id, 
                m.title, 
                COALESCE(SUM(up.progress_percentage) / COUNT(l.id), 0) as progress,
                CASE 
                    WHEN COUNT(CASE WHEN up.status = 'completed' THEN 1 END) = COUNT(l.id) AND COUNT(l.id) > 0 THEN 'completed'
                    WHEN COUNT(up.id) > 0 THEN 'in_progress'
                    ELSE 'not_started'
                END as status
            FROM modules m
            LEFT JOIN lessons l ON m.id = l.module_id AND l.is_published = TRUE
            LEFT JOIN user_progress up ON l.id = up.lesson_id AND up.user_id = ?
            WHERE m.is_published = TRUE
            GROUP BY m.id
            ORDER BY COALESCE(MAX(up.updated_at), m.created_at) DESC
            LIMIT 3`,
            [userId]
        );

        const stats = {
            completedModules: moduleStats.completedModules || 0,
            totalModules: moduleStats.totalModules || 0,
            points: userPoints?.points || 0,
            level: userPoints?.level || 'Novato',
            rank: userPoints?.rank_position || totalUsersData.total,
            totalUsers: totalUsersData.total,
            completionPercentage: moduleStats.totalModules > 0
                ? Math.round((moduleStats.completedModules / moduleStats.totalModules) * 100)
                : 0
        };

        res.json({
            success: true,
            stats,
            recentModules: recentModules.map(m => ({
                ...m,
                progress: Math.round(m.progress)
            }))
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
