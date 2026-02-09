const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const db = require('../config/database');
const logger = require('../config/logger');

async function migrate() {
    try {
        logger.info('Iniciando migración de gamificación...');

        // 1. Crear tabla de niveles
        await db.query(`
            CREATE TABLE IF NOT EXISTS gamification_levels (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL,
                min_points INT NOT NULL,
                icon VARCHAR(50) DEFAULT 'Award',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS system_settings (
                setting_key VARCHAR(100) PRIMARY KEY,
                setting_value VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        logger.info('Tablas de gamificación y settings creadas/verificadas.');

        // 2. Insertar niveles iniciales (Limpiar primero para asegurar los 10)
        await db.query('DELETE FROM gamification_levels');
        const levels = [
            ['Novato', 0, 'Award'],
            ['Iniciado', 50, 'ChevronRight'],
            ['Defensor', 150, 'Shield'],
            ['Protector', 300, 'ShieldCheck'],
            ['Guardián', 500, 'ShieldAlert'],
            ['Vigilante', 750, 'Eye'],
            ['Centinela', 1000, 'Zap'],
            ['Maestro Segur@', 1500, 'Star'],
            ['CISO Honorario', 2500, 'Trophy'],
            ['Leyenda Cyber', 5000, 'Crown']
        ];

        for (const [name, min_points, icon] of levels) {
            await db.query(
                'INSERT INTO gamification_levels (name, min_points, icon) VALUES (?, ?, ?)',
                [name, min_points, icon]
            );
        }

        // Insertar settings iniciales
        const settings = [
            ['points_per_lesson', '10'],
            ['points_per_quiz', '50'],
            ['bonus_perfect_score', '25']
        ];

        for (const [key, value] of settings) {
            await db.query(
                'INSERT IGNORE INTO system_settings (setting_key, setting_value) VALUES (?, ?)',
                [key, value]
            );
        }
        logger.info('Niveles y settings iniciales insertados.');

        // 3. Modificar columna level en user_points para permitir nombres dinámicos
        // Primero verificamos si es ENUM
        const columns = await db.query('SHOW COLUMNS FROM user_points LIKE "level"');
        if (columns[0] && columns[0].Type.includes('enum')) {
            await db.query('ALTER TABLE user_points MODIFY COLUMN level VARCHAR(100) DEFAULT "Novato"');
            logger.info('Columna level en user_points convertida de ENUM a VARCHAR.');
        }

        logger.info('Migración completada exitosamente.');
        process.exit(0);
    } catch (error) {
        logger.error('Error en la migración:', error);
        process.exit(1);
    }
}

migrate();
