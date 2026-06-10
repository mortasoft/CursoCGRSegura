const db = require('../config/database');
const logger = require('../config/logger');

class SurveyService {
    /**
     * Obtener una encuesta por su ID con sus preguntas, opciones y estado de finalización del usuario
     */
    async getSurveyById(surveyId, userId) {
        // 1. Obtener datos de la encuesta
        const [survey] = await db.query(
            'SELECT * FROM surveys WHERE id = ?',
            [surveyId]
        );

        if (!survey) return null;

        // Buscar puntos en lesson_contents para sincronizar con la lección
        const contentRows = await db.query(
            "SELECT points FROM lesson_contents WHERE content_type = 'survey' AND JSON_VALUE(data, '$.survey_id') = ?",
            [surveyId]
        );

        if (contentRows.length > 0) {
            survey.points = contentRows[0].points;
        }

        // 2. Verificar si el usuario ya respondió
        const responses = await db.query(
            'SELECT id, submitted_at FROM survey_responses WHERE user_id = ? AND survey_id = ?',
            [userId, surveyId]
        );

        // 3. Obtener preguntas
        const questions = await db.query(
            'SELECT id, question_text, question_type, order_index, is_required FROM survey_questions WHERE survey_id = ? ORDER BY order_index ASC',
            [surveyId]
        );

        // 4. Obtener opciones para cada pregunta
        for (let question of questions) {
            if (question.question_type !== 'text') {
                const options = await db.query(
                    'SELECT id, option_text, order_index FROM survey_options WHERE question_id = ? ORDER BY order_index ASC',
                    [question.id]
                );
                question.options = options;
            }
        }

        return {
            survey,
            questions,
            isCompleted: responses.length > 0,
            submittedAt: responses.length > 0 ? responses[0].submitted_at : null
        };
    }

