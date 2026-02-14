const express = require('express');
const router = express.Router();
const db = require('../config/database');

const { authMiddleware } = require('../middleware/auth');

/**
 * @route   GET /api/certificates/:moduleId
 * @desc    Obtener los detalles del certificado para un módulo y usuario específico
 * @access  Private
 */
router.get('/:moduleId', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const moduleId = req.params.moduleId;

        const [certificate] = await db.query(
            `SELECT c.*, m.title as module_title, u.first_name, u.last_name, u.department 
             FROM certificates c
             JOIN modules m ON c.module_id = m.id
             JOIN users u ON c.user_id = u.id
             WHERE c.user_id = ? AND c.module_id = ?`,
            [userId, moduleId]
        );

        if (!certificate) {
            return res.status(404).json({ error: 'Certificado no encontrado para este módulo.' });
        }

        res.json({ success: true, certificate });
    } catch (error) {
        console.error('Error fetching certificate:', error);
        res.status(500).json({ error: 'Error al obtener el certificado' });
    }
});

module.exports = router;
