const lessonService = require('../services/lessonService');
const lessonMigrationService = require('../services/lessonMigrationService');
const { clearCache } = require('../middleware/cache');
const logger = require('../config/logger');
const fs = require('fs');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

class LessonController {
    /**
     * Obtener los detalles de una lección específica por su ID
     */
    getLessonById = catchAsync(async (req, res, next) => {
        const lessonId = req.params.id;
        const userId = req.user.id;
        // Identifica si se visualiza como administrador o simulado como estudiante
        const isAdmin = req.user.role === 'admin' && req.headers['x-view-as-student'] !== 'true';

        const result = await lessonService.getLessonById(lessonId, userId, isAdmin);
        if (!result) return next(new AppError('Lección no encontrada', 404));
        if (result.locked) return res.status(403).json(result); // La lección se encuentra bloqueada por prerrequisitos

        // Si se otorga una insignia durante la visualización, no queremos cachear esta respuesta
        if (result.badgeAwarded) {
            res._doNotCache = true;
        }

        res.json({ success: true, ...result });
    });

    /**
     * Marcar una lección completa
     */
    completeLesson = catchAsync(async (req, res, next) => {
        const lessonId = req.params.id;
        const userId = req.user.id;
        const isAdminView = req.user.role === 'admin' && req.headers['x-view-as-student'] !== 'true';

        // Invalidar caches específicas del usuario que completa la lección
        await clearCache(`cache:/api/dashboard*u${userId}*`);
        await clearCache(`cache:/api/gamification/leaderboard*`);
        await clearCache(`cache:/api/modules*u${userId}*`);
        await clearCache(`cache:/api/lessons/*u${userId}*`);

        const { timeSpent } = req.body;
        
        try {
            // Llama al servicio de lecciones para validar requerimientos y otorgar puntos
            const result = await lessonService.completeLesson(lessonId, userId, isAdminView, timeSpent || 0);
            res.json({ success: true, message: 'Lección completada', ...result });
        } catch (error) {
            return next(new AppError(error.message || 'Error al registrar progreso', 400));
        }
    });

    /**
     * Crear una nueva lección (Admin)
     */
    createLesson = catchAsync(async (req, res, next) => {
        const lessonId = await lessonService.createLesson(req.body);
        
        // Limpiar caché global de lecciones/módulos tras la creación
        await clearCache('cache:/api/lessons*');
        await clearCache('cache:/api/modules*');
        await clearCache('cache:/api/dashboard*');

        res.status(201).json({ success: true, lessonId });
    });

    /**
     * Actualizar los datos informativos de una lección (Admin)
     */
    updateLesson = catchAsync(async (req, res, next) => {
        const lessonId = req.params.id;
        await lessonService.updateLesson(lessonId, req.body);

        // Limpiar caché tras la actualización
        await clearCache('cache:/api/lessons*');
        await clearCache('cache:/api/modules*');
        await clearCache('cache:/api/dashboard*');

        res.json({ success: true, message: 'Lección actualizada' });
    });

    /**
     * Reordenar la secuencia de lecciones dentro de un módulo (Admin)
     */
    reorderLessons = catchAsync(async (req, res, next) => {
        const { moduleId, orderedIds } = req.body;
        logger.info(`Reordenando lecciones para módulo ${moduleId}:`, orderedIds);
        
        if (!moduleId || !orderedIds) {
            return next(new AppError('Faltan parámetros requeridos (moduleId, orderedIds)', 400));
        }

        // Realiza la reordenación en base de datos
        await lessonService.reorderLessons(moduleId, orderedIds);

        // Limpiar caché afectada
        await clearCache('cache:/api/modules*');
        await clearCache('cache:/api/lessons*');
        await clearCache('cache:/api/dashboard*');

        res.json({ success: true, message: 'Lecciones reordenadas con éxito' });
    });

    /**
     * Eliminar una lección y todos sus componentes vinculados (Admin)
     */
    deleteLesson = catchAsync(async (req, res, next) => {
        const lessonId = req.params.id;
        // Borra la lección (limpiando de forma automática cuestionarios y encuestas)
        await lessonService.deleteLesson(lessonId);

        // Limpiar caché global de lecciones/módulos
        await clearCache('cache:/api/lessons*');
        await clearCache('cache:/api/modules*');
        await clearCache('cache:/api/dashboard*');

        res.json({ success: true, message: 'Lección eliminada' });
    });

    /**
     * Exportar una lección en formato ZIP comprimido para migración (Admin)
     */
    exportLesson = catchAsync(async (req, res, next) => {
        const lessonId = req.params.id;
        // Obtener el buffer del archivo comprimido conteniendo metadatos y multimedia
        const zipBuffer = await lessonMigrationService.exportLesson(lessonId);
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename=lesson-${lessonId}-export.zip`);
        res.send(zipBuffer);
    });

    /**
     * Importar una lección a partir de un archivo ZIP cargado (Admin)
     */
    importLesson = catchAsync(async (req, res, next) => {
        const { module_id } = req.body;
        if (!module_id) {
            return next(new AppError('El ID del módulo es requerido', 400));
        }
        if (!req.file) {
            return next(new AppError('El archivo ZIP es requerido', 400));
        }

        try {
            // Desempaquetar y persistir la lección en la BD bajo el módulo objetivo
            const newLessonId = await lessonMigrationService.importLesson(req.file.path, parseInt(module_id));

            // Eliminar archivo temporal subido por Multer en el disco
            try {
                fs.unlinkSync(req.file.path);
            } catch (err) {
                logger.error('Error al eliminar archivo temporal de importación:', err);
            }

            res.status(201).json({ success: true, message: 'Lección importada con éxito', lessonId: newLessonId });
        } catch (error) {
            // Limpieza preventiva del archivo temporal en caso de falla
            if (req.file && fs.existsSync(req.file.path)) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch (err) {}
            }
            return next(new AppError(error.message || 'Error al importar lección', 500));
        }
    });
}

module.exports = new LessonController();
