const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { googleAuth } = require('../validators/schemas');
const { validateRequest } = require('../middleware/validator');

/**
 * @route   POST /api/auth/google
 * @desc    Autenticación con Google OAuth (Session based)
 * @access  Public
 */
router.post('/google', 
    googleAuth, 
    validateRequest,
    authController.googleAuth
);

/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión
 * @access  Private
 */
router.post('/logout', authController.logout);

/**
 * @route   GET /api/auth/verify
 * @desc    Verificar sesión activa
 * @access  Private
 */
router.get('/verify', authController.verifySession);

module.exports = router;
