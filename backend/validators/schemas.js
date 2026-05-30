const { body } = require('express-validator');

// Esquemas de validacion centralizados para payloads de la aplicacion
const schemas = {
    // Autenticacion
    googleAuth: [
        body('credential')
            .notEmpty().withMessage('El token de credencial es requerido')
            .isString().withMessage('El token de credencial debe ser un texto')
    ],

    // Notificaciones
    sendMassNotification: [
        body('title')
            .notEmpty().withMessage('El titulo es requerido')
            .isString().withMessage('El titulo debe ser un texto'),
        body('message')
            .notEmpty().withMessage('El mensaje es requerido')
            .isString().withMessage('El mensaje debe ser un texto'),
        body('type')
            .optional()
            .isIn(['info', 'success', 'warning', 'danger']).withMessage('Tipo de notificacion invalido (debe ser info, success, warning o danger)'),
        body('link_url')
            .optional({ nullable: true, checkFalsy: true })
            .isURL().withMessage('La URL del enlace es invalida'),
        body('filters')
            .optional()
            .isObject().withMessage('Los filtros deben ser un objeto')
    ],

    // Encuestas (Surveys)
    submitSurvey: [
        body('answers')
            .notEmpty().withMessage('Las respuestas son requeridas')
            .isObject().withMessage('Las respuestas deben ser un objeto')
    ],
    createSurvey: [
        body('title')
            .notEmpty().withMessage('El titulo es requerido')
            .isString().withMessage('El titulo debe ser un texto'),
        body('description')
            .optional()
            .isString().withMessage('La descripcion debe ser un texto'),
        body('points')
            .optional()
            .isInt({ min: 0 }).withMessage('Los puntos deben ser un numero entero no negativo'),
        body('module_id')
            .optional({ nullable: true })
            .isInt().withMessage('El ID de modulo debe ser un entero'),
        body('lesson_id')
            .optional({ nullable: true })
            .isInt().withMessage('El ID de leccion debe ser un entero')
    ],
    updateSurvey: [
        body('title')
            .notEmpty().withMessage('El titulo es requerido')
            .isString().withMessage('El titulo debe ser un texto'),
        body('description')
            .optional()
            .isString().withMessage('La descripcion debe ser un texto'),
        body('points')
            .optional()
            .isInt({ min: 0 }).withMessage('Los puntos deben ser un numero entero no negativo')
    ],
    addSurveyQuestion: [
        body('question_text')
            .notEmpty().withMessage('El texto de la pregunta es requerido')
            .isString().withMessage('El texto de la pregunta debe ser un texto'),
        body('question_type')
            .notEmpty().withMessage('El tipo de pregunta es requerido')
            .isIn(['text', 'multiple_choice', 'rating']).withMessage('Tipo de pregunta invalido (debe ser text, multiple_choice o rating)'),
        body('is_required')
            .optional()
            .isBoolean().withMessage('El campo is_required debe ser un booleano'),
        body('order_index')
            .optional()
            .isInt().withMessage('El orden de la pregunta debe ser un numero entero'),
        body('options')
            .optional()
            .isArray().withMessage('Las opciones deben ser un arreglo')
    ],
    updateSurveyQuestion: [
        body('question_text')
            .notEmpty().withMessage('El texto de la pregunta es requerido')
            .isString().withMessage('El texto de la pregunta debe ser un texto'),
        body('question_type')
            .notEmpty().withMessage('El tipo de pregunta es requerido')
            .isIn(['text', 'multiple_choice', 'rating']).withMessage('Tipo de pregunta invalido (debe ser text, multiple_choice o rating)'),
        body('is_required')
            .optional()
            .isBoolean().withMessage('El campo is_required debe ser un booleano'),
        body('order_index')
            .optional()
            .isInt().withMessage('El orden de la pregunta debe ser un numero entero'),
        body('options')
            .optional()
            .isArray().withMessage('Las opciones deben ser un arreglo')
    ],

    // Reportes
    remindUnregistered: [
        body('department')
            .notEmpty().withMessage('El nombre del departamento es requerido')
            .isString().withMessage('El nombre del departamento debe ser un texto')
    ],
    remindAtRisk: [
        body('users')
            .notEmpty().withMessage('La lista de usuarios es requerida')
            .isArray().withMessage('La lista de usuarios debe ser un arreglo')
    ],
    remindIndividualAtRisk: [
        body('email')
            .notEmpty().withMessage('El correo electronico es requerido')
            .isEmail().withMessage('El correo electronico debe ser valido'),
        body('first_name')
            .optional()
            .isString().withMessage('El nombre debe ser un texto'),
        body('last_name')
            .optional()
            .isString().withMessage('El apellido debe ser un texto'),
        body('progress')
            .optional()
            .isNumeric().withMessage('El progreso debe ser un numero')
    ],

    // Usuarios
    updateUserProfile: [
        body('profile_picture')
            .optional({ nullable: true })
            .isString().withMessage('La ruta de la foto de perfil debe ser un string')
    ],
    updateUserAdmin: [
        body('role')
            .optional()
            .isIn(['student', 'admin', 'instructor', 'analyst']).withMessage('El rol del usuario es invalido'),
        body('is_active')
            .optional()
            .isBoolean().withMessage('El campo is_active debe ser un booleano'),
        body('first_name')
            .optional()
            .isString().withMessage('El nombre debe ser un texto'),
        body('last_name')
            .optional()
            .isString().withMessage('El apellido debe ser un texto'),
        body('department')
            .optional()
            .isString().withMessage('El departamento debe ser un texto'),
        body('position')
            .optional()
            .isString().withMessage('El puesto debe ser un texto')
    ],

    // Evaluaciones (Quizzes)
    submitQuiz: [
        body('answers')
            .notEmpty().withMessage('Las respuestas son requeridas')
            .isObject().withMessage('Las respuestas deben ser un objeto'),
        body('timeSpent')
            .optional()
            .isInt({ min: 0 }).withMessage('El tiempo transcurrido debe ser un entero no negativo'),
        body('is_replay')
            .optional()
            .isBoolean().withMessage('El indicador de repeticion debe ser un booleano')
    ],
    createQuiz: [
        body('lesson_id')
            .notEmpty().withMessage('El ID de leccion es requerido')
            .isInt().withMessage('El ID de leccion debe ser un entero'),
        body('title')
            .notEmpty().withMessage('El titulo es requerido')
            .isString().withMessage('El titulo debe ser un texto'),
        body('description')
            .optional()
            .isString().withMessage('La descripcion debe ser un texto'),
        body('passing_score')
            .optional()
            .isInt({ min: 0, max: 100 }).withMessage('La nota minima de aprobacion debe estar entre 0 y 100'),
        body('points')
            .optional()
            .isInt({ min: 0 }).withMessage('Los puntos deben ser un numero entero no negativo'),
        body('max_attempts')
            .optional()
            .isInt({ min: 1 }).withMessage('El numero maximo de intentos debe ser al menos 1')
    ],
    updateQuiz: [
        body('title')
            .notEmpty().withMessage('El titulo es requerido')
            .isString().withMessage('El titulo debe ser un texto'),
        body('description')
            .optional()
            .isString().withMessage('La descripcion debe ser un texto'),
        body('passing_score')
            .optional()
            .isInt({ min: 0, max: 100 }).withMessage('La nota minima de aprobacion debe estar entre 0 y 100'),
        body('points')
            .optional()
            .isInt({ min: 0 }).withMessage('Los puntos deben ser un numero entero no negativo'),
        body('max_attempts')
            .optional()
            .isInt({ min: 1 }).withMessage('El numero maximo de intentos debe ser al menos 1')
    ],
    addQuizQuestion: [
        body('question_text')
            .notEmpty().withMessage('El texto de la pregunta es requerido')
            .isString().withMessage('El texto de la pregunta debe ser un texto'),
        body('question_type')
            .notEmpty().withMessage('El tipo de pregunta es requerido')
            .isIn(['single_choice', 'multiple_choice', 'true_false', 'video']).withMessage('Tipo de pregunta invalido'),
        body('points')
            .optional()
            .isInt({ min: 0 }).withMessage('Los puntos deben ser un numero entero no negativo'),
        body('explanation')
            .optional()
            .isString().withMessage('La explicacion debe ser un texto'),
        body('options')
            .optional()
            .isArray().withMessage('Las opciones deben ser un arreglo')
    ],
    updateQuizQuestion: [
        body('question_text')
            .notEmpty().withMessage('El texto de la pregunta es requerido')
            .isString().withMessage('El texto de la pregunta debe ser un texto'),
        body('question_type')
            .notEmpty().withMessage('El tipo de pregunta es requerido')
            .isIn(['single_choice', 'multiple_choice', 'true_false', 'video']).withMessage('Tipo de pregunta invalido'),
        body('points')
            .optional()
            .isInt({ min: 0 }).withMessage('Los puntos deben ser un numero entero no negativo'),
        body('explanation')
            .optional()
            .isString().withMessage('La explicacion debe ser un texto'),
        body('options')
            .optional()
            .isArray().withMessage('Las opciones deben ser un arreglo')
    ]
};

module.exports = schemas;
