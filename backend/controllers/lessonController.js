const lessonService = require('../services/lessonService');
const lessonMigrationService = require('../services/lessonMigrationService');
const { clearCache } = require('../middleware/cache');
const logger = require('../config/logger');
const fs = require('fs');

class LessonController {
    async getLessonById(req, res) {
        try {
            const lessonId = req.params.id;
            const userId = req.user.id;
            const isAdmin = req.user.role === 'admin' && req.headers['x-view-as-student'] !== 'true';

            const result = await lessonService.getLessonById(lessonId, userId, isAdmin);
            if (!result) return res.status(404).json({ error: 'Lección no encontrada' });
            if (result.locked) return res.status(403).json(result);

            // Si se otorgó una insignia, no queremos cachear esta respuesta específica
            // porque el modal de insignia ganada es un evento único.
            if (result.badgeAwarded) {
                res._doNotCache = true;
            }

            res.json({ success: true, ...result });
        } catch (error) {
            logger.error('Error en lección:', error);
            res.status(500).json({ error: 'Error al cargar la lección' });
        }
    }

    async completeLesson(req, res) {
        try {
            const lessonId = req.params.id;
            const userId = req.user.id;
            const isAdminView = req.user.role === 'admin' && req.headers['x-view-as-student'] !== 'true';

            await clearCache(`cache:/api/dashboard*u${userId}*`);
            await clearCache(`cache:/api/gamification/leaderboard*`);
            await clearCache(`cache:/api/modules*u${userId}*`);
            await clearCache(`cache:/api/lessons/*u${userId}*`);

            const { timeSpent } = req.body;
            const result = await lessonService.completeLesson(lessonId, userId, isAdminView, timeSpent || 0);
            res.json({ success: true, message: 'Lección completada', ...result });
        } catch (error) {
            logger.error('Error al completar lección:', error);
            res.status(400).json({ error: error.message || 'Error al registrar progreso' });
        }
    }

    async createLesson(req, res) {
        try {
            const lessonId = await lessonService.createLesson(req.body);
            
            // Limpiar caché después de la operación exitosa
            await clearCache('cache:/api/lessons*');
            await clearCache('cache:/api/modules*');
            await clearCache('cache:/api/dashboard*');

            res.status(201).json({ success: true, lessonId });
        } catch (error) {
            logger.error('Error creando lección:', error);
            res.status(500).json({ error: 'Error al crear lección' });
        }
    }

    async updateLesson(req, res) {
        try {
            const lessonId = req.params.id;
            await lessonService.updateLesson(lessonId, req.body);

            // Limpiar caché después de la operación exitosa
            await clearCache('cache:/api/lessons*');
            await clearCache('cache:/api/modules*');
            await clearCache('cache:/api/dashboard*');

            res.json({ success: true, message: 'Lección actualizada' });
        } catch (error) {
            logger.error('Error actualizando lección:', error);
            res.status(500).json({ error: 'Error al actualizar lección' });
        }
    }

    async reorderLessons(req, res) {
        try {
            const { moduleId, orderedIds } = req.body;
            logger.info(`Reordenando lecciones para módulo ${moduleId}:`, orderedIds);
            
            if (!moduleId || !orderedIds) {
                return res.status(400).json({ error: 'Faltan parámetros requeridos (moduleId, orderedIds)' });
            }

            await lessonService.reorderLessons(moduleId, orderedIds);

            // Limpiar caché después de la operación exitosa
            await clearCache('cache:/api/modules*');
            await clearCache('cache:/api/lessons*');
            await clearCache('cache:/api/dashboard*');

            res.json({ success: true, message: 'Lecciones reordenadas con éxito' });
        } catch (error) {
            logger.error('Error reordenando lecciones:', error);
            res.status(500).json({ error: error.message || 'Error al reordenar lecciones' });
        }
    }

    async deleteLesson(req, res) {
        try {
            const lessonId = req.params.id;
            await lessonService.deleteLesson(lessonId);

            // Limpiar caché después de la operación exitosa
            await clearCache('cache:/api/lessons*');
            await clearCache('cache:/api/modules*');
            await clearCache('cache:/api/dashboard*');

            res.json({ success: true, message: 'Lección eliminada' });
        } catch (error) {
            logger.error('Error eliminando lección:', error);
            res.status(500).json({ error: 'Error al eliminar lección' });
        }
    }

    async exportLesson(req, res) {
        try {
            const lessonId = req.params.id;
            const zipBuffer = await lessonMigrationService.exportLesson(lessonId);
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', `attachment; filename=lesson-${lessonId}-export.zip`);
            res.send(zipBuffer);
        } catch (error) {
            logger.error('Error al exportar lección:', error);
            res.status(500).json({ error: 'Error al exportar lección' });
        }
    }

    async importLesson(req, res) {
        try {
            const { module_id } = req.body;
            if (!module_id) {
                return res.status(400).json({ error: 'El ID del módulo es requerido' });
            }
            if (!req.file) {
                return res.status(400).json({ error: 'El archivo ZIP es requerido' });
            }

            const newLessonId = await lessonMigrationService.importLesson(req.file.path, parseInt(module_id));

            // Eliminar archivo temporal
            try {
                fs.unlinkSync(req.file.path);
            } catch (err) {
                logger.error('Error al eliminar archivo temporal de importación:', err);
            }

            res.status(201).json({ success: true, message: 'Lección importada con éxito', lessonId: newLessonId });
        } catch (error) {
            logger.error('Error al importar lección:', error);
            if (req.file && fs.existsSync(req.file.path)) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch (err) {}
            }
            res.status(500).json({ error: 'Error al importar lección', details: error.message });
        }
    }
}

module.exports = new LessonController();
