const { HACK_PROFILES } = require('../constants/gamesData');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * Verificar intento de descifrado/hackeo en el juego "Hackea a tu Vecino"
 * Compara la contraseña ingresada por el usuario con la contraseña correcta del perfil simulado
 */
exports.verifyHackAttempt = catchAsync(async (req, res, next) => {
    const { profileId, index, password } = req.body;

    // Validacion de parametros minimos requeridos
    if ((profileId === undefined && index === undefined) || !password) {
        return next(new AppError('Por favor proporcione el ID del perfil o el índice y la contraseña', 400));
    }

    // El frontend puede enviar un indice basado en una semilla (ej. item.id % longitud_perfiles) 
    // o el ID directo del perfil. Resolvemos para ambos escenarios.
    let profile;
    if (index !== undefined) {
        profile = HACK_PROFILES[index];
    } else {
        profile = HACK_PROFILES.find(p => p.id === profileId);
    }

    // Control de existencia del perfil solicitado
    if (!profile) {
        return next(new AppError('Perfil no encontrado', 404));
    }

    // Validar si la contraseña ingresada coincide con la establecida para el perfil
    const isCorrect = profile.password === password;

    res.status(200).json({
        success: true,
        isCorrect,
        // Solo retornamos la contraseña correcta de vuelta si el usuario logro adivinarla
        password: isCorrect ? profile.password : undefined
    });
});