    /**
     * Enviar y procesar respuestas de una encuesta, sumando puntos de forma transaccional
     */
    async submitSurvey(surveyId, userId, answers) {
        const connection = await db.pool.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Verificar si ya respondió
            const [existing] = await connection.query(
                'SELECT id FROM survey_responses WHERE user_id = ? AND survey_id = ?',
                [userId, surveyId]
            );

            if (existing.length > 0) {
                await connection.rollback();
                return { success: false, reason: 'already_completed' };
            }

            // 2. Crear la respuesta
            const [responseResult] = await connection.query(
                'INSERT INTO survey_responses (survey_id, user_id) VALUES (?, ?)',
                [surveyId, userId]
            );
            const responseId = responseResult.insertId;

            // 3. Guardar cada respuesta individual
            if (answers && typeof answers === 'object') {
                const answerEntries = Object.entries(answers);
                logger.info(`Procesando ${answerEntries.length} respuestas para encuesta ${surveyId}`);
                
                for (const [qId, ans] of answerEntries) {
                    await connection.query(
                        'INSERT INTO survey_answers (response_id, question_id, answer_text, option_id) VALUES (?, ?, ?, ?)',
                        [responseId, qId, ans.text || null, ans.optionId || null]
                    );
                }
            }

            // 4. Otorgar puntos de gamificación
            let pointsAwarded = 0;
            const [contentRows] = await connection.query(
                "SELECT points FROM lesson_contents WHERE content_type = 'survey' AND JSON_VALUE(data, '$.survey_id') = ?",
                [surveyId]
            );

            if (contentRows && contentRows.length > 0) {
                pointsAwarded = contentRows[0].points;
            } else {
                const [surveyRows] = await connection.query('SELECT points FROM surveys WHERE id = ?', [surveyId]);
                if (surveyRows && surveyRows.length > 0) {
                    pointsAwarded = surveyRows[0].points || 0;
                }
            }

            if (pointsAwarded > 0) {
                await connection.query(
                    'INSERT INTO user_points (user_id, points) VALUES (?, ?) ON DUPLICATE KEY UPDATE points = points + ?',
                    [userId, pointsAwarded, pointsAwarded]
                );
                await connection.query(
                    'INSERT INTO gamification_activities (user_id, activity_type, points_earned, reference_id) VALUES (?, "survey_completed", ?, ?)',
                    [userId, pointsAwarded, surveyId]
                );
            }

            await connection.commit();
            return { success: true, pointsAwarded };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Obtener todas las encuestas registradas con sus estadísticas básicas
     */
    async getAllSurveys() {
        return await db.query(`
            SELECT 
                s.id, s.title, s.description, s.points, s.created_at,
                m.title as module_title, 
                l.title as lesson_title,
                (SELECT COUNT(*) FROM survey_responses sr WHERE sr.survey_id = s.id) as response_count
            FROM surveys s
            LEFT JOIN modules m ON s.module_id = m.id
            LEFT JOIN lessons l ON s.lesson_id = l.id
            ORDER BY s.id DESC
        `);
    }

    /**
     * Crear una encuesta
     */
    async createSurvey({ module_id, lesson_id, title, description, points }) {
        const result = await db.query(
            'INSERT INTO surveys (module_id, lesson_id, title, description, points) VALUES (?, ?, ?, ?, ?)',
            [module_id, lesson_id, title, description || '', points || 0]
        );
        return result.insertId;
    }

    /**
     * Obtener encuesta y preguntas configuradas (Admin)
     */
    async getQuizAdmin(surveyId) {
        const [survey] = await db.query('SELECT * FROM surveys WHERE id = ?', [surveyId]);
        if (!survey) return null;

        const questions = await db.query(
            'SELECT * FROM survey_questions WHERE survey_id = ? ORDER BY order_index ASC',
            [surveyId]
        );

        for (let question of questions) {
            const options = await db.query(
                'SELECT * FROM survey_options WHERE question_id = ? ORDER BY order_index ASC',
                [question.id]
            );
            question.options = options;
        }

        return { survey, questions };
    }

    /**
     * Actualizar una encuesta
     */
    async updateSurvey(surveyId, { title, description, points }) {
        return await db.query(
            'UPDATE surveys SET title = ?, description = ?, points = ? WHERE id = ?',
            [title, description, points, surveyId]
        );
    }

    /**
     * Agregar una pregunta a una encuesta
     */
    async addQuestion(surveyId, { question_text, question_type, is_required, order_index, options }) {
        const result = await db.query(
            'INSERT INTO survey_questions (survey_id, question_text, question_type, is_required, order_index) VALUES (?, ?, ?, ?, ?)',
            [surveyId, question_text, question_type, is_required ? 1 : 0, order_index || 0]
        );
        const questionId = result.insertId;

        if (options && Array.isArray(options)) {
            for (let opt of options) {
                await db.query(
                    'INSERT INTO survey_options (question_id, option_text, order_index) VALUES (?, ?, ?)',
                    [questionId, opt.option_text, opt.order_index || 0]
                );
            }
        }
        return questionId;
    }

    /**
     * Actualizar una pregunta y sus opciones
     */
    async updateQuestion(questionId, { question_text, question_type, is_required, order_index, options }) {
        const connection = await db.pool.getConnection();
        try {
            await connection.beginTransaction();

            await connection.query(
                'UPDATE survey_questions SET question_text = ?, question_type = ?, is_required = ?, order_index = ? WHERE id = ?',
                [question_text, question_type, is_required ? 1 : 0, order_index, questionId]
            );

            if (options && Array.isArray(options)) {
                await connection.query('DELETE FROM survey_options WHERE question_id = ?', [questionId]);
                for (let opt of options) {
                    await connection.query(
                        'INSERT INTO survey_options (question_id, option_text, order_index) VALUES (?, ?, ?)',
                        [questionId, opt.option_text, opt.order_index || 0]
                    );
                }
            }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Eliminar una pregunta
     */
    async deleteQuestion(questionId) {
        return await db.query('DELETE FROM survey_questions WHERE id = ?', [questionId]);
    }

    /**
     * Obtener respuestas de texto paginadas para una pregunta
     */
    async getTextAnswers(questionId, page, limit, search) {
        const offset = (page - 1) * limit;

        let queryStr = 'SELECT answer_text as text FROM survey_answers WHERE question_id = ? AND answer_text IS NOT NULL AND answer_text != ""';
        let countQueryStr = 'SELECT COUNT(*) as total FROM survey_answers WHERE question_id = ? AND answer_text IS NOT NULL AND answer_text != ""';
        const params = [questionId];

        if (search) {
            queryStr += ' AND answer_text LIKE ?';
            countQueryStr += ' AND answer_text LIKE ?';
            params.push(`%${search}%`);
        }

        const [countResult] = await db.query(countQueryStr, params);
        const total = countResult ? countResult.total : 0;

        queryStr += ' ORDER BY id DESC LIMIT ? OFFSET ?';
        const answers = await db.query(queryStr, [...params, limit, offset]);

        return {
            answers,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    /**
     * Eliminar una encuesta
     */
    async deleteSurvey(surveyId) {
        return await db.query('DELETE FROM surveys WHERE id = ?', [surveyId]);
    }

    /**
     * Obtener analíticas de una encuesta
     */
    async getSurveyAnalytics(surveyId) {
        const [survey] = await db.query('SELECT title, description FROM surveys WHERE id = ?', [surveyId]);
        if (!survey) return null;

        const [respCount] = await db.query('SELECT COUNT(*) as total FROM survey_responses WHERE survey_id = ?', [surveyId]);
        const totalResponses = respCount.total;

        const questions = await db.query(
            'SELECT id, question_text, question_type, order_index FROM survey_questions WHERE survey_id = ? ORDER BY order_index ASC',
            [surveyId]
        );

        const analytics = [];

        for (const q of questions) {
            let data = [];
            const qType = q.question_type?.toLowerCase();

            if (qType === 'rating') {
                const counts = await db.query(
                    'SELECT answer_text as label, COUNT(*) as value FROM survey_answers WHERE question_id = ? GROUP BY answer_text',
                    [q.id]
                );
                for (let i = 1; i <= 5; i++) {
                    const found = counts.find(c => parseInt(c.label) === i);
                    data.push({ label: `${i}★`, value: found ? found.value : 0 });
                }
            } 
            else if (qType === 'multiple_choice') {
                data = await db.query(
                    `SELECT so.option_text as label, COUNT(sa.id) as value 
                     FROM survey_options so 
                     LEFT JOIN survey_answers sa ON so.id = sa.option_id 
                     WHERE so.question_id = ? 
                     GROUP BY so.id 
                     ORDER BY so.order_index ASC`,
                    [q.id]
                );
            }
            else if (qType === 'text') {
                const [countResult] = await db.query(
                    'SELECT COUNT(*) as total FROM survey_answers WHERE question_id = ? AND answer_text IS NOT NULL AND answer_text != ""',
                    [q.id]
                );
                const total = countResult ? countResult.total : 0;

                const answers = await db.query(
                    'SELECT answer_text as text FROM survey_answers WHERE question_id = ? AND answer_text IS NOT NULL AND answer_text != "" ORDER BY id DESC LIMIT 5',
                    [q.id]
                );

                data = {
                    answers,
                    total,
                    page: 1,
                    limit: 5,
                    totalPages: Math.ceil(total / 5)
                };
            }

            analytics.push({
                questionId: q.id,
                text: q.question_text,
                type: q.question_type,
                data: data
            });
        }

        return {
            survey: {
                id: surveyId,
                title: survey.title,
                totalResponses
            },
            analytics
        };
    }

    /**
     * Obtener encuesta id para una lección específica
     */
    async getSurveyIdByLesson(lessonId) {
        const [survey] = await db.query('SELECT id FROM surveys WHERE lesson_id = ? LIMIT 1', [lessonId]);
        if (survey) return survey.id;

        const [content] = await db.query(
            "SELECT JSON_VALUE(data, '$.survey_id') as survey_id FROM lesson_contents WHERE lesson_id = ? AND content_type = 'survey' LIMIT 1",
            [lessonId]
        );
        return content ? content.survey_id : null;
    }

    /**
     * Obtener datos para la exportación de resultados
     */
    async getSurveyExportData(surveyId) {
        const [survey] = await db.query('SELECT title FROM surveys WHERE id = ?', [surveyId]);
        if (!survey) return null;

        const questions = await db.query(
            'SELECT id, question_text FROM survey_questions WHERE survey_id = ? ORDER BY order_index ASC',
            [surveyId]
        );

        const rows = await db.query(`
            SELECT 
                u.email as usuario,
                sr.submitted_at as fecha,
                sa.question_id,
                COALESCE(sa.answer_text, so.option_text) as respuesta,
                sr.id as response_id
            FROM survey_responses sr
            JOIN users u ON sr.user_id = u.id
            JOIN survey_answers sa ON sr.id = sa.response_id
            LEFT JOIN survey_options so ON sa.option_id = so.id
            WHERE sr.survey_id = ?
            ORDER BY sr.submitted_at DESC, sr.id DESC
        `, [surveyId]);

        return {
            title: survey.title,
            questions,
            rows
        };
    }
}

module.exports = new SurveyService();
