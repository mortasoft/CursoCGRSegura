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
/**
 * @route   POST /api/directory/single
 * @desc    Agregar un funcionario individual
 * @access  Private/Admin
 */
router.post('/single', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { email, full_name, department, position } = req.body;
        if (!email || !full_name) return res.status(400).json({ error: 'Email y nombre son requeridos' });

        await db.query(
            `INSERT INTO staff_directory (email, full_name, department, position) 
             VALUES (?, ?, ?, ?) 
             ON DUPLICATE KEY UPDATE full_name = ?, department = ?, position = ?`,
            [email, full_name, department, position, full_name, department, position]
        );

        res.status(201).json({ success: true, message: 'Funcionario agregado correctamente' });
    } catch (error) {
        console.error('Error agregando funcionario individual:', error);
        res.status(500).json({ error: 'Error al agregar el funcionario' });
    }
});

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

            const [email, fullName, department, position] = line.split(',').map(s => s.trim());

            if (email && fullName) {
                try {
                    await db.query(
                        `INSERT INTO staff_directory (email, full_name, department, position) 
                         VALUES (?, ?, ?, ?) 
                         ON DUPLICATE KEY UPDATE full_name = ?, department = ?, position = ?`,
                        [email, fullName, department, position, fullName, department, position]
                    );

                    // Si el usuario ya está registrado en 'users' pero no tiene departamento o puesto actualizado, sincronizarlo
                    await db.query(
                        'UPDATE users SET department = ?, position = ? WHERE email = ?',
                        [department, position || '', email]
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
 * @route   PUT /api/directory/:email
 * @desc    Actualizar un registro del directorio maestro
 * @access  Private/Admin
 */
router.put('/:email', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { full_name, department, position } = req.body;
        const { email } = req.params;

        await db.query(
            'UPDATE staff_directory SET full_name = ?, department = ?, position = ? WHERE email = ?',
            [full_name, department, position, email]
        );

        res.json({ success: true, message: 'Registro actualizado correctamente' });
    } catch (error) {
        console.error('Error actualizando registro del directorio:', error);
        res.status(500).json({ error: 'Error al actualizar el registro' });
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

/**
 * @route   GET /api/directory/template
 * @desc    Descargar plantilla CSV para carga masiva
 * @access  Private/Admin
 */
router.get('/template', authMiddleware, adminMiddleware, (req, res) => {
    const csvContent = 'email,full_name,department,position\nfuncionario@cgr.go.cr,Nombre Completo,TI,Especialista en Seguridad';
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=plantilla_directorio_cgr.csv');
    res.status(200).send(csvContent);
});

module.exports = router;
