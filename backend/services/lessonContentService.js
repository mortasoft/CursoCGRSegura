const db = require('../config/database');
const xss = require('xss');
const path = require('path');
const logger = require('../config/logger');
const { TRACEABLE_CONTENT_TYPES } = require('../constants/contentTypes');

class LessonContentService {
    async getLessonContents(lessonId, userId) {
        const contents = await db.query(
            `SELECT lc.*, 
                asub.id as asub_id,
                asub.file_url as asub_file_url,
                asub.status as asub_status,
                asub.grade as asub_grade,
                asub.feedback as asub_feedback,
                asub.submitted_at as asub_submitted_at,
                ucp.completed_at as completed_at,
                ucp.response_data as interaction_data
             FROM lesson_contents lc
             LEFT JOIN assignment_submissions asub ON asub.content_id = lc.id AND asub.user_id = ?
             LEFT JOIN user_content_progress ucp ON ucp.content_id = lc.id AND ucp.user_id = ?
             WHERE lc.lesson_id = ?
             ORDER BY lc.order_index ASC`,
            [userId, userId, lessonId]
        );

        const passedQuizzes = await db.query('SELECT DISTINCT quiz_id FROM quiz_attempts WHERE user_id = ? AND passed = TRUE', [userId]);
        const passedQuizIds = passedQuizzes.map(q => q.quiz_id);

        const quizAttemptCounts = await db.query('SELECT quiz_id, COUNT(*) as count FROM quiz_attempts WHERE user_id = ? GROUP BY quiz_id', [userId]);
        const attemptsMap = {};
        quizAttemptCounts.forEach(q => { attemptsMap[q.quiz_id] = q.count; });

        const quizMaxAttempts = await db.query('SELECT id, max_attempts FROM quizzes');
        const maxAttemptsMap = {};
        quizMaxAttempts.forEach(q => { maxAttemptsMap[q.id] = q.max_attempts; });

        const completedSurveys = await db.query('SELECT survey_id FROM survey_responses WHERE user_id = ?', [userId]);
        const completedSurveyIds = completedSurveys.map(s => s.survey_id);

        // Puntos ganados por el usuario en quizzes (reference_id = quiz_id)
        const quizPointsEarned = await db.query(
            `SELECT reference_id as quiz_id, COALESCE(SUM(points_earned), 0) as total
             FROM gamification_activities
             WHERE user_id = ? AND activity_type = 'quiz_passed'
             GROUP BY reference_id`,
            [userId]
        );
        const quizPointsMap = {};
        quizPointsEarned.forEach(r => { quizPointsMap[r.quiz_id] = parseInt(r.total) || 0; });

        // Puntos ganados en surveys y tareas aprobadas (reference_id = content_id)
        const otherPointsEarned = await db.query(
            `SELECT reference_id as content_id, COALESCE(SUM(points_earned), 0) as total
             FROM gamification_activities
             WHERE user_id = ? AND activity_type IN ('survey_completed', 'task_approved')
             GROUP BY reference_id`,
            [userId]
        );
        const otherPointsMap = {};
        otherPointsEarned.forEach(r => { otherPointsMap[r.content_id] = parseInt(r.total) || 0; });

        return contents.map(item => {
            let userSubmission = null;
            if (item.asub_id) {
                userSubmission = {
                    id: item.asub_id,
                    file_url: item.asub_file_url,
                    status: item.asub_status,
                    grade: item.asub_grade,
                    feedback: item.asub_feedback,
                    submitted_at: item.asub_submitted_at
                };
            }

            const itemData = typeof item.data === 'string' ? JSON.parse(item.data) : (item.data || {});
            let isCompleted = false;
            let attemptsMade = 0;
            let maxAttempts = 3;

            if (item.content_type === 'quiz' && itemData.quiz_id) {
                const qId = parseInt(itemData.quiz_id);
                isCompleted = passedQuizIds.includes(qId);
                attemptsMade = attemptsMap[qId] || 0;
                maxAttempts = maxAttemptsMap[qId] || 3;
            } else if (item.content_type === 'survey' && itemData.survey_id) {
                const sId = parseInt(itemData.survey_id);
                isCompleted = completedSurveyIds.includes(sId);
            } else if (item.content_type === 'assignment') {
                isCompleted = item.asub_status === 'approved';
            } else if (TRACEABLE_CONTENT_TYPES.includes(item.content_type)) {
                isCompleted = !!item.completed_at;
            }

            // Calcular puntos ganados por el usuario en esta actividad
            let pointsEarned = 0;
            if (item.content_type === 'quiz' && itemData.quiz_id) {
                pointsEarned = quizPointsMap[parseInt(itemData.quiz_id)] || 0;
            } else if (item.content_type === 'survey' || item.content_type === 'assignment') {
                pointsEarned = otherPointsMap[item.id] || 0;
            }

            return {
                id: item.id,
                lesson_id: item.lesson_id,
                title: item.title,
                content_type: item.content_type,
                data: itemData,
                order_index: item.order_index,
                points: item.points,
                pointsEarned,
                is_required: item.is_required,
                submission: userSubmission,
                interactionData: item.interaction_data ? (typeof item.interaction_data === 'string' ? JSON.parse(item.interaction_data) : item.interaction_data) : null,
                isCompleted,
                attemptsMade,
                maxAttempts
            };
        });
    }


