const db = require('../config/database');
const logger = require('../config/logger');
const { syncUserLevel, checkAndRecordModuleCompletion } = require('../utils/gamification');
const { checkAllBadges } = require('../utils/badges');
const { TRACEABLE_CONTENT_TYPES } = require('../constants/contentTypes');

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
                    'SELECT COUNT(*) as completed_count FROM user_progress up JOIN lessons l ON up.lesson_id = l.id WHERE up.user_id = ? AND up.module_id = ? AND up.status = "completed" AND l.is_optional = FALSE',
                    [userId, prevModule.id]
                );
                const [totalRequired] = await db.query(
                    'SELECT COUNT(*) as total FROM lessons WHERE module_id = ? AND is_published = TRUE AND is_optional = FALSE',
                    [prevModule.id]
                );
                const [quizProgress] = await db.query(
                    'SELECT COUNT(*) as passed_count FROM quiz_attempts WHERE user_id = ? AND quiz_id IN (SELECT id FROM quizzes WHERE module_id = ? AND lesson_id IS NULL) AND passed = TRUE',
                    [userId, prevModule.id]
                );
                const [totalQuizzes] = await db.query(
                    'SELECT COUNT(*) as total FROM quizzes WHERE module_id = ? AND is_published = TRUE AND lesson_id IS NULL',
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
            `SELECT up.*, 
                (SELECT SUM(points_earned) FROM gamification_activities 
                 WHERE user_id = up.user_id AND (
                    (activity_type = 'lesson_completed' AND reference_id = up.lesson_id) OR
                    (activity_type = 'quiz_passed' AND reference_id IN (SELECT id FROM quizzes WHERE lesson_id = up.lesson_id)) OR
                    (activity_type = 'task_approved' AND reference_id IN (SELECT id FROM lesson_contents WHERE lesson_id = up.lesson_id AND content_type = 'assignment')) OR
                    (activity_type = 'survey_completed' AND reference_id IN (SELECT id FROM surveys WHERE lesson_id = up.lesson_id))
                 )) as points_earned
             FROM user_progress up 
             WHERE up.user_id = ? AND up.lesson_id = ?`,
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
                `SELECT up.*, 
                    (SELECT SUM(points_earned) FROM gamification_activities 
                     WHERE user_id = up.user_id AND (
                        (activity_type = 'lesson_completed' AND reference_id = up.lesson_id) OR
                        (activity_type = 'quiz_passed' AND reference_id IN (SELECT id FROM quizzes WHERE lesson_id = up.lesson_id)) OR
                        (activity_type = 'task_approved' AND reference_id IN (SELECT id FROM lesson_contents WHERE lesson_id = up.lesson_id AND content_type = 'assignment')) OR
                        (activity_type = 'survey_completed' AND reference_id IN (SELECT id FROM surveys WHERE lesson_id = up.lesson_id))
                     )) as points_earned
                 FROM user_progress up 
                 WHERE up.user_id = ? AND up.lesson_id = ?`,
                [userId, lessonId]
            );

            const badgeResult = await checkAllBadges(userId, { moduleId: lesson.module_id });
            if (badgeResult?.awarded) badgeAwarded = badgeResult.badges;
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

    async completeLesson(lessonId, userId, isAdminView, timeSpent = 0) {
        const [lesson] = await db.query('SELECT module_id FROM lessons WHERE id = ?', [lessonId]);
        if (!lesson) throw new Error('Lección no encontrada');

        // Verificar si la lección ya estaba completada para evitar duplicar puntos
        const [existingProgress] = await db.query(
            `SELECT status FROM user_progress WHERE user_id = ? AND lesson_id = ?`,
            [userId, lessonId]
        );
        const isAlreadyCompleted = existingProgress && existingProgress.status === 'completed';

        // Verify requirements
        const assignments = await db.query(
            `SELECT lc.id, lc.title, asub.status FROM lesson_contents lc LEFT JOIN assignment_submissions asub ON lc.id = asub.content_id AND asub.user_id = ? WHERE lc.lesson_id = ? AND lc.content_type = 'assignment' AND lc.is_required = 1`,
            [userId, lessonId]
        );

        for (const assignment of assignments) {
            if (!assignment.status) throw new Error(`No puedes finalizar: Te falta enviar la tarea "${assignment.title}".`);
            if (assignment.status === 'rejected') throw new Error(`No puedes finalizar: La tarea "${assignment.title}" fue rechazada.`);
            if (assignment.status === 'pending') throw new Error(`No puedes finalizar: La tarea "${assignment.title}" está pendiente de revisión.`);
        }

        const quizzes = await db.query(
            `SELECT lc.title, lc.is_required,
             COALESCE((SELECT MAX(passed) FROM quiz_attempts qa WHERE qa.user_id = ? AND qa.quiz_id = JSON_VALUE(lc.data, '$.quiz_id')), 0) as has_passed,
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

        const surveys = await db.query(
            `SELECT lc.title, lc.is_required,
             (SELECT COUNT(*) FROM survey_responses sr WHERE sr.user_id = ? AND sr.survey_id = JSON_VALUE(lc.data, '$.survey_id')) as is_done
             FROM lesson_contents lc WHERE lc.lesson_id = ? AND lc.content_type = 'survey' AND lc.is_required = 1`,
            [userId, lessonId]
        );

        for (const survey of surveys) {
            if (survey.is_required && !survey.is_done) {
                throw new Error(`No puedes finalizar: Debes completar la encuesta "${survey.title}".`);
            }
        }

        // Verify required videos, links and confirmations
        const contents = await db.query(
            `SELECT lc.id, lc.title, lc.content_type, ucp.completed_at 
             FROM lesson_contents lc 
             LEFT JOIN user_content_progress ucp ON ucp.content_id = lc.id AND ucp.user_id = ? 
             WHERE lc.lesson_id = ? AND lc.is_required = 1 AND lc.content_type IN (${TRACEABLE_CONTENT_TYPES.map(() => '?').join(',')})`,
            [userId, lessonId, ...TRACEABLE_CONTENT_TYPES]
        );

        for (const item of contents) {
            if (!item.completed_at) {
                let action = 'visitar el enlace';
                if (item.content_type === 'video') action = 'ver el video';
                if (item.content_type === 'confirmation' || item.content_type === 'multiple_choice') action = 'responder la pregunta';
                if (item.content_type === 'interactive_input') action = 'completar la entrada';
                if (item.content_type === 'password_tester') action = 'probar la contraseña';

                throw new Error(`No puedes finalizar: Te falta ${action} "${item.title}".`);
            }
        }

        // Calculate points only for completed items
        const allContents = await db.query(
            `SELECT lc.id, lc.points, lc.content_type, lc.data,
                asub.status as asub_status,
                ucp.completed_at as ucp_completed_at,
                ucp.response_data as interaction_data,
                COALESCE((SELECT MAX(passed) FROM quiz_attempts qa WHERE qa.user_id = ? AND qa.quiz_id = JSON_VALUE(lc.data, '$.quiz_id')), 0) as quiz_passed,
                (SELECT COUNT(*) FROM survey_responses sr WHERE sr.user_id = ? AND sr.survey_id = JSON_VALUE(lc.data, '$.survey_id')) as survey_done
             FROM lesson_contents lc
             LEFT JOIN assignment_submissions asub ON asub.content_id = lc.id AND asub.user_id = ?
             LEFT JOIN user_content_progress ucp ON ucp.content_id = lc.id AND ucp.user_id = ?
             WHERE lc.lesson_id = ?`,
            [userId, userId, userId, userId, lessonId]
        );

        let pointsAwarded = 0;
        let totalPointsInLesson = 0;

        for (const content of allContents) {
            let isCompleted = false;
            if (content.content_type === 'quiz') {
                isCompleted = !!content.quiz_passed;
            } else if (content.content_type === 'survey') {
                isCompleted = content.survey_done > 0;
            } else if (content.content_type === 'assignment') {
                isCompleted = content.asub_status === 'approved';
            } else if (TRACEABLE_CONTENT_TYPES.includes(content.content_type)) {
                isCompleted = !!content.ucp_completed_at;
            } else {
                // Para tipos informativos sin rastreo (texto, imagen, etc), se consideran completados por defecto
                isCompleted = true;
            }

            if (!isCompleted) continue;

            let itemPoints = parseInt(content.points) || 0;
            const contentData = typeof content.data === 'string' ? JSON.parse(content.data) : (content.data || {});
            const interactionData = typeof content.interaction_data === 'string' ? JSON.parse(content.interaction_data) : (content.interaction_data || {});

            // Penalizaciones
            if (content.content_type === 'hack_neighbor' && itemPoints > 0) {
                const hintsUsed = parseInt(interactionData.hintsUsed) || 0;
                const penaltyPerHint = parseInt(contentData.hint_penalty) || 0;
                itemPoints = Math.max(0, itemPoints - (hintsUsed * penaltyPerHint));
            }

            if (content.content_type === 'mfa_defender' && itemPoints > 0) {
                const mfaFails = parseInt(interactionData.mfaFails) || 0;
                const failPenalty = parseInt(contentData.fail_penalty) || 0;
                itemPoints = Math.max(0, itemPoints - (mfaFails * failPenalty));
            }

            if (content.content_type === 'terms_trap' && itemPoints > 0) {
                if (interactionData.status === 'completed_after_failure') {
                    itemPoints = Math.round(itemPoints * 0.4);
                }
            }


            // Sumar siempre para el mensaje de la UI
            totalPointsInLesson += itemPoints;

            // EXCLUSIÓN: No sumar al balance real si ya se otorgó (Quices, Encuestas, Tareas)
            if (['quiz', 'survey', 'assignment'].includes(content.content_type)) continue;

            pointsAwarded += itemPoints;
        }

        await db.query(
            `UPDATE user_progress 
             SET status = 'completed', 
                 progress_percentage = 100, 
                 completed_at = COALESCE(completed_at, NOW()), 
                 time_spent_minutes = COALESCE(time_spent_minutes, 0) + ? 
             WHERE user_id = ? AND lesson_id = ?`,
            [timeSpent, userId, lessonId]
        );

        // Solo otorgar puntos si es la PRIMERA vez que se completa la lección
        if (!isAlreadyCompleted) {
            if (pointsAwarded > 0) {
                await db.query(`INSERT INTO user_points (user_id, points) VALUES (?, ?) ON DUPLICATE KEY UPDATE points = points + ?`, [userId, pointsAwarded, pointsAwarded]);
            }
            await db.query(`INSERT INTO gamification_activities (user_id, activity_type, points_earned, reference_id) VALUES (?, 'lesson_completed', ?, ?)`, [userId, pointsAwarded, lessonId]);
        }

        const moduleSync = await checkAndRecordModuleCompletion(userId, lesson.module_id, isAdminView);
        const levelSync = await syncUserLevel(userId);
        const badgeSync = await checkAllBadges(userId, {
            moduleId: lesson.module_id,
            isModuleCompletion: moduleSync?.completed && moduleSync?.newlyRecorded
        });

        const [updatedStats] = await db.query('SELECT points, level FROM user_points WHERE user_id = ?', [userId]);

        // --- SINCRONIZACIÓN FINAL ---
        // Refrescar el ranking global después de otorgar todos los puntos (incluyendo posibles insignias)
        try {
            const { refreshLeaderboardCache } = require('../utils/gamification');
            await refreshLeaderboardCache();
        } catch (rankErr) {
            console.error('Error sincronizando ranking al final de la lección:', rankErr);
        }

        return {
            pointsAwarded: totalPointsInLesson,
            realPointsAwarded: pointsAwarded,
            newBalance: updatedStats?.points || 0,
            newLevel: updatedStats?.level || 'Novato',
            levelUp: levelSync?.leveledUp || false,
            levelData: levelSync,
            moduleCompleted: moduleSync?.completed && moduleSync?.newlyRecorded,
            moduleData: moduleSync,
            badgeAwarded: badgeSync?.awarded ? badgeSync.badges : null
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
        // Limpiar quizzes y surveys asociados a esta lección
        const quizzes = await db.query('SELECT id FROM quizzes WHERE lesson_id = ?', [lessonId]);
        for (const q of quizzes) {
            await db.query('DELETE FROM quizzes WHERE id = ?', [q.id]);
        }

        const surveys = await db.query('SELECT id FROM surveys WHERE lesson_id = ?', [lessonId]);
        for (const s of surveys) {
            await db.query('DELETE FROM surveys WHERE id = ?', [s.id]);
        }

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
