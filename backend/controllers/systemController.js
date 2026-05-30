const db = require('../config/database');
const catchAsync = require('../utils/catchAsync');
const { getSystemSettings, refreshLeaderboardCache } = require('../services/gamificationService');
const { clearCache } = require('../middleware/cache');
const logger = require('../config/logger');

/**
 * Controlador para la gestión de las configuraciones globales del sistema
 */
class SystemController {
    /**
     * Obtener configuraciones del sistema
     */
    getSettings = catchAsync(async (req, res, next) => {
        const settingsRaw = await db.query('SELECT setting_key, setting_value FROM system_settings');
        const settings = {};
        settingsRaw.forEach(s => settings[s.setting_key] = s.setting_value);
        res.json({ success: true, settings });
    });

    /**
     * Actualizar configuraciones del sistema
     */
    updateSettings = catchAsync(async (req, res, next) => {
        const { maintenance_mode, ranking_limit_global, ranking_limit_department, allow_theme_change } = req.body;

        if (maintenance_mode !== undefined) {
            await db.query(
                "UPDATE system_settings SET setting_value = ? WHERE setting_key = 'maintenance_mode'",
                [String(maintenance_mode)]
            );
        }

        if (ranking_limit_global !== undefined) {
            await db.query(
                "INSERT INTO system_settings (setting_key, setting_value) VALUES ('ranking_limit_global', ?) ON DUPLICATE KEY UPDATE setting_value = ?",
                [String(ranking_limit_global), String(ranking_limit_global)]
            );
        }

        if (ranking_limit_department !== undefined) {
            await db.query(
                "INSERT INTO system_settings (setting_key, setting_value) VALUES ('ranking_limit_department', ?) ON DUPLICATE KEY UPDATE setting_value = ?",
                [String(ranking_limit_department), String(ranking_limit_department)]
            );
        }

        if (allow_theme_change !== undefined) {
            await db.query(
                "INSERT INTO system_settings (setting_key, setting_value) VALUES ('allow_theme_change', ?) ON DUPLICATE KEY UPDATE setting_value = ?",
                [String(allow_theme_change), String(allow_theme_change)]
            );
        }

        // Invalidar caché y refrescar leaderboard con los nuevos límites
        await getSystemSettings(true);
        await clearCache('cache:/api/gamification/leaderboard*');
        refreshLeaderboardCache().catch(err => logger.error('Error refreshing leaderboard after settings change:', err));

        res.json({ success: true, message: 'Configuración actualizada' });
    });
}

module.exports = new SystemController();
