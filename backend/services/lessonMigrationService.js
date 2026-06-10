const db = require('../config/database');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const logger = require('../config/logger');
const { clearCache } = require('../middleware/cache');

class LessonMigrationService {
    /**
     * Exports a complete lesson to a ZIP buffer
     * @param {number} lessonId 
     * @returns {Promise<Buffer>}
     */
    async exportLesson(lessonId) {
        // 1. Get the lesson
        const [lesson] = await db.query('SELECT * FROM lessons WHERE id = ?', [lessonId]);
        if (!lesson) {
            throw new Error('Lección no encontrada');
        }

        // 2. Get lesson contents
        const contents = await db.query(
            'SELECT * FROM lesson_contents WHERE lesson_id = ? ORDER BY order_index ASC',
            [lessonId]
        );

        // 3. Collect linked quizzes and surveys, plus referenced files
        const quizzes = [];
        const surveys = [];
        const referencedFiles = [];

        for (const content of contents) {
            let contentData = {};
            if (content.data) {
                try {
                    contentData = typeof content.data === 'string' ? JSON.parse(content.data) : content.data;
                } catch (e) {
                    logger.error(`Error parsing lesson content data for ID ${content.id}:`, e);
                }
            }

            // Check for file references in data
            if (contentData && contentData.file_url) {
                const relativePath = contentData.file_url.startsWith('/') 
                    ? contentData.file_url.substring(1) 
                    : contentData.file_url;
                
                const fullPath = path.join(process.cwd(), relativePath);
                if (fs.existsSync(fullPath)) {
                    referencedFiles.push({
                        zipPath: `files/${relativePath}`,
                        localPath: fullPath
                    });
                } else {
                    logger.warn(`File referenced in content ${content.id} does not exist: ${fullPath}`);
                }
            }

            // Check for quiz content
            if (content.content_type === 'quiz' && contentData.quiz_id) {
                const quizId = parseInt(contentData.quiz_id);
                // Retrieve quiz details
                const [quiz] = await db.query('SELECT * FROM quizzes WHERE id = ?', [quizId]);
                if (quiz) {
                    const quizQuestions = await db.query(
                        'SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY order_index ASC',
                        [quizId]
                    );

                    for (const q of quizQuestions) {
                        q.options = await db.query(
                            'SELECT * FROM quiz_options WHERE question_id = ? ORDER BY order_index ASC',
                            [q.id]
                        );
                        
                        // Parse JSON data field if any
                        if (q.data && typeof q.data === 'string') {
                            try {
                                q.data = JSON.parse(q.data);
                            } catch (err) {
                                q.data = {};
                            }
                        }
                    }

                    quizzes.push({
                        old_id: quizId,
                        ...quiz,
                        questions: quizQuestions
                    });
                }
            }

            // Check for survey content
            if (content.content_type === 'survey' && contentData.survey_id) {
                const surveyId = parseInt(contentData.survey_id);
                // Retrieve survey details
                const [survey] = await db.query('SELECT * FROM surveys WHERE id = ?', [surveyId]);
                if (survey) {
                    const surveyQuestions = await db.query(
                        'SELECT * FROM survey_questions WHERE survey_id = ? ORDER BY order_index ASC',
                        [surveyId]
                    );

                    for (const q of surveyQuestions) {
                        q.options = await db.query(
                            'SELECT * FROM survey_options WHERE question_id = ? ORDER BY order_index ASC',
                            [q.id]
                        );
                    }

                    surveys.push({
                        old_id: surveyId,
                        ...survey,
                        questions: surveyQuestions
                    });
                }
            }
        }

        // 4. Get additional resources
        const resources = await db.query('SELECT * FROM resources WHERE lesson_id = ?', [lessonId]);
        for (const res of resources) {
            if (res.url && res.url.startsWith('/uploads/')) {
                const relativePath = res.url.substring(1);
                const fullPath = path.join(process.cwd(), relativePath);
                if (fs.existsSync(fullPath)) {
                    referencedFiles.push({
                        zipPath: `files/${relativePath}`,
                        localPath: fullPath
                    });
                } else {
                    logger.warn(`File referenced in resource ${res.id} does not exist: ${fullPath}`);
                }
            }
        }

        // 5. Build metadata JSON
        const metadata = {
            version: '1.0',
            exported_at: new Date().toISOString(),
            lesson: {
                title: lesson.title,
                content: lesson.content,
                lesson_type: lesson.lesson_type,
                video_url: lesson.video_url,
                duration_minutes: lesson.duration_minutes,
                is_published: lesson.is_published,
                is_optional: lesson.is_optional
            },
            contents: contents.map(c => {
                let parsedData = {};
                try {
                    parsedData = typeof c.data === 'string' ? JSON.parse(c.data) : (c.data || {});
                } catch (e) {
                    parsedData = c.data || {};
                }
                return {
                    title: c.title,
                    content_type: c.content_type,
                    data: parsedData,
                    order_index: c.order_index,
                    points: c.points,
                    is_required: c.is_required
                };
            }),
            resources: resources.map(r => ({
                title: r.title,
                description: r.description,
                resource_type: r.resource_type,
                url: r.url,
                file_size: r.file_size
            })),
            quizzes,
            surveys
        };

        // 6. Build the ZIP file
        const zip = new AdmZip();
        zip.addFile('metadata.json', Buffer.from(JSON.stringify(metadata, null, 2), 'utf-8'));

        // Add binary files to zip
        for (const file of referencedFiles) {
            try {
                zip.addLocalFile(file.localPath, path.dirname(file.zipPath));
            } catch (err) {
                logger.error(`Error adding file to zip: ${file.localPath}`, err);
            }
        }

        return zip.toBuffer();
    }

