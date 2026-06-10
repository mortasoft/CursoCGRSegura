const userService = require('../services/userService');
const { clearCache } = require('../middleware/cache');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

class UserController {
    /**
     * @route   GET /api/users
     * @desc    Obtener todos los usuarios registrados (Admin)
     */
    getAllUsers = catchAsync(async (req, res, next) => {
        // Llama al servicio para obtener la lista completa de usuarios
        const users = await userService.getAllUsers();
        res.json({ success: true, users });
    });

    /**
     * @route   GET /api/users/profile
     * @desc    Obtener perfil completo del estudiante logueado (incluye insignias, puntos y lecciones)
     */
    getProfile = catchAsync(async (req, res, next) => {
        // Obtiene la informacion del perfil detallado para el usuario actual
        const profileData = await userService.getUserProfileData(req.user.id);
        if (!profileData) {
            return next(new AppError('Usuario no encontrado', 404));
        }

        // Integrar las configuraciones globales del sistema de gamificacion (ej. cambio de tema habilitado)
        const { getSystemSettings } = require('../services/gamificationService');
        const settings = await getSystemSettings();
        if (profileData.user) {
            profileData.user.allowThemeChange = settings.allow_theme_change;
        }

        res.json({ success: true, ...profileData });
    });

    /**
     * @route   PUT /api/users/profile
     * @desc    Actualizar campos modificables del perfil propio (ej. foto de perfil)
     */
    updateProfile = catchAsync(async (req, res, next) => {
        // Filtrar solo los datos que el propio usuario tiene permitido modificar
        const profileData = {
            profile_picture: req.body.profile_picture
        };
        
        await userService.updateOwnProfile(req.user.id, profileData);
        
        // Invalidar cache de perfil para el usuario especifico
        await clearCache(`cache:/api/users/profile*u${req.user.id}*`);
        
        res.json({ success: true, message: 'Perfil actualizado correctamente' });
    });

    /**
     * @route   GET /api/users/:id/full-profile
     * @desc    Obtener perfil completo de cualquier funcionario (Admin)
     */
    getFullProfile = catchAsync(async (req, res, next) => {
        // Consulta los datos del perfil del usuario especificado por su ID en los parametros
        const profileData = await userService.getUserProfileData(req.params.id);
        if (!profileData) {
            return next(new AppError('Usuario no encontrado', 404));
        }

        // Inyectar configuraciones globales de gamificacion
        const { getSystemSettings } = require('../services/gamificationService');
        const settings = await getSystemSettings();
        if (profileData.user) {
            profileData.user.allowThemeChange = settings.allow_theme_change;
        }

        res.json({ success: true, ...profileData });
    });

    /**
     * @route   GET /api/users/:id
     * @desc    Obtener un usuario específico (Admin)
     */
    getUserById = catchAsync(async (req, res, next) => {
        const user = await userService.getUserById(req.params.id);
        if (!user) {
            return next(new AppError('Usuario no encontrado', 404));
        }
        res.json({ success: true, user });
    });

    /**
     * @route   PUT /api/users/:id
     * @desc    Actualizar los datos de un usuario en el panel de administracion (Admin)
     */
    updateUser = catchAsync(async (req, res, next) => {
        const userId = req.params.id;
        const requestingUserId = req.user.id;

        // Medida de Seguridad: Evitar que el admin logueado cambie su propio rol o se inactive a si mismo
        if (userId == requestingUserId) {
            if (req.body.role && req.body.role !== req.user.role) {
                return next(new AppError('No puedes cambiar tu propio rol.', 400));
            }
            if (req.body.is_active === false || req.body.is_active === 0) {
                return next(new AppError('No puedes desactivar tu propia cuenta.', 400));
            }
        }

        // Actualiza los campos en base de datos
        await userService.updateUser(userId, req.body);
        res.json({ success: true, message: 'Usuario actualizado correctamente' });
    });

    /**
     * @route   DELETE /api/users/:id
     * @desc    Eliminar permanentemente la cuenta de un usuario (Admin)
     */
    deleteUser = catchAsync(async (req, res, next) => {
        const userId = req.params.id;
        // Medida de seguridad: impedir borrado de la cuenta del propio admin
        if (userId == req.user.id) {
            return next(new AppError('No puedes eliminar tu propia cuenta.', 400));
        }
        await userService.deleteUser(userId);
        res.json({ success: true, message: 'Usuario eliminado permanentemente' });
    });

    /**
     * Reiniciar el progreso academico e historico de un usuario (Admin)
     */
    resetProgress = catchAsync(async (req, res, next) => {
        const userId = req.params.id;
        const { moduleId } = req.body;

        // Limpieza masiva de todas las caches del usuario y rankings para evitar inconsistencias
        await clearCache(`cache:/api/dashboard*u${userId}*`);
        await clearCache(`cache:/api/users/profile*u${userId}*`);
        await clearCache(`cache:/api/users/${userId}/full-profile*`);
        await clearCache(`cache:/api/gamification/leaderboard*`);
        await clearCache(`cache:/api/gamification/ranking*`);
        await clearCache(`cache:/api/modules*u${userId}*`);
        await clearCache(`cache:/api/lessons*u${userId}*`);
        await clearCache(`leaderboard:institutional`);
        await clearCache(`cache:/api/users*`); 

        // Reinicia el progreso del modulo especificado o toda la plataforma si moduleId es nulo
        const result = await userService.resetUserProgress(userId, moduleId);

        // Sincronizar inmediatamente la puntuacion actualizada del usuario en los Sorted Sets de Redis
        const { updateUserScore } = require('../services/gamificationService');
        await updateUserScore(userId, result.newPoints);

        res.json({ 
            success: true, 
            message: moduleId 
                ? 'El progreso del módulo ha sido reiniciado correctamente'
                : 'Todo el progreso del usuario ha sido reiniciado completamente',
            newPoints: result.newPoints,
            newLevel: result.newLevel 
        });
    });
}

module.exports = new UserController();
