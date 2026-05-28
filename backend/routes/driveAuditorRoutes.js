const express = require('express');
const router = express.Router();
const driveAuditorController = require('../controllers/driveAuditorController');
const { authMiddleware } = require('../middleware/auth');

// Todas las rutas requieren estar autenticado
router.use(authMiddleware);

router.post('/start', driveAuditorController.startAudit);
router.post('/cancel', driveAuditorController.cancelAudit);
router.get('/latest', driveAuditorController.getLatestAudit);
router.get('/limit-status', driveAuditorController.getLimitStatus);
router.get('/history', driveAuditorController.getUserReports);
router.get('/status/:reportId', driveAuditorController.getAuditStatus);
router.get('/report/:reportId', driveAuditorController.getAuditReport);
router.delete('/report/:reportId', driveAuditorController.deleteReport);
router.post('/send-warning', driveAuditorController.sendWarningEmail);

const { adminMiddleware } = require('../middleware/auth');
router.get('/admin/running', adminMiddleware, driveAuditorController.getRunningAudits);
router.get('/admin/report/:reportId', adminMiddleware, driveAuditorController.getAdminAuditReport);
router.post('/admin/cancel', adminMiddleware, driveAuditorController.cancelAdminAudit);

module.exports = router;
