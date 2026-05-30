const db = require('../config/database');
const logger = require('../config/logger');
const redisClient = require('../config/redis');
const { isAdmin, isAnalystOrAdmin } = require('../utils/authUtils');
const AppError = require('../utils/appError');

/**
 * Middleware de autenticación basado en Sesiones
 * Verifica la sesión de Redis y carga la información del usuario
 */
const authMiddleware = async (req, res, next) => {
    try {
        // Verificar existencia de userId en la sesión
        const userId = req.session.userId;

        if (!userId) {
            return next(new AppError('No se detectó una sesión activa. Por favor inicie sesión.', 401));
        }

        // Marcar usuario como activo en Redis (expira en 5 minutos)
        if (redisClient && redisClient.isOpen) {
            redisClient.setEx(`online_user:${userId}`, 300, '1').catch(e => logger.error('Error setting online status:', e));
        }

        // Obtener usuario de la base de datos
        // Usamos cache o consulta directa dependiendo de la necesidad de frescura
        const [user] = await db.query(
            'SELECT id, email, first_name, last_name, role, is_active FROM users WHERE id = ?',
            [userId]
        );

        if (!user) {
            // Si el usuario ya no existe, destruimos la sesión inválida
            req.session.destroy();
            return next(new AppError('Usuario no encontrado', 401));
        }

        if (!user.is_active) {
            return next(new AppError('Usuario desactivado', 403));
        }

        // Agregar usuario al objeto request para uso posterior
        req.user = user;
        next();
    } catch (error) {
        logger.error('Error en middleware de autenticación:', error);
        next(error);
    }
};

/**
 * Middleware para verificar rol de administrador
 */
const adminMiddleware = (req, res, next) => {
    if (!isAdmin(req.user)) {
        return next(new AppError('Se requieren permisos de administrador para realizar esta acción.', 403));
    }
    next();
};

/**
 * Middleware para verificar rol de instructor o admin
 */
const instructorMiddleware = (req, res, next) => {
    // Nota: Podríamos agregar isInstructorOrAdmin en authUtils si se vuelve común
    if (!req.user || (req.user.role !== 'instructor' && req.user.role !== 'admin')) {
        return next(new AppError('Se requieren permisos de instructor o administrador.', 403));
    }
    next();
};

/**
 * Middleware para verificar rol de analista o admin (reportes)
 */
const analystMiddleware = (req, res, next) => {
    if (!isAnalystOrAdmin(req.user)) {
        return next(new AppError('Se requieren permisos de analista o administrador.', 403));
    }
    next();
};

module.exports = {
    authMiddleware,
    adminMiddleware,
    instructorMiddleware,
    analystMiddleware
};

