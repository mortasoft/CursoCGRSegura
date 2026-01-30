const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

/**
 * @route   GET /api/reports/compliance
 * @desc    Obtener reporte de cumplimiento global y por departamento
 * @access  Private/Admin
 */
router.get('/compliance', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        // 1. Estadísticas Globales
        const [globalStats] = await db.query(`
            SELECT 
                COUNT(DISTINCT u.id) as total_staff,
                (SELECT COUNT(*) FROM modules WHERE is_published = TRUE) as total_modules,
                AVG(up_agg.completion_rate) as avg_completion_rate
            FROM users u
            LEFT JOIN (
                SELECT 
                    user_id, 
                    (COUNT(CASE WHEN status = 'completed' THEN 1 END) / (SELECT COUNT(*) FROM modules WHERE is_published = TRUE)) * 100 as completion_rate
                FROM user_progress
                GROUP BY user_id
            ) up_agg ON u.id = up_agg.user_id
            WHERE u.is_active = TRUE AND u.role = 'user'
        `);

        // 2. Cumplimiento por Departamento
        const deptCompliance = await db.query(`
            SELECT 
                u.department,
                COUNT(u.id) as staff_count,
                AVG(COALESCE(up_agg.completion_rate, 0)) as avg_completion
            FROM users u
            LEFT JOIN (
                SELECT 
                    user_id, 
                    (COUNT(DISTINCT module_id) / (SELECT COUNT(*) FROM modules WHERE is_published = TRUE)) * 100 as completion_rate
                FROM user_progress
                WHERE status = 'completed'
                GROUP BY user_id
            ) up_agg ON u.id = up_agg.user_id
            WHERE u.is_active = TRUE AND u.department IS NOT NULL AND u.role = 'user'
            GROUP BY u.department
            ORDER BY avg_completion DESC
        `);

        // 3. Usuarios en Riesgo (Menos del 20% de progreso - Listado extendido)
        const usersAtRisk = await db.query(`
            SELECT 
                u.first_name, u.last_name, u.department, u.email,
                COALESCE(up_agg.completion_rate, 0) as progress
            FROM users u
            LEFT JOIN (
                SELECT 
                    user_id, 
                    (COUNT(DISTINCT module_id) / (SELECT COUNT(*) FROM modules WHERE is_published = TRUE)) * 100 as completion_rate
                FROM user_progress
                WHERE status = 'completed'
                GROUP BY user_id
            ) up_agg ON u.id = up_agg.user_id
            WHERE u.is_active = TRUE AND u.role = 'user'
            HAVING progress < 20
            ORDER BY progress ASC
            LIMIT 50
        `);

        // 4. Listado Detallado de Usuarios para el reporte completo
        const detailedUsers = await db.query(`
            SELECT 
                u.id, u.first_name, u.last_name, u.email, u.department, u.position,
                COALESCE(up_agg.completion_rate, 0) as progress,
                COALESCE(up_agg.completed_modules, 0) as completed_modules,
                (SELECT COUNT(*) FROM modules WHERE is_published = TRUE) as total_modules
            FROM users u
            LEFT JOIN (
                SELECT 
                    user_id, 
                    COUNT(DISTINCT module_id) as completed_modules,
                    (COUNT(DISTINCT module_id) / (SELECT COUNT(*) FROM modules WHERE is_published = TRUE)) * 100 as completion_rate
                FROM user_progress
                WHERE status = 'completed'
                GROUP BY user_id
            ) up_agg ON u.id = up_agg.user_id
            WHERE u.is_active = TRUE AND u.role = 'user'
            ORDER BY progress DESC
        `);

        // 5. Certificaciones Emitidas
        const [certsCount] = await db.query('SELECT COUNT(*) as count FROM certificates');

        res.json({
            success: true,
            summary: {
                totalStaff: globalStats.total_staff,
                avgCompletion: Math.round(globalStats.avg_completion_rate || 0),
                totalCerts: certsCount.count,
                activeModules: globalStats.total_modules
            },
            departments: deptCompliance.map(d => ({
                ...d,
                avg_completion: Math.round(d.avg_completion)
            })),
            atRisk: usersAtRisk,
            detailedUsers: detailedUsers.map(u => ({
                ...u,
                progress: Math.round(u.progress)
            }))
        });
    } catch (error) {
        console.error('Error generando reportes:', error);
        res.status(500).json({ error: 'Error al generar los reportes de cumplimiento' });
    }
});

module.exports = router;
