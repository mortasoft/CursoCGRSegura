const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { cacheMiddleware } = require('../middleware/cache');
const { getLevels } = require('../utils/gamification');

/**
 * @route   GET /api/gamification/leaderboard
 * @desc    Obtener el ranking global de funcionarios
 * @access  Private
 */
router.get('/leaderboard', authMiddleware, cacheMiddleware(600, true), async (req, res) => {
    try {
        const userId = req.user.id;
        const isAdmin = req.user.role === 'admin' && req.headers['x-view-as-student'] !== 'true';

        // 0. Get user basic info
        const [userBasic] = await db.query('SELECT email, department FROM users WHERE id = ?', [userId]);
        const email = userBasic?.email;
        const department = userBasic?.department;
        const userEmailLower = email ? email.toLowerCase() : '';

        // 1. Calculate INSTITUTIONAL RANK (Global) for EVERYONE in the directory
        // Using -1 for points to ensure alphabetic tie-breaking starts after someone actually has 0 points recorded? 
        // Actually, we want to rank based on points, then full_name.
        const globalRanking = await db.query(
            `SELECT LOWER(sd.email) as email, RANK() OVER (ORDER BY COALESCE(up.points, -1) DESC, sd.full_name ASC) as pos
             FROM staff_directory sd
             LEFT JOIN users u ON sd.email = u.email
             LEFT JOIN user_points up ON u.id = up.user_id`
        );

        // Find current user's rank
        const userGlobalRankRaw = globalRanking.find(r => r.email === userEmailLower);
        const myGlobalRankPos = userGlobalRankRaw ? userGlobalRankRaw.pos : (globalRanking.length + 1);

        // 2. Calculate DEPARTMENT RANK and Leaderboard
        let departmentLeaderboard = [];
        let myDeptRankPos = null;

        if (department) {
            const deptRanking = await db.query(
                `SELECT 
                    sd.full_name, u.first_name, u.last_name, u.profile_picture, sd.department, sd.email,
                    COALESCE(up.points, 0) as points, 
                    COALESCE(up.level, 'Novato') as level,
                    RANK() OVER (ORDER BY COALESCE(up.points, -1) DESC, sd.full_name ASC) as rank_position
                 FROM staff_directory sd
                 LEFT JOIN users u ON sd.email = u.email
                 LEFT JOIN user_points up ON u.id = up.user_id
                 WHERE sd.department = ?
                 ORDER BY points DESC, sd.full_name ASC`,
                [department]
            );
            departmentLeaderboard = deptRanking.map(r => ({
                ...r,
                id: r.email,
                first_name: r.first_name || r.full_name.split(' ')[0],
                last_name: r.last_name || r.full_name.split(' ').slice(1).join(' '),
                rank_position: r.rank_position
            }));
            const myEntry = departmentLeaderboard.find(r => r.email.toLowerCase() === userEmailLower);
            myDeptRankPos = myEntry ? myEntry.rank_position : null;
        }

        // 3. For Admins: Get full Institutional Leaderboard
        let institutionalLeaderboard = [];
        if (isAdmin) {
            const instRanking = await db.query(
                `SELECT 
                    sd.full_name, u.first_name, u.last_name, u.profile_picture, sd.department, sd.email,
                    COALESCE(up.points, 0) as points, 
                    COALESCE(up.level, 'Novato') as level,
                    RANK() OVER (ORDER BY COALESCE(up.points, -1) DESC, sd.full_name ASC) as rank_position
                 FROM staff_directory sd
                 LEFT JOIN users u ON sd.email = u.email
                 LEFT JOIN user_points up ON u.id = up.user_id
                 ORDER BY points DESC, sd.full_name ASC`
            );
            institutionalLeaderboard = instRanking.map(r => ({
                ...r,
                id: r.email,
                first_name: r.first_name || r.full_name.split(' ')[0],
                last_name: r.last_name || r.full_name.split(' ').slice(1).join(' '),
                rank_position: r.rank_position
            }));
        }

        const [userPointsData] = await db.query('SELECT points, level FROM user_points WHERE user_id = ?', [userId]);

        // 4. Department Trends Summary
        const departmentRanking = await db.query(
            `SELECT 
                sd.department, 
                SUM(COALESCE(up.points, 0)) as total_points, 
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
             ORDER BY total_points DESC`
        );

        res.json({
            success: true,
            currentUser: {
                userId,
                points: userPointsData?.points || 0,
                level: userPointsData?.level || 'Novato',
                globalRank: myGlobalRankPos,
                deptRank: myDeptRankPos,
                department
            },
            institutionalLeaderboard: isAdmin ? institutionalLeaderboard : [],
            departmentLeaderboard,
            departmentRanking: isAdmin ? departmentRanking : [],
            scope: isAdmin ? 'institutional' : 'department'
        });
    } catch (error) {
        console.error('Error obteniendo leaderboard:', error);
        res.status(500).json({ error: 'Error al cargar el ranking' });
    }
});

/**
 * @route   GET /api/gamification/settings
 * @desc    Obtener configuración de niveles y puntos
 * @access  Private/Admin
 */
router.get('/settings', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const levels = await getLevels(true);
        const settingsRaw = await db.query('SELECT setting_key, setting_value FROM system_settings');

        const settings = {};
        settingsRaw.forEach(s => {
            settings[s.setting_key] = s.setting_value;
        });

        res.json({
            success: true,
            levels
        });
    } catch (error) {
        console.error('Error obteniendo settings de gamificación:', error);
        res.status(500).json({ error: 'Error al cargar configuración' });
    }
});

/**
 * @route   PUT /api/gamification/settings
 * @desc    Actualizar configuración de niveles y puntos
 * @access  Private/Admin
 */
router.put('/settings', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { levels, points } = req.body;

        // 1. Actualizar niveles if present
        if (levels && Array.isArray(levels)) {
            await db.query('DELETE FROM gamification_levels');
            for (const level of levels) {
                const minPoints = level.minPoints !== undefined ? level.minPoints : (level.min_points !== undefined ? level.min_points : 0);
                await db.query(
                    'INSERT INTO gamification_levels (name, min_points, icon) VALUES (?, ?, ?)',
                    [level.name || 'Nivel', minPoints, level.icon || 'Award']
                );
            }
            await getLevels(true); // Refrescar caché
        }

        // points removal handled here (nothing to do as we only process levels if present)

        res.json({ success: true, message: 'Configuración actualizada correctamente' });
    } catch (error) {
        console.error('Error actualizando settings de gamificación:', error);
        res.status(500).json({ error: 'Error al actualizar configuración' });
    }
});

module.exports = router;
