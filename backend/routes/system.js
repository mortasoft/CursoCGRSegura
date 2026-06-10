const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/settings', authMiddleware, adminMiddleware, systemController.getSettings);
router.put('/settings', authMiddleware, adminMiddleware, systemController.updateSettings);

module.exports = router;
