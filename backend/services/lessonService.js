const db = require('../config/database');
const logger = require('../config/logger');
const { syncUserLevel, checkAndRecordModuleCompletion } = require('../utils/gamification');
const { checkAllBadges } = require('../utils/badges');

class LessonService {
    async getLessonById(lessonId, userId, isAdmin) {
        const [lesson] = await db.query(
            `SELECT l.*, m.title as module_title,
                (SELECT SUM(points) FROM lesson_contents WHERE lesson_id = l.id) as total_points
             FROM lessons l 
             JOIN modules m ON l.module_id = m.id 
             WHERE l.id = ? ${isAdmin ? '' : 'AND l.is_published = TRUE'}`,
            [lessonId]
        );

        if (!lesson) return null;

        // Validation for locked lesson
        const [prevMandatoryIncomplete] = await db.query(
            `SELECT l.id, l.title 
             FROM lessons l
             LEFT JOIN user_progress up ON l.id = up.lesson_id AND up.user_id = ?
             WHERE l.module_id = ? 
             AND l.order_index < ? 
             AND l.is_published = TRUE 
             AND l.is_optional = FALSE 
             AND (up.status IS NULL OR up.status != 'completed')
             ORDER BY l.order_index ASC LIMIT 1`,
            [userId, lesson.module_id, lesson.order_index]
        );

        if (prevMandatoryIncomplete && !isAdmin) {
            return { 
                locked: true, 
                error: 'Lección bloqueada', 
                message: `Debes completar la lección "${prevMandatoryIncomplete.title}" para continuar.`,
                moduleId: lesson.module_id 
            };
        }

        // Validation for locked module
        const [moduleInfo] = await db.query('SELECT order_index, requires_previous FROM modules WHERE id = ?', [lesson.module_id]);
        if (moduleInfo && moduleInfo.requires_previous && !isAdmin) {
            const [prevModule] = await db.query(
                'SELECT id FROM modules WHERE order_index < ? AND is_published = TRUE ORDER BY order_index DESC LIMIT 1',
                [moduleInfo.order_index]
            );

            if (prevModule) {
                const [lessonProgress] = await db.query(
                    'SELECT COUNT(*) as completed_count FROM user_progress WHERE user_id = ? AND module_id = ? AND status = "completed"',
                    [userId, prevModule.id]
                );
                const [totalRequired] = await db.query(
                    'SELECT COUNT(*) as total FROM lessons WHERE module_id = ? AND is_published = TRUE AND is_optional = FALSE',
                    [prevModule.id]
                );
                const [quizProgress] = await db.query(
                    'SELECT COUNT(*) as passed_count FROM quiz_attempts WHERE user_id = ? AND quiz_id IN (SELECT id FROM quizzes WHERE module_id = ?) AND passed = TRUE',
                    [userId, prevModule.id]
                );
                const [totalQuizzes] = await db.query(
                    'SELECT COUNT(*) as total FROM quizzes WHERE module_id = ? AND is_published = TRUE',
                    [prevModule.id]
                );

                if ((lessonProgress.completed_count < totalRequired.total) || (quizProgress.passed_count < totalQuizzes.total)) {
                    return { 
                        locked: true, 
                        error: 'Módulo bloqueado', 
                        message: 'Debes completar el módulo anterior antes de acceder a este contenido.',
                        moduleId: lesson.module_id 
                    };
                }
            }
        }

        // Progress management
        let [progress] = await db.query(
            'SELECT * FROM user_progress WHERE user_id = ? AND lesson_id = ?',
            [userId, lessonId]
        );

        let badgeAwarded = null;
        if (!progress) {
            await db.query(
                `INSERT INTO user_progress (user_id, module_id, lesson_id, status, last_accessed) 
                 VALUES (?, ?, ?, 'in_progress', NOW())`,
                [userId, lesson.module_id, lessonId]
            );
            [progress] = await db.query(
                'SELECT * FROM user_progress WHERE user_id = ? AND lesson_id = ?',
                [userId, lessonId]
            );

            const badgeResult = await checkAllBadges(userId, { moduleId: lesson.module_id });
            if (badgeResult?.awarded) badgeAwarded = badgeResult.badge;
        } else {
            await db.query('UPDATE user_progress SET last_accessed = NOW() WHERE id = ?', [progress.id]);
        }

        const [prevLesson] = await db.query(
            `SELECT id FROM lessons WHERE module_id = ? AND order_index < ? ${isAdmin ? '' : 'AND is_published = TRUE'} ORDER BY order_index DESC LIMIT 1`,
            [lesson.module_id, lesson.order_index]
        );

        const [nextLesson] = await db.query(
            `SELECT id FROM lessons WHERE module_id = ? AND order_index > ? ${isAdmin ? '' : 'AND is_published = TRUE'} ORDER BY order_index ASC LIMIT 1`,
            [lesson.module_id, lesson.order_index]
        );

        const moduleLessons = await db.query(
            `SELECT l.id, l.title, l.order_index, l.is_optional, l.lesson_type, l.duration_minutes, l.is_published, up.status,
                (SELECT SUM(points) FROM lesson_contents WHERE lesson_id = l.id) as total_points
             FROM lessons l
             LEFT JOIN user_progress up ON l.id = up.lesson_id AND up.user_id = ?
             WHERE l.module_id = ? ${isAdmin ? '' : 'AND l.is_published = TRUE'}
             ORDER BY l.order_index ASC`,
            [userId, lesson.module_id]
        );

        return {
            lesson,
            progress,
            moduleLessons,
            badgeAwarded,
            navigation: {
                prev: prevLesson?.id || null,
                next: nextLesson?.id || null
            }
        };
    }