    async trackContentProgress(contentId, userId, responseData = null) {
        const data = responseData && Object.keys(responseData).length > 0 ? JSON.stringify(responseData) : null;
        return await db.query(
            `INSERT INTO user_content_progress (user_id, content_id, response_data) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE response_data = VALUES(response_data), completed_at = NOW()`,
            [userId, contentId, data]
        );
    }

    async submitAssignment(contentId, userId, file) {
        const fileUrl = `/uploads/course_content/${file.filename}`;
        const [existing] = await db.query('SELECT id FROM assignment_submissions WHERE content_id = ? AND user_id = ?', [contentId, userId]);

        if (existing) {
            await db.query(`UPDATE assignment_submissions SET file_url = ?, status = 'pending', submitted_at = NOW() WHERE id = ?`, [fileUrl, existing.id]);
        } else {
            await db.query(`INSERT INTO assignment_submissions (content_id, user_id, file_url, status) VALUES (?, ?, ?, 'pending')`, [contentId, userId, fileUrl]);
        }

        // --- NOTIFICACIÓN POR CORREO A TODOS LOS ADMINISTRADORES ---
        try {
            const [details] = await db.query(`
                SELECT u.first_name, u.last_name, u.email,
                       lc.title as assignment_title,
                       l.title as lesson_title,
                       m.title as module_title
                FROM users u
                JOIN lesson_contents lc ON lc.id = ?
                JOIN lessons l ON lc.lesson_id = l.id
                JOIN modules m ON l.module_id = m.id
                WHERE u.id = ?
            `, [contentId, userId]);

            if (details) {
                // Obtener todos los administradores registrados
                const admins = await db.query("SELECT email FROM users WHERE role = 'admin' AND is_active = 1");
                
                if (admins.length > 0) {
                    const emailService = require('./emailService');
                    
                    // Enviar a cada administrador (de forma asíncrona para no bloquear)
                    for (const admin of admins) {
                        try {
                            await emailService.sendAssignmentSubmissionNotification(
                                admin.email,
                                {
                                    name: `${details.first_name} ${details.last_name}`,
                                    email: details.email
                                },
                                {
                                    title: details.assignment_title,
                                    lesson: details.lesson_title,
                                    module: details.module_title
                                }
                            );
                        } catch (err) {
                            console.error(`Error enviando notificación a admin ${admin.email}:`, err);
                        }
                    }
                }
            }
        } catch (mailErr) {
            const logger = require('../config/logger');
            logger.error('Error enviando notificación de tarea enviada:', mailErr);
        }

        return fileUrl;
    }

    async getAllSubmissions() {
        return await db.query(`
            SELECT asub.id, asub.status, asub.grade, asub.feedback, asub.file_url, asub.submitted_at,
                   u.first_name, u.last_name, u.email,
                   lc.title as assignment_title, lc.id as content_id,
                   l.title as lesson_title, l.id as lesson_id,
                   m.title as module_title, m.id as module_id
            FROM assignment_submissions asub
            JOIN users u ON asub.user_id = u.id
            JOIN lesson_contents lc ON asub.content_id = lc.id
            JOIN lessons l ON lc.lesson_id = l.id
            JOIN modules m ON l.module_id = m.id
            ORDER BY asub.submitted_at DESC
        `);
    }

    async getSubmissionsByContent(contentId) {
        return await db.query(
            `SELECT asub.*, u.first_name, u.last_name, u.email 
             FROM assignment_submissions asub
             JOIN users u ON asub.user_id = u.id
             WHERE asub.content_id = ?
             ORDER BY asub.submitted_at DESC`,
            [contentId]
        );
    }

