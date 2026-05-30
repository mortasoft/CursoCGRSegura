const db = require('../config/database');
const logger = require('../config/logger');
const { syncUserLevel, getSystemSettings, checkAndRecordModuleCompletion } = require('../utils/gamification');
const { checkAllBadges } = require('../utils/badges');

const GAME_QUESTION_TYPES = ['mfa_defender', 'hack_neighbor', 'data_tetris'];

class QuizService {
    async getQuizById(quizId, userId) {
        const [quiz] = await db.query(
            'SELECT * FROM quizzes WHERE id = ? AND is_published = TRUE',
            [quizId]
        );

        if (!quiz) return null;

        const [attempts] = await db.query(
            'SELECT COUNT(*) as count FROM quiz_attempts WHERE user_id = ? AND quiz_id = ?',
            [userId, quizId]
        );

        const questions = await db.query(
            'SELECT id, question_text, question_type, image_url, points, order_index, data, explanation FROM quiz_questions WHERE quiz_id = ? ORDER BY order_index ASC',
            [quizId]
        );

        for (let question of questions) {
            // Parse data field if it's a string
            if (question.data && typeof question.data === 'string') {
                try {
                    question.data = JSON.parse(question.data);
                } catch (e) {
                    logger.error(`Error parsing question data for question ${question.id}:`, e);
                    question.data = {};
                }
            } else if (!question.data) {
                question.data = {};
            }

            const options = await db.query(
                'SELECT id, option_text, order_index FROM quiz_options WHERE question_id = ? ORDER BY order_index ASC',
                [question.id]
            );
            question.options = options;
        }

        return {
            quiz,
            questions,
            attemptsMade: attempts.count,
            attemptsLeft: Math.max(0, quiz.max_attempts - attempts.count)
        };
    }

    _calculateQuestionScore(q, userAnswer) {
        let isCorrect = false;
        let earnedPoints = 0;
        let penaltyApplied = 0;

        if (q.question_type === 'video') {
            isCorrect = true;
            earnedPoints = q.points || 0;
        } else if (GAME_QUESTION_TYPES.includes(q.question_type)) {
            console.log(`[QuizScore] Scrutinizing ${q.question_type} Q#${q.id}:`, { userAnswer });
            
            if (typeof userAnswer === 'object' && userAnswer !== null) {
                isCorrect = userAnswer.success === true || userAnswer.success === 'true';
                
                let qData = {};
                try {
                    qData = typeof q.data === 'string' ? JSON.parse(q.data) : (q.data || {});
                } catch (e) {
                    console.error(`[QuizScore] Error parsing question data for Q#${q.id}:`, e);
                }

                if (q.question_type === 'hack_neighbor') {
                    const hintsUsed = parseInt(userAnswer.hintsUsed) || 0;
                    const penaltyPerHint = parseInt(qData.hint_penalty) || 0;
                    penaltyApplied = hintsUsed * penaltyPerHint;
                    earnedPoints = Math.max(0, q.points - penaltyApplied);
                } else if (q.question_type === 'mfa_defender') {
                    const mfaFails = parseInt(userAnswer.mfaFails) || 0;
                    const failPenalty = parseInt(qData.fail_penalty) || 10;
                    
                    // Calculamos puntos basados en fallos acumulados
                    earnedPoints = Math.max(0, q.points - (mfaFails * failPenalty));
                    
                    // Si el usuario "perdió" (timeout), aún le damos los puntos que logró salvar 
                    // ya que ahora no permitimos reintentar en quices.
                    // Pero isCorrect sigue reflejando si la defensa fue exitosa.
                } else if (q.question_type === 'data_tetris') {
                    if (isCorrect) {
                        const finalScore = parseInt(userAnswer.score) || 0;
                        const minScore = parseInt(qData.min_score) || 500;
                        const difficulty = userAnswer.difficulty || qData.difficulty || 'easy';
                        
                        let bonusMultiplier = 0;
                        if (finalScore >= minScore * 3) bonusMultiplier = 1.0; // Leyenda
                        else if (finalScore >= minScore * 2) bonusMultiplier = 0.5; // Maestro
                        else if (finalScore >= minScore * 1.5) bonusMultiplier = 0.25; // Experto
                        
                        let diffMultiplier = 1.0;
                        if (difficulty === 'medium') diffMultiplier = 1.2;
                        else if (difficulty === 'hard') diffMultiplier = 1.5;
                        
                        earnedPoints = Math.round((q.points * (1 + bonusMultiplier)) * diffMultiplier);
                    }
                } else {
                    if (isCorrect) earnedPoints = q.points;
                }
            } else {
                console.log(`[QuizScore] Answer for Q#${q.id} is NOT an object:`, userAnswer);
                isCorrect = userAnswer === true || userAnswer === 'true';
                if (isCorrect) earnedPoints = q.points;
            }
        }

        return { isCorrect, earnedPoints, penaltyApplied };
    }

