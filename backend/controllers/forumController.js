const forumService = require('../services/forumService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

class ForumController {
    /**
     * Obtener los mensajes (posts) de un foro asociado a un bloque de contenido
     */
    getPosts = catchAsync(async (req, res, next) => {
        const { contentId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const userId = req.user.id;
        
        // Obtener publicaciones paginadas con informacion de si el usuario dio upvote
        const result = await forumService.getPosts(contentId, userId, page, limit);
        
        if (!result.success) {
            return next(new AppError(result.error || 'Error al obtener publicaciones', 500));
        }
        
        res.json({ 
            success: true, 
            posts: result.posts,
            pagination: result.pagination
        });
    });

    /**
     * Crear un mensaje nuevo en un foro especifico
     */
    createPost = catchAsync(async (req, res, next) => {
        const { contentId } = req.params;
        const { message } = req.body;
        const userId = req.user.id;

        // Validacion de mensaje no vacio
        if (!message || message.trim() === '') {
            return next(new AppError('El mensaje no puede estar vacío', 400));
        }

        // Crea el post y evalua si otorga puntos por participacion
        const result = await forumService.createPost(contentId, userId, message);
        
        if (!result.success) {
            return next(new AppError(result.error || 'Error al crear publicación', 500));
        }
        
        res.status(201).json({ success: true, postId: result.postId });
    });

    /**
     * Responder a un mensaje existente (crear una respuesta/hijo)
     */
    createReply = catchAsync(async (req, res, next) => {
        const { contentId, postId } = req.params;
        const { message } = req.body;
        const userId = req.user.id;

        // Validacion de mensaje no vacio
        if (!message || message.trim() === '') {
            return next(new AppError('El mensaje no puede estar vacío', 400));
        }

        // Registra la respuesta al post principal (postId)
        const result = await forumService.createReply(contentId, userId, postId, message);
        
        if (!result.success) {
            return next(new AppError(result.error || 'Error al responder', 400));
        }
        
        res.status(201).json({ success: true, postId: result.postId });
    });

    /**
     * Eliminar un mensaje del foro
     */
    deletePost = catchAsync(async (req, res, next) => {
        const { postId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Llama al servicio que valida si el usuario es autor del post o tiene permisos de administracion
        const result = await forumService.deletePost(postId, userId, userRole);
        
        if (!result.success) {
            return next(new AppError(result.error || 'Acceso denegado', 403));
        }
        
        res.json({ success: true, message: 'Mensaje eliminado correctamente' });
    });

    /**
     * Alternar Upvote (voto positivo) en un mensaje del foro
     */
    toggleUpvote = catchAsync(async (req, res, next) => {
        const { postId } = req.params;
        const userId = req.user.id;

        // Agrega o remueve el upvote del usuario
        const result = await forumService.toggleUpvote(postId, userId);
        
        if (!result.success) {
            return next(new AppError(result.error || 'Error al procesar voto', 400));
        }
        
        res.json({ success: true, action: result.action });
    });
}

module.exports = new ForumController();
