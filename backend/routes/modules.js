const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

/**
 * @route   GET /api/modules
 * @desc    Obtener todos los módulos publicados
 * @access  Private
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        const isAdmin = req.user.role === 'admin' && req.headers['x-view-as-student'] !== 'true';

        const modules = await db.query(
            `SELECT 
                m.*,
                COUNT(DISTINCT l.id) as total_lessons,
                (SELECT COUNT(*) FROM quizzes q WHERE q.module_id = m.id AND q.is_published = TRUE) as total_quizzes,
                SUM(l.duration_minutes) as total_duration
            FROM modules m
            LEFT JOIN lessons l ON m.id = l.module_id 
                AND l.is_optional = FALSE
                ${isAdmin ? '' : 'AND l.is_published = TRUE'}
            WHERE 1=1 ${isAdmin ? '' : 'AND m.is_published = TRUE'}
            GROUP BY m.id
            ORDER BY m.order_index ASC`
        );

        // Obtener progreso del usuario para cada módulo
        const userId = req.user.id;
        for (let module of modules) {
            // 1. Contar lecciones completadas
            const [lessonProgress] = await db.query(
                `SELECT COUNT(*) as completed_count
                 FROM user_progress
                 WHERE user_id = ? AND module_id = ? AND status = 'completed'`,
                [userId, module.id]
            );

            // 2. Contar quizzes aprobados
            const [quizProgress] = await db.query(
                `SELECT COUNT(DISTINCT quiz_id) as passed_count
                 FROM quiz_attempts
                 WHERE user_id = ? AND passed = TRUE
                 AND quiz_id IN (SELECT id FROM quizzes WHERE module_id = ? AND is_published = TRUE)`,
                [userId, module.id]
            );

            const totalLessons = module.total_lessons || 0;
            const totalQuizzes = module.total_quizzes || 0;
            const totalItems = totalLessons + totalQuizzes;

            const completedLessons = lessonProgress.completed_count || 0;
            const completedQuizzes = quizProgress.passed_count || 0;
            const completedItems = completedLessons + completedQuizzes;

            module.completionPercentage = totalItems > 0
                ? Math.round((completedItems / totalItems) * 100)
                : 0;

            // No exceder 100%
            if (module.completionPercentage > 100) module.completionPercentage = 100;

            module.userProgress = {
                completed_lessons: completedLessons,
                completed_quizzes: completedQuizzes,
                total_items: totalItems
            };
        }

        res.json({ success: true, modules });
    } catch (error) {
        console.error('Error obteniendo módulos:', error);
        res.status(500).json({ error: 'Error al obtener módulos' });
    }
});

/**
 * @route   GET /api/modules/admin/all
 * @desc    Obtener todos los módulos (incluyendo no publicados) para administración
 * @access  Private/Admin
 */
router.get('/admin/all', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const modules = await db.query(
            `SELECT 
                m.*,
                COUNT(DISTINCT l.id) as total_lessons,
                SUM(l.duration_minutes) as total_duration
            FROM modules m
            LEFT JOIN lessons l ON m.id = l.module_id AND l.is_optional = FALSE
            GROUP BY m.id
            ORDER BY m.order_index ASC`
        );

        res.json({ success: true, modules });
    } catch (error) {
        console.error('Error obteniendo todos los módulos:', error);
        res.status(500).json({ error: 'Error al obtener módulos' });
    }
});

