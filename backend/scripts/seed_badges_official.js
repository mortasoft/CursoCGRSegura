const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const db = require('../config/database');
const logger = require('../config/logger');

async function seedBadges() {
    try {
        logger.info('Iniciando el sembrado de insignias oficiales...');

        const badges = [
            {
                name: 'Bienvenido a la seguridad',
                description: 'Se consigue luego de haber perdido un módulo/curso. Primer paso en tu camino de aprendizaje.',
                icon_name: 'Award',
                image_url: 'bienvenida-seguridad.svg',
                criteria_type: 'manual',
                criteria_value: null
            },
            {
                name: 'Se enciende la Racha',
                description: 'Participando en actividades por dos días seguidos. ¡Mantén el ritmo!',
                icon_name: 'Zap',
                image_url: 'racha-encendida.svg',
                criteria_type: 'manual',
                criteria_value: null
            },
            {
                name: 'El club de la Velocidad',
                description: 'Terminar un módulo en menos de X minutos. Demuestra tu agilidad mental.',
                icon_name: 'Zap',
                image_url: 'club-velocidad.svg',
                criteria_type: 'manual',
                criteria_value: null
            },
            {
                name: 'Lo mejor de la Sabana',
                description: 'Completa dos módulos seguidos. Un verdadero experto en la materia.',
                icon_name: 'Star',
                image_url: 'mejor-sabana.svg',
                criteria_type: 'manual',
                criteria_value: null
            },
            {
                name: 'El inicio de la seguridad',
                description: 'Iniciar un Módulo. El conocimiento es tu mejor defensa.',
                icon_name: 'Bell',
                image_url: 'inicio-seguridad.svg',
                criteria_type: 'manual',
                criteria_value: null
            },
            {
                name: 'Un gran poder lleva una gran seguridad',
                description: 'Terminar el módulo 1. Has fortalecido tus defensas básicas.',
                icon_name: 'ShieldCheck',
                image_url: 'gran-poder-seguridad.svg',
                criteria_type: 'module_completion',
                criteria_value: '1'
            },
            {
                name: 'Más seguridad',
                description: 'Obteniendo todas las insignias iniciales. El nivel máximo de protección.',
                icon_name: 'Crown',
                image_url: 'mas-seguridad.svg',
                criteria_type: 'manual',
                criteria_value: null
            },
            {
                name: 'Desafío aceptado',
                description: 'Entra en la clasificación de puntos. Has demostrado tu compromiso.',
                icon_name: 'Target',
                image_url: 'desafio-aceptado.svg',
                criteria_type: 'manual',
                criteria_value: null
            },
            {
                name: 'Seguridad sin igual',
                description: 'Descarga 1 recurso adicional de cualquier curso. Buscando la excelencia.',
                icon_name: 'Search',
                image_url: 'seguridad-sin-igual.svg',
                criteria_type: 'manual',
                criteria_value: null
            },
            {
                name: 'Seguridad contra lo peor',
                description: 'Termina el módulo 4. Eres un experto en detección de amenazas.',
                icon_name: 'ShieldAlert',
                image_url: 'seguridad-contra-peor.svg',
                criteria_type: 'module_completion',
                criteria_value: '4'
            },
            {
                name: 'Seguridad Legendaria',
                description: 'Termina en el top 10 de la clasificación. Un referente para la institución.',
                icon_name: 'Trophy',
                image_url: 'seguridad-legendaria.svg',
                criteria_type: 'manual',
                criteria_value: null
            },
            {
                name: 'Ciber-Prestigio',
                description: 'Acumula una gran cantidad de puntos en la clasificación. Reconocimiento a tu trayectoria.',
                icon_name: 'Award',
                image_url: 'ciber-prestigio.svg',
                criteria_type: 'total_points',
                criteria_value: '1000'
            },
            {
                name: 'Era de la Ciber Seguridad',
                description: 'Termina todos los módulos del programa. Graduado en CGR Segur@.',
                icon_name: 'Trophy',
                image_url: 'era-ciberseguridad.svg',
                criteria_type: 'manual',
                criteria_value: null
            },
            {
                name: 'Enfrentamiento por la seguridad',
                description: 'Defiende tu posición en la tabla de posiciones por varios días.',
                icon_name: 'Shield',
                image_url: 'enfrentamiento-seguridad.svg',
                criteria_type: 'manual',
                criteria_value: null
            }
        ];

        for (const badge of badges) {
            // Usamos INSERT IGNORE o comprobamos si existe por nombre
            const existing = await db.query('SELECT id FROM badges WHERE name = ?', [badge.name]);
            if (existing && existing.length > 0) {
                logger.info(`Actualizando insignia: ${badge.name}`);
                await db.query(
                    'UPDATE badges SET description = ?, icon_name = ?, image_url = ?, criteria_type = ?, criteria_value = ? WHERE name = ?',
                    [badge.description, badge.icon_name, badge.image_url, badge.criteria_type, badge.criteria_value, badge.name]
                );
            } else {
                logger.info(`Insertando nueva insignia: ${badge.name}`);
                await db.query(
                    'INSERT INTO badges (name, description, icon_name, image_url, criteria_type, criteria_value) VALUES (?, ?, ?, ?, ?, ?)',
                    [badge.name, badge.description, badge.icon_name, badge.image_url, badge.criteria_type, badge.criteria_value]
                );
            }
        }

        logger.info('Sembrado de insignias completado exitosamente.');
        process.exit(0);
    } catch (error) {
        logger.error('Error en el sembrado de insignias:', error);
        process.exit(1);
    }
}

seedBadges();
