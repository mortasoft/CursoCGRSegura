const { clearCache } = require('../middleware/cache');
const lessonContentService = require('../services/lessonContentService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

class LessonContentController {
    /**
     * Obtener el listado de contenidos de una lección específica y el progreso del usuario
     */
    getLessonContents = catchAsync(async (req, res, next) => {
        const { lessonId } = req.params;
        const userId = req.user.id;
        // Recuperar contenidos junto con estados de entregas y confirmaciones del estudiante
        const contents = await lessonContentService.getLessonContents(lessonId, userId);
        res.json({ success: true, contents });
    });

    /**
     * Registrar el progreso de interacción de un usuario con un bloque de contenido (ej. lectura de nota, confirmación)
     */
    trackProgress = catchAsync(async (req, res, next) => {
        const { id } = req.params;
        const userId = req.user.id;
        const responseData = req.body;
        // Registrar o actualizar el progreso de lectura del contenido
        await lessonContentService.trackContentProgress(id, userId, responseData);
        res.json({ success: true, message: 'Progreso registrado' });
    });

    /**
     * Subir/Enviar una tarea asignada en la lección
     */
    submitAssignment = catchAsync(async (req, res, next) => {
        // Validacion de archivo cargado
        if (!req.file) {
            return next(new AppError('Se requiere un archivo', 400));
        }
        // Guardar la entrega del estudiante
        const fileUrl = await lessonContentService.submitAssignment(req.params.contentId, req.user.id, req.file);
        res.json({ success: true, message: 'Tarea enviada correctamente. Espere a ser calificado.', file_url: fileUrl });
    });

    /**
     * Obtener todas las entregas de tareas del sistema (Instructor/Admin)
     */
    getAllSubmissions = catchAsync(async (req, res, next) => {
        const submissions = await lessonContentService.getAllSubmissions();
        res.json({ success: true, submissions });
    });

    /**
     * Obtener todas las interacciones de los bloques educativos interactivos
     */
    getAllInteractions = catchAsync(async (req, res, next) => {
        const interactions = await lessonContentService.getAllInteractions();
        res.json({ success: true, interactions });
    });

    /**
     * Obtener las entregas de tareas pertenecientes a un bloque de contenido específico (Instructor/Admin)
     */
    getSubmissionsByContent = catchAsync(async (req, res, next) => {
        const submissions = await lessonContentService.getSubmissionsByContent(req.params.contentId);
        res.json({ success: true, submissions });
    });

    /**
     * Calificar/Evaluar una tarea entregada por un estudiante (Instructor/Admin)
     */
    gradeSubmission = catchAsync(async (req, res, next) => {
        // Califica y asigna puntos correspondientes al usuario en caso de aprobacion
        await lessonContentService.gradeSubmission(req.params.submissionId, req.body);
        res.json({ success: true, message: 'Entrega evaluada correctamente' });
    });

    /**
     * Crear un nuevo bloque de contenido en una lección (Admin)
     */
    createContent = catchAsync(async (req, res, next) => {
        const { lesson_id } = req.body;
        // Invalidar caches relacionadas con la leccion, modulos y tableros para reflejar cambios
        await clearCache(`cache:/api/lessons/${lesson_id}*`);
        await clearCache('cache:/api/modules*');
        await clearCache('cache:/api/dashboard*');

        // Crea el bloque de contenido y asocia archivo si fue cargado
        const result = await lessonContentService.createContent(req.body, req.file);
        res.status(201).json({
            success: true,
            message: 'Contenido agregado correctamente',
            contentId: result.id,
            fileUrl: result.fileUrl
        });
    });

    /**
     * Actualizar los datos de un bloque de contenido específico (Admin)
     */
    updateContent = catchAsync(async (req, res, next) => {
        const { id } = req.params;
        // Limpiar cache de lecciones y tableros
        await clearCache('cache:/api/lessons*');
        await clearCache('cache:/api/modules*');
        await clearCache('cache:/api/dashboard*');

        // Ejecuta la actualizacion de la data
        await lessonContentService.updateContent(id, req.body, req.file);
        res.json({ success: true, message: 'Contenido actualizado correctamente' });
    });

    /**
     * Eliminar un bloque de contenido de una lección (Admin)
     */
    deleteContent = catchAsync(async (req, res, next) => {
        // Limpiar caches afectadas
        await clearCache('cache:/api/lessons*');
        await clearCache('cache:/api/modules*');
        await clearCache('cache:/api/dashboard*');

        // Borra el bloque (el servicio limpiara de forma segura los cuestionarios/encuestas asociados)
        await lessonContentService.deleteContent(req.params.id);
        res.json({ success: true, message: 'Contenido eliminado correctamente' });
    });

    /**
     * Reordenar la secuencia de bloques educativos dentro de una lección (Admin)
     */
    reorderContents = catchAsync(async (req, res, next) => {
        await clearCache('cache:/api/lessons*');
        // Recibe un arreglo con [{ id, order_index }] y los actualiza en serie
        await lessonContentService.reorderContents(req.body.items);
        res.json({ success: true, message: 'Orden actualizado' });
    });

    /**
     * Obtener estadísticas consolidadas de las respuestas en preguntas de opción múltiple/confirmación
     */
    getInteractionStats = catchAsync(async (req, res, next) => {
        const stats = await lessonContentService.getInteractionStats();
        res.json({ success: true, stats });
    });
}

module.exports = new LessonContentController();