/**
 * @route   GET /api/modules/:id
 * @desc    Obtener un módulo específico con sus lecciones
 * @access  Private
 */
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const moduleId = req.params.id;
        const userId = req.user.id;
        const isAdmin = req.user.role === 'admin' && req.headers['x-view-as-student'] !== 'true';

        // Si es admin, puede ver módulos no publicados
        const [module] = await db.query(
            `SELECT * FROM modules WHERE id = ? ${isAdmin ? '' : 'AND is_published = TRUE'}`,
            [moduleId]
        );

        if (!module) {
            return res.status(404).json({ error: 'Módulo no encontrado' });
        }

        // Obtener lecciones del módulo
        const lessons = await db.query(
            `SELECT 
                l.*,
                up.status,
                up.progress_percentage,
                up.time_spent_minutes,
                up.completed_at,
                (SELECT SUM(points) FROM lesson_contents WHERE lesson_id = l.id) as total_points
            FROM lessons l
            LEFT JOIN user_progress up ON l.id = up.lesson_id AND up.user_id = ?
            WHERE l.module_id = ? ${isAdmin ? '' : 'AND l.is_published = TRUE'}
            ORDER BY l.order_index ASC`,
            [userId, moduleId]
        );

        // Obtener recursos del módulo
        const resources = await db.query(
            'SELECT * FROM resources WHERE module_id = ? ORDER BY id ASC',
            [moduleId]
        );

        // Obtener quizzes del módulo
        const quizzes = await db.query(
            `SELECT 
                q.*,
                (SELECT COUNT(*) FROM quiz_attempts WHERE quiz_id = q.id AND user_id = ?) as attempts_count,
                (SELECT MAX(score) FROM quiz_attempts WHERE quiz_id = q.id AND user_id = ?) as best_score
            FROM quizzes q
            WHERE q.module_id = ? ${isAdmin ? '' : 'AND q.is_published = TRUE'}`,
            [userId, userId, moduleId]
        );

        // Calcular porcentaje de completado basado en lecciones (OBLIGATORIAS) y quizzes
        const requiredLessons = lessons.filter(l => !l.is_optional);
        const completedRequiredLessons = requiredLessons.filter(l => l.status === 'completed').length;

        // Por ahora asumimos que todos los quizzes son obligatorios
        const totalQuizzesCount = quizzes.length;
        const completedQuizzes = quizzes.filter(q => q.best_score >= q.passing_score).length;

        const totalItems = requiredLessons.length + totalQuizzesCount;
        const totalCompleted = completedRequiredLessons + completedQuizzes;

        const completionPercentage = totalItems > 0
            ? Math.round((totalCompleted / totalItems) * 100)
            : 0;

        res.json({
            success: true,
            module: {
                ...module,
                completionPercentage,
                lessons,
                resources,
                quizzes
            }
        });
    } catch (error) {
        console.error('Error obteniendo módulo:', error);
        res.status(500).json({ error: 'Error al obtener módulo' });
    }
});

/**
 * @route   POST /api/modules
 * @desc    Crear un nuevo módulo
 * @access  Private/Admin
 */
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const {
            module_number,
            title,
            description = null,
            month = null,
            duration_minutes = 0,
            is_published = false,
            release_date = null,
            order_index
        } = req.body;

        const result = await db.query(
            `INSERT INTO modules (module_number, title, description, month, duration_minutes, is_published, release_date, order_index)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                module_number,
                title,
                description ?? null,
                month ?? null,
                duration_minutes ?? 0,
                is_published ?? false,
                release_date ?? null,
                order_index ?? module_number
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Módulo creado correctamente',
            moduleId: result.insertId
        });
    } catch (error) {
        console.error('Error creando módulo:', error);
        res.status(500).json({ error: 'Error al crear módulo' });
    }
});

/**
 * @route   PUT /api/modules/:id
 * @desc    Actualizar un módulo
 * @access  Private/Admin
 */
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const {
            module_number,
            title,
            description = null,
            month = null,
            duration_minutes = 0,
            is_published = false,
            release_date = null,
            order_index
        } = req.body;
        const moduleId = req.params.id;

        await db.query(
            `UPDATE modules 
             SET module_number = ?, title = ?, description = ?, month = ?, 
                 duration_minutes = ?, is_published = ?, release_date = ?, order_index = ?
             WHERE id = ?`,
            [
                module_number,
                title,
                description ?? null,
                month ?? null,
                duration_minutes ?? 0,
                is_published ?? false,
                release_date ?? null,
                order_index ?? module_number,
                moduleId
            ]
        );

        res.json({ success: true, message: 'Módulo actualizado correctamente' });
    } catch (error) {
        console.error('Error actualizando módulo:', error);
        res.status(500).json({ error: 'Error al actualizar módulo' });
    }
});

/**
 * @route   DELETE /api/modules/:id
 * @desc    Eliminar un módulo
 * @access  Private/Admin
 */
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const moduleId = req.params.id;

        // Las lecciones y otros datos se borrarán en cascada por el esquema SQL
        await db.query('DELETE FROM modules WHERE id = ?', [moduleId]);

        res.json({ success: true, message: 'Módulo eliminado correctamente' });
    } catch (error) {
        console.error('Error eliminando módulo:', error);
        res.status(500).json({ error: 'Error al eliminar módulo' });
    }
});

module.exports = router;
