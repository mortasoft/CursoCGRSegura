const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
const db = require('../config/database');
const logger = require('../config/logger');
const AppError = require('../utils/appError');
const { downloadProfilePicture } = require('../utils/fileUtils');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthService {
    /**
     * Procesa la autenticación con Google OAuth
     * @param {string} credential - Access Token de Google
     */
    async googleAuth(credential) {
        // Obtener información del usuario usando el access_token
        let googleResponse;
        try {
            googleResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${credential}` },
                timeout: 10000
            });
        } catch (error) {
            logger.error('Error de red o verificacion con Google:', error.message);
            
            // Si el servidor no tiene conexion a internet (error de red o sin respuesta)
            if (!error.response && error.request) {
                throw new AppError('No se pudo establecer conexion con los servidores de Google. Verifique la conexion a internet del servidor o intente mas tarde.', 503);
            }
            
            // Si Google respondio con un codigo de estado de error (ej. token invalido o expirado)
            if (error.response) {
                const status = error.response.status;
                if (status >= 400 && status < 500) {
                    throw new AppError('El token de autenticacion de Google es invalido o ha expirado. Intente iniciar sesion de nuevo.', 401);
                }
            }
            
            // Error generico controlado
            throw new AppError('Error al validar la sesion con Google. Intente nuevamente en unos minutos.', 500);
        }

        const payload = googleResponse.data;
        const email = payload.email.toLowerCase();
        const googleId = payload.sub;
        const given_name = payload.given_name || '';
        const family_name = payload.family_name || '';
        const picture = payload.picture || null;

        // Intentar descargar la imagen localmente para evitar URLs caducadas
        const localPicture = await downloadProfilePicture(picture, googleId);
        const finalPicture = localPicture || picture;

        // Buscar o crear usuario
        let userResults;
        try {
            userResults = await db.query(
                'SELECT * FROM users WHERE email = ? OR google_id = ?',
                [email, googleId]
            );
        } catch (dbError) {
            logger.error('Error de base de datos en login:', dbError.message);
            throw new AppError('Error de conexión con la base de datos de seguridad.', 500);
        }

        let user;
        const defaultAdminEmail = process.env.DEFAULT_ADMIN_EMAIL ? process.env.DEFAULT_ADMIN_EMAIL.toLowerCase() : null;
        const isDefaultAdmin = defaultAdminEmail && email === defaultAdminEmail;

        if (userResults.length === 0) {
            logger.info(`Buscando usuario en directorio oficial: ${email}`);
            // Buscar información en el directorio maestro de funcionarios
            const directoryResults = await db.query(
                'SELECT department, full_name, position FROM staff_directory WHERE email = ?',
                [email]
            );
            const directoryInfo = directoryResults.length > 0 ? directoryResults[0] : null;

            // Si no está en el directorio Y no es el admin por defecto, rechazar
            if (!directoryInfo && !isDefaultAdmin) {
                logger.warn(`Usuario no encontrado en directorio oficial: ${email}`);
                throw new AppError('Su correo no está registrado en el directorio oficial de la institución.', 403);
            }

            // Determinar rol (Si es admin por defecto o si el directorio dice algo, aunque prioridad al .env)
            const role = isDefaultAdmin ? 'admin' : 'student';

            // Crear nuevo usuario
            const result = await db.query(
                `INSERT INTO users (
                    email, google_id, first_name, last_name, 
                    profile_picture, role, department, position, is_active, last_login,
                    login_streak, last_streak_date
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE, NOW(), 1, CURDATE())`,
                [
                    email,
                    googleId,
                    given_name,
                    family_name,
                    finalPicture,
                    role,
                    directoryInfo?.department || (isDefaultAdmin ? 'Administración' : null),
                    directoryInfo?.position || (isDefaultAdmin ? 'Súper Administrador' : null)
                ]
            );

            const newUserResults = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
            user = newUserResults[0];

            // Crear registro de gamificación para nuevo usuario
            await db.query(
                'INSERT INTO user_points (user_id, points, level) VALUES (?, 0, "Novato")',
                [user.id]
            );

            logger.info(`Nuevo usuario registrado mediante Google (Admin Bypass: ${isDefaultAdmin}): ${email}`);
        } else {
            user = userResults[0];

            if (!user.is_active) {
                logger.warn(`Intento de acceso a cuenta desactivada: ${email}`);
                throw new AppError('Su cuenta ha sido desactivada por el administrador.', 403);
            }

            // Actualizar datos existentes
            await db.query(
                'UPDATE users SET last_login = NOW(), profile_picture = ? WHERE id = ?',
                [finalPicture || user.profile_picture, user.id]
            );

            // Gestionar racha de login
            try {
                const { checkComboX5Badge } = require('./badgeService');
                await checkComboX5Badge(user.id);
            } catch (streakError) {
                logger.error('Error procesando racha de login:', streakError);
            }

            // Recargar datos actualizados
            const updatedUserResults = await db.query('SELECT * FROM users WHERE id = ?', [user.id]);
            user = updatedUserResults[0];
        }

        return user;
    }

    /**
     * Obtiene estadísticas del usuario
     */
    async getUserStats(userId) {
        const [stats] = await db.query(
            `SELECT 
                (SELECT COUNT(*) FROM user_progress WHERE user_id = ? AND status = 'completed') as completed_lessons,
                (SELECT points FROM user_points WHERE user_id = ?) as points,
                (SELECT level FROM user_points WHERE user_id = ?) as level
            `,
            [userId, userId, userId]
        );
        return stats || { completed_lessons: 0, points: 0, level: 'Novato' };
    }

    /**
     * Registra actividad de login/logout
     */
    async logActivity(userId, action, ip, userAgent) {
        await db.query(
            `INSERT INTO activity_logs (user_id, action, ip_address, user_agent) 
             VALUES (?, ?, ?, ?)`,
            [userId, action, ip, userAgent || null]
        );
    }
    
    /**
     * Obtiene información extendida de un usuario para la verificación de sesión
     */
    async getSessionUserInfo(userId) {
        const [user] = await db.query(
            `SELECT u.id, u.email, u.first_name, u.last_name, u.profile_picture, u.role, u.is_active,
                    up.points, up.level
             FROM users u
             LEFT JOIN user_points up ON u.id = up.user_id
             WHERE u.id = ?`,
            [userId]
        );
        return user;
    }
}

module.exports = new AuthService();
