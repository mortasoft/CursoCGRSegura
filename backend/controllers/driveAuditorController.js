const driveAuditorService = require('../services/driveAuditorService');
const logger = require('../config/logger');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * Iniciar Auditoria de Google Drive
 * Arranca un escaneo en segundo plano usando el access_token provisto
 */
exports.startAudit = catchAsync(async (req, res, next) => {
    const { access_token } = req.body;

    // Validacion de token requerido
    if (!access_token) {
        return next(new AppError('Se requiere access_token de Google Drive', 400));
    }

    const userId = req.user.id;
    const userEmail = req.user.email;
    const userName = `${req.user.first_name} ${req.user.last_name}`;

    try {
        // Inicia el proceso asincrono en la capa de servicios
        const result = await driveAuditorService.startAudit(userId, userEmail, userName, access_token);

        // Retorna codificacion 202 (Accepted) dado que se procesara asincronamente
        res.status(202).json({
            message: 'Auditoría iniciada en segundo plano',
            data: result
        });
    } catch (error) {
        const appErr = new AppError(error.message || 'Error al iniciar la auditoría', error.statusCode || 500);
        if (error.nextAvailableDate) {
            appErr.nextAvailableDate = error.nextAvailableDate;
        }
        return next(appErr);
    }
});

/**
 * Obtener Estado de la Auditoria
 * Devuelve el progreso y estado actual de un escaneo en ejecucion
 */
exports.getAuditStatus = catchAsync(async (req, res, next) => {
    const reportId = req.params.reportId;
    const userId = req.user.id;

    // Consulta el estado en la base de datos
    const status = await driveAuditorService.getReportStatus(reportId, userId);

    if (!status) {
        return next(new AppError('Reporte no encontrado', 404));
    }

    res.json({ data: status });
});

/**
 * Obtener Ultima Auditoria
 * Devuelve los resultados de la auditoria mas reciente del usuario
 */
exports.getLatestAudit = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    // Consulta el ultimo reporte completado
    const report = await driveAuditorService.getLatestReport(userId);
    res.json({ data: report }); 
});

/**
 * Obtener Detalles del Reporte de Auditoria
 * Retorna la lista detallada de archivos, riesgos y comparticiones externas
 */
exports.getAuditReport = catchAsync(async (req, res, next) => {
    const reportId = req.params.reportId;
    const isAdmin = req.user.role === 'admin' || req.user.role === 'instructor';
    const userId = isAdmin ? null : req.user.id; // Los administradores pueden ver reportes de cualquier usuario

    // Obtener la informacion completa del reporte
    const reportData = await driveAuditorService.getReportDetails(reportId, userId);

    if (!reportData) {
        return next(new AppError('Reporte no encontrado', 404));
    }

    res.json({ data: reportData });
});

/**
 * Obtener Auditorias en Ejecucion (Admin)
 * Permite monitorear las tareas de escaneo activas en el servidor
 */
exports.getRunningAudits = catchAsync(async (req, res, next) => {
    // Consulta los procesos activos en segundo plano
    const runningAudits = await driveAuditorService.getRunningAudits();
    res.json({ data: runningAudits });
});

/**
 * Obtener Detalles de Reporte para Vista de Administracion (Admin)
 */
exports.getAdminAuditReport = catchAsync(async (req, res, next) => {
    const reportId = req.params.reportId;
    const reportData = await driveAuditorService.getAdminReportDetails(reportId);

    if (!reportData) {
        return next(new AppError('Reporte no encontrado', 404));
    }

    res.json({ data: reportData });
});

/**
 * Cancelar Auditoria en Curso
 * Detiene de forma segura el proceso de escaneo de Drive perteneciente al usuario
 */
