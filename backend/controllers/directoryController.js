const directoryService = require('../services/directoryService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

class DirectoryController {
    /**
     * Obtener el directorio maestro completo de funcionarios (Admin)
     */
    getFullDirectory = catchAsync(async (req, res, next) => {
        // Obtener todos los registros del directorio maestro
        const directory = await directoryService.getFullDirectory();
        res.json({ success: true, directory });
    });

    /**
     * Registrar un funcionario de forma individual en el directorio maestro (Admin)
     */
    addSingleRecord = catchAsync(async (req, res, next) => {
        const { email, full_name } = req.body;
        // Validacion de campos requeridos
        if (!email || !full_name) {
            return next(new AppError('Email y nombre son requeridos', 400));
        }

        // Agrega un unico registro al directorio
        await directoryService.addSingleRecord(req.body);
        res.status(201).json({ success: true, message: 'Funcionario agregado correctamente' });
    });

    /**
     * Cargar y procesar un archivo CSV con la lista masiva de funcionarios (Admin)
     */
    uploadCSV = catchAsync(async (req, res, next) => {
        // Validacion de existencia del archivo en la peticion de Multer
        if (!req.file) {
            return next(new AppError('No se subió ningún archivo', 400));
        }

        // Procesa el buffer del CSV llamando al servicio
        const { processed, errors } = await directoryService.processCSV(req.file.buffer);
        res.json({
            success: true,
            message: `Proceso completado: ${processed} funcionarios sincronizados.`,
            errors
        });
    });

    /**
     * Actualizar los datos de un funcionario en el directorio (Admin)
     */
    updateRecord = catchAsync(async (req, res, next) => {
        const { id } = req.params;
        // Modifica los datos del registro correspondiente
        await directoryService.updateRecord(id, req.body);
        res.json({ success: true, message: 'Registro actualizado correctamente' });
    });

    /**
     * Eliminar un funcionario del directorio maestro (Admin)
     */
    deleteRecord = catchAsync(async (req, res, next) => {
        const { id } = req.params;
        // Elimina el registro por su ID unico
        await directoryService.deleteRecord(id);
        res.json({ success: true, message: 'Registro eliminado del directorio' });
    });

    /**
     * Descargar la plantilla CSV preestablecida para la carga masiva (Admin)
     */
    getTemplate = catchAsync(async (req, res, next) => {
        // Generar el contenido del CSV plantilla
        const csvContent = directoryService.getCSVTemplate();
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=plantilla_directorio_cgr.csv');
        res.status(200).send(csvContent);
    });

    /**
     * Enviar correo electronico de invitacion al curso para un funcionario (Admin)
     */
    sendInvitation = catchAsync(async (req, res, next) => {
        const { email, full_name } = req.body;
        // Validacion de parametros de envio
        if (!email || !full_name) {
            return next(new AppError('Email y nombre son requeridos', 400));
        }
        const emailService = require('../services/emailService');
        // Invoca al servicio de correo
        await emailService.sendInvitationEmail(email, full_name);
        res.json({ success: true, message: `Invitación enviada correctamente a ${full_name}` });
    });
}

module.exports = new DirectoryController();