    /**
     * Imports a complete lesson from a ZIP file path
     * @param {string} zipFilePath 
     * @param {number} targetModuleId 
     * @returns {Promise<number>} Returns the new lesson ID
     */
    async importLesson(zipFilePath, targetModuleId) {
        // 1. Check module exists
        const [module] = await db.query('SELECT id FROM modules WHERE id = ?', [targetModuleId]);
        if (!module) {
            throw new Error(`El módulo de destino ${targetModuleId} no existe`);
        }

        // 2. Load and parse the ZIP file
        const zip = new AdmZip(zipFilePath);
        const metadataEntry = zip.getEntry('metadata.json');
        if (!metadataEntry) {
            throw new Error('El archivo ZIP no contiene metadata.json');
        }

        const metadata = JSON.parse(zip.readAsText(metadataEntry));
        if (!metadata.lesson || !metadata.contents) {
            throw new Error('Formato de metadata.json inválido o incompleto');
        }

        // 3. Extract media files
        const zipEntries = zip.getEntries();
        for (const entry of zipEntries) {
            if (entry.entryName.startsWith('files/')) {
                // Extract to local path matching the relative zip structure
                // Zip path: files/uploads/course_content/xyz.png -> Local path: uploads/course_content/xyz.png
                const relativePath = entry.entryName.replace(/^files\//, '');
                const targetPath = path.join(process.cwd(), relativePath);
                
                // Ensure directory exists
                fs.mkdirSync(path.dirname(targetPath), { recursive: true });
                
                // Extract file content
                fs.writeFileSync(targetPath, entry.getData());
                logger.info(`Extracted imported file: ${targetPath}`);
            }
        }

        // 4. Perform database transactions
        const connection = await db.pool.getConnection();
        try {
            await connection.beginTransaction();

            // Calculate next order index for lessons in this module
            const [orderResult] = await connection.query(
                'SELECT MAX(order_index) as max_order FROM lessons WHERE module_id = ?',
                [targetModuleId]
            );
            const nextOrder = (orderResult[0]?.max_order || 0) + 1;

            // Insert lesson record
            const { title, content, lesson_type, video_url, duration_minutes, is_published, is_optional } = metadata.lesson;
            const [lessonInsert] = await connection.query(
                `INSERT INTO lessons (module_id, title, content, lesson_type, video_url, duration_minutes, order_index, is_published, is_optional)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [targetModuleId, title, content, lesson_type, video_url, duration_minutes, nextOrder, is_published, is_optional]
            );
            const newLessonId = lessonInsert.insertId;

            // Map old IDs to new IDs
            const quizIdMap = {};
            const surveyIdMap = {};

            // Import surveys
            if (metadata.surveys && Array.isArray(metadata.surveys)) {
                for (const surveyData of metadata.surveys) {
                    const [surveyInsert] = await connection.query(
                        `INSERT INTO surveys (module_id, lesson_id, title, description, points)
                         VALUES (?, ?, ?, ?, ?)`,
                        [targetModuleId, newLessonId, surveyData.title, surveyData.description || '', surveyData.points || 0]
                    );
                    const newSurveyId = surveyInsert.insertId;
                    quizIdMap[surveyData.old_id] = newSurveyId; // We map surveys
                    surveyIdMap[surveyData.old_id] = newSurveyId;

                    if (surveyData.questions && Array.isArray(surveyData.questions)) {
                        for (const q of surveyData.questions) {
                            const [qInsert] = await connection.query(
                                `INSERT INTO survey_questions (survey_id, question_text, question_type, order_index, is_required)
                                 VALUES (?, ?, ?, ?, ?)`,
                                [newSurveyId, q.question_text, q.question_type || 'multiple_choice', q.order_index || 0, q.is_required ? 1 : 0]
                            );
                            const newQId = qInsert.insertId;

                            if (q.options && Array.isArray(q.options)) {
                                for (const opt of q.options) {
                                    await connection.query(
                                        `INSERT INTO survey_options (question_id, option_text, order_index)
                                         VALUES (?, ?, ?)`,
                                        [newQId, opt.option_text, opt.order_index || 0]
                                    );
                                }
                            }
                        }
                    }
                }
            }

            // Import quizzes
            if (metadata.quizzes && Array.isArray(metadata.quizzes)) {
                for (const quizData of metadata.quizzes) {
                    const [quizInsert] = await connection.query(
                        `INSERT INTO quizzes (module_id, lesson_id, title, description, passing_score, time_limit_minutes, max_attempts, randomize_options, is_published)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            targetModuleId, 
                            newLessonId, 
                            quizData.title, 
                            quizData.description || '', 
                            quizData.passing_score || 80, 
                            quizData.time_limit_minutes || 30, 
                            quizData.max_attempts || 3, 
                            quizData.randomize_options ? 1 : 0,
                            quizData.is_published ? 1 : 0
                        ]
                    );
                    const newQuizId = quizInsert.insertId;
                    quizIdMap[quizData.old_id] = newQuizId;

                    if (quizData.questions && Array.isArray(quizData.questions)) {
                        for (const q of quizData.questions) {
                            const [qInsert] = await connection.query(
                                `INSERT INTO quiz_questions (quiz_id, question_text, question_type, image_url, points, order_index, explanation, data)
                                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                                [
                                    newQuizId, 
                                    q.question_text, 
                                    q.question_type || 'multiple_choice', 
                                    q.image_url || null, 
                                    q.points || 1, 
                                    q.order_index || 0, 
                                    q.explanation || '', 
                                    q.data ? JSON.stringify(q.data) : null
                                ]
                            );
                            const newQId = qInsert.insertId;

                            if (q.options && Array.isArray(q.options)) {
                                for (const opt of q.options) {
                                    await connection.query(
                                        `INSERT INTO quiz_options (question_id, option_text, is_correct, order_index)
                                         VALUES (?, ?, ?, ?)`,
                                        [newQId, opt.option_text, opt.is_correct ? 1 : 0, opt.order_index || 0]
                                    );
                                }
                            }
                        }
                    }
                }
            }

            // Import lesson contents
            for (const contentData of metadata.contents) {
                let data = { ...contentData.data };

                // Re-map quiz references
                if (contentData.content_type === 'quiz' && data.quiz_id) {
                    const oldQuizId = parseInt(data.quiz_id);
                    if (quizIdMap[oldQuizId]) {
                        data.quiz_id = quizIdMap[oldQuizId];
                    }
                }

                // Re-map survey references
                if (contentData.content_type === 'survey' && data.survey_id) {
                    const oldSurveyId = parseInt(data.survey_id);
                    if (surveyIdMap[oldSurveyId]) {
                        data.survey_id = surveyIdMap[oldSurveyId];
                    }
                }

                await connection.query(
                    `INSERT INTO lesson_contents (lesson_id, title, content_type, data, order_index, points, is_required)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        newLessonId, 
                        contentData.title, 
                        contentData.content_type, 
                        JSON.stringify(data), 
                        contentData.order_index, 
                        contentData.points || 0, 
                        contentData.is_required ? 1 : 0
                    ]
                );
            }

            // Import additional resources
            if (metadata.resources && Array.isArray(metadata.resources)) {
                for (const res of metadata.resources) {
                    await connection.query(
                        `INSERT INTO resources (module_id, lesson_id, title, description, resource_type, url, file_size)
                         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [targetModuleId, newLessonId, res.title, res.description || '', res.resource_type, res.url, res.file_size || 0]
                    );
                }
            }

            await connection.commit();

            // Clear cache to show new lesson immediately
            await clearCache('cache:/api/lessons*');
            await clearCache('cache:/api/modules*');
            await clearCache('cache:/api/dashboard*');

            logger.info(`Successfully imported lesson ${newLessonId} into module ${targetModuleId}`);
            return newLessonId;

        } catch (error) {
            await connection.rollback();
            logger.error('Error during lesson import transaction:', error);
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = new LessonMigrationService();
