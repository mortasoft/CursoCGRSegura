const authService = require('../services/authService');
const logger = require('../config/logger');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * Controlador de Autenticacion de Google
 * Establece la sesion del usuario validando las credenciales devueltas por Google OAuth
 */
exports.googleAuth = catchAsync(async (req, res, next) => {
    const { credential } = req.body;
    
    // Verificar que se haya provisto la credencial/token de Google
    if (!credential) {
        return next(new AppError('Token de Google no proporcionado', 400));
    }

    // Delegar a la capa de servicio la validacion y creacion/recuperacion del usuario
    const user = await authService.googleAuth(credential);

    // Guardar sesion en las cookies HTTP-Only de express-session
    req.session.userId = user.id;
    req.session.email = user.email;

    // Registrar actividad de inicio de sesion en el historial
    await authService.logActivity(user.id, 'login', req.ip, req.get('user-agent'));

    // Obtener estadisticas del usuario e informacion de nivelacion/gamificacion
    const stats = await authService.getUserStats(user.id);
    const { calculateLevel } = require('../services/gamificationService');
    const levelInfo = await calculateLevel(stats?.points || 0);

    res.json({
        success: true,
        user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            employeeId: user.employee_id,
            department: user.department,
            position: user.position,
            role: user.role,
            is_active: !!user.is_active,
            profilePicture: user.profile_picture,
            points: stats?.points || 0,
            level: `Nivel ${levelInfo.rank}: ${levelInfo.name}`,
            stats: stats || { completed_lessons: 0 },
            allowThemeChange: (await (require('../services/gamificationService').getSystemSettings())).allow_theme_change
        }
    });
});

/**
 * Cierre de Sesion
 * Destruye la sesion activa en Redis/Express-session y borra la cookie
 */
exports.logout = catchAsync(async (req, res, next) => {
    // Si hay una sesion activa, registrar la salida en bitacora
    if (req.session.userId) {
        await authService.logActivity(req.session.userId, 'logout', req.ip);
    }

    // Destruir la sesion del servidor de express-session
    req.session.destroy((err) => {
        if (err) {
            logger.error('Error al destruir sesión:', err);
            return next(new AppError('Error al cerrar sesión', 500));
        }
        // Limpiar cookie de identificador de sesion
        res.clearCookie('connect.sid'); 
        res.json({ success: true, message: 'Sesión cerrada correctamente' });
    });
});

/**
 * Verificar Sesion
 * Comprueba si la cookie de sesion sigue siendo valida y devuelve los datos basicos del usuario
 */
exports.verifySession = catchAsync(async (req, res, next) => {
    const userId = req.session.userId;

    // Retornar error de no autorizado si no existe sesion
    if (!userId) {
        return next(new AppError('Sesión expirada o no válida', 401));
    }

    // Obtener los datos actuales del usuario
    const user = await authService.getSessionUserInfo(userId);

    // Verificar si el usuario sigue activo y registrado
    if (!user || !user.is_active) {
        return next(new AppError('Usuario no válido o desactivado', 401));
    }

    // Formatear nivelacion actual
    const { calculateLevel } = require('../services/gamificationService');
    const levelInfo = await calculateLevel(user.points || 0);

    // Forzar al navegador a no cachear la respuesta de verificacion de sesion
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.json({
        valid: true,
        user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            profilePicture: user.profile_picture,
            role: user.role,
            is_active: !!user.is_active,
            points: user.points || 0,
            level: `Nivel ${levelInfo.rank}: ${levelInfo.name}`,
            allowThemeChange: (await (require('../services/gamificationService').getSystemSettings())).allow_theme_change
        }
    });
});
