const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const logger = require('../config/logger');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const axios = require('axios');

/**
 * @route   POST /api/auth/google
 * @desc    Autenticación con Google OAuth (Access Token)
 * @access  Public
 */
router.post('/google', async (req, res) => {
    try {
        const { credential } = req.body; // En este flujo, 'credential' es el access_token

        // Obtener información del usuario usando el access_token
        const googleResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${credential}` }
        });

        const payload = googleResponse.data;

        // Extraer datos con valores por defecto para evitar 'undefined' en SQL
        const email = payload.email;
        const googleId = payload.sub;
        const given_name = payload.given_name || '';
        const family_name = payload.family_name || '';
        const picture = payload.picture || null;

        // Verificar que el email sea del dominio @cgr.go.cr
        // TODO: Comentar esta validación para pruebas si no tienes correo @cgr.go.cr
        /* 
        if (!email.endsWith('@cgr.go.cr')) {
            return res.status(403).json({
                error: 'Acceso denegado',
                message: 'Solo se permite el acceso a funcionarios de la CGR con correo @cgr.go.cr'
            });
        }
        */

        // Buscar o crear usuario
        let user = await db.query(
            'SELECT * FROM users WHERE email = ? OR google_id = ?',
            [email, googleId]
        );

        if (user.length === 0) {
            // Buscar información en el directorio maestro de funcionarios
            const [directoryInfo] = await db.query(
                'SELECT department, full_name FROM staff_directory WHERE email = ?',
                [email]
            );

            // Determinar rol inicial (admin si coincide con el correo configurado)
            const defaultAdminEmail = process.env.DEFAULT_ADMIN_EMAIL;
            const role = (defaultAdminEmail && email.toLowerCase() === defaultAdminEmail.toLowerCase()) ? 'admin' : 'student';

            // Crear nuevo usuario
            const result = await db.query(
                `INSERT INTO users (
                    email, google_id, first_name, last_name, 
                    profile_picture, role, department, position, is_active, last_login
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE, NOW())`,
                [
                    email,
                    googleId,
                    given_name || '',
                    family_name || '',
                    picture || null,
                    role,
                    directoryInfo?.department || null,
                    directoryInfo?.position || null
                ]
            );

            user = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
            user = user[0];

            // Crear registro de gamificación para nuevo usuario
            await db.query(
                'INSERT INTO user_points (user_id, points, level) VALUES (?, 0, "Novato")',
                [user.id]
            );

            logger.info(`Nuevo usuario registrado: ${email}`);
        } else {
            // Si el usuario existe pero no tiene departamento o puesto, y el directorio sí lo tiene, actualizarlo
            const [directoryInfo] = await db.query(
                'SELECT department, position FROM staff_directory WHERE email = ?',
                [email]
            );

            if (directoryInfo) {
                if (!user[0].department || !user[0].position) {
                    await db.query(
                        'UPDATE users SET department = ?, position = ? WHERE id = ?',
                        [directoryInfo.department || user[0].department, directoryInfo.position || user[0].position, user[0].id]
                    );
                }
            }

            // Actualizar última conexión y foto de perfil si existe
            await db.query(
                'UPDATE users SET last_login = NOW(), profile_picture = ? WHERE id = ?',
                [picture || user[0].profile_picture, user[0].id]
            );

            // Recargar datos actualizados
            const updatedUser = await db.query('SELECT * FROM users WHERE id = ?', [user[0].id]);
            user = updatedUser[0];
        }

        // Verificar que el usuario esté activo
        if (!user.is_active) {
            return res.status(403).json({
                error: 'Cuenta desactivada',
                message: 'Su cuenta ha sido desactivada. Contacte al administrador.'
            });
        }

        // Generar JWT token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
                employeeId: user.employee_id
            },
            process.env.JWT_SECRET || 'cgr-jwt-secret',
            { expiresIn: '24h' }
        );

        // Guardar sesión
        req.session.userId = user.id;
        req.session.email = user.email;

        // Registrar actividad
        await db.query(
            `INSERT INTO activity_logs (user_id, action, ip_address, user_agent) 
             VALUES (?, 'login', ?, ?)`,
            [user.id, req.ip, req.get('user-agent')]
        );

        // Obtener estadísticas del usuario
        const [stats] = await db.query(
            `SELECT 
                (SELECT COUNT(*) FROM user_progress WHERE user_id = ? AND status = 'completed') as completed_lessons,
                (SELECT points FROM user_points WHERE user_id = ?) as points,
                (SELECT level FROM user_points WHERE user_id = ?) as level
            `,
            [user.id, user.id, user.id]
        );

        res.json({
            success: true,
            token,
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
                level: stats?.level || 'Novato',
                stats: stats || { completed_lessons: 0 }
            }
        });

    } catch (error) {
        logger.error('Error en autenticación Google:', error);
        res.status(500).json({
            error: 'Error de autenticación',
            message: 'No se pudo verificar las credenciales de Google'
        });
    }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión
 * @access  Private
 */
router.post('/logout', async (req, res) => {
    try {
        if (req.session.userId) {
            await db.query(
                `INSERT INTO activity_logs (user_id, action, ip_address) 
                 VALUES (?, 'logout', ?)`,
                [req.session.userId, req.ip]
            );
        }

        req.session.destroy((err) => {
            if (err) {
                logger.error('Error al destruir sesión:', err);
                return res.status(500).json({ error: 'Error al cerrar sesión' });
            }
            res.json({ success: true, message: 'Sesión cerrada correctamente' });
        });
    } catch (error) {
        logger.error('Error en logout:', error);
        res.status(500).json({ error: 'Error al cerrar sesión' });
    }
});

/**
 * @route   GET /api/auth/verify
 * @desc    Verificar token JWT
 * @access  Private
 */
router.get('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'No se proporcionó token' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cgr-jwt-secret');

        const [user] = await db.query(
            `SELECT u.id, u.email, u.first_name, u.last_name, u.profile_picture, u.role, u.is_active,
                    up.points, up.level
             FROM users u
             LEFT JOIN user_points up ON u.id = up.user_id
             WHERE u.id = ?`,
            [decoded.id]
        );

        if (!user || !user.is_active) {
            return res.status(401).json({ error: 'Usuario no válido' });
        }

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
                level: user.level || 'Novato'
            }
        });
    } catch (error) {
        res.status(401).json({ error: 'Token inválido o expirado' });
    }
});

module.exports = router;
