const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

async function migrate() {
    console.log('🔄 Iniciando actualización de tipos de contenido...');
    
    // El host es 'mariadb' porque se corre desde adentro del contenedor del backend
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'mariadb',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'cgr_user',
        password: process.env.DB_PASSWORD || 'cgr_password_2026',
        database: process.env.DB_NAME || 'cgr_lms'
    });

    try {
        console.log('⏳ Alterando tabla lesson_contents...');
        
        // Actualizamos el ENUM para incluir 'bullets' y 'confirmation'
        await connection.execute(`
            ALTER TABLE lesson_contents 
            MODIFY COLUMN content_type ENUM(
                'text', 
                'video', 
                'image', 
                'file', 
                'link', 
                'quiz', 
                'survey', 
                'assignment', 
                'note', 
                'heading',
                'bullets',
                'confirmation'
            ) NOT NULL;
        `);
        
        console.log('✅ Tabla lesson_contents actualizada exitosamente.');
        console.log('✨ Tipos "bullets" y "confirmation" ahora son válidos.');
        
    } catch (error) {
        console.error('❌ Error en la migración:', error);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

migrate();
