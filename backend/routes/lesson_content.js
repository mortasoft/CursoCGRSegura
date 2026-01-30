const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de Multer para subida de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/course_content/';
        // Crear directorio si no existe
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Nombre único: timestamp-nombreOriginal
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB límite
    fileFilter: (req, file, cb) => {
        // Permitir documentos, imágenes y videos básicos
        const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx|ppt|pptx|xls|xlsx|mp4|webm|mp3|zip|rar/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Tipo de archivo no soportado.'));
    }
});

/**
 * @route   GET /api/content/lesson/:lessonId
 * @desc    Obtener todos los items de contenido de una lección
 * @access  Private
 */
router.get('/lesson/:lessonId', authMiddleware, async (req, res) => {
    try {
        const { lessonId } = req.params;
        const contents = await db.query(
            'SELECT * FROM lesson_contents WHERE lesson_id = ? ORDER BY order_index ASC',
            [lessonId]
        );

        // Parsear el campo JSON 'data'
        const parsedContents = contents.map(item => ({
            ...item,
            data: typeof item.data === 'string' ? JSON.parse(item.data) : item.data
        }));

        res.json({ success: true, contents: parsedContents });
    } catch (error) {
        console.error('Error obteniendo contenidos:', error);
        res.status(500).json({ error: 'Error al cargar contenidos' });
    }
});

/**
 * @route   POST /api/content
 * @desc    Crear un nuevo item de contenido
 * @access  Private/Admin
 */
router.post('/', authMiddleware, adminMiddleware, upload.single('file'), async (req, res) => {
    try {
        const { lesson_id, title, content_type, data, order_index, is_required, points } = req.body;
        let contentData = data ? JSON.parse(data) : {};

        // Si hay archivo subido, agregarlo a contentData
        if (req.file) {
            contentData.file_url = `/uploads/course_content/${req.file.filename}`;
            contentData.original_name = req.file.originalname;
            contentData.mime_type = req.file.mimetype;
            contentData.size = req.file.size;
        }

        const result = await db.query(
            `INSERT INTO lesson_contents (lesson_id, title, content_type, data, order_index, is_required, points)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [lesson_id, title, content_type, JSON.stringify(contentData), order_index || 0, is_required ? 1 : 0, points || 0]
        );

        res.status(201).json({
            success: true,
            message: 'Contenido agregado correctamente',
            contentId: result.insertId,
            fileUrl: contentData.file_url
        });
    } catch (error) {
        console.error('Error creando contenido:', error);
        res.status(500).json({ error: 'Error al crear contenido' });
    }
});

/**
 * @route   PUT /api/content/:id
 * @desc    Actualizar un item de contenido
 * @access  Private/Admin
 */
router.put('/:id', authMiddleware, adminMiddleware, upload.single('file'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content_type, data, order_index, is_required, points } = req.body;

        // Obtener data existente para no perder lo que había si no se envía todo
        const [current] = await db.query('SELECT data FROM lesson_contents WHERE id = ?', [id]);
        if (!current) return res.status(404).json({ error: 'Contenido no encontrado' });

        let contentData = current.data ? (typeof current.data === 'string' ? JSON.parse(current.data) : current.data) : {};

        // Merge nueva data
        if (data) {
            const newData = JSON.parse(data);
            contentData = { ...contentData, ...newData };
        }

        // Si hay archivo nuevo, reemplazar
        if (req.file) {
            // TODO: Podríamos borrar el archivo anterior aquí
            contentData.file_url = `/uploads/course_content/${req.file.filename}`;
            contentData.original_name = req.file.originalname;
            contentData.mime_type = req.file.mimetype;
            contentData.size = req.file.size;
        }

        await db.query(
            `UPDATE lesson_contents 
             SET title = ?, content_type = ?, data = ?, order_index = ?, is_required = ?, points = ?
             WHERE id = ?`,
            [title, content_type, JSON.stringify(contentData), order_index, is_required ? 1 : 0, points || 0, id]
        );

        res.json({ success: true, message: 'Contenido actualizado correctamente' });
    } catch (error) {
        console.error('Error actualizando contenido:', error);
        res.status(500).json({ error: 'Error al actualizar contenido' });
    }
});

/**
 * @route   DELETE /api/content/:id
 * @desc    Eliminar un item de contenido
 * @access  Private/Admin
 */
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // Opcional: Borrar archivo físico si existe
        // const [item] = await db.query('SELECT data FROM lesson_contents WHERE id = ?', [id]);
        // ... lógica de borrado de archivo ...

        await db.query('DELETE FROM lesson_contents WHERE id = ?', [id]);
        res.json({ success: true, message: 'Contenido eliminado correctamente' });
    } catch (error) {
        console.error('Error eliminando contenido:', error);
        res.status(500).json({ error: 'Error al eliminar contenido' });
    }
});

/**
 * @route   POST /api/content/reorder
 * @desc    Reordenar items
 * @access  Private/Admin
 */
router.post('/reorder', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { items } = req.body; // Array de { id, order_index }

        for (const item of items) {
            await db.query('UPDATE lesson_contents SET order_index = ? WHERE id = ?', [item.order_index, item.id]);
        }

        res.json({ success: true, message: 'Orden actualizado' });
    } catch (error) {
        console.error('Error reordenando contenido:', error);
        res.status(500).json({ error: 'Error al reordenar' });
    }
});

module.exports = router;