    async gradeSubmission(submissionId, data) {
        const { status, grade, feedback } = data;
        
        // 1. Obtener datos de la entrega antes de actualizar para saber a quién notificar
        const [submission] = await db.query(
            'SELECT user_id, content_id, status as old_status FROM assignment_submissions WHERE id = ?', 
            [submissionId]
        );
        
        if (!submission) throw new Error('Entrega no encontrada');

        // 2. Actualizar la entrega
        await db.query(
            `UPDATE assignment_submissions SET 
                status = COALESCE(?, status), 
                grade = COALESCE(?, grade), 
                feedback = COALESCE(?, feedback)
             WHERE id = ?`,
            [status ?? null, grade ?? null, feedback ?? null, submissionId]
        );

        // 3. Registrar en el historial de actividad si se aprueba
        if (status === 'approved') {
            try {
                // Verificar si ya existe la actividad para evitar duplicados
                const [existingActivity] = await db.query(
                    "SELECT id FROM gamification_activities WHERE user_id = ? AND activity_type = 'task_approved' AND reference_id = ?",
                    [submission.user_id, submission.content_id]
                );

                if (!existingActivity) {
                    // Obtener puntos de la tarea para el historial
                    const [content] = await db.query('SELECT points FROM lesson_contents WHERE id = ?', [submission.content_id]);
                    const points = content ? content.points : 0;

                    await db.query(
                        `INSERT INTO gamification_activities (user_id, activity_type, points_earned, reference_id) 
                         VALUES (?, 'task_approved', ?, ?)`,
                        [submission.user_id, points, submission.content_id]
                    );

                    // SUMAR PUNTOS AL TOTAL DEL USUARIO
                    if (points > 0) {
                        await db.query(
                            `INSERT INTO user_points (user_id, points) VALUES (?, ?) ON DUPLICATE KEY UPDATE points = points + ?`,
                            [submission.user_id, points, points]
                        );
                        // Sincronizar nivel después de sumar puntos
                        const { syncUserLevel } = require('../utils/gamification');
                        await syncUserLevel(submission.user_id);
                    }

                    // Invalidar caché del perfil del usuario
                    const { clearCache } = require('../middleware/cache');
                    await clearCache(`cache:/api/users/profile*u${submission.user_id}*`);
                }
            } catch (activityErr) {
                if (typeof logger !== 'undefined') {
                    logger.error('Error registrando actividad de tarea aprobada:', activityErr);
                } else {
                    console.error('Error registrando actividad de tarea aprobada:', activityErr);
                }
            }
        }

        // 4. Enviar correo al usuario informando la calificación
        try {
            const [user] = await db.query('SELECT first_name, last_name, email FROM users WHERE id = ?', [submission.user_id]);
            const [content] = await db.query('SELECT title FROM lesson_contents WHERE id = ?', [submission.content_id]);
            
            if (user && content) {
                const emailService = require('./emailService');
                const userName = `${user.first_name} ${user.last_name}`;
                await emailService.sendAssignmentGradedNotification(user.email, userName, {
                    title: content.title,
                    status: status || submission.old_status,
                    grade: grade ?? 'N/A',
                    feedback: feedback || ''
                });
            }
        } catch (emailErr) {
            if (typeof logger !== 'undefined') {
                logger.error('Error enviando correo de calificación de tarea:', emailErr);
            } else {
                console.error('Error enviando correo de calificación de tarea:', emailErr);
            }
        }

        return true;
    }

    async getAllInteractions() {
        return await db.query(`
            SELECT ucp.id, ucp.response_data, ucp.completed_at,
                   u.first_name, u.last_name, u.email,
                   lc.title as content_title, lc.content_type, lc.id as content_id,
                   l.title as lesson_title, l.id as lesson_id,
                   m.title as module_title, m.id as module_id
            FROM user_content_progress ucp
            JOIN users u ON ucp.user_id = u.id
            JOIN lesson_contents lc ON ucp.content_id = lc.id
            JOIN lessons l ON lc.lesson_id = l.id
            JOIN modules m ON l.module_id = m.id
            WHERE ucp.response_data IS NOT NULL
            AND lc.content_type IN ('interactive_input', 'confirmation', 'multiple_choice', 'password_tester', 'mfa_defender', 'categorization')
            ORDER BY ucp.completed_at DESC
        `);
    }

