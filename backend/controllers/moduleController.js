const moduleService = require('../services/moduleService');
const { clearCache } = require('../middleware/cache');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

class ModuleController {
    /**
     * @route   GET /api/modules
     * @desc    Obtener módulos con el progreso del estudiante logueado
     */
    getModules = catchAsync(async (req, res, next) => {
        // Verifica si el administrador desea ver el modulo simulando la vista del estudiante
        const isStudentView = req.headers['x-view-as-student'] === 'true' || req.headers['X-View-As-Student'] === 'true';
        const isAdmin = req.user.role === 'admin' && !isStudentView;
        
        // Retorna los modulos vigentes y calcula los porcentajes de avance
        const modules = await moduleService.getModulesWithProgress(req.user.id, isAdmin);
        res.json({ success: true, modules });
    });

    /**
     * @route   GET /api/modules/admin/all
     * @desc    Obtener listado completo de módulos para administración (Admin)
     */
    getAllAdmin = catchAsync(async (req, res, next) => {
        // Obtener el catalogo completo de modulos sin filtrar por visibilidad
        const modules = await moduleService.getAllModulesAdmin();
        res.json({ success: true, modules });
    });

    /**
     * @route   GET /api/modules/:id
     * @desc    Obtener la información a detalle de un módulo (incluyendo lecciones)
     */
    getModuleById = catchAsync(async (req, res, next) => {
        const moduleId = Number(req.params.id);
        const isStudentView = req.headers['x-view-as-student'] === 'true' || req.headers['X-View-As-Student'] === 'true';
        const isAdmin = req.user.role === 'admin' && !isStudentView;

        // Obtiene datos del modulo, lecciones asociadas y progreso
        const moduleDetail = await moduleService.getModuleDetail(moduleId, req.user.id, isAdmin);
        if (!moduleDetail) {
            return next(new AppError('Módulo no encontrado', 404));
        }
        res.json({ success: true, module: moduleDetail });
    });

    /**
     * @route   POST /api/modules
     * @desc    Crear un nuevo módulo (Admin)
     */
    createModule = catchAsync(async (req, res, next) => {
        const moduleId = await moduleService.createModule(req.body);
        
        // Invalidar caches globales para que el nuevo modulo sea visible inmediatamente
        await clearCache('cache:/api/modules*');
        await clearCache('cache:/api/dashboard*');
        await clearCache('cache:/api/lessons*');
        await clearCache('cache:/api/reports*');

        res.status(201).json({
            success: true,
            message: 'Módulo creado correctamente',
            moduleId
        });
    });

    /**
     * @route   PUT /api/modules/:id
     * @desc    Actualizar la información general de un módulo (Admin)
     */
    updateModule = catchAsync(async (req, res, next) => {
        const moduleId = req.params.id;
        await moduleService.updateModule(moduleId, req.body);

        // Invalidar caches afectadas tras la actualizacion
        await clearCache('cache:/api/modules*');
        await clearCache('cache:/api/dashboard*');
        await clearCache('cache:/api/lessons*');
        await clearCache('cache:/api/reports*');

        res.json({ success: true, message: 'Módulo actualizado correctamente' });
    });

    /**
     * @route   DELETE /api/modules/:id
     * @desc    Eliminar un módulo de forma lógica o física (Admin)
     */
    deleteModule = catchAsync(async (req, res, next) => {
        const moduleId = req.params.id;
        await moduleService.deleteModule(moduleId);

        // Invalidar caches afectadas
        await clearCache('cache:/api/modules*');
        await clearCache('cache:/api/dashboard*');
        await clearCache('cache:/api/lessons*');
        await clearCache('cache:/api/reports*');

        res.json({ success: true, message: 'Módulo eliminado correctamente' });
    });
}

module.exports = new ModuleController();
