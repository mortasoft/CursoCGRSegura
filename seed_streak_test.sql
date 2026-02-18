-- Semilla para probar la insignia de Racha
-- Crea una actividad para el usuario Mario Zamora ayer
-- Para que al completar algo hoy, se dispare la insignia

USE cgr_lms;

-- Asegurarnos de que no tenga ya la insignia para la prueba
DELETE FROM user_badges WHERE user_id = 3 AND badge_id = 3;

-- Insertar una actividad fake para AYER
-- Restamos 24 horas a la fecha actual
INSERT INTO gamification_activities (user_id, activity_type, points_earned, reference_id, description, created_at)
VALUES (3, 'lesson_completed', 10, 1, 'Actividad de prueba de ayer', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Opcional: Asegurarnos de que hoy NO tenga actividades aun (para que el usuario sea quien la cree)
DELETE FROM gamification_activities WHERE user_id = 3 AND DATE(created_at) = CURDATE();
