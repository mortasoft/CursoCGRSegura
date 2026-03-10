const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { syncUserLevel, getSystemSettings, checkAndRecordModuleCompletion } = require('../utils/gamification');
const { checkAllBadges } = require('../utils/badges');
const { clearCache } = require('../middleware/cache');

/**
 * @route   GET /api/quizzes/:id
 * @desc    Obtener un quiz con sus preguntas y opciones
 * @access  Private
 */
/**
 * @route   GET /api/quizzes/:id/last-attempt
 * @desc    Obtener el último intento del usuario para un quiz
 * @access  Private
 */
router.get('/:id/last-attempt', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const quizId = req.params.id;

        const [lastAttempt] = await db.query(
            'SELECT answers, score, passed, attempt_number FROM quiz_attempts WHERE user_id = ? AND quiz_id = ? ORDER BY attempt_number DESC LIMIT 1',
            [userId, quizId]
        );

        if (!lastAttempt) {
            return res.json({ success: false, message: 'No hay intentos previos' });
        }

        // Obtener feedback detallado (necesitamos respuestas correctas y explicaciones)
        const questions = await db.query(
            `SELECT q.id, o.id as correct_option_id, q.explanation
             FROM quiz_questions q
             JOIN quiz_options o ON q.id = o.question_id
             WHERE q.quiz_id = ? AND o.is_correct = TRUE`,
            [quizId]
        );

        const answers = typeof lastAttempt.answers === 'string' ? JSON.parse(lastAttempt.answers) : (lastAttempt.answers || {});
        let earnedPoints = 0;
        let totalPoints = 0;

        // Obtener puntos reales de las preguntas
        const questionData = await db.query(
            'SELECT id, points FROM quiz_questions WHERE quiz_id = ?',
            [quizId]
        );
        const pointsMap = {};
        questionData.forEach(p => {
            pointsMap[p.id] = p.points;
            totalPoints += p.points;
        });

        const feedback = [];
        questions.forEach(q => {
            const isCorrect = parseInt(answers[q.id]) === q.correct_option_id;
            if (isCorrect) {
                earnedPoints += pointsMap[q.id] || 0;
            }
            feedback.push({
                questionId: q.id,
                isCorrect,
                correctOptionId: q.correct_option_id,
                explanation: q.explanation
            });
        });

        res.json({
            success: true,
            results: {
                score: lastAttempt.score,
                passed: lastAttempt.passed,
                attemptNumber: lastAttempt.attempt_number,
                earnedPoints,
                totalPoints,
                answers,
                feedback
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener último intento' });
    }
});

router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const quizId = req.params.id;
        const userId = req.user.id;

        // 1. Obtener datos del quiz
        const [quiz] = await db.query(
            'SELECT * FROM quizzes WHERE id = ? AND is_published = TRUE',
            [quizId]
        );

        if (!quiz) {
            return res.status(404).json({ error: 'Evaluación no encontrada' });
        }

        // 2. Verificar intentos previos
        const [attempts] = await db.query(
            'SELECT COUNT(*) as count FROM quiz_attempts WHERE user_id = ? AND quiz_id = ?',
            [userId, quizId]
        );

        if (attempts.count >= quiz.max_attempts) {
            // Pero si ya aprobó, tal vez quiera ver sus resultados (o permitirle ver el quiz si es modo estudio)
            // Por ahora, limitar estrictamente.
            const [lastAttempt] = await db.query(
                'SELECT passed FROM quiz_attempts WHERE user_id = ? AND quiz_id = ? ORDER BY attempt_number DESC LIMIT 1',
                [userId, quizId]
            );

            if (!lastAttempt?.passed) {
                return res.status(403).json({
                    error: 'Has alcanzado el máximo de intentos permitidos para esta evaluación',
                    attemptsMade: attempts.count,
                    maxAttempts: quiz.max_attempts
                });
            }
        }

        // 3. Obtener preguntas
        const questions = await db.query(
            'SELECT id, question_text, question_type, image_url, points, order_index FROM quiz_questions WHERE quiz_id = ? ORDER BY order_index ASC',
            [quizId]
        );

        // 4. Obtener opciones para cada pregunta
        for (let question of questions) {
            const options = await db.query(
                'SELECT id, option_text, order_index FROM quiz_options WHERE question_id = ? ORDER BY order_index ASC',
                [question.id]
            );
            question.options = options;
        }

        res.json({
            success: true,
            quiz,
            questions,
            attemptsMade: attempts.count,
            attemptsLeft: quiz.max_attempts - attempts.count
        });
    } catch (error) {
        console.error('Error al obtener quiz:', error);
        res.status(500).json({ error: 'Error al cargar la evaluación' });
    }
});

