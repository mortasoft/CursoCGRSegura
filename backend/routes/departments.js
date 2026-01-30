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

module.exports = router;
