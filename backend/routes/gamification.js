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
        const isAdmin = req.user.role === 'admin';

        // 0. Get user basic info
        const [userBasic] = await db.query('SELECT department FROM users WHERE id = ?', [userId]);
        const department = userBasic?.department;

        // 1. Calculate INSTITUTIONAL RANK (Global) for EVERYONE in the directory
        const globalRanking = await db.query(
            `SELECT sd.email, RANK() OVER (ORDER BY COALESCE(up.points, 0) DESC) as pos
             FROM staff_directory sd
             LEFT JOIN users u ON sd.email = u.email
             LEFT JOIN user_points up ON u.id = up.user_id`
        );

        // Find current user's email to get their rank
        const [currentUserEmail] = await db.query('SELECT email FROM users WHERE id = ?', [userId]);
        const myGlobalRank = globalRanking.find(r => r.email === currentUserEmail?.email);

        // 2. Calculate DEPARTMENT RANK
        let departmentLeaderboard = [];
        let myDeptRank = null;

        if (department) {
            const deptRanking = await db.query(
                `SELECT 
                    sd.full_name, u.first_name, u.last_name, u.profile_picture, sd.department, sd.email,
                    COALESCE(up.points, 0) as points, 
                    COALESCE(up.level, 'Novato') as level,
                    RANK() OVER (ORDER BY COALESCE(up.points, 0) DESC) as rank_position
                 FROM staff_directory sd
                 LEFT JOIN users u ON sd.email = u.email
                 LEFT JOIN user_points up ON u.id = up.user_id
                 WHERE sd.department = ?
                 ORDER BY points DESC, sd.full_name ASC`,
                [department]
            );
            departmentLeaderboard = deptRanking.map(r => ({
                ...r,
                // Use email as ID if user not registered yet for React keys
                id: r.email,
                first_name: r.first_name || r.full_name.split(' ')[0],
                last_name: r.last_name || r.full_name.split(' ').slice(1).join(' '),
                rank_position: r.points > 0 ? r.rank_position : null
            }));
            const myEntry = departmentLeaderboard.find(r => r.email === currentUserEmail?.email);
            // If user has 0 points, rank is null or not ranked
            myDeptRank = (myEntry && myEntry.points > 0) ? myEntry : null;
        }

        // 3. For Admins: Get full Institutional Leaderboard (Top 100)
        let institutionalLeaderboard = [];
        if (isAdmin) {
            const instRanking = await db.query(
                `SELECT 
                    sd.full_name, u.first_name, u.last_name, u.profile_picture, sd.department, sd.email,
                    COALESCE(up.points, 0) as points, 
                    COALESCE(up.level, 'Novato') as level,
                    RANK() OVER (ORDER BY COALESCE(up.points, 0) DESC) as rank_position
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
                rank_position: r.points > 0 ? r.rank_position : null
            }));
        }

        const [userData] = await db.query('SELECT points, level FROM user_points WHERE user_id = ?', [userId]);

        // 4. Department Trends (Summary for Admin or comparison)
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
                 ORDER BY COALESCE(up2.points, 0) DESC, sd2.full_name ASC LIMIT 1) as top_performer,
                (SELECT COALESCE(up3.points, 0) 
                 FROM staff_directory sd3
                 LEFT JOIN users u3 ON sd3.email = u3.email
                 LEFT JOIN user_points up3 ON u3.id = up3.user_id
                 WHERE sd3.department = sd.department 
                 ORDER BY COALESCE(up3.points, 0) DESC LIMIT 1) as top_points
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
                points: userData?.points || 0,
                level: userData?.level || 'Novato',
                globalRank: (myGlobalRank && myGlobalRank.pos && (userData?.points > 0)) ? myGlobalRank.pos : null,
                deptRank: (myDeptRank && myDeptRank.rank_position) ? myDeptRank.rank_position : null,
                department
            },
            institutionalLeaderboard: isAdmin ? institutionalLeaderboard : [], // Only admins see the full detail
            departmentLeaderboard: departmentLeaderboard, // Everyone sees their own area
            departmentRanking: isAdmin ? departmentRanking : [],
            scope: isAdmin ? 'institutional' : 'department'
        });
    } catch (error) {
        console.error('Error obteniendo leaderboard:', error);
        res.status(500).json({ error: 'Error al cargar el ranking' });
    }
});

module.exports = router;
