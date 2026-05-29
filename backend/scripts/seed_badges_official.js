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
            },
            {
                name: 'Enlace con el Operador',
                description: 'Has sabido cuándo levantar el auricular. Esta insignia reconoce tu inteligencia para pedir soporte externo y optimizar tu rendimiento en la simulación.',
                icon_name: 'PhoneCall',
                image_url: 'enlace-operador.svg',
                criteria_type: 'manual',
                criteria_value: null,
                points: 10
            },
            {
                name: 'Anomalía del Sistema',
                description: 'Has encontrado un fallo en la Matrix que no debería existir. Al reportarlo, has demostrado que tu percepción va más allá de lo que la Matrix intenta mostrarte.',
                icon_name: 'AlertTriangle',
                image_url: 'anomalia-sistema.svg',
                criteria_type: 'manual',
                criteria_value: null,
                points: 50
            },
            {
                name: 'Arcade Replay',
                description: 'El conocimiento es un músculo que se entrena. Ganada por rejugar los niveles finales de CGR Segura hasta dominar cada mecánica y lograr una ejecución libre de riesgos.',
                icon_name: 'RotateCcw',
                image_url: 'arcade-replay.svg',
                criteria_type: 'manual',
                criteria_value: null,
                points: 20
            },
            {
                name: 'Combo x5',
                description: "Has ingresado a la plataforma durante 5 días consecutivos. Bonus de 'Combo x5' aplicado. Tu compromiso con la misión es total!!!",
                icon_name: 'Zap',
                image_url: 'combo-x5.svg',
                criteria_type: 'manual',
                criteria_value: null,
                points: 10
            },
            {
                name: 'Equipo Élite',
                description: '¡Misión de equipo completada! Cada integrante ha superado el módulo con éxito. Han demostrado que el trabajo en equipo es el mejor "power-up".',
                icon_name: 'Users',
                image_url: 'equipo-elite.svg',
                criteria_type: 'manual',
                criteria_value: null,
                points: 15
            },
            {
                name: 'Maestro del Co-Op',
                description: 'Esta insignia se otorga al realizar 5 aportes en los foros de discusión. Al igual que en las mejores partidas multijugador, compartes tus tácticas con el clan para que todo el equipo suba de nivel en seguridad y evite un "Game Over" institucional',
                icon_name: 'MessageSquare',
                image_url: 'maestro-co-op.svg',
                criteria_type: 'manual',
                criteria_value: null,
                points: 15
            },
            {
                name: 'Data Tetris Grandmaster',
                description: '¡Has alcanzado el Olimpo! Desbloqueado al conquistar el rango de Leyenda en el Modo Difícil de Data Tetris. Soportaste la velocidad máxima de caída de archivos, ordenaste bloques rojos y amarillos bajo una presión extrema y demostraste reflejos inhumanos para aplicar la Ley Nº 8968 en milisegundos. Para ti, el término "Fuga de Datos" simplemente no existe. ¡Eres una leyenda viviente de la seguridad!',
                icon_name: 'Trophy',
                image_url: 'tetris.svg',
                criteria_type: 'manual',
                criteria_value: null,
                points: 50
            },
            {
                name: 'El Último "Continue"',
                description: '9... 8... 7... ¡Insert Coin! Esta insignia reconoce tu espíritu de la vieja escuela. Gastaste absolutamente todos los "tokens" y vidas de la máquina para superar el cuestionario. No importa cuántas veces viste la pantalla de advertencia; luchaste hasta el último segundo para asegurar que el aprendizaje sobre la Ley Nº 8968 quedara grabado en tu inventario.',
                icon_name: 'Gamepad2',
                image_url: 'reintento.svg',
                criteria_type: 'manual',
                criteria_value: null,
                points: 15
            },
            {
                name: '¡Reunión de Emergencia!',
                description: '¡Hay un archivo sospechoso en el sector de la nube! Tocaste el gran botón rojo al advertir de forma proactiva a un compañero sobre una anomalía crítica en sus carpetas compartidas. Gracias a tu reporte rápido y preciso a través de Drive Auditor, el "impostor" de la vulnerabilidad fue eyectado a tiempo, manteniendo a toda la tripulación de la CGR a salvo.',
                icon_name: 'AlertTriangle',
                image_url: 'emergencia.svg',
                criteria_type: 'manual',
                criteria_value: null,
                points: 15
            }
        ];

        for (const badge of badges) {
            // Asignamos 10 puntos por defecto si no está definido en el objeto
            const badgePoints = badge.points || 10;

            const existing = await db.query('SELECT id FROM badges WHERE name = ?', [badge.name]);
            if (existing && existing.length > 0) {
                logger.info(`Actualizando insignia: ${badge.name}`);
                await db.query(
                    'UPDATE badges SET description = ?, icon_name = ?, image_url = ?, criteria_type = ?, criteria_value = ?, points = ?, is_public = 1 WHERE name = ?',
                    [badge.description, badge.icon_name, badge.image_url, badge.criteria_type, badge.criteria_value, badgePoints, badge.name]
                );
            } else {
                logger.info(`Insertando nueva insignia: ${badge.name}`);
                await db.query(
                    'INSERT INTO badges (name, description, icon_name, image_url, criteria_type, criteria_value, points, is_public) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
                    [badge.name, badge.description, badge.icon_name, badge.image_url, badge.criteria_type, badge.criteria_value, badgePoints]
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
