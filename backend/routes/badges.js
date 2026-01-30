const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

/**
 * @route   GET /api/badges
 * @desc    Obtener todas las insignias
 * @access  Private
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        const badges = await db.query('SELECT * FROM badges ORDER BY created_at DESC');
        res.json({ success: true, badges });
    } catch (error) {
        console.error('Error al obtener insignias:', error);
        res.status(500).json({ error: 'Error al obtener las insignias' });
    }
});

/**
 * @route   POST /api/badges
 * @desc    Crear una nueva insignia
 * @access  Private/Admin
 */
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { name, description, icon_name, criteria_type, criteria_value } = req.body;

        if (!name || !description) {
            return res.status(400).json({ error: 'Nombre y descripción son obligatorios' });
        }

        const result = await db.query(
            'INSERT INTO badges (name, description, icon_name, criteria_type, criteria_value) VALUES (?, ?, ?, ?, ?)',
            [name, description, icon_name || 'Award', criteria_type || 'manual', criteria_value || null]
        );

        res.json({
            success: true,
            message: 'Insignia creada correctamente',
            badgeId: result.insertId
        });
    } catch (error) {
        console.error('Error al crear insignia:', error);
        res.status(500).json({ error: 'Error al crear la insignia' });
    }
});

/**
 * @route   PUT /api/badges/:id
 * @desc    Actualizar una insignia
 * @access  Private/Admin
 */
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { name, description, icon_name, criteria_type, criteria_value } = req.body;
        const { id } = req.params;

        await db.query(
            'UPDATE badges SET name = ?, description = ?, icon_name = ?, criteria_type = ?, criteria_value = ? WHERE id = ?',
            [name, description, icon_name, criteria_type, criteria_value, id]
        );

        res.json({ success: true, message: 'Insignia actualizada correctamente' });
    } catch (error) {
        console.error('Error al actualizar insignia:', error);
        res.status(500).json({ error: 'Error al actualizar la insignia' });
    }
});

/**
 * @route   DELETE /api/badges/:id
 * @desc    Eliminar una insignia
 * @access  Private/Admin
 */
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM badges WHERE id = ?', [id]);
        res.json({ success: true, message: 'Insignia eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar insignia:', error);
        res.status(500).json({ error: 'Error al eliminar la insignia' });
    }
});

/**
 * @route   GET /api/badges/user/:userId
 * @desc    Obtener insignias de un usuario específico
 * @access  Private
 */
router.get('/user/:userId', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        const badges = await db.query(`
            SELECT b.*, ub.earned_at 
            FROM badges b
            JOIN user_badges ub ON b.id = ub.badge_id
            WHERE ub.user_id = ?
            ORDER BY ub.earned_at DESC
        `, [userId]);

        res.json({ success: true, badges });
    } catch (error) {
        console.error('Error al obtener insignias del usuario:', error);
        res.status(500).json({ error: 'Error al obtener las insignias del usuario' });
    }
});

/**
 * @route   POST /api/badges/award
 * @desc    Asignar manualmente una insignia a un usuario
 * @access  Private/Admin
 */
router.post('/award', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { userId, badgeId } = req.body;

        if (!userId || !badgeId) {
            return res.status(400).json({ error: 'Usuario e insignia son obligatorios' });
        }

        await db.query(
            'INSERT IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)',
            [userId, badgeId]
        );

        res.json({ success: true, message: 'Insignia asignada correctamente' });
    } catch (error) {
        console.error('Error al asignar insignia:', error);
        res.status(500).json({ error: 'Error al asignar la insignia' });
    }
});

module.exports = router;
