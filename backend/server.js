const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const rateLimit = require('express-rate-limit');
const { createClient } = require('redis');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const db = require('./config/database');
const logger = require('./config/logger');

// Importar rutas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const moduleRoutes = require('./routes/modules');
const lessonRoutes = require('./routes/lessons');
const quizRoutes = require('./routes/quizzes');
const progressRoutes = require('./routes/progress');
const gamificationRoutes = require('./routes/gamification');
const phishingRoutes = require('./routes/phishing');
const dashboardRoutes = require('./routes/dashboard');
const reportRoutes = require('./routes/reports');
const directoryRoutes = require('./routes/directory');
const departmentRoutes = require('./routes/departments');
const badgeRoutes = require('./routes/badges');
const contentRoutes = require('./routes/lesson_content');
const resourceRoutes = require('./routes/resources');
const certificateRoutes = require('./routes/certificates');
const { authMiddleware, adminMiddleware } = require('./middleware/auth');
const maintenanceMiddleware = require('./middleware/maintenance');

const app = express();
const PORT = process.env.PORT || 5000;

const redisClient = require('./config/redis');

// Middlewares generales (CORS debe ir primero)
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-view-as-student']
}));

// Middlewares de seguridad
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "https://accounts.google.com", "https://www.youtube.com", "https://s.ytimg.com"],
            imgSrc: ["'self'", "data:", "https://lh3.googleusercontent.com", "https://ui-avatars.com", "https://*.googleusercontent.com", "https://i.ytimg.com", "https://www.transparenttextures.com"],
            connectSrc: ["'self'", "https://accounts.google.com"],
            frameSrc: ["'self'", "https://accounts.google.com", "https://www.youtube.com", "https://youtube.com"],
        },
    },
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 1000, // límite de 1000 requests por ventana
    message: 'Demasiadas solicitudes desde esta IP, por favor intente más tarde.',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', limiter);

// Middlewares generales

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuración de sesiones con Redis
app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || 'cgr-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
}));

// Health check
app.get('/health', async (req, res) => {
    try {
        await db.query('SELECT 1');
        const redisPing = await redisClient.ping();
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                database: 'connected',
                redis: redisPing === 'PONG' ? 'connected' : 'disconnected'
            }
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            error: error.message
        });
    }
});

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/gamification', authMiddleware, maintenanceMiddleware, gamificationRoutes);
app.use('/api/phishing', authMiddleware, maintenanceMiddleware, phishingRoutes);
app.use('/api/dashboard', authMiddleware, maintenanceMiddleware, dashboardRoutes);
app.use('/api/reports', authMiddleware, maintenanceMiddleware, reportRoutes);
app.use('/api/directory', authMiddleware, maintenanceMiddleware, directoryRoutes);
app.use('/api/departments', authMiddleware, maintenanceMiddleware, departmentRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/certificates', authMiddleware, maintenanceMiddleware, certificateRoutes);

// Ruta para obtener configuraciones globales del sistema (Admin)
app.get('/api/system/settings', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const settingsRaw = await db.query('SELECT setting_key, setting_value FROM system_settings');
        const settings = {};
        settingsRaw.forEach(s => settings[s.setting_key] = s.setting_value);
        res.json({ success: true, settings });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener configuraciones' });
    }
});

// Ruta para actualizar configuraciones globales del sistema (Admin)
app.put('/api/system/settings', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { maintenance_mode } = req.body;
        if (maintenance_mode !== undefined) {
            await db.query(
                "UPDATE system_settings SET setting_value = ? WHERE setting_key = 'maintenance_mode'",
                [String(maintenance_mode)]
            );
        }
        res.json({ success: true, message: 'Configuración actualizada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al guardar configuración' });
    }
});

// Ruta raíz
app.get('/', (req, res) => {
    res.json({
        message: 'CGR LMS API',
        version: '1.0.0',
        documentation: '/api/docs'
    });
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        path: req.path
    });
});

// Manejo global de errores
app.use((err, req, res, next) => {
    logger.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    logger.info(`🚀 Servidor CGR LMS corriendo en puerto ${PORT}`);
    logger.info(`📚 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

// Manejo de cierre graceful
process.on('SIGTERM', async () => {
    logger.info('SIGTERM recibido, cerrando servidor...');
    await redisClient.quit();
    await db.end();
    process.exit(0);
});

module.exports = app;
