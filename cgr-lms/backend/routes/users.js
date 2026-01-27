const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

/**
 * @route   GET /api/users/profile
 * @desc    Obtener perfil completo del funcionario (datos, estadísticas, insignias)
 * @access  Private
 */
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Datos básicos del usuario
        const [user] = await db.query(
            `SELECT id, first_name, last_name, email, profile_picture, role, department, position, created_at 
             FROM users WHERE id = ?`,
            [userId]
        );

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // 2. Estadísticas de puntos y nivel
        const [stats] = await db.query(
            `SELECT points, level, badges, rank_position 
             FROM user_points WHERE user_id = ?`,
            [userId]
        );

        // 3. Resumen de progreso (Módulos completados)
        const [progress] = await db.query(
            `SELECT 
                COUNT(DISTINCT module_id) as completed_modules,
                (SELECT COUNT(*) FROM modules WHERE is_published = TRUE) as total_modules
             FROM user_progress 
             WHERE user_id = ? AND status = 'completed'`,
            [userId]
        );

        // 4. Actividad reciente
        const activities = await db.query(
            `SELECT ga.type, ga.points, ga.created_at, ga.reference_id,
                CASE 
                    WHEN ga.type = 'lesson_completed' THEN (SELECT title FROM lessons WHERE id = ga.reference_id)
                    WHEN ga.type = 'quiz_passed' THEN (SELECT title FROM quizzes WHERE id = ga.reference_id)
                    ELSE 'Actividad general'
                END as reference_title,
                CASE 
                    WHEN ga.type = 'lesson_completed' THEN (SELECT module_id FROM lessons WHERE id = ga.reference_id)
                    WHEN ga.type = 'quiz_passed' THEN (SELECT module_id FROM quizzes WHERE id = ga.reference_id)
                    ELSE NULL
                END as module_id
             FROM gamification_activities ga
             WHERE ga.user_id = ?
             ORDER BY ga.created_at DESC
             LIMIT 10`,
            [userId]
        );

        // 5. Certificados obtenidos
        const certificates = await db.query(
            `SELECT c.*, m.title as module_title 
             FROM certificates c
             JOIN modules m ON c.module_id = m.id
             WHERE c.user_id = ?`,
            [userId]
        );

        res.json({
            success: true,
            user,
            stats: stats || { points: 0, level: 'Novato', badges: '[]', rank_position: 0 },
            progress: {
                completed: progress.completed_modules || 0,
                total: progress.total_modules || 0,
                percentage: progress.total_modules > 0 ? Math.round((progress.completed_modules / progress.total_modules) * 100) : 0
            },
            activities,
            certificates
        });
    } catch (error) {
        console.error('Error detallado obteniendo perfil:', error);
        res.status(500).json({
            error: 'Error al cargar el perfil',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

/**
 * @route   GET /api/users
 * @desc    Obtener todos los usuarios (Admin)
 * @access  Private/Admin
 */
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await db.query(
            `SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.department, u.position, u.is_active, u.created_at, u.last_login,
                    up.points, up.level
             FROM users u
             LEFT JOIN user_points up ON u.id = up.user_id
             ORDER BY u.created_at DESC`
        );

        res.json({
            success: true,
            users
        });
    } catch (error) {
        console.error('Error obteniendo usuarios:', error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

/**
 * @route   GET /api/users/:id
 * @desc    Obtener un usuario específico (Admin)
 * @access  Private/Admin
 */
router.get('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const [user] = await db.query(
            'SELECT id, first_name, last_name, email, role, department, position, is_active FROM users WHERE id = ?',
            [req.params.id]
        );

        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

        res.json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el usuario' });
    }
});

/**
 * @route   PUT /api/users/:id
 * @desc    Actualizar un usuario (Admin)
 * @access  Private/Admin
 */
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { role, department, position, is_active } = req.body;
        const userId = req.params.id;

        await db.query(
            `UPDATE users 
             SET role = ?, department = ?, position = ?, is_active = ?
             WHERE id = ?`,
            [role, department, position, is_active, userId]
        );

        res.json({ success: true, message: 'Usuario actualizado correctamente' });
    } catch (error) {
        console.error('Error actualizando usuario:', error);
        res.status(500).json({ error: 'Error al actualizar usuario' });
    }
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Eliminar un usuario permanentemente (Admin)
 * @access  Private/Admin
 */
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const userId = req.params.id;

        // Evitar que un admin se elimine a sí mismo
        if (userId == req.user.id) {
            return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta administrativa.' });
        }

        await db.query('DELETE FROM users WHERE id = ?', [userId]);

        res.json({ success: true, message: 'Usuario eliminado permanentemente' });
    } catch (error) {
        console.error('Error eliminando usuario:', error);
        res.status(500).json({ error: 'Error al eliminar el usuario' });
    }
});

module.exports = router;
