const express = require('express');
const router = express.Router();

const logger = require('../config/logger');
const db = require('../config/database');
const { authMiddleware, adminMiddleware, analystMiddleware } = require('../middleware/auth');
const { cacheMiddleware } = require('../middleware/cache');
const badgeService = require('../services/badgeService');

router.get('/', authMiddleware, cacheMiddleware(300, true), async (req, res) => {
    try {
        const userId = req.user.id;
        const isStudentView = req.headers['x-view-as-student'] === 'true' || req.headers['X-View-As-Student'] === 'true';
        const isAdmin = req.user.role === 'admin' && !isStudentView;

        // 1. Obtener todos los módulos (Admins ven todos, estudiantes ven los publicados incluyendo futuros)
        const modules = await db.query(
            `SELECT m.id, m.title, m.order_index, m.requires_previous, m.release_date
             FROM modules m
             WHERE 1=1 ${isAdmin ? '' : 'AND m.is_published = 1'}
             ORDER BY m.order_index ASC`
        );

        let completedModulesCount = 0;
        let totalMandatoryItemsGlobally = 0;
        let completedMandatoryItemsGlobally = 0;
        const totalModulesCount = modules.length;
        const modulesWithProgress = [];

        let lastModuleCompleted = true;
        let previousModuleTitle = "";

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

            // Contar quizzes totales y aprobados (SOLO INDEPENDIENTES)
            const [quizzesData] = await db.query(
                `SELECT 
                    COUNT(*) as total,
                    (SELECT COUNT(DISTINCT quiz_id) FROM quiz_attempts qa 
                     WHERE qa.user_id = ? AND qa.passed = TRUE 
                     AND qa.quiz_id IN (SELECT id FROM quizzes WHERE module_id = ? ${isAdmin ? '' : 'AND is_published = TRUE'} AND lesson_id IS NULL)) as completed
                 FROM quizzes q
                 WHERE q.module_id = ? ${isAdmin ? '' : 'AND q.is_published = TRUE'} AND q.lesson_id IS NULL`,
                [userId, m.id, m.id]
            );

            const totalItems = (lessonsData.total || 0) + (quizzesData.total || 0);
            const completedItems = (lessonsData.completed || 0) + (quizzesData.completed || 0);

            totalMandatoryItemsGlobally += totalItems;
            completedMandatoryItemsGlobally += completedItems;

            const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
            const isFullyCompleted = totalItems > 0 && completedItems === totalItems;

            if (isFullyCompleted) completedModulesCount++;

            // Determinar si está bloqueado
            let isLocked = false;
            let lockReason = null;
            let isUpcoming = false;

            const releaseDate = m.release_date ? new Date(m.release_date) : null;
            if (releaseDate && releaseDate > new Date() && !isAdmin) {
                isLocked = true;
                isUpcoming = true;
                lockReason = "Próximamente";
            } else if (m.requires_previous && !lastModuleCompleted && !isAdmin) {
                isLocked = true;
                lockReason = `Complete el módulo "${previousModuleTitle}"`;
            }

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
                next_lesson_id: nextLesson?.id || null,
                is_locked: isLocked,
                is_upcoming: isUpcoming,
                lock_reason: lockReason
            });

            // Para el siguiente módulo en la iteración
            lastModuleCompleted = isFullyCompleted;
            previousModuleTitle = m.title;
        }

        // 2. Obtener puntos y nivel del usuario
        const [userPoints] = await db.query(
            `SELECT points, level FROM user_points WHERE user_id = ?`,
            [userId]
        );

        // 3. Obtener insignias del usuario
        const userBadges = await badgeService.getUserBadges(userId);

        // 3. Rankings using Standardized Logic
        const [userData] = await db.query(`SELECT email, department FROM users WHERE id = ?`, [userId]);
        const { calculateLevel, getUserRank } = require('../services/gamificationService');
        
        const rankData = await getUserRank(userId, userData?.email, userData?.department);
        
        const institutionalRank = rankData.institutionalRank;
        const departmentalRank = rankData.departmentalRank;
        const totalUsersCount = rankData.totalUsersCount;
        const totalInDepartment = rankData.totalInDepartment;

        // 4. Obtener certificados
        const certificates = await db.query(
            `SELECT c.*, m.title as module_title 
             FROM certificates c
             JOIN modules m ON c.module_id = m.id
             WHERE c.user_id = ?`,
            [userId]
        );

        // 5. Formatear nivel para consistencia UI
        const levelInfo = await calculateLevel(userPoints?.points || 0);

        const stats = {
            completedModules: completedModulesCount,
            totalModules: totalModulesCount,
            points: userPoints?.points || 0,
            level: `Nivel ${levelInfo.rank}: ${levelInfo.name}`,
            rank: institutionalRank,
            departmentRank: departmentalRank,
            totalInDepartment,
            totalUsers: totalUsersCount,
            badges: userBadges || [],
            certificates: certificates || [],
            completionPercentage: totalMandatoryItemsGlobally > 0
                ? Math.round((completedMandatoryItemsGlobally / totalMandatoryItemsGlobally) * 100)
                : 0
        };

        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.json({
            success: true,
            stats,
            modules: modulesWithProgress
        });
    } catch (error) {
        logger.error('Error en dashboard:', error);
        res.status(500).json({ error: 'Error al cargar datos del dashboard' });
    }
});

/**
 * @route   GET /api/dashboard/admin-stats
 * @desc    Obtener estadísticas globales para el panel de administración
 * @access  Private/Admin
 */
router.get('/admin-stats', authMiddleware, analystMiddleware, async (req, res) => {
    try {
        const [userStats] = await db.query('SELECT COUNT(*) as count FROM users');
        const [activeUserStats] = await db.query('SELECT COUNT(*) as count FROM users WHERE is_active = TRUE');
        const [moduleStats] = await db.query('SELECT COUNT(*) as count FROM modules');

        // Mejor enfoque: Parallel queries
        const stats = {
            users: userStats?.count || 0,
            activeUsers: activeUserStats?.count || 0,
            modules: moduleStats?.count || 0,
            campaigns: 0
        };

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        logger.error('Error in admin stats:', error);
        res.status(500).json({ error: 'Error al cargar estadísticas de admin' });
    }
});

module.exports = router;
