const reportsService = require('../services/reportsService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

class ReportsController {
    /**
     * @route   POST /api/reports/compliance/refresh
     * @desc    Forzar actualización del caché de reportes
     */
    refreshComplianceReport = catchAsync(async (req, res, next) => {
        const reportData = await reportsService.refreshReportsCache();
        if (!reportData) {
            return next(new AppError('Error al refrescar los reportes de cumplimiento', 500));
        }
        res.json({ success: true, message: 'Reportes actualizados correctamente', ...reportData });
    });

    /**
     * @route   GET /api/reports/compliance
     * @desc    Obtener reporte de cumplimiento (Desde caché de Redis)
     */
    getComplianceReport = catchAsync(async (req, res, next) => {
        const reportData = await reportsService.getComplianceReport();
        if (!reportData) {
            return next(new AppError('No se pudieron generar los reportes.', 500));
        }
        res.json({
            success: true,
            ...reportData
        });
    });

    /**
     * @route   GET /api/reports/completion-trend
     * @desc    Obtener tendencia de finalizaciones por tiempo
     */
    getCompletionTrend = catchAsync(async (req, res, next) => {
        const { module_id, interval = 'weekly', startDate, endDate } = req.query;

        if (!module_id) {
            return next(new AppError('ID de módulo es requerido', 400));
        }

        const stats = await reportsService.getCompletionTrend(module_id, interval, startDate, endDate);
        res.json({
            success: true,
            data: stats
        });
    });

    /**
     * @route   GET /api/reports/department-compliance
     * @desc    Obtener cumplimiento por departamento para un módulo específico
     */
    getDepartmentCompliance = catchAsync(async (req, res, next) => {
        const { module_id } = req.query;

        if (!module_id) {
            return next(new AppError('ID de módulo es requerido', 400));
        }

        const stats = await reportsService.getDepartmentCompliance(module_id);
        res.json({ success: true, departments: stats });
    });

    /**
     * @route   GET /api/reports/module-completions-detail
     * @desc    Obtener listado detallado de personas que terminaron un módulo
     */
    getModuleCompletionsDetail = catchAsync(async (req, res, next) => {
        const { module_id } = req.query;

        if (!module_id) {
            return next(new AppError('ID de módulo es requerido', 400));
        }

        const completions = await reportsService.getModuleCompletionsDetail(module_id);
        res.json({
            success: true,
            data: completions
        });
    });

    /**
     * @route   POST /api/reports/remind-unregistered
     * @desc    Enviar correos de invitación a funcionarios que no han ingresado a la plataforma
     */
    remindUnregistered = catchAsync(async (req, res, next) => {
        const { department } = req.body;

        if (!department) {
            return next(new AppError('El nombre del departamento es requerido', 400));
        }

        const result = await reportsService.remindUnregistered(department);
        
        if (result.count === 0) {
            return res.json({ success: true, message: 'No hay funcionarios pendientes de registro en este departamento.' });
        }

        res.json({ 
            success: true, 
            message: `Proceso finalizado. Invitaciones enviadas: ${result.sentCount}. Fallidos: ${result.errorCount}.`,
            sentCount: result.sentCount,
            errorCount: result.errorCount
        });
    });

    /**
     * @route   POST /api/reports/remind-at-risk
     * @desc    Enviar correos de recordatorio a todos los funcionarios con avance < 20%
     */
    remindAtRisk = catchAsync(async (req, res, next) => {
        const { users } = req.body;

        if (!users || !Array.isArray(users)) {
            return next(new AppError('La lista de usuarios es requerida', 400));
        }

        const result = await reportsService.remindAtRisk(users);

        res.json({ 
            success: true, 
            message: `Proceso finalizado. Alertas enviadas: ${result.sentCount}. Fallidos: ${result.errorCount}.`,
            sentCount: result.sentCount,
            errorCount: result.errorCount
        });
    });

    /**
     * @route   POST /api/reports/remind-individual-at-risk
     * @desc    Enviar correo de recordatorio individual a un funcionario con avance < 20%
     */
    remindIndividualAtRisk = catchAsync(async (req, res, next) => {
        const { email, first_name, last_name, progress } = req.body;

        if (!email) {
            return next(new AppError('El email del funcionario es requerido', 400));
        }

        await reportsService.remindIndividualAtRisk({ email, first_name, last_name, progress });

        res.json({ 
            success: true, 
            message: `Alerta enviada correctamente a ${first_name} ${last_name}.`
        });
    });

    /**
     * @route   GET /api/reports/area-compliance-detail
     * @desc    Obtener detalle de cumplimiento de funcionarios por área (unidad o puesto)
     */
    getAreaComplianceDetail = catchAsync(async (req, res, next) => {
        const { type, name, module_id = 'ALL' } = req.query;

        if (!type || !name) {
            return next(new AppError('Tipo y nombre de área son requeridos', 400));
        }

        const staff = await reportsService.getAreaComplianceDetail(type, name, module_id);
        res.json({ success: true, staff });
    });
}

module.exports = new ReportsController();
