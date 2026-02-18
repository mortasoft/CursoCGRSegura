-- Mejora de contenido para el Módulo 0 (Tutorial CGR Segur@)
USE cgr_lms;

SET @module_id = (SELECT id FROM modules WHERE module_number = 0 LIMIT 1);

-- 1. Limpieza total del Módulo 0
DELETE FROM lesson_contents WHERE lesson_id IN (SELECT id FROM lessons WHERE module_id = @module_id);
DELETE FROM user_progress WHERE module_id = @module_id;
DELETE FROM lessons WHERE module_id = @module_id;

-- 2. Lección 1: ¡Bienvenido a CGR Segura!
INSERT INTO lessons (module_id, title, content, order_index, is_published, lesson_type) 
VALUES (@module_id, '¡Bienvenido a CGR Segura!', 'Comienza tu viaje en la plataforma lider de ciberseguridad.', 1, 1, 'reading');
SET @lesson_id_1 = LAST_INSERT_ID();

INSERT INTO lesson_contents (lesson_id, title, content_type, data, order_index, is_required, points) VALUES
(@lesson_id_1, 'Tu nueva plataforma', 'heading', '{"text": "Tu nueva plataforma de aprendizaje"}', 1, 0, 0),
(@lesson_id_1, 'Introduccion', 'text', '{"text": "CGR Segura es el centro de formacion digital disenado especificamente para los funcionarios de la Contraloria General de la Republica. Tu mision aqui es clara: aprender a proteger los datos sensibles de nuestra institucion."}', 2, 0, 10),
(@lesson_id_1, 'Experiencia inmersiva', 'text', '{"text": "A diferencia de otros cursos, aqui viviras una experiencia interactiva. Encontraras videos, laboratorios leyendos y desafios que te haran subir de nivel como si estuvieras en un juego profesional de estrategia."}', 3, 1, 10),
(@lesson_id_1, 'Nota Pro', 'note', '{"text": "Te recomendamos usar audifonos al ver los videos para una mejor inmersion en los temas de seguridad."}', 4, 0, 5);

-- 3. Lección 2: Navegando el Dashboard
INSERT INTO lessons (module_id, title, content, order_index, is_published, lesson_type) 
VALUES (@module_id, 'Navegando el Dashboard', 'Aprende a identificar tus herramientas principales.', 2, 1, 'reading');
SET @lesson_id_2 = LAST_INSERT_ID();

INSERT INTO lesson_contents (lesson_id, title, content_type, data, order_index, is_required, points) VALUES
(@lesson_id_2, 'El Centro de Control', 'heading', '{"text": "Tu Centro de Control"}', 1, 0, 0),
(@lesson_id_2, 'El Dashboard', 'text', '{"text": "Al iniciar sesion, el Dashboard te mostrara de inmediato en que punto te quedaste. Podras ver la barra de progreso de los modulos activos, tu balance de puntos y las ultimas insignias obtenidas."}', 2, 0, 10),
(@lesson_id_2, 'Los Modulos', 'text', '{"text": "En la seccion de Modulos podras ver todos los cursos disponibles. Algunos estaran bloqueados hasta que completes los fundamentos basicos. ¡La seguridad se construye paso a paso!"}', 3, 1, 10);

-- 4. Lección 3: Ranking y Reconocimiento
INSERT INTO lessons (module_id, title, content, order_index, is_published, lesson_type) 
VALUES (@module_id, 'Ranking y Reconocimiento', 'La gloria te espera en la tabla de lideres.', 3, 1, 'reading');
SET @lesson_id_3 = LAST_INSERT_ID();

INSERT INTO lesson_contents (lesson_id, title, content_type, data, order_index, is_required, points) VALUES
(@lesson_id_3, 'Compite con Honor', 'heading', '{"text": "Gamificacion y el Ranking"}', 1, 0, 0),
(@lesson_id_3, 'Los Puntos', 'text', '{"text": "Cada accion cuenta. Visualizar contenidos, completar lecciones y sobre todo, obtener buenos resultados en los quices, te otorgara puntos de experiencia (XP)."}', 2, 0, 10),
(@lesson_id_3, 'Insignias', 'text', '{"text": "Las insignias no son solo adornos. Representan logros especificos como velocidad, racha o maestria. Cada vez que ganes una, veras una celebracion en pantalla y se guardara en tu perfil publico."}', 3, 0, 10),
(@lesson_id_3, 'El Top 10', 'text', '{"text": "Visita frecuentemente el Ranking para ver quien lidera la institucion en conocimientos de seguridad. ¿Tienes lo necesario para estar en el primer lugar?"}', 4, 1, 10);

-- 5. Lección 4: Certificaciones y Exitos
INSERT INTO lessons (module_id, title, content, order_index, is_published, lesson_type) 
VALUES (@module_id, 'Certificaciones y Exitos', 'Alcanza la meta y obten tu certificado oficial.', 4, 1, 'reading');
SET @lesson_id_4 = LAST_INSERT_ID();

INSERT INTO lesson_contents (lesson_id, title, content_type, data, order_index, is_required, points) VALUES
(@lesson_id_4, 'Tu Recompensa Final', 'heading', '{"text": "Certificados Digitales"}', 1, 0, 0),
(@lesson_id_4, 'El Examen Final', 'text', '{"text": "Al final de cada modulo, deberas aprobar un cuestionario. Si obtienes la nota minima, el sistema generara automaticamente un certificado digital a tu nombre."}', 2, 0, 10),
(@lesson_id_4, 'Descarga y Comparte', 'text', '{"text": "Tus certificados se guardan en tu perfil. Puedes descargarlos en formato PDF para adjuntarlos a tu hoja de vida o historial institucional."}', 3, 1, 15);
