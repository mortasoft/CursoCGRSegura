const redisClient = require('../config/redis');
const logger = require('../config/logger');

/**
 * Middleware para cachear respuestas en Redis
 * @param {number} duration - Duración del caché en segundos
 * @param {boolean} userSpecific - Si el caché debe ser único por usuario
 */
const cacheMiddleware = (duration = 300, userSpecific = false) => {
    return async (req, res, next) => {
        // Solo cachear peticiones GET
        if (req.method !== 'GET') {
            return next();
        }

        const viewAsStudent = req.headers['x-view-as-student'] === 'true';
        const key = `cache:${req.originalUrl || req.url}${userSpecific && req.user ? `:u${req.user.id}` : ''}${viewAsStudent ? ':student-view' : ''}`;

        try {
            if (!redisClient.isOpen) {
                return next();
            }

            const cachedData = await redisClient.get(key);
            if (cachedData) {
                logger.info(`CACHE HIT [Redis]: ${key}`);
                const data = JSON.parse(cachedData);
                return res.json(data);
            }

            logger.info(`CACHE MISS [Database]: ${key}`);

            // Sobrescribir res.json para guardar en caché antes de enviar
            const originalJson = res.json;
            res.json = (body) => {
                // Solo cachear si la respuesta es exitosa (success: true o status < 400)
                if (res.statusCode < 400 && (body.success || body.success === undefined)) {
                    redisClient.setEx(key, duration, JSON.stringify(body)).catch(err => {
                        logger.error('Error saving to Redis cache:', err);
                    });
                }
                return originalJson.call(res, body);
            };

            next();
        } catch (error) {
            logger.error('Cache middleware error:', error);
            next();
        }
    };
};

/**
 * Limpiar llaves de caché que coincidan con un patrón
 * @param {string} pattern - Patrón de búsqueda (ej: 'cache:/api/dashboard*')
 */
const clearCache = async (pattern) => {
    try {
        if (!redisClient.isOpen) return;

        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
            await redisClient.del(keys);
            logger.info(`Cache cleared for pattern: ${pattern} (${keys.length} keys)`);
        }
    } catch (error) {
        logger.error('Error clearing cache:', error);
    }
};

module.exports = { cacheMiddleware, clearCache };
