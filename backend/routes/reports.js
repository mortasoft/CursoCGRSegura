const express = require('express');
const router = express.Router();

const logger = require('../config/logger');
const db = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const redisClient = require('../config/redis');

/**
 * Función para generar y cachear el reporte de cumplimiento en Redis
 * Se ejecuta periódicamente en segundo plano para no bloquear el API.
 */
const refreshReportsCache = async () => {
    try {
        if (!redisClient || !redisClient.isOpen) return null;

        logger.info('📊 Refrescando caché de reportes de cumplimiento...');

        // 0. Obtener total de módulos publicados una sola vez
        const [moduleData] = await db.query('SELECT COUNT(*) as total FROM modules WHERE is_published = TRUE');
        const totalModules = moduleData?.total || 1;

        // 1. Estadísticas Globales
        const [globalStats] = await db.query(`
            SELECT 
                COUNT(DISTINCT u.id) as total_staff,
                AVG(up_agg.completion_rate) as avg_completion_rate
            FROM users u
            LEFT JOIN (
                SELECT 
                    user_id, 
                    (COUNT(DISTINCT module_id) / ${totalModules}) * 100 as completion_rate
                FROM user_progress
                WHERE status = 'completed'
                GROUP BY user_id
            ) up_agg ON u.id = up_agg.user_id
            WHERE u.is_active = TRUE AND u.role = 'student'
        `);

        // 2. Cumplimiento por Departamento
        const deptCompliance = await db.query(`
            SELECT 
                d.name as department,
                COUNT(u.id) as staff_count,
                AVG(COALESCE(up_agg.completion_rate, 0)) as avg_completion
            FROM departments d
            LEFT JOIN users u ON u.department = d.name AND u.is_active = TRUE AND u.role = 'student'
            LEFT JOIN (
                SELECT 
                    user_id, 
                    (COUNT(DISTINCT module_id) / ${totalModules}) * 100 as completion_rate
                FROM user_progress
                WHERE status = 'completed'
                GROUP BY user_id
            ) up_agg ON u.id = up_agg.user_id
            GROUP BY d.name
            ORDER BY avg_completion DESC
        `);

        // 3. Usuarios en Riesgo (Menos del 20%)
        const usersAtRisk = await db.query(`
            SELECT 
                u.first_name, u.last_name, u.department, u.email,
                COALESCE(up_agg.completion_rate, 0) as progress
            FROM users u
            LEFT JOIN (
                SELECT 
                    user_id, 
                    (COUNT(DISTINCT module_id) / ${totalModules}) * 100 as completion_rate
                FROM user_progress
                WHERE status = 'completed'
                GROUP BY user_id
            ) up_agg ON u.id = up_agg.user_id
            WHERE u.is_active = TRUE AND u.role = 'student'
            HAVING progress < 20
            ORDER BY progress ASC
            LIMIT 50
        `);

        // 4. Listado Detallado
        const detailedUsers = await db.query(`
            SELECT 
                u.id, u.first_name, u.last_name, u.email, u.department, u.position,
                COALESCE(up_agg.completion_rate, 0) as progress,
                COALESCE(up_agg.completed_modules, 0) as completed_modules,
                ${totalModules} as total_modules
            FROM users u
            LEFT JOIN (
                SELECT 
                    user_id, 
                    COUNT(DISTINCT module_id) as completed_modules,
                    (COUNT(DISTINCT module_id) / ${totalModules}) * 100 as completion_rate
                FROM user_progress
                WHERE status = 'completed'
                GROUP BY user_id
            ) up_agg ON u.id = up_agg.user_id
            WHERE u.is_active = TRUE AND u.role = 'student'
            ORDER BY progress DESC
        `);

        // 5. Cumplimiento por Módulo
        const moduleCompliance = await db.query(`
            SELECT 
                m.id,
                m.title,
                (SELECT COUNT(*) FROM users WHERE role = 'student' AND is_active = TRUE) as total_students,
                COUNT(DISTINCT up.user_id) as completed_count
            FROM modules m
            LEFT JOIN user_progress up ON up.module_id = m.id AND up.status = 'completed'
            LEFT JOIN users u ON up.user_id = u.id AND u.role = 'student' AND u.is_active = TRUE
            WHERE m.is_published = TRUE
            GROUP BY m.id
        `);

        const [certsCount] = await db.query('SELECT COUNT(*) as count FROM certificates');

        const reportData = {
            summary: {
                totalStaff: globalStats.total_staff || 0,
                avgCompletion: Math.round(globalStats.avg_completion_rate || 0),
                totalCerts: certsCount.count || 0,
                activeModules: totalModules
            },
            departments: deptCompliance.map(d => ({
                ...d,
                avg_completion: Math.round(d.avg_completion || 0)
            })),
            moduleCompliance: moduleCompliance.map(m => ({
                ...m,
                avg_completion: m.total_students > 0 
                    ? Math.round((m.completed_count / m.total_students) * 100) 
                    : 0
            })),
            atRisk: usersAtRisk,
            detailedUsers: detailedUsers.map(u => ({
                ...u,
                progress: Math.round(u.progress)
            })),
            lastUpdated: new Date()
        };

        // Guardar en Redis por 2 horas (7200 segundos)
        if (redisClient && redisClient.isOpen) {
            await redisClient.setEx('reports:compliance', 7200, JSON.stringify(reportData));
        }
        
        logger.info('✅ Caché de reportes actualizada correctamente.');
        return reportData;
    } catch (error) {
        logger.error('❌ Error refrescando caché de reportes:', error);
        return null;
    }
};

// Programar actualización cada 2 horas (opcional: primera ejecución tras 30s)
setTimeout(refreshReportsCache, 30000);
setInterval(refreshReportsCache, 2 * 60 * 60 * 1000);

/**
 * @route   POST /api/reports/compliance/refresh
 * @desc    Forzar actualización del caché de reportes
 * @access  Private/Admin
 */
router.post('/compliance/refresh', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const reportData = await refreshReportsCache();
        if (!reportData) {
            return res.status(500).json({ error: 'Error al refrescar los reportes de cumplimiento' });
        }
        res.json({ success: true, message: 'Reportes actualizados correctamente', ...reportData });
    } catch (error) {
        logger.error('Error refreshing reports manually:', error);
        res.status(500).json({ error: 'Error al refrescar los reportes' });
    }
});

// Programar actualización cada 2 horas (opcional: primera ejecución tras 30s)
setTimeout(refreshReportsCache, 30000);
setInterval(refreshReportsCache, 2 * 60 * 60 * 1000);

/**
 * @route   GET /api/reports/compliance
 * @desc    Obtener reporte de cumplimiento (Desde caché de Redis)
 * @access  Private/Admin
 */
router.get('/compliance', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        let reportData = null;

        // 1. Intentar obtener de Redis
        if (redisClient && redisClient.isOpen) {
            const cached = await redisClient.get('reports:compliance');
            if (cached) {
                reportData = JSON.parse(cached);
            }
        }

        // 2. Si no hay caché, generar en el momento (solo la primera vez)
        if (!reportData) {
            logger.info('⚠️ Caché de reportes vacía, generando en tiempo real (slow path)...');
            reportData = await refreshReportsCache();
        }

        if (!reportData) {
            return res.status(500).json({ error: 'No se pudieron generar los reportes.' });
        }

        res.json({
            success: true,
            ...reportData
        });
    } catch (error) {
        logger.error('Error obteniendo reportes:', error);
        res.status(500).json({ error: 'Error al cargar los reportes de cumplimiento' });
    }
});

module.exports = router;
