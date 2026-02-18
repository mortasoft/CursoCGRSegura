-- Limpieza y creación de contenido para el Módulo 0 (Introducción)
USE cgr_lms;

SET @module_id = (SELECT id FROM modules WHERE module_number = 0 LIMIT 1);

-- 1. Eliminar contenido y lecciones previas del Módulo 0
DELETE FROM lesson_contents WHERE lesson_id IN (SELECT id FROM lessons WHERE module_id = @module_id);
DELETE FROM user_progress WHERE module_id = @module_id;
DELETE FROM lessons WHERE module_id = @module_id;

-- 2. Insertar Lección 1: Bienvenido a CGR Segura
INSERT INTO lessons (module_id, title, content, order_index, is_published, lesson_type) 
VALUES (@module_id, 'Bienvenido a CGR Segura', 'Introduccion general a la plataforma de aprendizaje.', 1, 1, 'reading');
SET @lesson_id_1 = LAST_INSERT_ID();

INSERT INTO lesson_contents (lesson_id, title, content_type, data, order_index, is_required, points) VALUES
(@lesson_id_1, 'Bienvenida', 'heading', '{"text": "Bienvenido a tu nueva plataforma de aprendizaje"}', 1, 0, 0),
(@lesson_id_1, 'Introduccion', 'text', '{"text": "CGR Segura es un espacio disenado para fortalecer tus capacidades en ciberseguridad. Aqui aprenderas a identificar amenazas, proteger la informacion institucional y navegar de forma segura en el entorno digital."}', 2, 0, 10),
(@lesson_id_1, 'Objetivo', 'text', '{"text": "El objetivo de este curso es que te conviertas en la primera linea de defensa de la CGR. A lo largo de los modulos, encontraras contenido interactivo, videos y desafios que pondran a prueba tus conocimientos."}', 3, 1, 10);

-- 3. Insertar Lección 2: Dashboard y Progreso
INSERT INTO lessons (module_id, title, content, order_index, is_published, lesson_type) 
VALUES (@module_id, 'Tu Dashboard y Progreso', 'Como interpretar tu panel principal y seguir tus avances.', 2, 1, 'reading');
SET @lesson_id_2 = LAST_INSERT_ID();

INSERT INTO lesson_contents (lesson_id, title, content_type, data, order_index, is_required, points) VALUES
(@lesson_id_2, 'El Panel Principal', 'heading', '{"text": "Todo lo que necesitas en un solo vistazo"}', 1, 0, 0),
(@lesson_id_2, 'Explicacion Dashboard', 'text', '{"text": "En el Dashboard veras tus modulos activos, tu nivel actual y la cantidad de puntos acumulados. Cada vez que completes una leccion, veras como tu barra de progreso se llena."}', 2, 0, 10),
(@lesson_id_2, 'Puntos de Experiencia (XP)', 'text', '{"text": "Los puntos (XP) representan tu esfuerzo. Entre mas contenidos consumas y mejor califiques en los examenes, mas rapido subiras de nivel."}', 3, 1, 10);

-- 4. Insertar Lección 3: Gamificacion y Premios
INSERT INTO lessons (module_id, title, content, order_index, is_published, lesson_type) 
VALUES (@module_id, 'Gamificacion e Insignias', 'El sistema de medallas y el ranking de funcionarios.', 3, 1, 'reading');
SET @lesson_id_3 = LAST_INSERT_ID();

INSERT INTO lesson_contents (lesson_id, title, content_type, data, order_index, is_required, points) VALUES
(@lesson_id_3, 'Reconocimiento a tu Esfuerzo', 'heading', '{"text": "Gana insignias y destaca"}', 1, 0, 0),
(@lesson_id_3, 'Insignias', 'text', '{"text": "Las insignias son medallas especiales que recibes por hitos especificos: completar modulos en tiempo record, mantener rachas de actividad o alcanzar puntajes perfectos. Puedes verlas todas en tu perfil."}', 2, 0, 10),
(@lesson_id_3, 'El Ranking', 'text', '{"text": "Quieres ver como te comparas con otros compañeros? En la seccion de Ranking podras ver a los lideres de la plataforma. Compite de forma sana y demuestra tu compromiso con la seguridad"}', 3, 1, 20);
