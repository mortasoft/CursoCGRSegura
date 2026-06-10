const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const { authMiddleware, analystMiddleware } = require('../middleware/auth');
const { remindUnregistered, remindAtRisk, remindIndividualAtRisk } = require('../validators/schemas');
const { validateRequest } = require('../middleware/validator');

/**
 * @route   POST /api/reports/compliance/refresh
 * @desc    Forzar actualización del caché de reportes
 * @access  Private/Admin
 */
router.post('/compliance/refresh', authMiddleware, analystMiddleware, reportsController.refreshComplianceReport);

/**
 * @route   GET /api/reports/compliance
 * @desc    Obtener reporte de cumplimiento (Desde caché de Redis)
 * @access  Private/Admin
 */
router.get('/compliance', authMiddleware, analystMiddleware, reportsController.getComplianceReport);

/**
 * @route   GET /api/reports/completion-trend
 * @desc    Obtener tendencia de finalizaciones por tiempo
 * @access  Private/Admin
 */
router.get('/completion-trend', authMiddleware, analystMiddleware, reportsController.getCompletionTrend);

/**
 * @route   GET /api/reports/department-compliance
 * @desc    Obtener cumplimiento por departamento para un módulo específico
 * @access  Private/Admin
 */
router.get('/department-compliance', authMiddleware, analystMiddleware, reportsController.getDepartmentCompliance);

/**
 * @route   GET /api/reports/module-completions-detail
 * @desc    Obtener listado detallado de personas que terminaron un módulo
 * @access  Private/Admin
 */
router.get('/module-completions-detail', authMiddleware, analystMiddleware, reportsController.getModuleCompletionsDetail);

/**
 * @route   POST /api/reports/remind-unregistered
 * @desc    Enviar correos de invitación a funcionarios que no han ingresado a la plataforma
 * @access  Private/Admin
 */
router.post('/remind-unregistered', authMiddleware, analystMiddleware, remindUnregistered, validateRequest, reportsController.remindUnregistered);

/**
 * @route   POST /api/reports/remind-at-risk
 * @desc    Enviar correos de recordatorio a todos los funcionarios con avance < 20%
 * @access  Private/Admin
 */
router.post('/remind-at-risk', authMiddleware, analystMiddleware, remindAtRisk, validateRequest, reportsController.remindAtRisk);

/**
 * @route   POST /api/reports/remind-individual-at-risk
 * @desc    Enviar correo de recordatorio individual a un funcionario con avance < 20%
 * @access  Private/Admin
 */
router.post('/remind-individual-at-risk', authMiddleware, analystMiddleware, remindIndividualAtRisk, validateRequest, reportsController.remindIndividualAtRisk);

/**
 * @route   GET /api/reports/area-compliance-detail
 * @desc    Obtener detalle de cumplimiento de funcionarios por área (unidad o puesto)
 * @access  Private/Admin
 */
router.get('/area-compliance-detail', authMiddleware, analystMiddleware, reportsController.getAreaComplianceDetail);

module.exports = router;
