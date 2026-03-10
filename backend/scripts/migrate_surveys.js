const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'cgr_user',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'cgr_lms'
    });

    console.log('🚀 Iniciando migración de Encuestas...');

    try {
        // Table: surveys
        await connection.execute(`
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
        console.log('✅ Tabla surveys creada');

        // Table: survey_questions
        await connection.execute(`
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
        console.log('✅ Tabla survey_questions creada');

        // Table: survey_options
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS survey_options (
                id INT PRIMARY KEY AUTO_INCREMENT,
                question_id INT NOT NULL,
                option_text VARCHAR(255) NOT NULL,
                order_index INT DEFAULT 0,
                FOREIGN KEY (question_id) REFERENCES survey_questions(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('✅ Tabla survey_options creada');

        // Table: survey_responses
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS survey_responses (
                id INT PRIMARY KEY AUTO_INCREMENT,
                survey_id INT NOT NULL,
                user_id INT NOT NULL,
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('✅ Tabla survey_responses creada');

        // Table: survey_answers
        await connection.execute(`
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
        console.log('✅ Tabla survey_answers creada');

        console.log('🎊 Migración de Encuestas completada con éxito');
    } catch (error) {
        console.error('❌ Error en la migración:', error);
    } finally {
        await connection.end();
    }
}

migrate();
