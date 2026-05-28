const db = require('../config/database');
const logger = require('../config/logger');

const initializeDatabase = async () => {
    try {
        logger.info('🔄 Verificando integridad de la base de datos...');

        // Crear tabla system_settings si no existe
        await db.query(`
            CREATE TABLE IF NOT EXISTS system_settings (
                setting_key VARCHAR(50) PRIMARY KEY,
                setting_value TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // Insertar valores por defecto para parámetros globales si no existen
        await db.query(`
            INSERT IGNORE INTO system_settings (setting_key, setting_value) VALUES 
            ('ranking_limit_global', '100'),
            ('ranking_limit_department', '10'),
            ('maintenance_mode', 'false'),
            ('allow_theme_change', 'false');
        `);

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

        // Crear tablas de encuestas si no existen
        await db.query(`
            CREATE TABLE IF NOT EXISTS surveys (
                id INT PRIMARY KEY AUTO_INCREMENT,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                module_id INT,
                lesson_id INT,
                points INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE SET NULL,
                FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS survey_questions (
                id INT PRIMARY KEY AUTO_INCREMENT,
                survey_id INT NOT NULL,
                question_text TEXT NOT NULL,
                question_type ENUM('multiple_choice', 'rating', 'text') DEFAULT 'multiple_choice',
                order_index INT DEFAULT 0,
                is_required BOOLEAN DEFAULT TRUE,
                FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS survey_options (
                id INT PRIMARY KEY AUTO_INCREMENT,
                question_id INT NOT NULL,
                option_text VARCHAR(255) NOT NULL,
                order_index INT DEFAULT 0,
                FOREIGN KEY (question_id) REFERENCES survey_questions(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS survey_responses (
                id INT PRIMARY KEY AUTO_INCREMENT,
                survey_id INT NOT NULL,
                user_id INT NOT NULL,
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS survey_answers (
                id INT PRIMARY KEY AUTO_INCREMENT,
                response_id INT NOT NULL,
                question_id INT NOT NULL,
                answer_text TEXT,
                option_id INT,
                FOREIGN KEY (response_id) REFERENCES survey_responses(id) ON DELETE CASCADE,
                FOREIGN KEY (question_id) REFERENCES survey_questions(id) ON DELETE CASCADE,
                FOREIGN KEY (option_id) REFERENCES survey_options(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // Actualizar tabla de insignias para incluir puntos y visibilidad
        await db.query(`
            ALTER TABLE badges ADD COLUMN IF NOT EXISTS points INT DEFAULT 10;
        `);
        await db.query(`
            ALTER TABLE badges ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;
        `);

        // Asegurar que 'categorization', 'forum' y 'terms_trap' existan en el ENUM de content_type
        await db.query(`
            ALTER TABLE lesson_contents MODIFY COLUMN content_type ENUM(
                'text','video','image','file','link','quiz','survey','assignment','note',
                'heading','bullets','confirmation','interactive_input','password_tester',
                'multiple_choice','mfa_defender','hack_neighbor','dork_search','categorization','data_tetris','forum','terms_trap','drive_auditor'
            ) NOT NULL;
        `);

        // Columnas para racha de login
        await db.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS login_streak INT DEFAULT 0;
        `);
        await db.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS last_streak_date DATE DEFAULT NULL;
        `);
        
        // Aumentar tamaño de columna activity_type para evitar truncado
        await db.query(`
            ALTER TABLE gamification_activities MODIFY COLUMN activity_type VARCHAR(50);
        `);

        // Asegurar que el rol 'analyst' exista en el ENUM de roles de usuario
        await db.query(`
            ALTER TABLE users MODIFY COLUMN role ENUM('student', 'instructor', 'admin', 'analyst') DEFAULT 'student';
        `);


        // Tabla de upvotes para foros
        await db.query(`
            CREATE TABLE IF NOT EXISTS forum_post_upvotes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                post_id INT NOT NULL,
                user_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE KEY unique_user_post_upvote (user_id, post_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // Tablas de Auditoría de Drive
        await db.query(`
            CREATE TABLE IF NOT EXISTS drive_audit_reports (
                id INT AUTO_INCREMENT PRIMARY KEY,
                uuid VARCHAR(36) NOT NULL UNIQUE,
                user_id INT NOT NULL,
                status ENUM('running', 'completed', 'failed') DEFAULT 'running',
                started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP NULL,
                total_scanned INT DEFAULT 0,
                risk_count INT DEFAULT 0,
                sharing_map_json JSON COMMENT 'Mapa de compartición',
                external_domains_json JSON COMMENT 'Lista y conteo de dominios externos',
                error_message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS drive_audit_files (
                id INT AUTO_INCREMENT PRIMARY KEY,
                report_id INT NOT NULL,
                file_id VARCHAR(255) NOT NULL,
                file_name VARCHAR(500) NOT NULL,
                mime_type VARCHAR(100),
                size_kb INT DEFAULT 0,
                owner_name VARCHAR(255),
                owner_email VARCHAR(255),
                sharing_level ENUM('Privado', 'Restringido', 'Dominio con Enlace', 'Dominio Publico', 'Con Enlace', 'Publico', 'Desconocido') DEFAULT 'Desconocido',
                shared_with_emails TEXT,
                file_link TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (report_id) REFERENCES drive_audit_reports(id) ON DELETE CASCADE,
                INDEX idx_report_id (report_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // Migración para añadir columna UUID en drive_audit_reports si no existe
        const columns = await db.query(`SHOW COLUMNS FROM drive_audit_reports LIKE 'uuid'`);
        if (columns && columns.length === 0) {
            logger.info('Añadiendo columna uuid a drive_audit_reports...');
            await db.query(`ALTER TABLE drive_audit_reports ADD COLUMN uuid VARCHAR(36) NULL AFTER id`);
            
            // Generar UUIDs para los registros existentes
            const existing = await db.query(`SELECT id FROM drive_audit_reports`);
            const crypto = require('crypto');
            for (const row of existing) {
                const u = crypto.randomUUID();
                await db.query(`UPDATE drive_audit_reports SET uuid = ? WHERE id = ?`, [u, row.id]);
            }
            
            // Hacer la columna NOT NULL y agregar la restricción UNIQUE
            await db.query(`ALTER TABLE drive_audit_reports MODIFY COLUMN uuid VARCHAR(36) NOT NULL`);
            await db.query(`ALTER TABLE drive_audit_reports ADD UNIQUE KEY idx_drive_audit_reports_uuid (uuid)`);
            logger.info('Columna UUID añadida e inicializada con éxito.');
        }

        // Asegurar que todas las filas tengan un UUID generado (por si la columna ya existía vacía)
        const nullUuids = await db.query(`SELECT id FROM drive_audit_reports WHERE uuid IS NULL OR uuid = ''`);
        if (nullUuids && nullUuids.length > 0) {
            logger.info(`Generando UUIDs para ${nullUuids.length} reportes con UUID nulo...`);
            const crypto = require('crypto');
            for (const row of nullUuids) {
                const u = crypto.randomUUID();
                await db.query(`UPDATE drive_audit_reports SET uuid = ? WHERE id = ?`, [u, row.id]);
            }
            logger.info('UUIDs generados con éxito para los reportes existentes.');
        }

        // Limpiar auditorías "zombies" que hayan quedado corriendo antes de reiniciar el servidor
        const updateResult = await db.query(`
            UPDATE drive_audit_reports 
            SET status = 'failed', error_message = 'El servidor se reinició inesperadamente, por lo que el proceso fue interrumpido.' 
            WHERE status = 'running'
        `);
        
        if (updateResult && updateResult.affectedRows > 0) {
            logger.warn(`Se limpiaron ${updateResult.affectedRows} auditorías de Drive que quedaron "zombies" por un reinicio del servidor.`);
        }

        logger.info('✅ Estructura de base de datos verificada y actualizada.');
    } catch (error) {
        logger.error('❌ Error inicializando base de datos:', error);
        // No salimos del proceso para permitir que la app intente funcionar, 
        // pero el error queda registrado.
    }
};

module.exports = { initializeDatabase };
