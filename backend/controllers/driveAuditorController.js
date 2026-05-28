const driveAuditorService = require('../services/driveAuditorService');
const logger = require('../config/logger');

exports.startAudit = async (req, res) => {
    try {
        const { access_token } = req.body;
        
        if (!access_token) {
            return res.status(400).json({ error: 'Se requiere access_token de Google Drive' });
        }

        const userId = req.user.id;
        const userEmail = req.user.email;
        const userName = `${req.user.first_name} ${req.user.last_name}`;

        const result = await driveAuditorService.startAudit(userId, userEmail, userName, access_token);
        
        res.status(202).json({
            message: 'Auditoría iniciada en segundo plano',
            data: result
        });
    } catch (error) {
        logger.error('Error en startAudit:', error);
        res.status(error.statusCode || 500).json({ 
            error: error.message || 'Error al iniciar la auditoría',
            nextAvailableDate: error.nextAvailableDate
        });
    }
};

exports.getAuditStatus = async (req, res) => {
    try {
        const reportId = req.params.reportId;
        const userId = req.user.id;
        
        const status = await driveAuditorService.getReportStatus(reportId, userId);
        
        if (!status) {
            return res.status(404).json({ error: 'Reporte no encontrado' });
        }

        res.json({ data: status });
    } catch (error) {
        logger.error('Error en getAuditStatus:', error);
        res.status(500).json({ error: 'Error al obtener estado' });
    }
};

exports.getLatestAudit = async (req, res) => {
    try {
        const userId = req.user.id;
        const report = await driveAuditorService.getLatestReport(userId);
        res.json({ data: report }); // returns null if no report exists
    } catch (error) {
        logger.error('Error en getLatestAudit:', error);
        res.status(500).json({ error: 'Error al obtener el último reporte' });
    }
};

exports.getAuditReport = async (req, res) => {
    try {
        const reportId = req.params.reportId;
        const userId = req.user.id;
        
        const reportData = await driveAuditorService.getReportDetails(reportId, userId);
        
        if (!reportData) {
            return res.status(404).json({ error: 'Reporte no encontrado' });
        }

        res.json({ data: reportData });
    } catch (error) {
        logger.error('Error en getAuditReport:', error);
        res.status(500).json({ error: 'Error al obtener el reporte' });
    }
};

exports.getRunningAudits = async (req, res) => {
    try {
        const runningAudits = await driveAuditorService.getRunningAudits();
        res.json({ data: runningAudits });
    } catch (error) {
        logger.error('Error en getRunningAudits:', error);
        res.status(500).json({ error: 'Error al obtener auditorías en ejecución' });
    }
};

exports.getAdminAuditReport = async (req, res) => {
    try {
        const reportId = req.params.reportId;
        const reportData = await driveAuditorService.getAdminReportDetails(reportId);
        
        if (!reportData) {
            return res.status(404).json({ error: 'Reporte no encontrado' });
        }

        res.json({ data: reportData });
    } catch (error) {
        logger.error('Error en getAdminAuditReport:', error);
        res.status(500).json({ error: 'Error al obtener el reporte de admin' });
    }
};

exports.cancelAudit = async (req, res) => {
    try {
        const { reportId } = req.body;
        const userId = req.user.id;
        
        if (!reportId) {
            return res.status(400).json({ error: 'Report ID es requerido' });
        }

        const cancelled = await driveAuditorService.cancelAudit(reportId, userId);
        
        if (!cancelled) {
            return res.status(400).json({ error: 'No se pudo cancelar el proceso (puede que ya haya terminado o no te pertenezca)' });
        }

        res.json({ message: 'Proceso cancelado exitosamente' });
    } catch (error) {
        logger.error('Error en cancelAudit:', error);
        res.status(500).json({ error: 'Error al cancelar la auditoría' });
    }
};

exports.cancelAdminAudit = async (req, res) => {
    try {
        const { reportId } = req.body;
        
        if (!reportId) {
            return res.status(400).json({ error: 'Report ID es requerido' });
        }

        const cancelled = await driveAuditorService.cancelAdminAudit(reportId);
        
        if (!cancelled) {
            return res.status(400).json({ error: 'No se pudo cancelar el proceso (puede que ya haya terminado)' });
        }

        res.json({ message: 'Proceso cancelado por el administrador' });
    } catch (error) {
        logger.error('Error en cancelAdminAudit:', error);
        res.status(500).json({ error: 'Error al cancelar la auditoría (admin)' });
    }
};

exports.sendWarningEmail = async (req, res) => {
    try {
        const { ownerEmail, ownerName, fileName, sharingLevel, fileLink } = req.body;
        
        if (!ownerEmail || !fileName || !sharingLevel || !fileLink) {
            return res.status(400).json({ error: 'Faltan parámetros requeridos (ownerEmail, fileName, sharingLevel, fileLink)' });
        }

        const auditorName = `${req.user.first_name} ${req.user.last_name}`;
        const auditorEmail = req.user.email;

        const emailService = require('../services/emailService');
        await emailService.sendDriveAuditFileWarning(
            ownerEmail,
            ownerName || 'Funcionario',
            fileName,
            sharingLevel,
            fileLink,
            auditorName,
            auditorEmail
        );

        res.json({ message: 'Correo de advertencia enviado exitosamente al propietario' });
    } catch (error) {
        logger.error('Error en sendWarningEmail:', error);
        res.status(500).json({ error: 'Error al enviar el correo de advertencia' });
    }
};

exports.getLimitStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const limitStatus = await driveAuditorService.getLimitStatus(userId);
        res.json({ data: limitStatus });
    } catch (error) {
        logger.error('Error en getLimitStatus:', error);
        res.status(500).json({ error: 'Error al obtener estado de límites' });
    }
};

exports.getUserReports = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
        const result = await driveAuditorService.getUserReports(userId, page, limit);
        res.json({ data: result });
    } catch (error) {
        logger.error('Error en getUserReports:', error);
        res.status(500).json({ error: 'Error al obtener historial de reportes' });
    }
};

exports.deleteReport = async (req, res) => {
    try {
        const userId = req.user.id;
        const { reportId } = req.params;
        const result = await driveAuditorService.deleteReport(reportId, userId);

        if (!result.deleted) {
            if (result.reason === 'not_found') {
                return res.status(404).json({ error: 'Reporte no encontrado o no te pertenece' });
            }
            if (result.reason === 'running') {
                return res.status(400).json({ error: 'No se puede eliminar un reporte en ejecucion. Cancela la auditoría primero.' });
            }
        }

        res.json({ message: 'Reporte eliminado exitosamente' });
    } catch (error) {
        logger.error('Error en deleteReport:', error);
        res.status(500).json({ error: 'Error al eliminar el reporte' });
    }
};


