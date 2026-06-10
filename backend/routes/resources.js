const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { checkAllBadges } = require('../services/badgeService');
const { clearCache } = require('../middleware/cache');
const logger = require('../config/logger');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de Multer para recursos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(process.cwd(), 'uploads', 'resources');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'res-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|doc|docx|ppt|pptx|xls|xlsx|zip|rar|png|jpg|jpeg|mp4|webm/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Formato de archivo no permitido para recursos.'));
    }
});

/**
 * @route   POST /api/resources
 * @desc    Crear un nuevo recurso (Admin)
 */
router.post('/', (req, res, next) => {
    logger.info(`Incoming POST /api/resources - Type: ${req.headers['content-type']}`);
    next();
}, authMiddleware, adminMiddleware, upload.single('file'), async (req, res) => {
    try {
        logger.info('--- INTENTO DE CREACIÓN DE RECURSO ---');
        logger.info('Body recibido:', JSON.stringify(req.body));
        logger.info('Archivo recibido:', req.file ? req.file.filename : 'Ninguno');

        const { module_id, title, description, resource_type, url } = req.body;
        
        if (!title || !module_id) {
            return res.status(400).json({ error: 'Título y ID de módulo son obligatorios' });
        }

        let finalUrl = url;

        if (req.file) {
            finalUrl = `/uploads/resources/${req.file.filename}`;
        }

        const result = await db.query(
            `INSERT INTO resources (module_id, title, description, resource_type, url, file_size) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [parseInt(module_id), title, description, resource_type, finalUrl, req.file?.size || 0]
        );

        logger.info(`✅ Recurso creado con ID: ${result.insertId}`);

        // Invalida caché del módulo
        await clearCache(`cache:/api/modules/${module_id}*`);
        await clearCache('cache:/api/modules*');

        res.status(201).json({
            success: true,
            message: 'Recurso creado correctamente',
            resourceId: result.insertId,
            url: finalUrl
        });
    } catch (error) {
        logger.error('❌ Error crítico creando recurso:', error);
        res.status(500).json({ 
            error: 'Error al crear recurso', 
            details: process.env.NODE_ENV === 'development' ? error.message : undefined 
        });
    }
});

/**
 * @route   PUT /api/resources/:id
 * @desc    Actualizar un recurso (Admin)
 */
router.put('/:id', (req, res, next) => {
    logger.info(`Incoming PUT /api/resources/${req.params.id} - Type: ${req.headers['content-type']}`);
    next();
}, authMiddleware, adminMiddleware, upload.single('file'), async (req, res) => {
    try {
        const { id } = req.params;
        logger.info(`--- INTENTO DE ACTUALIZACIÓN DE RECURSO ${id} ---`);
        logger.info('Body recibido:', JSON.stringify(req.body));
        logger.info('Archivo recibido:', req.file ? req.file.filename : 'Ninguno');
        
        const { title, description, resource_type, url } = req.body;

        const [current] = await db.query('SELECT url FROM resources WHERE id = ?', [id]);
        if (!current) return res.status(404).json({ error: 'Recurso no encontrado' });

        let finalUrl = url || current.url;
        if (req.file) {
            finalUrl = `/uploads/resources/${req.file.filename}`;
        }

        await db.query(
            `UPDATE resources 
             SET title = ?, description = ?, resource_type = ?, url = ?, file_size = ?
             WHERE id = ?`,
            [title, description, resource_type, finalUrl, req.file?.size || 0, id]
        );

        // Invalida caché del módulo
        const [moduleRes] = await db.query('SELECT module_id FROM resources WHERE id = ?', [id]);
        if (moduleRes) {
            await clearCache(`cache:/api/modules/${moduleRes.module_id}*`);
            await clearCache('cache:/api/modules*');
        }

        res.json({ success: true, message: 'Recurso actualizado' });
    } catch (error) {
        logger.error('Error actualizando recurso:', error);
        res.status(500).json({ error: 'Error al actualizar' });
    }
});

/**
 * @route   DELETE /api/resources/:id
 * @desc    Eliminar un recurso (Admin)
 */
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const [moduleRes] = await db.query('SELECT module_id FROM resources WHERE id = ?', [id]);

        await db.query('DELETE FROM resources WHERE id = ?', [id]);

        if (moduleRes) {
            await clearCache(`cache:/api/modules/${moduleRes.module_id}*`);
            await clearCache('cache:/api/modules*');
        }
        res.json({ success: true, message: 'Recurso eliminado' });
    } catch (error) {
        logger.error('Error eliminando recurso:', error);
        res.status(500).json({ error: 'Error al eliminar' });
    }
});

/**
 * @route   POST /api/resources/:id/track-download
 * @desc    Registra la descarga de un recurso y verifica insignias
 * @access  Private
 */
router.post('/:id/track-download', authMiddleware, async (req, res) => {
    try {
        const resourceId = req.params.id;
        const userId = req.user.id;

        // 1. Verificar que el recurso exista (en resources o lesson_contents)
        let [resource] = await db.query('SELECT title FROM resources WHERE id = ?', [resourceId]);

        if (!resource) {
            // Intentar buscar en lesson_contents si no está en resources
            [resource] = await db.query('SELECT title FROM lesson_contents WHERE id = ?', [resourceId]);
        }

        if (!resource) {
            return res.status(404).json({ error: 'Recurso no encontrado' });
        }

        // 2. Registrar la actividad (aunque sea repetida, la insignia se controla en la utilidad)
        await db.query(
            `INSERT INTO gamification_activities (user_id, activity_type, points_earned, reference_id, description) 
             VALUES (?, 'resource_downloaded', ?, ?, ?)`,
            [userId, 0, resourceId, `Descargó recurso: ${resource.title}`]
        );

        // 2b. Si el recurso es un contenido de lección (tipo file), registrar progreso en user_content_progress
        const [isLessonContent] = await db.query('SELECT id FROM lesson_contents WHERE id = ?', [resourceId]);
        if (isLessonContent) {
            await db.query(
                `INSERT INTO user_content_progress (user_id, content_id) 
                 VALUES (?, ?) 
                 ON DUPLICATE KEY UPDATE completed_at = NOW()`,
                [userId, resourceId]
            );
        }

        // 3. Verificar insignias
        const badgeResult = await checkAllBadges(userId);

        if (badgeResult?.awarded) {
            // Limpiar caché del perfil para que la nueva insignia aparezca inmediatamente
            await clearCache(`cache:/api/users/profile*u${userId}*`);
            await clearCache(`cache:/api/dashboard*u${userId}*`);
        }

        res.json({
            success: true,
            message: 'Descarga registrada',
            badgeAwarded: badgeResult?.awarded ? badgeResult.badges : null
        });
    } catch (error) {
        logger.error('Error al trackear descarga:', error);
        res.status(500).json({ error: 'Error al registrar la descarga' });
    }
});

module.exports = router;
