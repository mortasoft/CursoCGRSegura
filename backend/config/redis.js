const { createClient } = require('redis');
const logger = require('./logger');

// Inicializacion del cliente de Redis con la configuracion de conexion
const redisClient = createClient({
    socket: {
        // Host y puerto obtenidos de las variables de entorno para facil configuracion en Docker
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                logger.error('Redis: Máximo de reintentos alcanzado. Fallo crítico.');
                return new Error('Redis connection failed');
            }
            const delay = Math.min(retries * 500, 5000);
            logger.warn(`Redis: Error de conexión. Reintentando en ${delay}ms... (Intento ${retries})`);
            return delay;
        }
    },
    ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD })
});

// Manejadores de eventos de la conexion para monitoreo
redisClient.on('error', (err) => logger.error('Error en el cliente de Redis', err));
redisClient.on('connect', () => logger.info('Cliente de Redis conectado exitosamente'));

// Conectar de forma asincrona e inmediata al inicializar el modulo para evitar bloqueos
(async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
    } catch (err) {
        logger.error('Error al intentar conectar con Redis:', err);
    }
})();

module.exports = redisClient;