    async getLastAttempt(quizId, userId) {
        const [lastAttempt] = await db.query(
            'SELECT answers, score, passed, attempt_number FROM quiz_attempts WHERE user_id = ? AND quiz_id = ? ORDER BY attempt_number DESC LIMIT 1',
            [userId, quizId]
        );

        if (!lastAttempt) return null;

        const questions = await db.query(
            `SELECT q.id, q.question_type, q.points, q.data, o.id as correct_option_id, q.explanation
             FROM quiz_questions q
             LEFT JOIN quiz_options o ON q.id = o.question_id AND o.is_correct = TRUE
             WHERE q.quiz_id = ?`,
            [quizId]
        );

        const answers = typeof lastAttempt.answers === 'string' ? JSON.parse(lastAttempt.answers) : (lastAttempt.answers || {});
        let earnedPointsTotal = 0;
        let totalPoints = 0;

        const feedback = [];
        questions.forEach(q => {
            totalPoints += q.points;
            const userAnswer = answers[q.id];
            
            let isCorrect = false;
            let earnedPoints = 0;
            let penaltyApplied = 0;

            if (q.question_type === 'video') {
                isCorrect = true;
                earnedPoints = q.points || 0;
            } else if (GAME_QUESTION_TYPES.includes(q.question_type)) {
                const scoring = this._calculateQuestionScore(q, userAnswer);
                isCorrect = scoring.isCorrect;
                earnedPoints = scoring.earnedPoints;
                penaltyApplied = scoring.penaltyApplied;
            } else {
                isCorrect = userAnswer == q.correct_option_id;
                if (isCorrect) earnedPoints = q.points;
            }

            earnedPointsTotal += earnedPoints;
            
            feedback.push({
                questionId: q.id,
                isCorrect,
                userAnswerId: userAnswer,
                correctOptionId: q.correct_option_id,
                explanation: q.explanation,
                earnedPoints,
                maxPoints: q.points,
                penaltyApplied
            });
        });

        return {
            score: lastAttempt.score,
            passed: lastAttempt.passed,
            attemptNumber: lastAttempt.attempt_number,
            earnedPoints: earnedPointsTotal,
            totalPoints,
            answers,
            feedback
        };
    }

