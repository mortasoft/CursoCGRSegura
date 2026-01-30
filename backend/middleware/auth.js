const jwt = require('jsonwebtoken');
const db = require('../config/database');

/**
 * Middleware de autenticación
 * Verifica el token JWT y carga la información del usuario
 */
const authMiddleware = async (req, res, next) => {
    try {
        // Obtener token del header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No se proporcionó token de autenticación' });
        }

        const token = authHeader.split(' ')[1];

        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cgr-jwt-secret');

        // Obtener usuario de la base de datos
        const [user] = await db.query(
            'SELECT id, email, first_name, last_name, role, is_active FROM users WHERE id = ?',
            [decoded.id]
        );

        if (!user) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        if (!user.is_active) {
            return res.status(403).json({ error: 'Usuario desactivado' });
        }

        // Agregar usuario al request
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Token inválido' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expirado' });
        }
        return res.status(500).json({ error: 'Error de autenticación' });
    }
};

/**
 * Middleware para verificar rol de administrador
 */
const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
    }
    next();
};

/**
 * Middleware para verificar rol de instructor o admin
 */
const instructorMiddleware = (req, res, next) => {
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de instructor.' });
    }
    next();
};

module.exports = {
    authMiddleware,
    adminMiddleware,
    instructorMiddleware
};
