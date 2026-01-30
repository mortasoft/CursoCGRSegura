-- CGR LMS Database Schema
-- Sistema de Gestión de Aprendizaje para CGR Segur@

CREATE DATABASE IF NOT EXISTS cgr_lms;
USE cgr_lms;

-- Tabla de departamentos / áreas
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de usuarios (funcionarios)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE COMMENT 'Cédula o ID de empleado',
    email VARCHAR(255) UNIQUE NOT NULL,
    google_id VARCHAR(255) UNIQUE COMMENT 'Google OAuth ID',
    password_hash VARCHAR(255) COMMENT 'Hash de contraseña (opcional si usa Google)',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    profile_picture TEXT COMMENT 'URL de foto de perfil de Google',
    department VARCHAR(100),
    position VARCHAR(100),
    role ENUM('student', 'instructor', 'admin') DEFAULT 'student',
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_employee_id (employee_id),
    INDEX idx_email (email),
    INDEX idx_google_id (google_id),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de módulos del curso
CREATE TABLE IF NOT EXISTS modules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    month VARCHAR(20) NOT NULL COMMENT 'Mes programado (Febrero, Marzo, etc.)',
    duration_minutes INT DEFAULT 60,
    is_published BOOLEAN DEFAULT FALSE,
    release_date DATE COMMENT 'Fecha de lanzamiento',
    order_index INT NOT NULL,
    points_to_earn INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_module_number (module_number),
    INDEX idx_order (order_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de lecciones dentro de cada módulo
CREATE TABLE IF NOT EXISTS lessons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content LONGTEXT COMMENT 'Contenido HTML de la lección',
    lesson_type ENUM('video', 'reading', 'interactive', 'quiz') DEFAULT 'reading',
    video_url TEXT,
    duration_minutes INT DEFAULT 15,
    order_index INT NOT NULL,
    is_published BOOLEAN DEFAULT FALSE,
    is_optional BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    INDEX idx_module_id (module_id),
    INDEX idx_order (order_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de recursos adicionales
CREATE TABLE IF NOT EXISTS resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module_id INT,
    lesson_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    resource_type ENUM('pdf', 'video', 'link', 'document') NOT NULL,
    url TEXT NOT NULL,
    file_size INT COMMENT 'Tamaño en bytes',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    INDEX idx_module_id (module_id),
    INDEX idx_lesson_id (lesson_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de evaluaciones/quizzes
CREATE TABLE IF NOT EXISTS quizzes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module_id INT NOT NULL,
    lesson_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    passing_score INT DEFAULT 80 COMMENT 'Porcentaje mínimo para aprobar',
    time_limit_minutes INT DEFAULT 30,
    max_attempts INT DEFAULT 3,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE SET NULL,
    INDEX idx_module_id (module_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de preguntas de quiz
CREATE TABLE IF NOT EXISTS quiz_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT NOT NULL,
    question_text TEXT NOT NULL,
    question_type ENUM('multiple_choice', 'true_false', 'multiple_select') DEFAULT 'multiple_choice',
    points INT DEFAULT 1,
    order_index INT NOT NULL,
    explanation TEXT COMMENT 'Explicación de la respuesta correcta',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    INDEX idx_quiz_id (quiz_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de opciones de respuesta
CREATE TABLE IF NOT EXISTS quiz_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    order_index INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE,
    INDEX idx_question_id (question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de progreso del usuario
CREATE TABLE IF NOT EXISTS user_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    module_id INT NOT NULL,
    lesson_id INT,
    status ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started',
    progress_percentage INT DEFAULT 0,
    time_spent_minutes INT DEFAULT 0,
    started_at DATETIME,
    completed_at DATETIME,
    last_accessed DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_lesson (user_id, lesson_id),
    INDEX idx_user_id (user_id),
    INDEX idx_module_id (module_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de intentos de quiz
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    quiz_id INT NOT NULL,
    attempt_number INT NOT NULL,
    score DECIMAL(5,2),
    passed BOOLEAN DEFAULT FALSE,
    time_spent_minutes INT,
    started_at DATETIME NOT NULL,
    completed_at DATETIME,
    answers JSON COMMENT 'Respuestas del usuario en formato JSON',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    INDEX idx_user_quiz (user_id, quiz_id),
    INDEX idx_completed (completed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de certificados
CREATE TABLE IF NOT EXISTS certificates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    module_id INT,
    certificate_code VARCHAR(100) UNIQUE NOT NULL,
    issued_at DATETIME NOT NULL,
    pdf_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_certificate_code (certificate_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de gamificación - puntos
CREATE TABLE IF NOT EXISTS user_points (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    points INT DEFAULT 0,
    level ENUM('Novato', 'Defensor', 'Guardián', 'CISO Honorario') DEFAULT 'Novato',
    badges JSON COMMENT 'Insignias obtenidas en formato JSON',
    rank_position INT,
    last_updated DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_points (user_id),
    INDEX idx_points (points DESC),
    INDEX idx_level (level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de insignias (badges)
CREATE TABLE IF NOT EXISTS badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_name VARCHAR(50) DEFAULT 'Award',
    image_url TEXT COMMENT 'Placeholder or URL to icon',
    criteria_type ENUM('module_completion', 'quiz_score', 'phishing_report', 'total_points', 'manual') DEFAULT 'manual',
    criteria_value VARCHAR(255) COMMENT 'ID of module, score needed, etc.',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de insignias obtenidas por el usuario
CREATE TABLE IF NOT EXISTS user_badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    badge_id INT NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_badge (user_id, badge_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de actividades de gamificación
CREATE TABLE IF NOT EXISTS gamification_activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    activity_type ENUM('lesson_completed', 'quiz_passed', 'module_completed', 'phishing_reported', 'perfect_score', 'early_completion') NOT NULL,
    points_earned INT NOT NULL,
    reference_id INT,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de simulacros de phishing
CREATE TABLE IF NOT EXISTS phishing_simulations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_name VARCHAR(255) NOT NULL,
    description TEXT,
    scheduled_date DATE NOT NULL,
    status ENUM('scheduled', 'active', 'completed') DEFAULT 'scheduled',
    total_sent INT DEFAULT 0,
    total_clicked INT DEFAULT 0,
    total_reported INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_scheduled_date (scheduled_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de resultados de simulacros por usuario
CREATE TABLE IF NOT EXISTS phishing_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    simulation_id INT NOT NULL,
    user_id INT NOT NULL,
    email_sent BOOLEAN DEFAULT FALSE,
    email_opened BOOLEAN DEFAULT FALSE,
    link_clicked BOOLEAN DEFAULT FALSE,
    credentials_entered BOOLEAN DEFAULT FALSE,
    reported BOOLEAN DEFAULT FALSE,
    clicked_at DATETIME,
    reported_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (simulation_id) REFERENCES phishing_simulations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_simulation_user (simulation_id, user_id),
    INDEX idx_simulation_id (simulation_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type ENUM('info', 'success', 'warning', 'danger') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    link_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de directorio maestro de funcionarios
CREATE TABLE IF NOT EXISTS staff_directory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    position VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_department (department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de logs de actividad
CREATE TABLE IF NOT EXISTS activity_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar módulos iniciales del curso CGR Segur@
INSERT INTO modules (module_number, title, description, month, duration_minutes, is_published, order_index) VALUES
(1, 'Fundamentos de Seguridad de la Información', 'Conceptos básicos de seguridad, marco normativo ISO 27001:2022, roles y responsabilidades, gestión de contraseñas y autenticación 2FA', 'Febrero', 120, TRUE, 1),
(2, 'Protección de Datos Personales', 'Ley N° 8968, clasificación de información, despersonalización de datos y almacenamiento seguro', 'Marzo', 90, TRUE, 2),
(3, 'Inteligencia Artificial y Ciberseguridad', 'IA en la CGR, riesgos de seguridad en sistemas de IA, monitoreo y confidencialidad', 'Abril', 90, TRUE, 3),
(4, 'Malware y Amenazas Digitales', 'Tipos de malware, phishing, spear phishing, detección y protección', 'Mayo', 100, TRUE, 4),
(5, 'Redes y Comunicaciones Seguras', 'Redes institucionales, Wi-Fi seguro, VPN, correo electrónico institucional', 'Julio', 80, TRUE, 5),
(6, 'Teletrabajo y Seguridad Física', 'Responsabilidades en teletrabajo, escritorio limpio, protección de activos', 'Agosto', 70, TRUE, 6),
(7, 'Gestión de Incidentes', 'Tipos de incidentes, detección, reporte y respuesta', 'Octubre', 90, TRUE, 7),
(8, 'Aspectos Avanzados de Seguridad', 'Criptografía, navegación segura, gestión de activos tecnológicos', 'Noviembre', 100, TRUE, 8);

-- Insertar áreas/departamentos iniciales
INSERT IGNORE INTO departments (name) VALUES 
('TI'), 
('Auditoría'), 
('Administración'), 
('Recursos Humanos'), 
('Jurídico');

-- Crear usuario administrador por defecto
INSERT INTO users (employee_id, email, password_hash, first_name, last_name, department, position, role, is_active) VALUES
('ADMIN001', 'admin@cgr.go.cr', '$2b$10$YourHashedPasswordHere', 'Administrador', 'Sistema', 'TI', 'Administrador LMS', 'admin', TRUE);

-- Crear usuario de prueba
INSERT INTO users (employee_id, email, password_hash, first_name, last_name, department, position, role, is_active) VALUES
('EMP001', 'funcionario@cgr.go.cr', '$2b$10$YourHashedPasswordHere', 'Juan', 'Pérez', 'Auditoría', 'Auditor', 'student', TRUE);