    async submitQuiz(quizId, userId, data, isAdminView) {
        const { answers, timeSpent, is_replay } = data;

        const [quiz] = await db.query('SELECT * FROM quizzes WHERE id = ?', [quizId]);
        if (!quiz) throw new Error('Evaluación no encontrada');

        const [attempts] = await db.query(
            'SELECT COUNT(*) as count FROM quiz_attempts WHERE user_id = ? AND quiz_id = ?',
            [userId, quizId]
        );

        // Only check max attempts if not replaying
        if (!is_replay && attempts.count >= quiz.max_attempts) {
            throw new Error('Máximo de intentos alcanzado');
        }

        const questions = await db.query(
            `SELECT q.id, q.question_type, q.points, q.data, o.id as correct_option_id, q.explanation
             FROM quiz_questions q
             LEFT JOIN quiz_options o ON q.id = o.question_id AND o.is_correct = TRUE
             WHERE q.quiz_id = ?`,
            [quizId]
        );

        let totalPoints = 0;
        let earnedPoints = 0;
        const feedback = [];

        questions.forEach(q => {
            totalPoints += q.points;
            const userAnswer = answers[q.id];
            
            let isCorrect = false;
            let earnedPointsForThisQ = 0;
            let penaltyApplied = 0;

            if (q.question_type === 'video') {
                isCorrect = true;
                earnedPointsForThisQ = q.points || 0;
            } else if (GAME_QUESTION_TYPES.includes(q.question_type)) {
                const scoring = this._calculateQuestionScore(q, userAnswer);
                isCorrect = scoring.isCorrect;
                earnedPointsForThisQ = scoring.earnedPoints;
                penaltyApplied = scoring.penaltyApplied;
            } else {
                isCorrect = userAnswer == q.correct_option_id;
                if (isCorrect) earnedPointsForThisQ = q.points;
            }

            earnedPoints += earnedPointsForThisQ;

            feedback.push({
                questionId: q.id,
                isCorrect,
                correctOptionId: q.correct_option_id,
                explanation: q.explanation,
                earnedPoints: earnedPointsForThisQ,
                maxPoints: q.points,
                penaltyApplied
            });
        });

        const score = (earnedPoints / totalPoints) * 100;
        const passed = score >= quiz.passing_score;

        // If it's a replay, return results but don't save anything
        if (is_replay) {
            let badgeAwarded = null;
            if (passed) {
                const badgeCheck = await checkAllBadges(userId, { isReplay: true, passed: true });
                if (badgeCheck.awarded) {
                    badgeAwarded = badgeCheck.badge;
                }
            }

            return {
                score,
                passed,
                earnedPoints,
                totalPoints,
                pointsAwarded: 0,
                penaltyApplied: 0,
                feedback,
                isReplay: true,
                attemptNumber: attempts.count, // Just informative
                newBalance: undefined,
                newLevel: undefined,
                moduleCompleted: false,
                badgeAwarded
            };
        }

        await db.query(
            `INSERT INTO quiz_attempts (user_id, quiz_id, attempt_number, score, passed, time_spent_minutes, started_at, completed_at, answers) 
             VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)`,
            [userId, quizId, attempts.count + 1, score, passed, timeSpent || 0, JSON.stringify(answers)]
        );

        let pointsAwarded = 0;
        let penaltyApplied = 0;

        const settings = await getSystemSettings();
        const contentEntries = await db.query(
            `SELECT points FROM lesson_contents 
             WHERE content_type = 'quiz' 
             AND JSON_UNQUOTE(JSON_EXTRACT(data, '$.quiz_id')) = ?`,
            [quizId]
        );

        let basePoints = 0;
        let isCustomPoints = false;

        if (contentEntries?.[0]?.points > 0) {
            basePoints = contentEntries[0].points;
            isCustomPoints = true;
        } else {
            basePoints = settings.points_per_quiz;
        }

        if (passed) {
            const hasDataTetris = questions.some(q => q.question_type === 'data_tetris');
            let potentialPoints;

            if (hasDataTetris) {
                // Para Data Tetris, los puntos ya vienen calculados con los multiplicadores
                // de dificultad y rango desde _calculateQuestionScore. Usar ese valor directamente.
                const tetrisFeedback = feedback.find(f => {
                    const q = questions.find(qq => qq.id === f.questionId);
                    return q && q.question_type === 'data_tetris';
                });
                potentialPoints = tetrisFeedback ? tetrisFeedback.earnedPoints : earnedPoints;
            } else {
                potentialPoints = Math.round((score / 100) * basePoints);
                const failedAttempts = attempts.count;
                if (failedAttempts > 0) {
                    const penaltyFactor = Math.max(0, 1 - (failedAttempts * 0.1));
                    const originalPoints = potentialPoints;
                    potentialPoints = Math.round(potentialPoints * penaltyFactor);
                    penaltyApplied = originalPoints - potentialPoints;
                }
                if (!isCustomPoints && score === 100 && attempts.count === 0) {
                    potentialPoints += settings.bonus_perfect_score;
                }
            }

            // Query points already awarded to user for this quiz
            const [pointsEarnedRows] = await db.query(
                "SELECT COALESCE(SUM(points_earned), 0) as total FROM gamification_activities WHERE user_id = ? AND activity_type = 'quiz_passed' AND reference_id = ?",
                [userId, quizId]
            );
            const pointsAlreadyAwarded = parseInt(pointsEarnedRows?.total) || 0;

            // Only award the difference if this attempt yields more points
            pointsAwarded = Math.max(0, potentialPoints - pointsAlreadyAwarded);

            if (pointsAwarded > 0) {
                await db.query(
                    `INSERT INTO user_points (user_id, points) VALUES (?, ?) 
                     ON DUPLICATE KEY UPDATE points = points + ?`,
                    [userId, pointsAwarded, pointsAwarded]
                );
                await db.query(
                    `INSERT INTO gamification_activities (user_id, activity_type, points_earned, reference_id) 
                     VALUES (?, 'quiz_passed', ?, ?)`,
                    [userId, pointsAwarded, quizId]
                );
            }
        }

        const moduleSync = await checkAndRecordModuleCompletion(userId, quiz.module_id, isAdminView);
        const levelSync = await syncUserLevel(userId);
        
        let badgeSync = null;
        if (passed) {
            badgeSync = await checkAllBadges(userId, {
                moduleId: quiz.module_id,
                isModuleCompletion: moduleSync?.completed && moduleSync?.newlyRecorded
            });
        }

        const [updatedStats] = await db.query('SELECT points, level FROM user_points WHERE user_id = ?', [userId]);

        return {
            score,
            passed,
            earnedPoints,
            totalPoints,
            pointsAwarded,
            penaltyApplied,
            feedback,
            attemptNumber: attempts.count + 1,
            newBalance: updatedStats?.points || 0,
            newLevel: updatedStats?.level || 'Novato',
            levelUp: levelSync?.leveledUp || false,
            levelData: levelSync,
            moduleCompleted: moduleSync?.completed && moduleSync?.newlyRecorded,
            moduleData: moduleSync,
            badgeAwarded: badgeSync?.awarded ? badgeSync.badges : null
        };
    }

