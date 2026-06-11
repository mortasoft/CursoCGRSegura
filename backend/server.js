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
const expressPrometheus = require('express-prometheus-middleware');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const db = require('./config/database');
const logger = require('./config/logger');

// Validación crítica de variables de entorno (Fail-Fast)
const requiredEnvVars = ['SESSION_SECRET', 'JWT_SECRET', 'GOOGLE_CLIENT_ID', 'DB_PASSWORD'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    logger.error(`❌ ERROR CRÍTICO: Faltan las siguientes variables de entorno: ${missingEnvVars.join(', ')}`);
    process.exit(1);
}

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
const systemRoutes = require('./routes/system');
const departmentRoutes = require('./routes/departments');
const badgeRoutes = require('./routes/badges');
const contentRoutes = require('./routes/lesson_content');
const resourceRoutes = require('./routes/resources');
const surveyRoutes = require('./routes/surveys');
const certificateRoutes = require('./routes/certificates');
const announcementRoutes = require('./routes/announcements');
const forumRoutes = require('./routes/forumRoutes');
const gameRoutes = require('./routes/gameRoutes');
const notificationRoutes = require('./routes/notifications');
const driveAuditorRoutes = require('./routes/driveAuditorRoutes');

const { authMiddleware, adminMiddleware } = require('./middleware/auth');
const maintenanceMiddleware = require('./middleware/maintenance');
const errorMiddleware = require('./middleware/errorMiddleware');
const { initializeDatabase } = require('./services/dbInitService');

const app = express();
const PORT = process.env.PORT;

const redisClient = require('./config/redis');

// Middleware de emergencia: Forzar HTTPS para que las cookies funcionen tras el proxy
app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] === 'https' || process.env.NODE_ENV === 'production') {
        req.connection.proxySecure = true;
    }
    next();
});

// Middlewares generales (CORS debe ir primero)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean);
if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL.trim());
}

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const cleanOrigin = origin.trim().replace(/\/$/, '');
        const isAllowed = allowedOrigins.some(o => o.trim().replace(/\/$/, '') === cleanOrigin) ||
            cleanOrigin.includes('localhost') ||
            cleanOrigin.includes('lvh.me');

        if (isAllowed) {
            callback(null, true);
        } else {
            logger.warn(`CORS Reject: [${origin}] - No en lista permitida`);
            callback(null, false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-view-as-student']
}));

// Middlewares de seguridad
app.use(helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
}));

// Confiar en el proxy
app.set('trust proxy', 3);

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 1000,
    message: 'Demasiadas solicitudes desde esta IP, por favor intente más tarde.',
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false },
});

app.use('/api/', limiter);

// Middlewares generales
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Prometheus Metrics Middleware
app.use(expressPrometheus({
    metricsPath: '/metrics',
    collectDefaultMetrics: true,
    requestDurationBuckets: [0.1, 0.5, 1, 1.5, 2, 3, 5, 10],
}));

// Archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuración de sesiones con Redis
app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
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
app.use('/api/surveys', surveyRoutes);
app.use('/api/certificates', authMiddleware, maintenanceMiddleware, certificateRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/forums', authMiddleware, maintenanceMiddleware, forumRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/notifications', authMiddleware, maintenanceMiddleware, notificationRoutes);
app.use('/api/drive-auditor', authMiddleware, maintenanceMiddleware, driveAuditorRoutes);
app.use('/api/system', systemRoutes);

// Health Check Endpoint (Público para monitoreo y stress tests)
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Ruta raíz
app.get('/', (req, res) => {
    res.json({
        message: 'CGR LMS API',
        version: '1.0.0'
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
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    logger.error('Error:', err);
    
    res.status(err.statusCode).json({
        success: false,
        error: err.message || 'Error interno del servidor',
        ...(err.nextAvailableDate && { nextAvailableDate: err.nextAvailableDate }),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Iniciar servidor asignando la instancia a una constante
const server = app.listen(PORT, () => {
    logger.info(`🚀 Servidor CGR LMS corriendo en puerto ${PORT}`);
    logger.info(`📚 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

// Manejo de promesas rechazadas no capturadas
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Manejo de excepciones síncronas no capturadas
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

// Manejo de cierre graceful (SIGTERM y SIGINT)
const gracefulShutdown = (signal) => {
    logger.info(`${signal} recibido. Cerrando servidor HTTP...`);
    
    server.close(async () => {
        logger.info('Servidor HTTP cerrado. Finalizando conexiones de base de datos y cache...');
        try {
            if (redisClient && redisClient.isOpen) {
                await redisClient.quit();
                logger.info('Cliente de Redis desconectado.');
            }
            await db.end();
            logger.info('Pool de MariaDB cerrado.');
            process.exit(0);
        } catch (err) {
            logger.error('Error al cerrar recursos durante graceful shutdown:', err);
            process.exit(1);
        }
    });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app;
