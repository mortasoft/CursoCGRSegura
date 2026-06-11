const logger = require('../config/logger');

/**
 * Middleware global para capturar errores y devolver respuestas JSON consistentes
 */
const errorMiddleware = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Ha ocurrido un error inesperado en el servidor';

    // Log detallado para el desarrollador
    logger.error(`[Error API] ${req.method} ${req.path}`);
    if (statusCode === 500) {
        logger.error(err.stack);
    } else {
        logger.warn(`Mensaje: ${message}`);
    }

    // Respuesta limpia para el frontend
    res.status(statusCode).json({
        success: false,
        status: statusCode,
        message: message,
        // Solo enviamos el stack en desarrollo
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = errorMiddleware;