/**
 * @route   POST /api/quizzes/:id/submit
 * @desc    Enviar respuestas de un quiz y calificar
 * @access  Private
 */
router.post('/:id/submit', authMiddleware, async (req, res) => {
    try {
        const quizId = req.params.id;
        const userId = req.user.id;

        // Invalida el caché (incluyendo vista de estudiante)
        await clearCache(`cache:/api/dashboard*u${userId}*`);
        await clearCache(`cache:/api/gamification/leaderboard*`);
        await clearCache(`cache:/api/modules*u${userId}*`);
        await clearCache(`cache:/api/lessons/*u${userId}*`);
        await clearCache(`cache:/api/quizzes/${quizId}*u${userId}*`);
        const { answers, timeSpent } = req.body; // answers: { questionId: optionId }

        // 1. Obtener el quiz para saber el passing_score
        const [quiz] = await db.query('SELECT * FROM quizzes WHERE id = ?', [quizId]);
        if (!quiz) return res.status(404).json({ error: 'Quiz no encontrado' });

        // 2. Obtener respuestas correctas
        const questions = await db.query(
            `SELECT q.id, q.points, o.id as correct_option_id, q.explanation
             FROM quiz_questions q
             JOIN quiz_options o ON q.id = o.question_id
             WHERE q.quiz_id = ? AND o.is_correct = TRUE`,
            [quizId]
        );

        let totalPoints = 0;
        let earnedPoints = 0;
        const feedback = [];

        questions.forEach(q => {
            totalPoints += q.points;
            const userAnswer = answers[q.id];
            const isCorrect = userAnswer == q.correct_option_id;

            if (isCorrect) {
                earnedPoints += q.points;
            }

            feedback.push({
                questionId: q.id,
                isCorrect,
                correctOptionId: q.correct_option_id,
                explanation: q.explanation
            });
        });

        const score = (earnedPoints / totalPoints) * 100;
        const passed = score >= quiz.passing_score;

        // 3. Registrar el intento
        const [attempts] = await db.query(
            'SELECT COUNT(*) as count FROM quiz_attempts WHERE user_id = ? AND quiz_id = ?',
            [userId, quizId]
        );

        await db.query(
            `INSERT INTO quiz_attempts (user_id, quiz_id, attempt_number, score, passed, time_spent_minutes, started_at, completed_at, answers) 
             VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)`,
            [userId, quizId, attempts.count + 1, score, passed, timeSpent || 0, JSON.stringify(answers)]
        );

        // 4. Si aprobó, dar puntos de gamificación y marcar lección/módulo como completado
        let pointsAwarded = 0;
        if (passed) {
            const settings = await getSystemSettings();

            // Intentar obtener puntos específicos de la lección (definidos en lesson_contents)
            const contentEntries = await db.query(
                `SELECT points FROM lesson_contents 
                 WHERE content_type = 'quiz' 
                 AND JSON_UNQUOTE(JSON_EXTRACT(data, '$.quiz_id')) = ?`,
                [quizId]
            );

            let basePoints = 0;
            let isCustomPoints = false;

            if (contentEntries && contentEntries.length > 0 && contentEntries[0].points > 0) {
                basePoints = contentEntries[0].points;
                isCustomPoints = true;
            } else {
                basePoints = settings.points_per_quiz;
            }

            // Calcular puntos proporcionales: (nota / 100) * puntos_totales
            pointsAwarded = Math.round((score / 100) * basePoints);

            // Bonus solo si usamos puntos globales y sacó 100
            if (!isCustomPoints && score === 100) {
                pointsAwarded += settings.bonus_perfect_score;
            }

            // Actualizar puntos del usuario
            await db.query(
                `INSERT INTO user_points (user_id, points) VALUES (?, ?) 
                 ON DUPLICATE KEY UPDATE points = points + ?`,
                [userId, pointsAwarded, pointsAwarded]
            );

            // Registrar actividad
            await db.query(
                `INSERT INTO gamification_activities (user_id, activity_type, points_earned, reference_id) 
                 VALUES (?, 'quiz_passed', ?, ?)`,
                [userId, pointsAwarded, quizId]
            );
        }

        // Sincronizar nivel
        const levelSync = await syncUserLevel(userId);

        // Verificar si completó el módulo (considerando si es admin para incluir no publicados)
        const isAdmin = req.user.role === 'admin' && req.headers['x-view-as-student'] !== 'true';
        const moduleSync = await checkAndRecordModuleCompletion(userId, quiz.module_id, isAdmin);

        // Verificar insignias si aprobó
        let badgeSync = null;
        if (passed) {
            badgeSync = await checkAllBadges(userId, {
                moduleId: quiz.module_id,
                isModuleCompletion: moduleSync?.completed && moduleSync?.newlyRecorded
            });
        }

        // Obtener balance actualizado (siempre para asegurar que el navbar esté sincronizado)
        const [updatedStats] = await db.query(
            'SELECT points, level FROM user_points WHERE user_id = ?',
            [userId]
        );

        res.json({
            success: true,
            score,
            passed,
            earnedPoints,
            totalPoints,
            pointsAwarded,
            feedback,
            attemptNumber: attempts.count + 1,
            newBalance: updatedStats?.points || 0,
            newLevel: updatedStats?.level || 'Novato',
            levelUp: levelSync?.leveledUp || false,
            levelData: levelSync,
            moduleCompleted: moduleSync?.completed && moduleSync?.newlyRecorded,
            moduleData: moduleSync,
            badgeAwarded: badgeSync?.awarded ? badgeSync.badge : null
        });

    } catch (error) {
        console.error('Error al calificar quiz:', error);
        res.status(500).json({ error: 'Error al procesar los resultados' });
    }
});

