const announcementService = require('../services/announcementService');
const catchAsync = require('../utils/catchAsync');

class AnnouncementController {
    /**
     * @route   GET /api/announcements/admin
     * @desc    Obtener todos los anuncios (Admin)
     */
    getAllAdmin = catchAsync(async (req, res, next) => {
        // Llama al servicio para recuperar todos los anuncios creados sin filtrar por vigencia
        const announcements = await announcementService.getAllAnnouncements();
        res.json({ success: true, announcements });
    });

    /**
     * @route   POST /api/announcements
     * @desc    Crear un anuncio (Admin)
     */
    createAnnouncement = catchAsync(async (req, res, next) => {
        // Llama al servicio para registrar un nuevo anuncio con los datos provistos en el cuerpo
        const id = await announcementService.createAnnouncement(req.body);
        res.status(201).json({ success: true, message: 'Anuncio creado correctamente', id });
    });

    /**
     * @route   PUT /api/announcements/:id
     * @desc    Actualizar un anuncio (Admin)
     */
    updateAnnouncement = catchAsync(async (req, res, next) => {
        // Actualiza los campos del anuncio especificado por su ID en los parametros
        await announcementService.updateAnnouncement(req.params.id, req.body);
        res.json({ success: true, message: 'Anuncio actualizado correctamente' });
    });

    /**
     * @route   DELETE /api/announcements/:id
     * @desc    Eliminar un anuncio (Admin)
     */
    deleteAnnouncement = catchAsync(async (req, res, next) => {
        // Elimina permanentemente el anuncio especificado de la base de datos
        await announcementService.deleteAnnouncement(req.params.id);
        res.json({ success: true, message: 'Anuncio eliminado correctamente' });
    });

    /**
     * @route   GET /api/announcements/active
     * @desc    Obtener anuncio activo para el usuario actual
     */
    getActive = catchAsync(async (req, res, next) => {
        // Obtiene el anuncio vigente que el usuario actual todavia no ha descartado
        const announcement = await announcementService.getActiveForUser(req.user.id);
        res.json({ success: true, announcement });
    });

    /**
     * @route   POST /api/announcements/:id/dismiss
     * @desc    Marcar anuncio como visto/descartado
     */
    dismiss = catchAsync(async (req, res, next) => {
        // Registra la lectura del anuncio por el usuario actual para evitar mostrarselo de nuevo
        await announcementService.dismissForUser(req.user.id, req.params.id);
        res.json({ success: true, message: 'Anuncio descartado' });
    });
}

module.exports = new AnnouncementController();
