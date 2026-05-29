const express = require('express');
const router = express.Router();
const badgeController = require('../controllers/badgeController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

/**
 * @route   GET /api/badges
 * @desc    Obtener todas las insignias
 * @access  Private
 */
router.get('/', authMiddleware, badgeController.getAllBadges);

/**
 * @route   POST /api/badges
 * @desc    Crear una nueva insignia
 * @access  Private/Admin
 */
router.post('/', authMiddleware, adminMiddleware, badgeController.createBadge);

/**
 * @route   PUT /api/badges/:id
 * @desc    Actualizar una insignia
 * @access  Private/Admin
 */
router.put('/:id', authMiddleware, adminMiddleware, badgeController.updateBadge);

/**
 * @route   DELETE /api/badges/:id
 * @desc    Eliminar una insignia
 * @access  Private/Admin
 */
router.delete('/:id', authMiddleware, adminMiddleware, badgeController.deleteBadge);

/**
 * @route   GET /api/badges/user/:userId
 * @desc    Obtener insignias de un usuario específico
 * @access  Private
 */
router.get('/user/:userId', authMiddleware, badgeController.getUserBadges);

/**
 * @route   POST /api/badges/award
 * @desc    Asignar manualmente una insignia a un usuario
 * @access  Private/Admin
 */
router.post('/award', authMiddleware, adminMiddleware, badgeController.awardBadge);

/**
 * @route   POST /api/badges/award-by-email
 * @desc    Asignar manualmente una insignia a un usuario usando su correo
 * @access  Private/Admin
 */
router.post('/award-by-email', authMiddleware, adminMiddleware, badgeController.awardBadgeByEmail);

/**
 * @route   POST /api/badges/roswell-claim
 * @desc    Auto-asignar la insignia Hacker de Roswell al entrar al expediente
 * @access  Private
 */
router.post('/roswell-claim', authMiddleware, badgeController.awardRoswellBadge);

module.exports = router;
