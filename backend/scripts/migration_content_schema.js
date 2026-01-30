const db = require('../config/database');
const logger = require('../config/logger'); // Assuming logger exists based on previous file reads

const runMigration = async () => {
    try {
        console.log('🔄 Iniciando migración de esquema de contenidos...');

        // 1. Alterar tabla quizzes para soportar encuestas
        try {
            await db.query(`
                ALTER TABLE quizzes 
                ADD COLUMN type ENUM('quiz', 'survey') DEFAULT 'quiz' AFTER title;
            `);
            console.log('✅ Tabla quizzes actualizada con columna type.');
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ Columna type ya existe en quizzes.');
            } else {
                throw error;
            }
        }

        // 2. Crear tabla de contenidos de lección
        await db.query(`
            CREATE TABLE IF NOT EXISTS lesson_contents (
                id INT AUTO_INCREMENT PRIMARY KEY,
                lesson_id INT NOT NULL,
                title VARCHAR(255),
                content_type ENUM('text', 'video', 'image', 'file', 'link', 'quiz', 'survey', 'assignment') NOT NULL,
                data JSON COMMENT 'Almacena contenido HTML, URLs, ID de quiz, config de archivo, etc.',
                order_index INT NOT NULL,
                is_required BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
                INDEX idx_lesson_id (lesson_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('✅ Tabla lesson_contents creada.');

        // 3. Crear tabla de entregas de tareas
        await db.query(`
            CREATE TABLE IF NOT EXISTS assignment_submissions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                content_id INT NOT NULL COMMENT 'Referencia a lesson_contents id',
                user_id INT NOT NULL,
                file_url TEXT NOT NULL,
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                feedback TEXT,
                grade INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (content_id) REFERENCES lesson_contents(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_content_user (content_id, user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('✅ Tabla assignment_submissions creada.');

        console.log('✨ Migración completada exitosamente.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error en la migración:', error);
        process.exit(1);
    }
};

runMigration();
