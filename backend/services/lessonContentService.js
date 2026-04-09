const db = require('../config/database');
const xss = require('xss');
const path = require('path');

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
                ucp.completed_at as completed_at
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
            } else if (item.content_type === 'video' || item.content_type === 'link' || item.content_type === 'confirmation') {
                isCompleted = !!item.completed_at;
            }

            return {
                id: item.id,
                lesson_id: item.lesson_id,
                title: item.title,
                content_type: item.content_type,
                data: itemData,
                order_index: item.order_index,
                points: item.points,
                is_required: item.is_required,
                submission: userSubmission,
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
        return await db.query(
            `UPDATE assignment_submissions SET 
                status = COALESCE(?, status), 
                grade = COALESCE(?, grade), 
                feedback = COALESCE(?, feedback)
             WHERE id = ?`,
            [status ?? null, grade ?? null, feedback ?? null, submissionId]
        );
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

        await db.query(
            `UPDATE lesson_contents SET 
                title = COALESCE(?, title), 
                content_type = COALESCE(?, content_type), 
                data = ?, 
                order_index = COALESCE(?, order_index), 
                is_required = COALESCE(?, is_required), 
                points = COALESCE(?, points)
             WHERE id = ?`,
            [title ?? null, content_type ?? null, JSON.stringify(contentData), order_index ?? null, requiredVal ? 1 : 0, points ?? null, id]
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
}

module.exports = new LessonContentService();
