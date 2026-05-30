const mysql = require('mysql2/promise');
const logger = require('./logger');

// Configuracion de pool de conexiones para alta concurrencia (optimizada para 700 usuarios)
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'cgr_user',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'cgr_lms',
    // Habilitar la espera de conexiones cuando el pool este lleno
    waitForConnections: true,
    // Limite maximo de conexiones simultaneas
    connectionLimit: 50,
    // Cola ilimitada para peticiones pendientes de conexion
    queueLimit: 0,
    // Mantener la conexion activa y evitar timeouts
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    charset: 'utf8mb4',
    timezone: '-06:00' // Zona horaria de Costa Rica
});

// Prueba la conexion inicial con reintentos para tolerar el tiempo de arranque de MariaDB en Docker
const testConnection = async (retries = 5, delay = 5000) => {
    while (retries > 0) {
        try {
            const connection = await pool.getConnection();
            logger.info('Conexion a MariaDB establecida correctamente');
            connection.release();
            return;
        } catch (err) {
            logger.error(`Error conectando a MariaDB. Intentos restantes: ${retries - 1}`, err);
            retries -= 1;
            if (retries === 0) {
                logger.error('Fallo critico de conexion a base de datos. Saliendo...');
                process.exit(1);
            }
            await new Promise(res => setTimeout(res, delay));
        }
    }
};

// Iniciar validacion asincrona de conexion
testConnection();

// Helper global para ejecutar consultas seguras mediante prepared statements
const query = async (sql, params) => {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        logger.error('Error al ejecutar query en la base de datos:', error);
        throw error;
    }
};

module.exports = {
    pool,
    query
};