    async completeLesson(lessonId, userId, isAdminView) {
        const [lesson] = await db.query('SELECT module_id FROM lessons WHERE id = ?', [lessonId]);
        if (!lesson) throw new Error('Lección no encontrada');

        // Verify requirements
        const assignments = await db.query(
            `SELECT lc.id, lc.title, asub.status FROM lesson_contents lc LEFT JOIN assignment_submissions asub ON lc.id = asub.content_id AND asub.user_id = ? WHERE lc.lesson_id = ? AND lc.content_type = 'assignment'`,
            [userId, lessonId]
        );

        for (const assignment of assignments) {
            if (!assignment.status) throw new Error(`No puedes finalizar: Te falta enviar la tarea "${assignment.title}".`);
            if (assignment.status === 'rejected') throw new Error(`No puedes finalizar: La tarea "${assignment.title}" fue rechazada.`);
            if (assignment.status === 'pending') throw new Error(`No puedes finalizar: La tarea "${assignment.title}" está pendiente de revisión.`);
        }

        const quizzes = await db.query(
            `SELECT lc.title, lc.is_required,
             (SELECT passed FROM quiz_attempts qa WHERE qa.user_id = ? AND qa.quiz_id = JSON_VALUE(lc.data, '$.quiz_id') ORDER BY qa.attempt_number DESC LIMIT 1) as has_passed,
             (SELECT COUNT(*) FROM quiz_attempts qa WHERE qa.user_id = ? AND qa.quiz_id = JSON_VALUE(lc.data, '$.quiz_id')) as attempts_made,
             (SELECT max_attempts FROM quizzes q WHERE q.id = JSON_VALUE(lc.data, '$.quiz_id')) as max_attempts
             FROM lesson_contents lc WHERE lc.lesson_id = ? AND lc.content_type = 'quiz'`,
            [userId, userId, lessonId]
        );

        for (const quiz of quizzes) {
            if (quiz.is_required && !quiz.has_passed) {
                if (quiz.attempts_made >= quiz.max_attempts) throw new Error(`No puedes finalizar: Has reprobado todos los intentos de "${quiz.title}".`);
                throw new Error(`No puedes finalizar: Debes completar y aprobar la evaluación "${quiz.title}".`);
            }
        }

        const [contentPoints] = await db.query('SELECT SUM(points) as total FROM lesson_contents WHERE lesson_id = ?', [lessonId]);
        const pointsAwarded = (parseInt(contentPoints?.total) || 0);

        await db.query(`UPDATE user_progress SET status = 'completed', progress_percentage = 100, completed_at = NOW() WHERE user_id = ? AND lesson_id = ?`, [userId, lessonId]);
        await db.query(`INSERT INTO user_points (user_id, points) VALUES (?, ?) ON DUPLICATE KEY UPDATE points = points + ?`, [userId, pointsAwarded, pointsAwarded]);
        await db.query(`INSERT INTO gamification_activities (user_id, activity_type, points_earned, reference_id) VALUES (?, 'lesson_completed', ?, ?)`, [userId, pointsAwarded, lessonId]);

        const levelSync = await syncUserLevel(userId);
        const moduleSync = await checkAndRecordModuleCompletion(userId, lesson.module_id, isAdminView);
        const badgeSync = await checkAllBadges(userId, {
            moduleId: lesson.module_id,
            isModuleCompletion: moduleSync?.completed && moduleSync?.newlyRecorded
        });

        const [updatedStats] = await db.query('SELECT points, level FROM user_points WHERE user_id = ?', [userId]);

        return {
            pointsAwarded,
            newBalance: updatedStats?.points || 0,
            newLevel: updatedStats?.level || 'Novato',
            levelUp: levelSync?.leveledUp || false,
            levelData: levelSync,
            moduleCompleted: moduleSync?.completed && moduleSync?.newlyRecorded,
            moduleData: moduleSync,
            badgeAwarded: badgeSync?.awarded ? badgeSync.badge : null
        };
    }

