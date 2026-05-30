const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { cacheMiddleware } = require('../middleware/cache');
const { updateUserProfile, updateUserAdmin } = require('../validators/schemas');
const { validateRequest } = require('../middleware/validator');

/**
 * @route   GET /api/users/profile
 * @desc    Obtener perfil completo del funcionario
 * @access  Private
 */
router.get('/profile', authMiddleware, cacheMiddleware(300, true), (req, res) => userController.getProfile(req, res));
router.put('/profile', authMiddleware, updateUserProfile, validateRequest, (req, res) => userController.updateProfile(req, res));

/**
 * @route   GET /api/users
 * @desc    Obtener todos los usuarios (Admin)
 * @access  Private/Admin
 */
router.get('/', authMiddleware, adminMiddleware, (req, res) => userController.getAllUsers(req, res));

/**
 * @route   GET /api/users/:id/full-profile
 * @desc    Obtener perfil completo de cualquier funcionario (Admin)
 * @access  Private/Admin
 */
router.get('/:id/full-profile', authMiddleware, adminMiddleware, cacheMiddleware(300, true), (req, res) => userController.getFullProfile(req, res));

/**
 * @route   GET /api/users/:id
 * @desc    Obtener un usuario específico (Admin)
 * @access  Private/Admin
 */
router.get('/:id', authMiddleware, adminMiddleware, (req, res) => userController.getUserById(req, res));

/**
 * @route   PUT /api/users/:id
 * @desc    Actualizar un usuario (Admin)
 * @access  Private/Admin
 */
router.put('/:id', authMiddleware, adminMiddleware, updateUserAdmin, validateRequest, (req, res) => userController.updateUser(req, res));

/**
 * @route   DELETE /api/users/:id
 * @desc    Eliminar un usuario permanentemente (Admin)
 * @access  Private/Admin
 */
router.delete('/:id', authMiddleware, adminMiddleware, (req, res) => userController.deleteUser(req, res));

/**
 * @route   POST /api/users/:id/reset
 * @desc    Reiniciar todo el progreso de un usuario (Admin)
 * @access  Private/Admin
 */
router.post('/:id/reset', authMiddleware, adminMiddleware, (req, res) => userController.resetProgress(req, res));

module.exports = router;