// --- Admin Routes ---

/**
 * @route   POST /api/quizzes
 * @desc    Crear un nuevo quiz vinculado a una lección
 * @access  Private/Admin
 */
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { module_id, lesson_id, title, description, passing_score, time_limit_minutes, max_attempts, randomize_options } = req.body;

        const result = await db.query(
            `INSERT INTO quizzes (module_id, lesson_id, title, description, passing_score, time_limit_minutes, max_attempts, randomize_options, is_published)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
            [module_id, lesson_id, title, description || '', passing_score || 80, time_limit_minutes || 30, max_attempts || 3, randomize_options ? 1 : 0]
        );

        res.status(201).json({
            success: true,
            message: 'Quiz creado',
            quizId: result.insertId
        });
    } catch (error) {
        console.error('Error creando quiz:', error);
        res.status(500).json({ error: 'Error al crear la evaluación' });
    }
});

/**
 * @route   GET /api/quizzes/:id/admin
 * @desc    Obtener quiz completo con respuestas correctas para edición
 * @access  Private/Admin
 */
router.get('/:id/admin', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const quizId = req.params.id;

        const [quiz] = await db.query('SELECT * FROM quizzes WHERE id = ?', [quizId]);
        if (!quiz) return res.status(404).json({ error: 'Quiz no encontrado' });

        const questions = await db.query(
            'SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY order_index ASC',
            [quizId]
        );

        for (let question of questions) {
            const options = await db.query(
                'SELECT * FROM quiz_options WHERE question_id = ? ORDER BY order_index ASC',
                [question.id]
            );
            question.options = options;
        }

        res.json({ success: true, quiz, questions });
    } catch (error) {
        res.status(500).json({ error: 'Error al cargar datos de edición' });
    }
});

/**
 * @route   PUT /api/quizzes/:id
 * @desc    Actualizar datos básicos del quiz
 */
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { title, description, passing_score, time_limit_minutes, max_attempts, randomize_options } = req.body;
        await db.query(
            `UPDATE quizzes SET title = ?, description = ?, passing_score = ?, time_limit_minutes = ?, max_attempts = ?, randomize_options = ?
             WHERE id = ?`,
            [title, description, passing_score, time_limit_minutes, max_attempts, randomize_options ? 1 : 0, req.params.id]
        );
        res.json({ success: true, message: 'Quiz actualizado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar' });
    }
});

/**
 * @route   POST /api/quizzes/:id/questions
 * @desc    Agregar una pregunta a un quiz
 */
router.post('/:id/questions', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { question_text, question_type, image_url, points, order_index, explanation, options } = req.body;
        const quizId = req.params.id;

        // 1. Insertar pregunta
        const result = await db.query(
            `INSERT INTO quiz_questions (quiz_id, question_text, question_type, image_url, points, order_index, explanation)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [quizId, question_text, question_type || 'multiple_choice', image_url || null, points || 1, order_index || 0, explanation || '']
        );
        const questionId = result.insertId;

        // 2. Insertar opciones si vienen
        if (options && Array.isArray(options)) {
            for (let opt of options) {
                await db.query(
                    `INSERT INTO quiz_options (question_id, option_text, is_correct, order_index)
                     VALUES (?, ?, ?, ?)`,
                    [questionId, opt.option_text, opt.is_correct ? 1 : 0, opt.order_index || 0]
                );
            }
        }

        res.status(201).json({ success: true, questionId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al agregar pregunta' });
    }
});

