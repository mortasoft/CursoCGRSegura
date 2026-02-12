const db = require('../config/database');

/**
 * Middleware para verificar si el sistema está en modo mantenimiento
 */
const maintenanceMiddleware = async (req, res, next) => {
    try {
        // Los administradores SIEMPRE pueden entrar al sistema
        if (req.user && req.user.role === 'admin') {
            return next();
        }

        const [setting] = await db.query(
            "SELECT setting_value FROM system_settings WHERE setting_key = 'maintenance_mode'"
        );

        const isMaintenance = setting && setting.setting_value === 'true';

        if (isMaintenance) {
            return res.status(503).json({
                maintenance: true,
                message: 'El sistema se encuentra en mantenimiento programado. Por favor, intente más tarde.'
            });
        }

        next();
    } catch (error) {
        console.error('Error en maintenanceMiddleware:', error);
        next(); // Si falla la DB, dejamos pasar para no romper el app por completo
    }
};

module.exports = maintenanceMiddleware;
