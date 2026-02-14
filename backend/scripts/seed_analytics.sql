-- Seed Data for Analytics Reporting
-- Users (Role: student)
INSERT INTO users (first_name, last_name, email, password_hash, role, department, position, is_active, created_at) VALUES 
('Ana', 'Vargas', 'ana.vargas@cgr.go.cr', '$2b$10$EpO..', 'student', 'Unidad de Tecnologias de Informacion', 'Desarrollador Senior', 1, NOW()),
('Carlos', 'Mendez', 'carlos.mendez@cgr.go.cr', '$2b$10$EpO..', 'student', 'Unidad de Tecnologias de Informacion', 'Soporte Tecnico', 1, NOW()),
('Elena', 'Rojas', 'elena.rojas@cgr.go.cr', '$2b$10$EpO..', 'student', 'Unidad de Tecnologias de Informacion', 'Administrador de Redes', 1, NOW()),
('David', 'Siles', 'david.siles@cgr.go.cr', '$2b$10$EpO..', 'student', 'Unidad de Tecnologias de Informacion', 'Analista de Seguridad', 1, NOW()),
('Sofia', 'Castro', 'sofia.castro@cgr.go.cr', '$2b$10$EpO..', 'student', 'Unidad de Tecnologias de Informacion', 'QA Engineer', 1, NOW()),

('Luis', 'Perez', 'luis.perez@cgr.go.cr', '$2b$10$EpO..', 'student', 'Division de Gestion de Apoyo', 'Analista Administrativo', 1, NOW()),
('Maria', 'Gonzalez', 'maria.gonzalez@cgr.go.cr', '$2b$10$EpO..', 'student', 'Division de Gestion de Apoyo', 'Asistente de Recursos Humanos', 1, NOW()),
('Pedro', 'Sanchez', 'pedro.sanchez@cgr.go.cr', '$2b$10$EpO..', 'student', 'Division de Gestion de Apoyo', 'Contador', 1, NOW()),
('Laura', 'Ramirez', 'laura.ramirez@cgr.go.cr', '$2b$10$EpO..', 'student', 'Division de Gestion de Apoyo', 'Secretaria', 1, NOW()),

('Jorge', 'Jimenez', 'jorge.jimenez@cgr.go.cr', '$2b$10$EpO..', 'student', 'Auditoria Interna', 'Auditor Junior', 1, NOW()),
('Carmen', 'Mora', 'carmen.mora@cgr.go.cr', '$2b$10$EpO..', 'student', 'Auditoria Interna', 'Auditor Senior', 1, NOW()),
('Roberto', 'Diaz', 'roberto.diaz@cgr.go.cr', '$2b$10$EpO..', 'student', 'Auditoria Interna', 'Supervisor de Auditoria', 1, NOW()),

('Patricia', 'Solano', 'patricia.solano@cgr.go.cr', '$2b$10$EpO..', 'student', 'Division de Fiscalizacion Operativa y Evaluativa', 'Fiscalizador', 1, NOW()),
('Miguel', 'Vega', 'miguel.vega@cgr.go.cr', '$2b$10$EpO..', 'student', 'Division de Fiscalizacion Operativa y Evaluativa', 'Analista de Fiscalizacion', 1, NOW()),
('Andrea', 'Cordero', 'andrea.cordero@cgr.go.cr', '$2b$10$EpO..', 'student', 'Division de Fiscalizacion Operativa y Evaluativa', 'Jefe de Equipo', 1, NOW()),

('Ricardo', 'Monge', 'ricardo.monge@cgr.go.cr', '$2b$10$EpO..', 'student', 'Unidad de Gestion del Potencial Humano', 'Reclutador', 1, NOW()),
('Gabriela', 'Umana', 'gabriela.umana@cgr.go.cr', '$2b$10$EpO..', 'student', 'Unidad de Gestion del Potencial Humano', 'Capacitador', 1, NOW()),
('Fernando', 'Quiros', 'fernando.quiros@cgr.go.cr', '$2b$10$EpO..', 'student', 'Unidad de Gestion del Potencial Humano', 'Analista de Planillas', 1, NOW());

-- User Progress (Module 1, 2, 9 are published)
-- High Performers (UTI & AIG) - Mostly Completed
INSERT INTO user_progress (user_id, module_id, status, progress_percentage, completed_at) 
SELECT id, 1, 'completed', 100, NOW() FROM users WHERE department IN ('Unidad de Tecnologias de Informacion', 'Auditoria Interna') AND role = 'student';

INSERT INTO user_progress (user_id, module_id, status, progress_percentage, completed_at) 
SELECT id, 2, 'completed', 100, NOW() FROM users WHERE department IN ('Unidad de Tecnologias de Informacion', 'Auditoria Interna') AND id % 2 = 0 AND role = 'student';

INSERT INTO user_progress (user_id, module_id, status, progress_percentage, completed_at) 
SELECT id, 9, 'completed', 100, NOW() FROM users WHERE department IN ('Unidad de Tecnologias de Informacion') AND id % 3 = 0 AND role = 'student';

-- Mid Performers (DGA) - Some Completed, Some In Progress
INSERT INTO user_progress (user_id, module_id, status, progress_percentage, completed_at) 
SELECT id, 1, 'completed', 100, NOW() FROM users WHERE department = 'Division de Gestion de Apoyo' AND id % 2 != 0 AND role = 'student';

INSERT INTO user_progress (user_id, module_id, status, progress_percentage) 
SELECT id, 2, 'in_progress', 50 FROM users WHERE department = 'Division de Gestion de Apoyo' AND role = 'student';

-- Low Performers / At Risk (DFOE & UGPH) - Mostly Not Started or In Progress
INSERT INTO user_progress (user_id, module_id, status, progress_percentage) 
SELECT id, 1, 'in_progress', 30 FROM users WHERE department = 'Division de Fiscalizacion Operativa y Evaluativa' AND id % 2 = 0 AND role = 'student';

-- Certificates (For completed modules)
INSERT INTO certificates (user_id, module_id, issued_at, certificate_code)
SELECT user_id, module_id, completed_at, CONCAT('CERT-', user_id, '-', module_id, '-', FLOOR(RAND() * 1000))
FROM user_progress WHERE status = 'completed';
