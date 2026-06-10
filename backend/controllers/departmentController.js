const departmentService = require('../services/departmentService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

class DepartmentController {
    /**
     * Obtener todos los departamentos registrados en el sistema
     */
    getAllDepartments = catchAsync(async (req, res, next) => {
        // Llama al servicio para obtener la lista completa de areas/departamentos
        const departments = await departmentService.getAllDepartments();
        res.json({ success: true, departments });
    });

    /**
     * Crear un nuevo departamento de forma manual (Admin)
     */
    createDepartment = catchAsync(async (req, res, next) => {
        const { name } = req.body;
        // Validacion de campo requerido
        if (!name) {
            return next(new AppError('El nombre es requerido', 400));
        }

        try {
            // Registra el departamento en la BD
            const department = await departmentService.createDepartment(name);
            res.status(201).json({ success: true, ...department });
        } catch (error) {
            // Controlar errores de duplicidad en la base de datos
            if (error.code === 'ER_DUP_ENTRY') {
                return next(new AppError('El departamento ya existe', 400));
            }
            throw error;
        }
    });

    /**
     * Actualizar el nombre de un departamento (Admin)
     */
    updateDepartment = catchAsync(async (req, res, next) => {
        const { name } = req.body;
        const { id } = req.params;
        // Validacion de campo requerido
        if (!name) {
            return next(new AppError('El nombre es requerido', 400));
        }

        try {
            // Actualiza el nombre del departamento
            await departmentService.updateDepartment(id, name);
            res.json({ success: true, message: 'Departamento actualizado correctamente' });
        } catch (error) {
            // Controlar errores de duplicidad en caso de colisionar con otro nombre existente
            if (error.code === 'ER_DUP_ENTRY') {
                return next(new AppError('Ya existe otro departamento con ese nombre', 400));
            }
            throw error;
        }
    });

    /**
     * Eliminar un departamento por su ID (Admin)
     */
    deleteDepartment = catchAsync(async (req, res, next) => {
        const { id } = req.params;
        // Elimina el departamento especifico
        await departmentService.deleteDepartment(id);
        res.json({ success: true, message: 'Departamento eliminado correctamente' });
    });

    /**
     * Sincronizar departamentos desde el directorio maestro institucional (Admin)
     */
    syncFromDirectory = catchAsync(async (req, res, next) => {
        // Llama al servicio para importar las areas del directorio principal a la base de datos
        const insertedCount = await departmentService.syncFromDirectory();
        res.json({ 
            success: true, 
            message: `Sincronización completada. ${insertedCount} nuevas áreas agregadas desde el directorio maestro.` 
        });
    });

    /**
     * Eliminar todos los departamentos de la base de datos (Admin)
     */
    deleteAllDepartments = catchAsync(async (req, res, next) => {
        // Limpia por completo la tabla de departamentos
        await departmentService.deleteAllDepartments();
        res.json({ success: true, message: 'Todas las áreas han sido eliminadas' });
    });
}

module.exports = new DepartmentController();