    async createLesson(data) {
        const { module_id, title, content, lesson_type, video_url, duration_minutes, order_index, is_published, is_optional } = data;
        const result = await db.query(
            `INSERT INTO lessons (module_id, title, content, lesson_type, video_url, duration_minutes, order_index, is_published, is_optional)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [module_id, title, content || null, lesson_type || 'reading', video_url || null, duration_minutes || 15, order_index || 0, is_published || false, is_optional || false]
        );
        return result.insertId;
    }

    async updateLesson(lessonId, data) {
        const { title, content, lesson_type, video_url, duration_minutes, order_index, is_published, is_optional } = data;
        return await db.query(
            `UPDATE lessons SET 
                title = COALESCE(?, title), 
                content = COALESCE(?, content), 
                lesson_type = COALESCE(?, lesson_type), 
                video_url = COALESCE(?, video_url), 
                duration_minutes = COALESCE(?, duration_minutes), 
                order_index = COALESCE(?, order_index), 
                is_published = COALESCE(?, is_published), 
                is_optional = COALESCE(?, is_optional)
             WHERE id = ?`,
            [
                title ?? null, 
                content ?? null, 
                lesson_type ?? null, 
                video_url ?? null, 
                duration_minutes ?? null, 
                order_index ?? null, 
                is_published ?? null, 
                is_optional ?? null, 
                lessonId
            ]
        );
    }

    async deleteLesson(lessonId) {
        return await db.query('DELETE FROM lessons WHERE id = ?', [lessonId]);
    }

    async reorderLessons(moduleId, orderedIds) {
        if (!moduleId || !Array.isArray(orderedIds)) {
            throw new Error('Parámetros de reordenamiento inválidos');
        }

        // Ejecutar actualizaciones en serie para evitar deadlocks y asegurar el orden
        for (let i = 0; i < orderedIds.length; i++) {
            await db.query(
                'UPDATE lessons SET order_index = ? WHERE id = ? AND module_id = ?',
                [i + 1, orderedIds[i], moduleId]
            );
        }
        return true;
    }
}

module.exports = new LessonService();
