const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @route   GET /api/directory
 * @desc    Obtener lista completa del directorio institucional con estado de registro
 * @access  Private/Admin
 */
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const directory = await db.query(
            `SELECT sd.*, 
                    CASE WHEN u.id IS NOT NULL THEN TRUE ELSE FALSE END as is_registered,
                    u.last_login
             FROM staff_directory sd
             LEFT JOIN users u ON sd.email = u.email COLLATE utf8mb4_unicode_ci
             ORDER BY sd.department ASC, sd.full_name ASC`
        );

        res.json({
            success: true,
            directory
        });
    } catch (error) {
        console.error('Error obteniendo directorio:', error);
        res.status(500).json({ error: 'Error al obtener el directorio maestro' });
    }
});

/**
 * @route   POST /api/directory/upload
 * @desc    Subir CSV de funcionarios y sincronizar
 * @access  Private/Admin
 */
router.post('/upload', authMiddleware, adminMiddleware, upload.single('csv'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No se subió ningún archivo' });
    }

    try {
        const csvContent = req.file.buffer.toString('utf8');
        const lines = csvContent.split(/\r?\n/);

        // Asumiendo formato: email,nombre,departamento
        // Saltear encabezado si existe
        const startIndex = lines[0].toLowerCase().includes('email') ? 1 : 0;

        let processed = 0;
        let errors = 0;

        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const [email, fullName, department] = line.split(',').map(s => s.trim());

            if (email && fullName) {
                try {
                    await db.query(
                        `INSERT INTO staff_directory (email, full_name, department) 
                         VALUES (?, ?, ?) 
                         ON DUPLICATE KEY UPDATE full_name = ?, department = ?`,
                        [email, fullName, department, fullName, department]
                    );

                    // Si el usuario ya está registrado en 'users' pero no tiene departamento, actualizarlo
                    await db.query(
                        'UPDATE users SET department = ? WHERE email = ? AND (department IS NULL OR department = "")',
                        [department, email]
                    );

                    processed++;
                } catch (e) {
                    errors++;
                }
            }
        }

        res.json({
            success: true,
            message: `Proceso completado: ${processed} funcionarios sincronizados.`,
            errors
        });
    } catch (error) {
        console.error('Error procesando CSV:', error);
        res.status(500).json({ error: 'Error al procesar el archivo CSV' });
    }
});

/**
 * @route   DELETE /api/directory/:email
 * @desc    Eliminar un registro del directorio maestro
 * @access  Private/Admin
 */
router.delete('/:email', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await db.query('DELETE FROM staff_directory WHERE email = ?', [req.params.email]);
        res.json({ success: true, message: 'Registro eliminado del directorio' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el registro' });
    }
});

module.exports = router;
