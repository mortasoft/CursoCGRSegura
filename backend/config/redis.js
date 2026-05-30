const { createClient } = require('redis');
const logger = require('./logger');

// Inicializacion del cliente de Redis con la configuracion de conexion
const redisClient = createClient({
    socket: {
        // Host y puerto obtenidos de las variables de entorno para facil configuracion en Docker
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
    },
    // Contrasena del cliente Redis para entornos de produccion seguros
    password: process.env.REDIS_PASSWORD
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
