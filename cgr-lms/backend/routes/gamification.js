const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

/**
 * @route   GET /api/gamification/leaderboard
 * @desc    Obtener el ranking global de funcionarios
 * @access  Private
 */
router.get('/leaderboard', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Obtener Top 20 funcionarios con sus datos básicos (Calculando rango dinámico)
        const topUsers = await db.query(
            `SELECT 
                u.id, u.first_name, u.last_name, u.profile_picture, u.department,
                up.points, up.level,
                ROW_NUMBER() OVER (ORDER BY up.points DESC) as rank_position
             FROM user_points up
             JOIN users u ON up.user_id = u.id
             WHERE u.is_active = TRUE
             ORDER BY up.points DESC
             LIMIT 20`
        );

        // 2. Obtener posición actual del usuario que consulta (Escaneo de ranking completo)
        const rankingList = await db.query(
            `SELECT user_id, ROW_NUMBER() OVER (ORDER BY points DESC) as pos
             FROM user_points`
        );
        const myRank = rankingList.find(r => r.user_id === userId);
        const [userData] = await db.query('SELECT points, level FROM user_points WHERE user_id = ?', [userId]);

        const currentUserRank = {
            points: userData?.points || 0,
            level: userData?.level || 'Novato',
            rank_position: myRank?.pos || rankingList.length + 1
        };

        // 3. (Opcional) Obtener ranking por departamento
        const departmentRanking = await db.query(
            `SELECT u.department, SUM(up.points) as total_points, COUNT(u.id) as staff_count
             FROM users u
             JOIN user_points up ON u.id = up.user_id
             WHERE u.department IS NOT NULL
             GROUP BY u.department
             ORDER BY total_points DESC`
        );

        res.json({
            success: true,
            leaderboard: topUsers,
            currentUser: {
                ...currentUserRank,
                userId
            },
            departmentRanking
        });
    } catch (error) {
        console.error('Error obteniendo leaderboard:', error);
        res.status(500).json({ error: 'Error al cargar el ranking' });
    }
});

module.exports = router;
