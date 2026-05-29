const badgeService = require('../services/badgeService');
const logger = require('../config/logger');

class BadgeController {
    async getAllBadges(req, res) {
        try {
            const badges = await badgeService.getAllBadges();
            res.json({ success: true, badges });
        } catch (error) {
            logger.error('Error al obtener insignias:', error);
            res.status(500).json({ error: 'Error al obtener las insignias' });
        }
    }

    async createBadge(req, res) {
        try {
            const { name, description, is_public } = req.body;
            if (!name || !description) {
                return res.status(400).json({ error: 'Nombre y descripción son obligatorios' });
            }

            const badgeId = await badgeService.createBadge(req.body);
            res.json({ success: true, message: 'Insignia creada correctamente', badgeId });
        } catch (error) {
            logger.error('Error al crear insignia:', error);
            res.status(500).json({ error: 'Error al crear la insignia' });
        }
    }

    async updateBadge(req, res) {
        try {
            const { id } = req.params;
            const result = await badgeService.updateBadge(id, req.body);
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Insignia no encontrada' });
            }
            
            res.json({ success: true, message: 'Insignia actualizada correctamente' });
        } catch (error) {
            logger.error('Error al actualizar insignia:', error);
            res.status(500).json({ error: 'Error al actualizar la insignia' });
        }
    }

    async deleteBadge(req, res) {
        try {
            const { id } = req.params;
            const result = await badgeService.deleteBadge(id);
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Insignia no encontrada' });
            }
            
            res.json({ success: true, message: 'Insignia eliminada correctamente' });
        } catch (error) {
            logger.error('Error al eliminar insignia:', error);
            res.status(500).json({ error: 'Error al eliminar la insignia' });
        }
    }

    async getUserBadges(req, res) {
        try {
            const { userId } = req.params;
            const badges = await badgeService.getUserBadges(userId);
            res.json({ success: true, badges });
        } catch (error) {
            logger.error('Error al obtener insignias del usuario:', error);
            res.status(500).json({ error: 'Error al obtener las insignias del usuario' });
        }
    }

    async awardBadge(req, res) {
        try {
            const { userId, badgeId } = req.body;
            if (!userId || !badgeId) {
                return res.status(400).json({ error: 'Usuario e insignia son obligatorios' });
            }

            const result = await badgeService.awardBadge(userId, badgeId, true);
            
            // Informar sobre el estado del correo
            let message = 'Insignia asignada correctamente.';
            if (result && result.emailSent) {
                message += ' Notificación enviada por correo.';
            } else if (result && result.emailError) {
                message += ` Pero hubo un error con el correo: ${result.emailError}`;
            }

            res.json({ 
                success: true, 
                message,
                emailSent: result ? result.emailSent : false,
                emailError: result ? result.emailError : null
            });
        } catch (error) {
            logger.error('Error al asignar insignia:', error);
            res.status(500).json({ error: 'Error al asignar la insignia' });
        }
    }

    async awardBadgeByEmail(req, res) {
        try {
            const { email, badgeId } = req.body;
            if (!email || !badgeId) {
                return res.status(400).json({ error: 'Correo e insignia son obligatorios' });
            }

            const db = require('../config/database');
            const [user] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado con ese correo' });
            }

            // Usar utils/badges.js para que asigne también los puntos
            const badgesUtil = require('../utils/badges');
            const result = await badgesUtil.awardBadge(user.id, badgeId, true);

            if (result && result.error) {
                return res.status(500).json({ error: 'Error interno al asignar insignia' });
            }

            if (result && result.awarded === false) {
                return res.status(400).json({ error: result.message || 'El usuario ya tiene esta insignia' });
            }

            // Informar sobre el estado del correo
            let message = 'Insignia asignada correctamente y puntos sumados.';
            if (result.emailSent) {
                message += ' Notificación enviada por correo.';
            } else if (result.emailError) {
                message += ` Pero hubo un error con el correo: ${result.emailError}`;
            }

            res.json({ 
                success: true, 
                message,
                emailSent: result.emailSent,
                emailError: result.emailError
            });
        } catch (error) {
            logger.error('Error al asignar insignia por email:', error);
            res.status(500).json({ error: 'Error al asignar la insignia' });
        }
    }

    async awardRoswellBadge(req, res) {
        try {
            const userId = req.user.id;
            const db = require('../config/database');
            const [badge] = await db.query("SELECT id FROM badges WHERE name = 'Hacker de Roswell'");
            if (!badge) {
                return res.status(404).json({ error: 'Insignia Hacker de Roswell no encontrada en la base de datos' });
            }

            const badgesUtil = require('../utils/badges');
            const result = await badgesUtil.awardBadge(userId, badge.id, true);

            res.json({ 
                success: true, 
                awarded: result ? result.awarded : false,
                badge: result ? result.badge : null
            });
        } catch (error) {
            logger.error('Error al auto-asignar insignia Hacker de Roswell:', error);
            res.status(500).json({ error: 'Error interno al procesar la insignia' });
        }
    }
}

module.exports = new BadgeController();
