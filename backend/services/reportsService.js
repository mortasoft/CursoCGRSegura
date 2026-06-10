const db = require('../config/database');
const logger = require('../config/logger');
const redisClient = require('../config/redis');

class ReportsService {
    constructor() {
        // Programar la actualización de la caché del reporte en segundo plano
        // Se ejecuta una primera vez a los 30 segundos del arranque y luego cada 2 horas
        setTimeout(() => this.refreshReportsCache(), 30000);
        setInterval(() => this.refreshReportsCache(), 2 * 60 * 60 * 1000);
    }

    /**
     * Función para generar y cachear el reporte de cumplimiento en Redis
     */
    async refreshReportsCache() {
        try {
            logger.info('📊 Refrescando caché de reportes de cumplimiento...');

            // 0. Obtener total de módulos publicados una sola vez
            const [moduleData] = await db.query('SELECT COUNT(*) as total FROM modules WHERE is_published = TRUE AND (release_date IS NULL OR release_date <= CURRENT_DATE)');
            const totalModules = moduleData?.total || 1;

            // 1. Estadísticas Globales (Directorio vs Registrados)
            const [globalStats] = await db.query(`
                SELECT 
                    (SELECT COUNT(*) FROM staff_directory) as total_staff,
                    COUNT(u.id) as registered_staff,
                    SUM(COALESCE(up_agg.completion_rate, 0)) / GREATEST((SELECT COUNT(*) FROM staff_directory), 1) as avg_completion_rate,
                    SUM(CASE WHEN up_agg.completion_rate = 100 THEN 1 ELSE 0 END) as completed_count
                FROM users u
                LEFT JOIN (
                    SELECT 
                        user_id, 
                        (COUNT(DISTINCT reference_id) / ${totalModules}) * 100 as completion_rate
                    FROM gamification_activities
                    WHERE activity_type = 'module_completed'
                    GROUP BY user_id
                ) up_agg ON u.id = up_agg.user_id
                WHERE u.is_active = TRUE AND u.role IN ('student', 'admin', 'instructor')
            `);

            // 2. Cumplimiento por Departamento (Incluyendo Directorio Maestro)
            const deptCompliance = await db.query(`
                SELECT 
                    d.name as department,
                    COALESCE(dir.total_pax, 0) as total_pax,
                    COUNT(u.id) as registered_count,
                    SUM(CASE WHEN up_agg.completion_rate = 100 THEN 1 ELSE 0 END) as completed_count,
                    SUM(COALESCE(up_agg.completion_rate, 0)) / GREATEST(COALESCE(dir.total_pax, 0), 1) as real_compliance
                FROM departments d
                LEFT JOIN (
                    SELECT department, COUNT(*) as total_pax 
                    FROM staff_directory 
                    GROUP BY department
                ) dir ON d.name = dir.department
                LEFT JOIN users u ON u.department = d.name AND u.is_active = TRUE AND u.role IN ('student', 'admin', 'instructor')
                LEFT JOIN (
                    SELECT 
                        user_id, 
                        (COUNT(DISTINCT reference_id) / ${totalModules}) * 100 as completion_rate
                    FROM gamification_activities
                    WHERE activity_type = 'module_completed'
                    GROUP BY user_id
                ) up_agg ON u.id = up_agg.user_id
                GROUP BY d.name, dir.total_pax
                ORDER BY real_compliance DESC
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
                        (COUNT(DISTINCT reference_id) / ${totalModules}) * 100 as completion_rate
                    FROM gamification_activities
                    WHERE activity_type = 'module_completed'
                    GROUP BY user_id
                ) up_agg ON u.id = up_agg.user_id
                WHERE u.is_active = TRUE AND u.role IN ('student', 'admin', 'instructor')
                HAVING progress < 20
                ORDER BY progress ASC
                LIMIT 50
            `);

            // 4. Listado Detallado (con Insignias)
            const detailedUsers = await db.query(`
                SELECT 
                    u.id, u.first_name, u.last_name, u.email, u.department, u.position,
                    COALESCE(up_agg.completion_rate, 0) as progress,
                    COALESCE(up_agg.completed_modules, 0) as completed_modules,
                    ${totalModules} as total_modules,
                    COALESCE((
                        SELECT JSON_ARRAYAGG(JSON_OBJECT('name', b.name, 'icon', b.icon_name))
                        FROM user_badges ub
                        JOIN badges b ON ub.badge_id = b.id
                        WHERE ub.user_id = u.id
                    ), '[]') as badges
                FROM users u
                LEFT JOIN (
                    SELECT 
                        user_id, 
                        COUNT(DISTINCT reference_id) as completed_modules,
                        (COUNT(DISTINCT reference_id) / ${totalModules}) * 100 as completion_rate
                    FROM gamification_activities
                    WHERE activity_type = 'module_completed'
                    GROUP BY user_id
                ) up_agg ON u.id = up_agg.user_id
                WHERE u.is_active = TRUE AND u.role IN ('student', 'admin', 'instructor')
                ORDER BY progress DESC
            `);

            // 5. Cumplimiento por Módulo (con tiempo promedio)
            const moduleCompliance = await db.query(`
                SELECT 
                    m.id,
                    m.title,
                    m.order_index,
                    (SELECT COUNT(*) FROM staff_directory) as total_students,
                    COUNT(DISTINCT u.id) as completed_count,
                    stats.avg_time
                FROM modules m
                LEFT JOIN gamification_activities ga ON ga.reference_id = m.id AND ga.activity_type = 'module_completed'
                LEFT JOIN users u ON ga.user_id = u.id AND u.role IN ('student', 'admin', 'instructor') AND u.is_active = TRUE
                LEFT JOIN (
                    SELECT 
                        comp.reference_id,
                        AVG(TIMESTAMPDIFF(MINUTE, first_access.start_time, comp.created_at)) as avg_time
                FROM gamification_activities comp
                JOIN (
                        SELECT user_id, module_id, MIN(created_at) as start_time
                        FROM user_progress
                        GROUP BY user_id, module_id
                    ) first_access ON first_access.user_id = comp.user_id AND first_access.module_id = comp.reference_id
                    WHERE comp.activity_type = 'module_completed'
                    GROUP BY comp.reference_id
                ) stats ON m.id = stats.reference_id
                WHERE m.is_published = TRUE
                GROUP BY m.id
                ORDER BY m.order_index DESC
            `);

            // 2b. Cumplimiento por Puesto (Basado en Directorio Maestro)
            const positionCompliance = await db.query(`
                SELECT 
                    dir.position as position,
                    COUNT(dir.email) as total_pax,
                    COUNT(u.id) as registered_count,
                    SUM(CASE WHEN up_agg.completion_rate = 100 THEN 1 ELSE 0 END) as completed_count,
                    SUM(COALESCE(up_agg.completion_rate, 0)) / GREATEST(COUNT(dir.email), 1) as real_compliance
                FROM staff_directory dir
                LEFT JOIN users u ON u.email = dir.email AND u.is_active = TRUE AND u.role IN ('student', 'admin', 'instructor')
                LEFT JOIN (
                    SELECT 
                        user_id, 
                        (COUNT(DISTINCT reference_id) / ${totalModules}) * 100 as completion_rate
                    FROM gamification_activities
                    WHERE activity_type = 'module_completed'
                    GROUP BY user_id
                ) up_agg ON u.id = up_agg.user_id
                WHERE dir.position IS NOT NULL AND dir.position != ''
                GROUP BY dir.position
                HAVING total_pax > 0
                ORDER BY real_compliance DESC
            `);

            const [certsCount] = await db.query('SELECT COUNT(*) as count FROM certificates');

            // 6. Estadísticas de Insignias
            const badgeStats = await db.query(`
                SELECT 
                    b.name, 
                    b.icon_name, 
                    COUNT(ub.user_id) as earned_count
                FROM badges b
                LEFT JOIN user_badges ub ON b.id = ub.badge_id
                GROUP BY b.id
                ORDER BY earned_count DESC
            `);

            const [pointsData] = await db.query('SELECT SUM(points) as total FROM user_points');
            const totalPoints = pointsData?.total || 0;

            // Conteo de usuarios en línea (Redis)
            let onlineUsers = 0;
            if (redisClient && redisClient.isOpen) {
                const keys = await redisClient.keys('online_user:*');
                onlineUsers = keys.length;
            }

            const reportData = {
                summary: {
                    totalStaff: globalStats.total_staff || 0,
                    registeredStaff: globalStats.registered_staff || 0,
                    pendingRegistration: (globalStats.total_staff || 0) - (globalStats.registered_staff || 0),
                    completed: Math.round(globalStats.completed_count || 0),
                    inProgress: Math.max(0, (globalStats.registered_staff || 0) - (globalStats.completed_count || 0)),
                    avgCompletion: Math.round(globalStats.avg_completion_rate || 0),
                    onlineUsers: onlineUsers,
                    totalPoints: totalPoints,
                    avgPointsPerUser: globalStats.registered_staff > 0 ? Math.round(totalPoints / globalStats.registered_staff) : 0,
                    totalCerts: certsCount.count || 0,
                    activeModules: totalModules
                },
                badgeStats: badgeStats.map(b => ({
                    name: b.name,
                    icon: b.icon_name,
                    earned_count: b.earned_count
                })),
                departments: deptCompliance.map(d => ({
                    department: d.department,
                    total_pax: d.total_pax,
                    registered_count: d.registered_count,
                    completed_count: Math.round(d.completed_count || 0),
                    avg_completion: Math.round(d.real_compliance || 0)
                })),
                positions: positionCompliance.map(p => ({
                    position: p.position,
                    total_pax: p.total_pax,
                    registered_count: p.registered_count,
                    completed_count: Math.round(p.completed_count || 0),
                    avg_completion: Math.round(p.real_compliance || 0)
                })),
                moduleCompliance: moduleCompliance.map(m => ({
                    ...m,
                    avg_completion: m.total_students > 0
                        ? Math.round((m.completed_count / m.total_students) * 100)
                        : 0,
                    avg_time: Math.round(m.avg_time || 0)
                })),
                atRisk: usersAtRisk,
                detailedUsers: detailedUsers.map(u => ({
                    ...u,
                    progress: Math.round(u.progress),
                    badges: typeof u.badges === 'string' ? JSON.parse(u.badges) : u.badges
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
    }

    /**
     * Obtener reporte de cumplimiento
     */
    async getComplianceReport() {
        let reportData = null;

        // 1. Intentar obtener de Redis
        if (redisClient && redisClient.isOpen) {
            const cached = await redisClient.get('reports:compliance');
            if (cached) {
                reportData = JSON.parse(cached);
            }
        }

        // 2. Si no hay caché, generar en el momento
        if (!reportData) {
            logger.info('⚠️ Caché de reportes vacía, generando en tiempo real (slow path)...');
            reportData = await this.refreshReportsCache();
        }

        return reportData;
    }

    /**
     * Obtener tendencia de finalizaciones
     */
    async getCompletionTrend(moduleId, interval, startDate, endDate) {
        let dateFormat = '%Y-%m-%d';
        let groupBy = 'DATE(created_at)';

        if (interval === 'monthly') {
            dateFormat = '%b %Y';
            groupBy = 'DATE_FORMAT(created_at, "%Y-%m")';
        } else if (interval === 'weekly') {
            dateFormat = 'Semana %v, %Y';
            groupBy = 'YEARWEEK(created_at, 1)';
        } else if (interval === 'daily') {
            dateFormat = '%d %b';
            groupBy = 'DATE(created_at)';
        } else if (interval === 'yearly') {
            dateFormat = '%Y';
            groupBy = 'YEAR(created_at)';
        }

        let dateFilter = '';
        const params = [dateFormat, moduleId];

        if (startDate && endDate) {
            dateFilter = ' AND created_at BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }

        return await db.query(`
            SELECT 
                DATE_FORMAT(created_at, ?) as label,
                COUNT(*) as value,
                ${groupBy} as sort_key
            FROM gamification_activities
            WHERE activity_type = 'module_completed'
              AND reference_id = ? 
              ${dateFilter}
            GROUP BY sort_key
            ORDER BY sort_key ASC
            LIMIT 24
        `, params);
    }

    /**
     * Obtener cumplimiento por departamento
     */
    async getDepartmentCompliance(moduleId) {
        return await db.query(`
            SELECT 
                d.name as department,
                COALESCE(dir.total_pax, 0) as total_pax,
                COUNT(DISTINCT CASE WHEN ga.activity_type = 'module_completed' THEN u.id END) as completed_count,
                ROUND((COUNT(DISTINCT CASE WHEN ga.activity_type = 'module_completed' THEN u.id END) / GREATEST(COALESCE(dir.total_pax, 0), 1)) * 100) as avg_completion
            FROM departments d
            LEFT JOIN (
                SELECT department, COUNT(*) as total_pax 
                FROM staff_directory 
                GROUP BY department
            ) dir ON d.name = dir.department
            LEFT JOIN users u ON u.department = d.name AND u.is_active = TRUE AND u.role IN ('student', 'admin', 'instructor')
            LEFT JOIN gamification_activities ga ON u.id = ga.user_id AND ga.reference_id = ? AND ga.activity_type = 'module_completed'
            GROUP BY d.name, dir.total_pax
            ORDER BY avg_completion DESC
        `, [moduleId]);
    }

    /**
     * Obtener finalizaciones detalladas por módulo
     */
    async getModuleCompletionsDetail(moduleId) {
        return await db.query(`
            SELECT 
                CONCAT_WS(' ', u.first_name, u.last_name) as full_name, 
                u.email, 
                m.title as module_name, 
                ga.created_at as completion_date
            FROM gamification_activities ga
            JOIN users u ON ga.user_id = u.id
            JOIN modules m ON ga.reference_id = m.id
            WHERE ga.activity_type = 'module_completed'
              AND ga.reference_id = ?
            ORDER BY ga.created_at DESC
        `, [moduleId]);
    }

    /**
     * Enviar recordatorios a funcionarios no registrados
     */
    async remindUnregistered(department) {
        // Encontrar funcionarios en el directorio que NO tengan usuario creado
        const pendingUsers = await db.query(`
            SELECT s.full_name, s.email 
            FROM staff_directory s 
            LEFT JOIN users u ON s.email = u.email 
            WHERE s.department = ? AND u.id IS NULL
        `, [department]);

        if (pendingUsers.length === 0) {
            return { success: true, count: 0 };
        }

        const emailService = require('../services/emailService');
        let sentCount = 0;
        let errorCount = 0;

        for (const user of pendingUsers) {
            try {
                await emailService.sendInvitationEmail(user.email, user.full_name);
                sentCount++;
                await new Promise(resolve => setTimeout(resolve, 200));
            } catch (err) {
                errorCount++;
                logger.error(`Fallo al enviar invitación a ${user.email}:`, err);
            }
        }

        return { success: true, sentCount, errorCount };
    }

    /**
     * Enviar recordatorio masivo de riesgo
     */
    async remindAtRisk(users) {
        const emailService = require('../services/emailService');
        let sentCount = 0;
        let errorCount = 0;

        for (const user of users) {
            try {
                await emailService.sendRiskReminder(user.email, `${user.first_name} ${user.last_name}`, Math.round(user.progress));
                sentCount++;
                await new Promise(resolve => setTimeout(resolve, 200));
            } catch (err) {
                errorCount++;
                logger.error(`Fallo al enviar alerta de riesgo a ${user.email}:`, err);
            }
        }

        return { sentCount, errorCount };
    }

    /**
     * Enviar recordatorio individual de riesgo
     */
    async remindIndividualAtRisk({ email, first_name, last_name, progress }) {
        const emailService = require('../services/emailService');
        await emailService.sendRiskReminder(email, `${first_name} ${last_name}`, Math.round(progress));
        return true;
    }

    /**
     * Obtener detalles de cumplimiento por área (puesto o departamento)
     */
    async getAreaComplianceDetail(type, name, moduleId) {
        let areaFilter = '';
        let params = [];

        if (type === 'departments') {
            areaFilter = 'WHERE s.department = ?';
            params.push(name);
        } else if (type === 'positions') {
            areaFilter = 'WHERE s.position = ?';
            params.push(name);
        }

        let query = '';

        if (moduleId === 'ALL') {
            const [moduleData] = await db.query('SELECT COUNT(*) as total FROM modules WHERE is_published = TRUE AND (release_date IS NULL OR release_date <= CURRENT_DATE)');
            const totalModules = moduleData?.total || 1;

            query = `
                SELECT 
                    s.full_name,
                    s.email,
                    s.department,
                    s.position,
                    COALESCE(up_agg.completed_count, 0) as completed_modules,
                    ${totalModules} as total_modules,
                    ROUND((COALESCE(up_agg.completed_count, 0) / ${totalModules}) * 100) as progress,
                    CASE WHEN COALESCE(up_agg.completed_count, 0) >= ${totalModules} THEN TRUE ELSE FALSE END as is_completed
                FROM staff_directory s
                LEFT JOIN users u ON s.email = u.email
                LEFT JOIN (
                    SELECT 
                        user_id, 
                        COUNT(DISTINCT reference_id) as completed_count
                    FROM gamification_activities
                    WHERE activity_type = 'module_completed'
                    GROUP BY user_id
                ) up_agg ON u.id = up_agg.user_id
                ${areaFilter}
                ORDER BY s.full_name ASC
            `;
        } else {
            const queryParams = [moduleId, ...params];
            query = `
                SELECT 
                    s.full_name,
                    s.email,
                    s.department,
                    s.position,
                    CASE WHEN ga.id IS NOT NULL THEN TRUE ELSE FALSE END as is_completed,
                    CASE WHEN ga.id IS NOT NULL THEN 100 ELSE 0 END as progress
                FROM staff_directory s
                LEFT JOIN users u ON s.email = u.email
                LEFT JOIN gamification_activities ga ON u.id = ga.user_id 
                    AND ga.activity_type = 'module_completed' 
                    AND ga.reference_id = ?
                ${areaFilter}
                ORDER BY s.full_name ASC
            `;
            params = queryParams;
        }

        return await db.query(query, params);
    }
}

module.exports = new ReportsService();
