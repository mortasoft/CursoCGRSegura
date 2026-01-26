const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { createNotification } = require('../utils/notifications');

/**
 * @route   GET /api/quizzes/:id
 * @desc    Obtener un quiz con sus preguntas y opciones
 * @access  Private
 */
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
            'SELECT id, question_text, question_type, points, order_index FROM quiz_questions WHERE quiz_id = ? ORDER BY order_index ASC',
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
            pointsAwarded = 50; // Punto base por examen aprobado
            if (score === 100) pointsAwarded += 25; // Bonus por score perfecto

            // Actualizar puntos del usuario
            await db.query(
                `INSERT INTO user_points (user_id, points) VALUES (?, ?) 
                 ON DUPLICATE KEY UPDATE points = points + ?`,
                [userId, pointsAwarded, pointsAwarded]
            );

            // Registrar actividad
            await db.query(
                `INSERT INTO gamification_activities (user_id, type, points, reference_id) 
                 VALUES (?, 'quiz_passed', ?, ?)`,
                [userId, pointsAwarded, quizId]
            );

            // Marcar lección asociada como completada si existe
            if (quiz.lesson_id) {
                await db.query(
                    `INSERT INTO user_progress (user_id, module_id, lesson_id, status, progress_percentage, completed_at) 
                     VALUES (?, ?, ?, 'completed', 100, NOW())
                     ON DUPLICATE KEY UPDATE status = 'completed', progress_percentage = 100, completed_at = NOW()`,
                    [userId, quiz.module_id, quiz.lesson_id]
                );
            }

            // Notificación de éxito
            await createNotification(
                userId,
                '¡Certificación Aprobada! 🏆',
                `Aprobaste la evaluación "${quiz.title}" con un ${score.toFixed(1)}%. ¡Excelente trabajo!`,
                'success',
                `/modules/${quiz.module_id}`
            );
        } else {
            // Notificación de fallo
            await createNotification(
                userId,
                'Resultado de Evaluación 📝',
                `No has alcanzado la nota mínima en "${quiz.title}" (${score.toFixed(1)}%). Revisa el contenido e inténtalo de nuevo.`,
                'warning',
                `/quizzes/${quizId}`
            );
        }

        res.json({
            success: true,
            score,
            passed,
            earnedPoints,
            totalPoints,
            pointsAwarded,
            feedback
        });

    } catch (error) {
        console.error('Error al calificar quiz:', error);
        res.status(500).json({ error: 'Error al procesar los resultados' });
    }
});

module.exports = router;