    // Admin Methods
    async createQuiz(data) {
        const { module_id, lesson_id, title, description, passing_score, time_limit_minutes, max_attempts, randomize_options } = data;
        const result = await db.query(
            `INSERT INTO quizzes (module_id, lesson_id, title, description, passing_score, time_limit_minutes, max_attempts, randomize_options, is_published)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
            [module_id, lesson_id, title, description || '', passing_score || 80, time_limit_minutes || 30, max_attempts || 3, randomize_options ? 1 : 0]
        );
        return result.insertId;
    }

    async getQuizAdmin(quizId) {
        const [quiz] = await db.query('SELECT * FROM quizzes WHERE id = ?', [quizId]);
        if (!quiz) return null;

        const questions = await db.query('SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY order_index ASC', [quizId]);
        for (let question of questions) {
            question.options = await db.query('SELECT * FROM quiz_options WHERE question_id = ? ORDER BY order_index ASC', [question.id]);
        }
        return { quiz, questions };
    }

    async updateQuiz(quizId, data) {
        const { title, description, passing_score, time_limit_minutes, max_attempts, randomize_options, is_published } = data;
        return await db.query(
            `UPDATE quizzes SET 
                title = COALESCE(?, title), 
                description = COALESCE(?, description), 
                passing_score = COALESCE(?, passing_score), 
                time_limit_minutes = COALESCE(?, time_limit_minutes), 
                max_attempts = COALESCE(?, max_attempts), 
                randomize_options = COALESCE(?, randomize_options),
                is_published = COALESCE(?, is_published)
             WHERE id = ?`,
            [
                title ?? null, 
                description ?? null, 
                passing_score ?? null, 
                time_limit_minutes ?? null, 
                max_attempts ?? null, 
                randomize_options !== undefined ? (randomize_options ? 1 : 0) : null,
                is_published !== undefined ? (is_published ? 1 : 0) : null,
                quizId
            ]
        );
    }

    async addQuestion(quizId, dataIn) {
        const { question_text, question_type, image_url, points, order_index, explanation, options, data } = dataIn;
        const result = await db.query(
            `INSERT INTO quiz_questions (quiz_id, question_text, question_type, image_url, points, order_index, explanation, data)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [quizId, question_text, question_type || 'multiple_choice', image_url || null, points || 1, order_index || 0, explanation || '', data ? JSON.stringify(data) : null]
        );
        const questionId = result.insertId;

        if (options && Array.isArray(options)) {
            for (let opt of options) {
                await db.query(
                    `INSERT INTO quiz_options (question_id, option_text, is_correct, order_index)
                     VALUES (?, ?, ?, ?)`,
                    [questionId, opt.option_text, opt.is_correct ? 1 : 0, opt.order_index || 0]
                );
            }
        }
        return questionId;
    }

    async updateQuestion(questionId, dataIn) {
        const connection = await db.pool.getConnection();
        try {
            const { question_text, question_type, image_url, points, order_index, explanation, options, data } = dataIn;
            await connection.beginTransaction();

            await connection.query(
                `UPDATE quiz_questions SET 
                    question_text = COALESCE(?, question_text), 
                    question_type = COALESCE(?, question_type), 
                    image_url = COALESCE(?, image_url), 
                    points = COALESCE(?, points), 
                    order_index = COALESCE(?, order_index), 
                    explanation = COALESCE(?, explanation),
                    data = COALESCE(?, data)
                 WHERE id = ?`,
                [
                    question_text ?? null, 
                    question_type ?? null, 
                    image_url ?? null, 
                    points ?? null, 
                    order_index ?? null, 
                    explanation ?? null, 
                    data ? JSON.stringify(data) : null,
                    questionId
                ]
            );

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
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async deleteQuestion(questionId) {
        return await db.query('DELETE FROM quiz_questions WHERE id = ?', [questionId]);
    }

    async deleteQuiz(quizId) {
        return await db.query('DELETE FROM quizzes WHERE id = ?', [quizId]);
    }
}

module.exports = new QuizService();
