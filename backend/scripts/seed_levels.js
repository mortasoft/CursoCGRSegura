const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const db = require('../config/database');
const logger = require('../config/logger');

async function seed() {
    try {
        logger.info('Iniciando seed de niveles de gamificación...');

        // 1. Limpiar niveles actuales
        await db.query('DELETE FROM gamification_levels');
        logger.info('Tabla gamification_levels limpia.');

        // 2. Insertar los niveles solicitados (sincronizados con el frontend)
        const levels = [
            ['Novato', 0, 'Award'],
            ['Iniciado', 50, 'Award'],
            ['Defensor', 150, 'ShieldCheck'],
            ['Protector', 300, 'ShieldCheck'],
            ['Guardián', 500, 'ShieldCheck'],
            ['Vigilante', 750, 'ShieldCheck'],
            ['Centinela', 1000, 'ShieldCheck'],
            ['Maestro Segur@', 1500, 'Trophy'],
            ['CISO Honorario', 2500, 'Medal'],
            ['Leyenda Cyber', 5000, 'Crown']
        ];

        for (const [name, min_points, icon] of levels) {
            await db.query(
                'INSERT INTO gamification_levels (name, min_points, icon) VALUES (?, ?, ?)',
                [name, min_points, icon]
            );
            logger.info(`Nivel '${name}' insertado con ${min_points} pts.`);
        }

        logger.info('Seed de niveles completado exitosamente.');
        process.exit(0);
    } catch (error) {
        logger.error('Error en el seed:', error);
        process.exit(1);
    }
}

seed();