exports.cancelAudit = catchAsync(async (req, res, next) => {
    const { reportId } = req.body;
    const userId = req.user.id;

    if (!reportId) {
        return next(new AppError('Report ID es requerido', 400));
    }

    // Ejecuta la cancelacion asincrona del trabajo
    const cancelled = await driveAuditorService.cancelAudit(reportId, userId);

    if (!cancelled) {
        return next(new AppError('No se pudo cancelar el proceso (puede que ya haya terminado o no te pertenezca)', 400));
    }

    res.json({ message: 'Proceso cancelado exitosamente' });
});

/**
 * Cancelar Auditoria de Cualquier Usuario (Admin)
 */
exports.cancelAdminAudit = catchAsync(async (req, res, next) => {
    const { reportId } = req.body;

    if (!reportId) {
        return next(new AppError('Report ID es requerido', 400));
    }

    // Forzar cancelacion de auditoria sin validar pertenencia
    const cancelled = await driveAuditorService.cancelAdminAudit(reportId);

    if (!cancelled) {
        return next(new AppError('No se pudo cancelar el proceso (puede que ya haya terminado)', 400));
    }

    res.json({ message: 'Proceso cancelado por el administrador' });
});

/**
 * Enviar Correo de Alerta de Seguridad
 * Envia un correo electronico de advertencia al dueno de un archivo expuesto
 */
exports.sendWarningEmail = catchAsync(async (req, res, next) => {
    const { ownerEmail, ownerName, fileName, sharingLevel, fileLink } = req.body;

    // Validacion de datos requeridos para la plantilla de correo
    if (!ownerEmail || !fileName || !sharingLevel || !fileLink) {
        return next(new AppError('Faltan parámetros requeridos (ownerEmail, fileName, sharingLevel, fileLink)', 400));
    }

    const auditorName = `${req.user.first_name} ${req.user.last_name}`;
    const auditorEmail = req.user.email;

    const emailService = require('../services/emailService');
    // Envia el correo con detalles del archivo en riesgo
    await emailService.sendDriveAuditFileWarning(
        ownerEmail,
        ownerName || 'Funcionario',
        fileName,
        sharingLevel,
        fileLink,
        auditorName,
        auditorEmail
    );

    // Logica para otorgar insignia "¡Reunión de Emergencia!" por reportar riesgos
    try {
        const { awardBadge } = require('../services/badgeService');
        const db = require('../config/database');
        const [badge] = await db.query(
            "SELECT id FROM badges WHERE name = '¡Reunión de Emergencia!' LIMIT 1"
        );
        if (badge) {
            await awardBadge(req.user.id, badge.id, true);
        }
    } catch (badgeErr) {
        logger.error('Error al otorgar la insignia Reunion de Emergencia:', badgeErr);
    }

    res.json({ message: 'Correo de advertencia enviado exitosamente al propietario' });
});

/**
 * Obtener Limites de Auditoria
 * Verifica si el usuario excede los limites permitidos por dia de ejecucion
 */
exports.getLimitStatus = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const limitStatus = await driveAuditorService.getLimitStatus(userId);
    res.json({ data: limitStatus });
});

/**
 * Obtener Reportes del Usuario
 * Devuelve el historial paginado de auditorias del usuario logueado
 */
exports.getUserReports = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const result = await driveAuditorService.getUserReports(userId, page, limit);
    res.json({ data: result });
});

/**
 * Eliminar Reporte de Auditoria
 */
exports.deleteReport = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const { reportId } = req.params;
    const result = await driveAuditorService.deleteReport(reportId, userId);

    if (!result.deleted) {
        if (result.reason === 'not_found') {
            return next(new AppError('Reporte no encontrado o no te pertenece', 404));
        }
        if (result.reason === 'running') {
            return next(new AppError('No se puede eliminar un reporte en ejecucion. Cancela la auditoría primero.', 400));
        }
    }

    res.json({ message: 'Reporte eliminado exitosamente' });
});

/**
 * Obtener Historial General de Auditorias (Admin)
 * Devuelve el historial paginado de todos los usuarios
 */
exports.getAdminReportsHistory = catchAsync(async (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const search = req.query.search || '';
    const result = await driveAuditorService.getAllReports(page, limit, search);
    res.json({ data: result });
});
