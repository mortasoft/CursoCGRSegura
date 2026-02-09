const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

/**
 * @route   GET /api/departments
 * @desc    Obtener lista de departamentos (Para selectores o gestión)
 * @access  Private
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        const departments = await db.query('SELECT * FROM departments ORDER BY name ASC');
        res.json({ success: true, departments });
    } catch (error) {
        console.error('Error al obtener departamentos:', error);
        res.status(500).json({ error: 'Error al cargar los departamentos' });
    }
});

/**
 * @route   POST /api/departments
 * @desc    Crear nuevo departamento
 * @access  Private/Admin
 */
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'El nombre es requerido' });

        const result = await db.query('INSERT INTO departments (name) VALUES (?)', [name]);
        res.status(201).json({ success: true, id: result.insertId, name });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'El departamento ya existe' });
        }
        console.error('Error al crear departamento:', error);
        res.status(500).json({ error: 'Error al crear el departamento' });
    }
});

/**
 * @route   PUT /api/departments/:id
 * @desc    Actualizar nombre de departamento
 * @access  Private/Admin
 */
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { name } = req.body;
        const { id } = req.params;
        if (!name) return res.status(400).json({ error: 'El nombre es requerido' });

        await db.query('UPDATE departments SET name = ? WHERE id = ?', [name, id]);
        res.json({ success: true, message: 'Departamento actualizado' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Ya existe otro departamento con ese nombre' });
        }
        res.status(500).json({ error: 'Error al actualizar el departamento' });
    }
});

/**
 * @route   DELETE /api/departments/:id
 * @desc    Eliminar departamento
 * @access  Private/Admin
 */
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM departments WHERE id = ?', [id]);
        res.json({ success: true, message: 'Departamento eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el departamento' });
    }
});

/**
 * @route   POST /api/departments/sync
 * @desc    Sincronizar departamentos desde el directorio maestro
 * @access  Private/Admin
 */
router.post('/sync', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        // 1. Obtener departamentos únicos del directorio maestro
        // asume que la columna se llama 'department' en staff_directory
        const directoryDepts = await db.query(
            "SELECT DISTINCT department FROM staff_directory WHERE department IS NOT NULL AND department != ''"
        );

        let addedCount = 0;

        // 2. Insertarlos en la tabla departments ignorando duplicados
        for (const row of directoryDepts) {
            const deptName = row.department.trim();
            if (!deptName) continue;

            try {
                // Intentar insertar
                // Usamos INSERT IGNORE si es MySQL/MariaDB para evitar error de duplicado y continuar
                // O mejor aun, verificamos existencia primero para contar correctamente
                const existing = await db.query("SELECT id FROM departments WHERE name = ?", [deptName]);

                if (existing.length === 0) {
                    await db.query("INSERT INTO departments (name) VALUES (?)", [deptName]);
                    addedCount++;
                }
            } catch (err) {
                console.error(`Error insertando departamento ${deptName}:`, err);
                // Continuar con el siguiente
            }
        }

        res.json({
            success: true,
            message: `Sincronización completada. ${addedCount} nuevas áreas agregadas desde el directorio maestro.`
        });
    } catch (error) {
        console.error('Error sincronizando departamentos:', error);
        res.status(500).json({ error: 'Error al sincronizar departamentos' });
    }
});

/**
 * @route   DELETE /api/departments/all
 * @desc    Eliminar todos los departamentos
 * @access  Private/Admin
 */
router.post('/delete-all', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await db.query('DELETE FROM departments');
        res.json({ success: true, message: 'Todas las áreas han sido eliminadas' });
    } catch (error) {
        console.error('Error al eliminar todas las áreas:', error);
        res.status(500).json({ error: 'Error al eliminar las áreas' });
    }
});

module.exports = router;