/**
 * @route   PUT /api/quizzes/questions/:questionId
 * @desc    Actualizar pregunta y sus opciones (reemplazo completo de opciones por simplicidad en este caso)
 */
router.put('/questions/:questionId', authMiddleware, adminMiddleware, async (req, res) => {
    const connection = await db.pool.getConnection();
    try {
        const { question_text, question_type, image_url, points, order_index, explanation, options } = req.body;
        const { questionId } = req.params;

        await connection.beginTransaction();

        // 1. Update question
        await connection.query(
            `UPDATE quiz_questions SET question_text = ?, question_type = ?, image_url = ?, points = ?, order_index = ?, explanation = ?
             WHERE id = ?`,
            [question_text, question_type, image_url, points, order_index, explanation, questionId]
        );

        // 2. Delete old options and insert new ones (simpler than selective update)
        if (options && Array.isArray(options)) {
            await connection.query('DELETE FROM quiz_options WHERE question_id = ?', [questionId]);
            for (let opt of options) {
                await connection.query(
                    `INSERT INTO quiz_options (question_id, option_text, is_correct, order_index)
                     VALUES (?, ?, ?, ?)`,
                    [questionId, opt.option_text, opt.is_correct ? 1 : 0, opt.order_index || 0]
                );
            }
        }

        await connection.commit();
        res.json({ success: true, message: 'Pregunta actualizada' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar pregunta' });
    } finally {
        connection.release();
    }
});

/**
 * @route   DELETE /api/quizzes/questions/:questionId
 */
router.delete('/questions/:questionId', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await db.query('DELETE FROM quiz_questions WHERE id = ?', [req.params.questionId]);
        res.json({ success: true, message: 'Pregunta eliminada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar' });
    }
});

/**
 * @route   DELETE /api/quizzes/:id
 */
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await db.query('DELETE FROM quizzes WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Quiz eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar' });
    }
});

module.exports = router;