    async createContent(data, file) {
        let { lesson_id, title, content_type, data: jsonData, order_index, is_required, points } = data;
        const requiredVal = is_required === 'true' || is_required === true || is_required === 1 || is_required === '1';
        let contentData = jsonData ? (typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData) : {};

        if (contentData.text) contentData.text = xss(contentData.text);

        if (file) {
            contentData.file_url = `/uploads/course_content/${file.filename}`;
            contentData.original_name = path.basename(file.originalname);
            contentData.mime_type = file.mimetype;
            contentData.size = file.size;
        }

        const result = await db.query(
            `INSERT INTO lesson_contents (lesson_id, title, content_type, data, order_index, is_required, points)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [lesson_id, title, content_type, JSON.stringify(contentData), order_index || 0, requiredVal ? 1 : 0, points || 0]
        );
        return { id: result.insertId, fileUrl: contentData.file_url };
    }

    async updateContent(id, data, file) {
        let { title, content_type, data: jsonData, order_index, is_required, points } = data;
        const requiredVal = is_required === 'true' || is_required === true || is_required === 1 || is_required === '1';

        const [current] = await db.query('SELECT data FROM lesson_contents WHERE id = ?', [id]);
        if (!current) throw new Error('Contenido no encontrado');

        let contentData = current.data ? (typeof current.data === 'string' ? JSON.parse(current.data) : current.data) : {};

        if (jsonData) {
            const newData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            if (newData.text) newData.text = xss(newData.text);
            contentData = { ...contentData, ...newData };
        }

        if (file) {
            contentData.file_url = `/uploads/course_content/${file.filename}`;
            contentData.original_name = path.basename(file.originalname);
            contentData.mime_type = file.mimetype;
            contentData.size = file.size;
        }

        // Ensure numeric fields are correctly handled (especially when coming from FormData as strings)
        const cleanOrderIndex = (order_index === 'undefined' || order_index === 'null' || order_index === '' || order_index === undefined) ? null : order_index;
        const cleanPoints = (points === 'undefined' || points === 'null' || points === '') ? null : points;

        await db.query(
            `UPDATE lesson_contents SET 
                title = COALESCE(?, title), 
                content_type = COALESCE(?, content_type), 
                data = ?, 
                order_index = COALESCE(?, order_index), 
                is_required = COALESCE(?, is_required), 
                points = COALESCE(?, points)
             WHERE id = ?`,
            [title ?? null, content_type ?? null, JSON.stringify(contentData), cleanOrderIndex, requiredVal ? 1 : 0, cleanPoints, id]
        );
    }

    async deleteContent(id) {
        return await db.query('DELETE FROM lesson_contents WHERE id = ?', [id]);
    }

    async reorderContents(items) {
        for (const item of items) {
            await db.query('UPDATE lesson_contents SET order_index = ? WHERE id = ?', [item.order_index, item.id]);
        }
    }

    async getInteractionStats() {
        const interactiveContents = await db.query(`
            SELECT lc.id, lc.title, lc.data, lc.content_type, lc.lesson_id, l.module_id 
            FROM lesson_contents lc
            JOIN lessons l ON lc.lesson_id = l.id
            WHERE lc.content_type IN ('multiple_choice', 'confirmation')
        `);

        const responses = await db.query(`
            SELECT content_id, response_data 
            FROM user_content_progress 
            WHERE response_data IS NOT NULL
        `);

        const stats = interactiveContents.map(content => {
            const contentData = typeof content.data === 'string' ? JSON.parse(content.data) : (content.data || {});
            const options = contentData.options || [];
            
            // Initialize counts
            const optionCounts = options.map((opt, index) => ({
                label: opt.text || `Opción ${index + 1}`,
                value: 0,
                isCorrect: opt.is_correct || false
            }));

            // Count responses for this content
            responses.filter(r => r.content_id === content.id).forEach(r => {
                const resData = typeof r.response_data === 'string' ? JSON.parse(r.response_data) : (r.response_data || {});
                
                if (content.content_type === 'confirmation' && resData.selectedOption !== undefined) {
                    const idx = parseInt(resData.selectedOption) - 1;
                    if (optionCounts[idx]) optionCounts[idx].value++;
                } else if (content.content_type === 'multiple_choice') {
                    // Soporte para ambos formatos: seleccionado único (selectedIndex) o múltiple (selectedOptions)
                    if (resData.selectedIndex !== undefined && resData.selectedIndex !== null) {
                        const idx = parseInt(resData.selectedIndex);
                        if (optionCounts[idx]) optionCounts[idx].value++;
                    } else if (resData.selectedOptions) {
                        const selected = Array.isArray(resData.selectedOptions) ? resData.selectedOptions : [resData.selectedOptions];
                        selected.forEach(optIdx => {
                            const idx = parseInt(optIdx) - (resData.isOneBased ? 1 : 0); // Ajuste de base si aplica
                            if (optionCounts[idx]) optionCounts[idx].value++;
                        });
                    }
                }
            });

            return {
                id: content.id,
                lesson_id: content.lesson_id,
                module_id: content.module_id,
                title: content.title,
                type: content.content_type,
                data: optionCounts,
                total: responses.filter(r => r.content_id === content.id).length
            };
        });

        return stats.filter(s => s.total > 0);
    }
}

module.exports = new LessonContentService();
