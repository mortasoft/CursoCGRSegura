const { getSystemSettings } = require('../services/gamificationService');
const logger = require('../config/logger');

/**
 * Middleware para verificar si el sistema está en modo mantenimiento
 */
const maintenanceMiddleware = async (req, res, next) => {
    try {
        // Los administradores SIEMPRE pueden entrar al sistema
        if (req.user && req.user.role === 'admin') {
            return next();
        }

        const settings = await getSystemSettings();
        const isMaintenance = settings && settings.maintenance_mode === true;

        if (isMaintenance) {
            return res.status(503).json({
                maintenance: true,
                message: 'El sistema se encuentra en mantenimiento programado. Por favor, intente más tarde.'
            });
        }

        next();
    } catch (error) {
        logger.error('Error en maintenanceMiddleware:', error);
        next(); // Si falla la obtención, dejamos pasar para no romper la app por completo
    }
};

module.exports = maintenanceMiddleware;
