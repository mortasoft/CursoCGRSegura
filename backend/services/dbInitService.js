const db = require('./config/database');
const logger = require('./config/logger');

const initializeDatabase = async () => {
    try {
        logger.info('🔄 Verificando integridad de la base de datos...');
        
        // Crear tabla user_content_progress si no existe
        await db.query(`
            CREATE TABLE IF NOT EXISTS user_content_progress (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                content_id INT NOT NULL,
                completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (content_id) REFERENCES lesson_contents(id) ON DELETE CASCADE,
                UNIQUE KEY unique_user_content (user_id, content_id),
                INDEX idx_user_id (user_id),
                INDEX idx_content_id (content_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        logger.info('✅ Estructura de base de datos verificada y actualizada.');
    } catch (error) {
        logger.error('❌ Error inicializando base de datos:', error);
        // No salimos del proceso para permitir que la app intente funcionar, 
        // pero el error queda registrado.
    }
};

module.exports = { initializeDatabase };
