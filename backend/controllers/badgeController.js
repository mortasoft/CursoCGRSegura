const badgeService = require('../services/badgeService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

class BadgeController {
    /**
     * Obtener todas las insignias registradas en el sistema
     */
    getAllBadges = catchAsync(async (req, res, next) => {
        // Llama al servicio para obtener todas las insignias del catálogo general
        const badges = await badgeService.getAllBadges();
        res.json({ success: true, badges });
    });

    /**
     * Crear una nueva insignia en el catálogo (Admin)
     */
    createBadge = catchAsync(async (req, res, next) => {
        const { name, description } = req.body;
        // Validacion de campos requeridos
        if (!name || !description) {
            return next(new AppError('Nombre y descripción son obligatorios', 400));
        }

        // Invoca al servicio para registrar la nueva insignia en la BD
        const badgeId = await badgeService.createBadge(req.body);
        res.json({ success: true, message: 'Insignia creada correctamente', badgeId });
    });

    /**
     * Actualizar los datos de una insignia existente (Admin)
     */
    updateBadge = catchAsync(async (req, res, next) => {
        const { id } = req.params;
        // Modifica los datos usando los parametros del cuerpo
        const result = await badgeService.updateBadge(id, req.body);
        
        // Retornar 404 si la insignia con ese ID no existe
        if (result.affectedRows === 0) {
            return next(new AppError('Insignia no encontrada', 404));
        }
        
        res.json({ success: true, message: 'Insignia actualizada correctamente' });
    });

    /**
     * Eliminar una insignia del catálogo (Admin)
     */
    deleteBadge = catchAsync(async (req, res, next) => {
        const { id } = req.params;
        // Elimina la insignia por su ID
        const result = await badgeService.deleteBadge(id);
        
        // Retornar 404 si la insignia con ese ID no existe
        if (result.affectedRows === 0) {
            return next(new AppError('Insignia no encontrada', 404));
        }
        
        res.json({ success: true, message: 'Insignia eliminada correctamente' });
    });

    /**
     * Obtener las insignias obtenidas por un usuario especifico
     */
    getUserBadges = catchAsync(async (req, res, next) => {
        const { userId } = req.params;
        // Llama al servicio para obtener la lista de insignias logradas por el estudiante
        const badges = await badgeService.getUserBadges(userId);
        res.json({ success: true, badges });
    });

    /**
     * Otorgar una insignia de forma manual a un usuario (Admin)
     */
    awardBadge = catchAsync(async (req, res, next) => {
        const { userId, badgeId } = req.body;
        // Validacion de parametros requeridos
        if (!userId || !badgeId) {
            return next(new AppError('Usuario e insignia son obligatorios', 400));
        }

        // Asigna la insignia y envia notificacion si esta configurada
        const result = await badgeService.awardBadge(userId, badgeId, true);
        
        // Informar sobre el estado de la notificacion por correo
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
    });

    /**
     * Asignar una insignia a un usuario buscando por su direccion de correo (Admin)
     */
    awardBadgeByEmail = catchAsync(async (req, res, next) => {
        const { email, badgeId } = req.body;
        // Validacion de parametros requeridos
        if (!email || !badgeId) {
            return next(new AppError('Correo e insignia son obligatorios', 400));
        }

        const db = require('../config/database');
        // Obtener el ID del usuario a partir de su correo
        const [user] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (!user) {
            return next(new AppError('Usuario no encontrado con ese correo', 404));
        }

        // Usar la utilidad centralizada de insignias para realizar la asignacion y sumar puntos
        const badgesUtil = require('../services/badgeService');
        const result = await badgesUtil.awardBadge(user.id, badgeId, true);

        if (result && result.error) {
            return next(new AppError('Error interno al asignar insignia', 500));
        }

        if (result && result.awarded === false) {
            return next(new AppError(result.message || 'El usuario ya tiene esta insignia', 400));
        }

        // Informar sobre el estado del envio del correo electronico
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
    });

    /**
     * Auto-asignar la insignia especial "Hacker de Roswell" al resolver un reto interactivo especifico
     */
    awardRoswellBadge = catchAsync(async (req, res, next) => {
        const userId = req.user.id;
        const db = require('../config/database');
        // Buscar la insignia por su nombre unico en el sistema
        const [badge] = await db.query("SELECT id FROM badges WHERE name = 'Hacker de Roswell'");
        if (!badge) {
            return next(new AppError('Insignia Hacker de Roswell no encontrada en la base de datos', 404));
        }

        // Asignar la insignia usando la utilidad de insignias
        const badgesUtil = require('../services/badgeService');
        const result = await badgesUtil.awardBadge(userId, badge.id, true);

        res.json({ 
            success: true, 
            awarded: result ? result.awarded : false,
            badge: result ? result.badge : null
        });
    });
}

module.exports = new BadgeController();
