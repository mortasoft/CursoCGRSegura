-- Creación de contenido para el Módulo 1 (Fundamentos de Seguridad)
USE cgr_lms;

SET @module_id = (SELECT id FROM modules WHERE module_number = 1 LIMIT 1);

-- 1. Eliminar contenido previo del Módulo 1 (Limpieza)
DELETE FROM lesson_contents WHERE lesson_id IN (SELECT id FROM lessons WHERE module_id = @module_id);
DELETE FROM user_progress WHERE module_id = @module_id;
DELETE FROM lessons WHERE module_id = @module_id;

-- 2. Lección 1: La Tríada CIA (Confidencialidad, Integridad y Disponibilidad)
INSERT INTO lessons (module_id, title, content, order_index, is_published, lesson_type) 
VALUES (@module_id, 'La Triada CIA', 'Los pilares fundamentales de la seguridad de la informacion.', 1, 1, 'reading');
SET @lesson_id_1 = LAST_INSERT_ID();

INSERT INTO lesson_contents (lesson_id, title, content_type, data, order_index, is_required, points) VALUES
(@lesson_id_1, 'Pilares de Seguridad', 'heading', '{"text": "Entendiendo la Triada CIA"}', 1, 0, 0),
(@lesson_id_1, 'Confidencialidad', 'text', '{"text": "Asegura que la informacion sea accesible unicamente para quienes tienen autorizacion legal o administrativa. En la CGR, esto es vital para proteger datos sensibles de auditorias y denuncias."}', 2, 0, 10),
(@lesson_id_1, 'Integridad', 'text', '{"text": "Garantiza que la informacion sea exacta y no haya sido alterada por terceros. Un informe de auditoria debe mantener su integridad desde su creacion hasta su publicacion final."}', 3, 0, 10),
(@lesson_id_1, 'Disponibilidad', 'text', '{"text": "Asegura que los sistemas y los datos esten listos para ser usados cuando el funcionario lo necesite. Un ataque que tumbe el sistema de gestion documental afecta directamente la disponibilidad."}', 4, 1, 10);

-- 3. Lección 2: Marco Normativo e ISO 27001:2022
INSERT INTO lessons (module_id, title, content, order_index, is_published, lesson_type) 
VALUES (@module_id, 'Marco Normativo e ISO 27001', 'Normas internacionales y lineamientos institucionales en la CGR.', 2, 1, 'reading');
SET @lesson_id_2 = LAST_INSERT_ID();

INSERT INTO lesson_contents (lesson_id, title, content_type, data, order_index, is_required, points) VALUES
(@lesson_id_2, 'Estandares Globales', 'heading', '{"text": "ISO 27001:2022 en la CGR"}', 1, 0, 0),
(@lesson_id_2, 'ISO 27001:2022', 'text', '{"text": "Es la norma internacional para los Sistemas de Gestion de Seguridad de la Informacion (SGSI). La CGR adopta estos estandares para asegurar que nuestras practicas cumplan con las mejores expectativas globales de ciberseguridad."}', 2, 0, 15),
(@lesson_id_2, 'Marco Institucional', 'text', '{"text": "La CGR cuenta con politicas de uso de activos y manejo de informacion que todos los funcionarios deben conocer. No se trata solo de reglas, sino de un compromiso con la integridad de la Republica."}', 3, 1, 15);

-- 4. Lección 3: Roles, Responsabilidades y Acuerdos
INSERT INTO lessons (module_id, title, content, order_index, is_published, lesson_type) 
VALUES (@module_id, 'Roles y Responsabilidades', 'Tu papel fundamental en la proteccion de los activos.', 3, 1, 'reading');
SET @lesson_id_3 = LAST_INSERT_ID();

INSERT INTO lesson_contents (lesson_id, title, content_type, data, order_index, is_required, points) VALUES
(@lesson_id_3, 'Responsabilidades', 'heading', '{"text": "El Factor Humano: Tu Responsabilidad"}', 1, 0, 0),
(@lesson_id_3, 'Roles de Seguridad', 'text', '{"text": "Desde TI hasta las unidades administrativas, todos tienen un rol. Como funcionario, eres el custodio de los datos que manejas a diario."}', 2, 0, 10),
(@lesson_id_3, 'Acuerdos de Confidencialidad', 'text', '{"text": "El acuerdo de confidencialidad es un compromiso formal para no divulgar informacion sensible. Su violacion puede tener consecuencias administrativas y legales serias para el funcionario."}', 3, 1, 15);

-- 5. Lección 4: Higiene Digital (Passwords y 2FA)
INSERT INTO lessons (module_id, title, content, order_index, is_published, lesson_type) 
VALUES (@module_id, 'Gestion de Contrasenas y 2FA', 'Herramientas practicas para asegurar tu acceso diario.', 4, 1, 'interactive');
SET @lesson_id_4 = LAST_INSERT_ID();

INSERT INTO lesson_contents (lesson_id, title, content_type, data, order_index, is_required, points) VALUES
(@lesson_id_4, 'Contrasenas Robustas', 'heading', '{"text": "Fortaleciendo tus Llaves Digitales"}', 1, 0, 0),
(@lesson_id_4, 'Gestion de Passwords', 'text', '{"text": "Usa frases de contrasena largas, combina caracteres y evita fechas de nacimiento o nombres de mascotas. Nunca compartas tus llaves con otros."}', 2, 0, 15),
(@lesson_id_4, 'Autenticacion de Dos Factores (2FA)', 'text', '{"text": "El 2FA agrega una capa extra. Incluso si alguien roba tu contrasena, necesitara el codigo de tu aplicacion movil o token para entrar. Es una de las defensas mas efectivas!"}', 3, 1, 20);
