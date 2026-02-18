/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.2.6-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: 127.0.0.1    Database: cgr_lms
-- ------------------------------------------------------
-- Server version	11.2.6-MariaDB-ubu2204

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `activity_logs` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_action` (`action`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_logs`
--

LOCK TABLES `activity_logs` WRITE;
/*!40000 ALTER TABLE `activity_logs` DISABLE KEYS */;
INSERT INTO `activity_logs` VALUES
(1,3,'login',NULL,NULL,'::ffff:172.18.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',NULL,'2026-02-09 15:21:00'),
(2,3,'login',NULL,NULL,'::ffff:172.18.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',NULL,'2026-02-09 16:07:50'),
(3,3,'login',NULL,NULL,'::ffff:172.18.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',NULL,'2026-02-09 21:01:37'),
(4,3,'login',NULL,NULL,'::ffff:172.19.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',NULL,'2026-02-11 03:10:38'),
(5,3,'login',NULL,NULL,'::ffff:172.19.0.5','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',NULL,'2026-02-12 15:14:51'),
(6,3,'logout',NULL,NULL,'::ffff:172.19.0.5',NULL,NULL,'2026-02-12 16:28:32'),
(7,3,'login',NULL,NULL,'::ffff:172.19.0.5','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',NULL,'2026-02-12 16:28:38'),
(8,3,'logout',NULL,NULL,'::ffff:172.19.0.5',NULL,NULL,'2026-02-12 16:29:40'),
(9,3,'login',NULL,NULL,'::ffff:172.19.0.5','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',NULL,'2026-02-12 16:29:46'),
(10,3,'login',NULL,NULL,'::ffff:172.19.0.5','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',NULL,'2026-02-12 17:32:55'),
(11,3,'login',NULL,NULL,'::ffff:172.19.0.5','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',NULL,'2026-02-12 18:11:25'),
(12,3,'logout',NULL,NULL,'::ffff:172.19.0.5',NULL,NULL,'2026-02-12 19:47:10'),
(13,3,'login',NULL,NULL,'::ffff:172.19.0.5','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',NULL,'2026-02-12 19:47:25'),
(14,3,'login',NULL,NULL,'::ffff:172.19.0.5','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',NULL,'2026-02-12 20:04:39'),
(15,3,'login',NULL,NULL,'::ffff:172.19.0.4','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',NULL,'2026-02-14 00:43:09'),
(16,3,'logout',NULL,NULL,'::ffff:172.19.0.4',NULL,NULL,'2026-02-14 01:34:26'),
(17,3,'login',NULL,NULL,'::ffff:172.19.0.4','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',NULL,'2026-02-14 01:34:35'),
(18,3,'logout',NULL,NULL,'::ffff:172.19.0.4',NULL,NULL,'2026-02-14 01:34:38'),
(19,3,'login',NULL,NULL,'::ffff:172.19.0.4','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',NULL,'2026-02-14 01:42:16'),
(20,3,'login',NULL,NULL,'::ffff:172.19.0.5','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',NULL,'2026-02-16 19:39:33'),
(21,3,'login',NULL,NULL,'::ffff:172.19.0.5','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',NULL,'2026-02-17 20:58:05'),
(22,3,'logout',NULL,NULL,'::ffff:172.19.0.5',NULL,NULL,'2026-02-18 01:34:14'),
(23,3,'login',NULL,NULL,'::ffff:172.19.0.5','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',NULL,'2026-02-18 01:34:18'),
(24,3,'logout',NULL,NULL,'::ffff:172.19.0.5',NULL,NULL,'2026-02-18 01:35:15'),
(25,3,'login',NULL,NULL,'::ffff:172.19.0.5','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',NULL,'2026-02-18 01:35:21'),
(26,3,'login',NULL,NULL,'::ffff:172.19.0.5','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',NULL,'2026-02-18 03:32:26');
/*!40000 ALTER TABLE `activity_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assignment_submissions`
--

DROP TABLE IF EXISTS `assignment_submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `assignment_submissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `content_id` int(11) NOT NULL COMMENT 'Referencia a lesson_contents id',
  `user_id` int(11) NOT NULL,
  `file_url` text NOT NULL,
  `submitted_at` timestamp NULL DEFAULT current_timestamp(),
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `feedback` text DEFAULT NULL,
  `grade` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_content_user` (`content_id`,`user_id`),
  CONSTRAINT `assignment_submissions_ibfk_1` FOREIGN KEY (`content_id`) REFERENCES `lesson_contents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `assignment_submissions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignment_submissions`
--

LOCK TABLES `assignment_submissions` WRITE;
/*!40000 ALTER TABLE `assignment_submissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `assignment_submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `badges`
--

DROP TABLE IF EXISTS `badges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `badges` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `icon_name` varchar(50) DEFAULT 'Award',
  `image_url` text DEFAULT NULL COMMENT 'Placeholder or URL to icon',
  `criteria_type` enum('module_completion','quiz_score','phishing_report','total_points','manual') DEFAULT 'manual',
  `criteria_value` varchar(255) DEFAULT NULL COMMENT 'ID of module, score needed, etc.',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `badges`
--

LOCK TABLES `badges` WRITE;
/*!40000 ALTER TABLE `badges` DISABLE KEYS */;
INSERT INTO `badges` VALUES
(2,'Bienvenido a la seguridad','Se consigue luego de haber perdido un m├│dulo/curso. Primer paso en tu camino de aprendizaje.','Award','bienvenida-seguridad.svg','manual',NULL,'2026-02-16 20:10:03','2026-02-16 20:10:03'),
(3,'Se enciende la Racha','Participando en actividades por dos d├¡as seguidos. ┬íMant├®n el ritmo!','Zap','racha-encendida.svg','manual',NULL,'2026-02-16 20:10:03','2026-02-16 20:10:03'),
(4,'Club de la Velocidad I','Terminar un m├│dulo en 5 min o menos. ┬íEres un rayo!','Zap','club-velocidad.svg','manual',NULL,'2026-02-16 20:10:03','2026-02-18 01:49:36'),
(5,'Lo mejor de la Sabana','Completa dos m├│dulos seguidos. Un verdadero experto en la materia.','Star','mejor-sabana.svg','manual',NULL,'2026-02-16 20:10:03','2026-02-16 20:10:03'),
(6,'El inicio de la seguridad','Iniciar un M├│dulo. El conocimiento es tu mejor defensa.','Bell','inicio-seguridad.svg','manual',NULL,'2026-02-16 20:10:03','2026-02-16 20:10:03'),
(7,'Un gran poder lleva una gran seguridad','Terminar el m├│dulo 1. Has fortalecido tus defensas b├ísicas.','ShieldCheck','gran-poder-seguridad.svg','module_completion','1','2026-02-16 20:10:03','2026-02-16 20:10:03'),
(8,'M├ís seguridad','Obteniendo todas las insignias iniciales. El nivel m├íximo de protecci├│n.','Crown','mas-seguridad.svg','manual',NULL,'2026-02-16 20:10:03','2026-02-16 20:10:03'),
(9,'Desaf├¡o aceptado','Entra en la clasificaci├│n de puntos. Has demostrado tu compromiso.','Target','desafio-aceptado.svg','manual',NULL,'2026-02-16 20:10:03','2026-02-16 20:10:03'),
(10,'Seguridad sin igual','Descarga 1 recurso adicional de cualquier curso. Buscando la excelencia.','Search','seguridad-sin-igual.svg','manual',NULL,'2026-02-16 20:10:03','2026-02-16 20:10:03'),
(11,'Seguridad contra lo peor','Termina el m├│dulo 4. Eres un experto en detecci├│n de amenazas.','ShieldAlert','seguridad-contra-peor.svg','module_completion','4','2026-02-16 20:10:03','2026-02-16 20:10:03'),
(12,'Seguridad Legendaria','Termina en el top 10 de la clasificaci├│n. Un referente para la instituci├│n.','Trophy','seguridad-legendaria.svg','manual',NULL,'2026-02-16 20:10:03','2026-02-16 20:10:03'),
(13,'Ciber-Prestigio','Acumula una gran cantidad de puntos en la clasificaci├│n. Reconocimiento a tu trayectoria.','Award','ciber-prestigio.svg','total_points','1000','2026-02-16 20:10:03','2026-02-16 20:10:03'),
(14,'Era de la Ciber Seguridad','Termina todos los m├│dulos del programa. Graduado en CGR Segur@.','Trophy','era-ciberseguridad.svg','manual',NULL,'2026-02-16 20:10:03','2026-02-16 20:10:03'),
(15,'Enfrentamiento por la seguridad','Defiende tu posici├│n en la tabla de posiciones por varios d├¡as.','Shield','enfrentamiento-seguridad.svg','manual',NULL,'2026-02-16 20:10:03','2026-02-16 20:10:03'),
(16,'Club de la Velocidad II','Terminar un m├│dulo en 10 min o menos. Demuestra tu agilidad mental.','Zap','club-velocidad.svg','manual',NULL,'2026-02-18 01:49:36','2026-02-18 01:51:34'),
(17,'Club de la Velocidad III','Terminar un m├│dulo en 20 min o menos. ┬íMantienes un excelente ritmo!','Zap','club-velocidad.svg','manual',NULL,'2026-02-18 03:04:35','2026-02-18 03:04:35');
/*!40000 ALTER TABLE `badges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `certificates`
--

DROP TABLE IF EXISTS `certificates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `certificates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `module_id` int(11) DEFAULT NULL,
  `certificate_code` varchar(100) NOT NULL,
  `issued_at` datetime NOT NULL,
  `pdf_url` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `certificate_code` (`certificate_code`),
  KEY `module_id` (`module_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_certificate_code` (`certificate_code`),
  CONSTRAINT `certificates_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `certificates_ibfk_2` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `certificates`
--

LOCK TABLES `certificates` WRITE;
/*!40000 ALTER TABLE `certificates` DISABLE KEYS */;
/*!40000 ALTER TABLE `certificates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `departments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES
(32,'├ürea de Fiscalizaci├│n para el Desarrollo de Capacidades (CAP)','2026-02-09 15:46:38'),
(33,'├ürea de Fiscalizaci├│n para el Desarrollo de la Gobernanza (GOB)','2026-02-09 15:46:38'),
(34,'├ürea de Fiscalizaci├│n para el Desarrollo de las Ciudades (CIU)','2026-02-09 15:46:38'),
(35,'├ürea de Fiscalizaci├│n para el Desarrollo de las Finanzas P├║blicas (FIP)','2026-02-09 15:46:38'),
(36,'├ürea de Fiscalizaci├│n para el Desarrollo del Bienestar Social (BIS)','2026-02-09 15:46:38'),
(37,'├ürea de Fiscalizaci├│n para el Desarrollo Local (LOC)','2026-02-09 15:46:38'),
(38,'├ürea de Fiscalizaci├│n para el Desarrollo Sostenible (SOS)','2026-02-09 15:46:38'),
(39,'├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','2026-02-09 15:46:38'),
(40,'├ürea de Seguimiento para la Mejora P├║blica (SEM)','2026-02-09 15:46:38'),
(41,'├ürea para la Innovaci├│n y Aprendizaje en la Fiscalizaci├│n (IAF)','2026-02-09 15:46:38'),
(42,'Auditor├¡a Interna (AIG)','2026-02-09 15:46:38'),
(43,'Despacho Contralor (DC)','2026-02-09 15:46:38'),
(44,'Divisi├│n de Contratacion Publica (DCP)','2026-02-09 15:46:38'),
(45,'Divisi├│n de Fiscalizaci├│n Operativa y Evaluativa (DFOE)','2026-02-09 15:46:38'),
(46,'Divisi├│n de Gesti├│n de Apoyo (DGA)','2026-02-09 15:46:38'),
(47,'Division Juridica (DJ)','2026-02-09 15:46:38'),
(48,'Unidad Centro de Capacitaci├│n (UCC)','2026-02-09 15:46:38'),
(49,'Unidad de Administraci├│n Financiera (UAF)','2026-02-09 15:46:38'),
(50,'Unidad de Gesti├│n del Potencial Humano (UGPH)','2026-02-09 15:46:38'),
(51,'Unidad de Gobierno Corporativo (UGC)','2026-02-09 15:46:38'),
(52,'Unidad de Prensa (UPC)','2026-02-09 15:46:38'),
(53,'Unidad de Servicios de Informaci├│n (USI)','2026-02-09 15:46:38'),
(54,'Unidad de Servicios de Proveedur├¡a (USP)','2026-02-09 15:46:38'),
(55,'Unidad de Servicios Generales (USG)','2026-02-09 15:46:38'),
(56,'Unidad de Tecnolog├¡as de Informaci├│n (UTI)','2026-02-09 15:46:38'),
(57,'Unidad Jur├¡dica Interna (UJI)','2026-02-09 15:46:38');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gamification_activities`
--

DROP TABLE IF EXISTS `gamification_activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gamification_activities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `activity_type` enum('lesson_completed','quiz_passed','module_completed','phishing_reported','perfect_score','early_completion','resource_downloaded') NOT NULL,
  `points_earned` int(11) NOT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `gamification_activities_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=211 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gamification_activities`
--

LOCK TABLES `gamification_activities` WRITE;
/*!40000 ALTER TABLE `gamification_activities` DISABLE KEYS */;
/*!40000 ALTER TABLE `gamification_activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gamification_levels`
--

DROP TABLE IF EXISTS `gamification_levels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gamification_levels` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `min_points` int(11) NOT NULL,
  `icon` varchar(50) DEFAULT 'Award',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gamification_levels`
--

LOCK TABLES `gamification_levels` WRITE;
/*!40000 ALTER TABLE `gamification_levels` DISABLE KEYS */;
INSERT INTO `gamification_levels` VALUES
(21,'Novato',0,'Award','2026-02-09 21:38:43','2026-02-09 21:38:43'),
(22,'Iniciado',50,'ChevronRight','2026-02-09 21:38:43','2026-02-09 21:38:43'),
(23,'Defensor',150,'Shield','2026-02-09 21:38:43','2026-02-09 21:38:43'),
(24,'Protector',300,'ShieldCheck','2026-02-09 21:38:43','2026-02-09 21:38:43'),
(25,'Guardi├ín',500,'ShieldAlert','2026-02-09 21:38:43','2026-02-09 21:38:43'),
(26,'Vigilante',750,'Eye','2026-02-09 21:38:43','2026-02-09 21:38:43'),
(27,'Centinela',1000,'Zap','2026-02-09 21:38:43','2026-02-09 21:38:43'),
(28,'Maestro Segur@',1500,'Star','2026-02-09 21:38:43','2026-02-09 21:38:43'),
(29,'CISO Honorario',2500,'Trophy','2026-02-09 21:38:43','2026-02-09 21:38:43'),
(30,'Leyenda Cyber',5000,'Crown','2026-02-09 21:38:43','2026-02-09 21:38:43');
/*!40000 ALTER TABLE `gamification_levels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lesson_contents`
--

DROP TABLE IF EXISTS `lesson_contents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lesson_contents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `lesson_id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `content_type` enum('text','video','image','file','link','quiz','survey','assignment','note','heading') NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Almacena contenido HTML, URLs, ID de quiz, config de archivo, etc.' CHECK (json_valid(`data`)),
  `order_index` int(11) NOT NULL,
  `is_required` tinyint(1) DEFAULT 0,
  `points` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_lesson_id` (`lesson_id`),
  CONSTRAINT `lesson_contents_ibfk_1` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lesson_contents`
--

LOCK TABLES `lesson_contents` WRITE;
/*!40000 ALTER TABLE `lesson_contents` DISABLE KEYS */;
INSERT INTO `lesson_contents` VALUES
(12,8,'123213123','text','{\"text\":\"213213123123213211\"}',1,1,10,'2026-02-12 16:32:58','2026-02-12 16:32:58'),
(13,8,'13213213','link','{\"url\":\"http://localhost/admin/lessons/8/editor\"}',2,1,10,'2026-02-12 16:33:07','2026-02-12 16:33:07'),
(14,9,'asdasd','text','{\"text\":\"sadsadsadasdasdsa\"}',1,1,1,'2026-02-12 16:44:07','2026-02-12 16:44:07'),
(27,15,'Pilares de Seguridad','heading','{\"text\": \"Entendiendo la Triada CIA\"}',1,0,0,'2026-02-18 04:44:03','2026-02-18 04:44:03'),
(28,15,'Confidencialidad','text','{\"text\": \"Asegura que la informacion sea accesible unicamente para quienes tienen autorizacion legal o administrativa. En la CGR, esto es vital para proteger datos sensibles de auditorias y denuncias.\"}',2,0,10,'2026-02-18 04:44:03','2026-02-18 04:44:03'),
(29,15,'Integridad','text','{\"text\": \"Garantiza que la informacion sea exacta y no haya sido alterada por terceros. Un informe de auditoria debe mantener su integridad desde su creacion hasta su publicacion final.\"}',3,0,10,'2026-02-18 04:44:03','2026-02-18 04:44:03'),
(30,15,'Disponibilidad','text','{\"text\": \"Asegura que los sistemas y los datos esten listos para ser usados cuando el funcionario lo necesite. Un ataque que tumbe el sistema de gestion documental afecta directamente la disponibilidad.\"}',4,1,10,'2026-02-18 04:44:03','2026-02-18 04:44:03'),
(31,16,'Estandares Globales','heading','{\"text\": \"ISO 27001:2022 en la CGR\"}',1,0,0,'2026-02-18 04:44:03','2026-02-18 04:44:03'),
(32,16,'ISO 27001:2022','text','{\"text\": \"Es la norma internacional para los Sistemas de Gestion de Seguridad de la Informacion (SGSI). La CGR adopta estos estandares para asegurar que nuestras practicas cumplan con las mejores expectativas globales de ciberseguridad.\"}',2,0,15,'2026-02-18 04:44:03','2026-02-18 04:44:03'),
(33,16,'Marco Institucional','text','{\"text\": \"La CGR cuenta con politicas de uso de activos y manejo de informacion que todos los funcionarios deben conocer. No se trata solo de reglas, sino de un compromiso con la integridad de la Republica.\"}',3,1,15,'2026-02-18 04:44:03','2026-02-18 04:44:03'),
(34,17,'Responsabilidades','heading','{\"text\": \"El Factor Humano: Tu Responsabilidad\"}',1,0,0,'2026-02-18 04:44:03','2026-02-18 04:44:03'),
(35,17,'Roles de Seguridad','text','{\"text\": \"Desde TI hasta las unidades administrativas, todos tienen un rol. Como funcionario, eres el custodio de los datos que manejas a diario.\"}',2,0,10,'2026-02-18 04:44:03','2026-02-18 04:44:03'),
(36,17,'Acuerdos de Confidencialidad','text','{\"text\": \"El acuerdo de confidencialidad es un compromiso formal para no divulgar informacion sensible. Su violacion puede tener consecuencias administrativas y legales serias para el funcionario.\"}',3,1,15,'2026-02-18 04:44:03','2026-02-18 04:44:03'),
(37,18,'Contrasenas Robustas','heading','{\"text\": \"Fortaleciendo tus Llaves Digitales\"}',1,0,0,'2026-02-18 04:44:03','2026-02-18 04:44:03'),
(38,18,'Gestion de Passwords','text','{\"text\": \"Usa frases de contrasena largas, combina caracteres y evita fechas de nacimiento o nombres de mascotas. Nunca compartas tus llaves con otros.\"}',2,0,15,'2026-02-18 04:44:03','2026-02-18 04:44:03'),
(39,18,'Autenticacion de Dos Factores (2FA)','text','{\"text\": \"El 2FA agrega una capa extra. Incluso si alguien roba tu contrasena, necesitara el codigo de tu aplicacion movil o token para entrar. Es una de las defensas mas efectivas!\"}',3,1,20,'2026-02-18 04:44:03','2026-02-18 04:44:03'),
(40,19,'Tu nueva plataforma','heading','{\"text\": \"Tu nueva plataforma de aprendizaje\"}',1,0,0,'2026-02-18 04:56:50','2026-02-18 04:56:50'),
(41,19,'Introduccion','text','{\"text\": \"CGR Segura es el centro de formacion digital disenado especificamente para los funcionarios de la Contraloria General de la Republica. Tu mision aqui es clara: aprender a proteger los datos sensibles de nuestra institucion.\"}',2,0,10,'2026-02-18 04:56:50','2026-02-18 04:56:50'),
(42,19,'Experiencia inmersiva','text','{\"text\": \"A diferencia de otros cursos, aqui viviras una experiencia interactiva. Encontraras videos, laboratorios leyendos y desafios que te haran subir de nivel como si estuvieras en un juego profesional de estrategia.\"}',3,1,10,'2026-02-18 04:56:50','2026-02-18 04:56:50'),
(43,19,'Nota Pro','note','{\"text\": \"Te recomendamos usar audifonos al ver los videos para una mejor inmersion en los temas de seguridad.\"}',4,0,5,'2026-02-18 04:56:50','2026-02-18 04:56:50'),
(44,20,'El Centro de Control','heading','{\"text\": \"Tu Centro de Control\"}',1,0,0,'2026-02-18 04:56:50','2026-02-18 04:56:50'),
(45,20,'El Dashboard','text','{\"text\": \"Al iniciar sesion, el Dashboard te mostrara de inmediato en que punto te quedaste. Podras ver la barra de progreso de los modulos activos, tu balance de puntos y las ultimas insignias obtenidas.\"}',2,0,10,'2026-02-18 04:56:50','2026-02-18 04:56:50'),
(46,20,'Los Modulos','text','{\"text\": \"En la seccion de Modulos podras ver todos los cursos disponibles. Algunos estaran bloqueados hasta que completes los fundamentos basicos. ??La seguridad se construye paso a paso!\"}',3,1,10,'2026-02-18 04:56:50','2026-02-18 04:56:50'),
(47,21,'Compite con Honor','heading','{\"text\": \"Gamificacion y el Ranking\"}',1,0,0,'2026-02-18 04:56:50','2026-02-18 04:56:50'),
(48,21,'Los Puntos','text','{\"text\": \"Cada accion cuenta. Visualizar contenidos, completar lecciones y sobre todo, obtener buenos resultados en los quices, te otorgara puntos de experiencia (XP).\"}',2,0,10,'2026-02-18 04:56:50','2026-02-18 04:56:50'),
(49,21,'Insignias','text','{\"text\": \"Las insignias no son solo adornos. Representan logros especificos como velocidad, racha o maestria. Cada vez que ganes una, veras una celebracion en pantalla y se guardara en tu perfil publico.\"}',3,0,10,'2026-02-18 04:56:50','2026-02-18 04:56:50'),
(50,21,'El Top 10','text','{\"text\": \"Visita frecuentemente el Ranking para ver quien lidera la institucion en conocimientos de seguridad. ??Tienes lo necesario para estar en el primer lugar?\"}',4,1,10,'2026-02-18 04:56:50','2026-02-18 04:56:50'),
(51,22,'Tu Recompensa Final','heading','{\"text\": \"Certificados Digitales\"}',1,0,0,'2026-02-18 04:56:50','2026-02-18 04:56:50'),
(52,22,'El Examen Final','text','{\"text\": \"Al final de cada modulo, deberas aprobar un cuestionario. Si obtienes la nota minima, el sistema generara automaticamente un certificado digital a tu nombre.\"}',2,0,10,'2026-02-18 04:56:50','2026-02-18 04:56:50'),
(53,22,'Descarga y Comparte','text','{\"text\": \"Tus certificados se guardan en tu perfil. Puedes descargarlos en formato PDF para adjuntarlos a tu hoja de vida o historial institucional.\"}',3,1,15,'2026-02-18 04:56:50','2026-02-18 04:56:50');
/*!40000 ALTER TABLE `lesson_contents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lessons`
--

DROP TABLE IF EXISTS `lessons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lessons` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `module_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` longtext DEFAULT NULL COMMENT 'Contenido HTML de la lecci├│n',
  `lesson_type` enum('video','reading','interactive','quiz') DEFAULT 'reading',
  `video_url` text DEFAULT NULL,
  `duration_minutes` int(11) DEFAULT 15,
  `order_index` int(11) NOT NULL,
  `is_published` tinyint(1) DEFAULT 0,
  `is_optional` tinyint(1) DEFAULT 0,
  `points` int(11) DEFAULT 10,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_module_id` (`module_id`),
  KEY `idx_order` (`order_index`),
  CONSTRAINT `lessons_ibfk_1` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lessons`
--

LOCK TABLES `lessons` WRITE;
/*!40000 ALTER TABLE `lessons` DISABLE KEYS */;
INSERT INTO `lessons` VALUES
(8,2,'111111',NULL,'reading',NULL,15,1,1,0,10,'2026-02-12 16:32:32','2026-02-12 16:32:32'),
(9,2,'Proteccion de datos personales',NULL,'interactive',NULL,15,2,1,0,10,'2026-02-12 16:43:52','2026-02-12 16:43:58'),
(15,1,'La Triada CIA','Los pilares fundamentales de la seguridad de la informacion.','reading',NULL,15,1,1,0,10,'2026-02-18 04:44:03','2026-02-18 04:44:03'),
(16,1,'Marco Normativo e ISO 27001','Normas internacionales y lineamientos institucionales en la CGR.','reading',NULL,15,2,1,0,10,'2026-02-18 04:44:03','2026-02-18 04:44:03'),
(17,1,'Roles y Responsabilidades','Tu papel fundamental en la proteccion de los activos.','reading',NULL,15,3,1,0,10,'2026-02-18 04:44:03','2026-02-18 04:44:03'),
(18,1,'Gestion de Contrasenas y 2FA','Herramientas practicas para asegurar tu acceso diario.','interactive',NULL,15,4,1,0,10,'2026-02-18 04:44:03','2026-02-18 04:44:03'),
(19,9,'??Bienvenido a CGR Segura!','Comienza tu viaje en la plataforma lider de ciberseguridad.','reading',NULL,15,1,1,0,10,'2026-02-18 04:56:50','2026-02-18 04:56:50'),
(20,9,'Navegando el Dashboard','Aprende a identificar tus herramientas principales.','reading',NULL,15,2,1,0,10,'2026-02-18 04:56:50','2026-02-18 04:56:50'),
(21,9,'Ranking y Reconocimiento','La gloria te espera en la tabla de lideres.','reading',NULL,15,3,1,0,10,'2026-02-18 04:56:50','2026-02-18 04:56:50'),
(22,9,'Certificaciones y Exitos','Alcanza la meta y obten tu certificado oficial.','reading',NULL,15,4,1,0,10,'2026-02-18 04:56:50','2026-02-18 04:56:50');
/*!40000 ALTER TABLE `lessons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `modules`
--

DROP TABLE IF EXISTS `modules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `modules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `module_number` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `month` varchar(20) DEFAULT NULL,
  `duration_minutes` int(11) DEFAULT 60,
  `is_published` tinyint(1) DEFAULT 0,
  `generates_certificate` tinyint(1) DEFAULT 1,
  `requires_previous` tinyint(1) DEFAULT 0,
  `release_date` date DEFAULT NULL COMMENT 'Fecha de lanzamiento',
  `order_index` int(11) NOT NULL,
  `points_to_earn` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `image_url` varchar(512) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_module_number` (`module_number`),
  KEY `idx_order` (`order_index`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `modules`
--

LOCK TABLES `modules` WRITE;
/*!40000 ALTER TABLE `modules` DISABLE KEYS */;
INSERT INTO `modules` VALUES
(1,1,'Fundamentos de Seguridad de la Informaci├│n','Conceptos b├ísicos de seguridad, marco normativo ISO 27001:2022, roles y responsabilidades, gesti├│n de contrase├▒as y autenticaci├│n 2FA','Febrero',0,1,1,1,'2026-02-11',1,0,'2026-02-09 15:17:26','2026-02-13 00:41:07','https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80'),
(2,2,'Protecci├│n de Datos Personales','Ley N┬░ 8968, clasificaci├│n de informaci├│n, despersonalizaci├│n de datos y almacenamiento seguro','Marzo',0,1,1,1,'2026-03-23',2,0,'2026-02-09 15:17:26','2026-02-13 01:05:20','https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80'),
(3,3,'Inteligencia Artificial y Ciberseguridad','IA en la CGR, riesgos de seguridad en sistemas de IA, monitoreo y confidencialidad','Abril',90,0,1,0,'2026-02-09',3,0,'2026-02-09 15:17:26','2026-02-10 16:18:01','https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80'),
(4,4,'Malware y Amenazas Digitales','Tipos de malware, phishing, spear phishing, detecci├│n y protecci├│n','Mayo',100,0,1,0,'2026-02-11',4,0,'2026-02-09 15:17:26','2026-02-10 16:18:01','https://images.unsplash.com/photo-1563206767-5b18f218e8de?auto=format&fit=crop&w=800&q=80'),
(5,5,'Redes y Comunicaciones Seguras','Redes institucionales, Wi-Fi seguro, VPN, correo electr├│nico institucional','Julio',80,0,1,0,'2026-02-10',5,0,'2026-02-09 15:17:26','2026-02-10 16:18:01','https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&w=800&q=80'),
(6,6,'Teletrabajo y Seguridad F├¡sica','Responsabilidades en teletrabajo, escritorio limpio, protecci├│n de activos','Agosto',70,0,1,0,'2026-02-15',6,0,'2026-02-09 15:17:26','2026-02-10 16:18:01','https://images.unsplash.com/photo-1586282391129-59a998fd034c?auto=format&fit=crop&w=800&q=80'),
(7,7,'Gesti├│n de Incidentes','Tipos de incidentes, detecci├│n, reporte y respuesta','Octubre',90,0,1,0,'2026-02-09',7,0,'2026-02-09 15:17:26','2026-02-10 16:18:01','https://images.unsplash.com/photo-1454165833267-02300a204e33?auto=format&fit=crop&w=800&q=80'),
(8,8,'Aspectos Avanzados de Seguridad','Criptograf├¡a, navegaci├│n segura, gesti├│n de activos tecnol├│gicos','Noviembre',100,0,1,0,'2026-02-09',8,0,'2026-02-09 15:17:26','2026-02-10 16:18:01','https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80'),
(9,0,'Tutorial CGR Segur@','┬íBienvenido a tu viaje de aprendizaje! En este m├│dulo introductorio, te guiaremos paso a paso por todas las funciones de la plataforma, desde c├│mo navegar por tus lecciones hasta c├│mo conquistar el ranking y coleccionar insignias.','Febrero',0,1,0,0,'2026-02-09',0,10,'2026-02-09 16:34:17','2026-02-18 04:56:17','https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80');
/*!40000 ALTER TABLE `modules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `notification_type` enum('info','success','warning','danger') DEFAULT 'info',
  `is_read` tinyint(1) DEFAULT 0,
  `link_url` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `read_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_created_at` (`created_at` DESC),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `phishing_results`
--

DROP TABLE IF EXISTS `phishing_results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `phishing_results` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `simulation_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `email_sent` tinyint(1) DEFAULT 0,
  `email_opened` tinyint(1) DEFAULT 0,
  `link_clicked` tinyint(1) DEFAULT 0,
  `credentials_entered` tinyint(1) DEFAULT 0,
  `reported` tinyint(1) DEFAULT 0,
  `clicked_at` datetime DEFAULT NULL,
  `reported_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_simulation_user` (`simulation_id`,`user_id`),
  KEY `idx_simulation_id` (`simulation_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `phishing_results_ibfk_1` FOREIGN KEY (`simulation_id`) REFERENCES `phishing_simulations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `phishing_results_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phishing_results`
--

LOCK TABLES `phishing_results` WRITE;
/*!40000 ALTER TABLE `phishing_results` DISABLE KEYS */;
/*!40000 ALTER TABLE `phishing_results` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `phishing_simulations`
--

DROP TABLE IF EXISTS `phishing_simulations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `phishing_simulations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `scheduled_date` date NOT NULL,
  `status` enum('scheduled','active','completed') DEFAULT 'scheduled',
  `total_sent` int(11) DEFAULT 0,
  `total_clicked` int(11) DEFAULT 0,
  `total_reported` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_scheduled_date` (`scheduled_date`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phishing_simulations`
--

LOCK TABLES `phishing_simulations` WRITE;
/*!40000 ALTER TABLE `phishing_simulations` DISABLE KEYS */;
/*!40000 ALTER TABLE `phishing_simulations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quiz_attempts`
--

DROP TABLE IF EXISTS `quiz_attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `quiz_attempts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `quiz_id` int(11) NOT NULL,
  `attempt_number` int(11) NOT NULL,
  `score` decimal(5,2) DEFAULT NULL,
  `passed` tinyint(1) DEFAULT 0,
  `time_spent_minutes` int(11) DEFAULT NULL,
  `started_at` datetime NOT NULL,
  `completed_at` datetime DEFAULT NULL,
  `answers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Respuestas del usuario en formato JSON' CHECK (json_valid(`answers`)),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `quiz_id` (`quiz_id`),
  KEY `idx_user_quiz` (`user_id`,`quiz_id`),
  KEY `idx_completed` (`completed_at`),
  CONSTRAINT `quiz_attempts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `quiz_attempts_ibfk_2` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_attempts`
--

LOCK TABLES `quiz_attempts` WRITE;
/*!40000 ALTER TABLE `quiz_attempts` DISABLE KEYS */;
/*!40000 ALTER TABLE `quiz_attempts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quiz_options`
--

DROP TABLE IF EXISTS `quiz_options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `quiz_options` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `question_id` int(11) NOT NULL,
  `option_text` text NOT NULL,
  `is_correct` tinyint(1) DEFAULT 0,
  `order_index` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_question_id` (`question_id`),
  CONSTRAINT `quiz_options_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `quiz_questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_options`
--

LOCK TABLES `quiz_options` WRITE;
/*!40000 ALTER TABLE `quiz_options` DISABLE KEYS */;
/*!40000 ALTER TABLE `quiz_options` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quiz_questions`
--

DROP TABLE IF EXISTS `quiz_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `quiz_questions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `quiz_id` int(11) NOT NULL,
  `question_text` text NOT NULL,
  `question_type` enum('multiple_choice','true_false','multiple_select') DEFAULT 'multiple_choice',
  `points` int(11) DEFAULT 1,
  `order_index` int(11) NOT NULL,
  `explanation` text DEFAULT NULL COMMENT 'Explicaci├│n de la respuesta correcta',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_quiz_id` (`quiz_id`),
  CONSTRAINT `quiz_questions_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_questions`
--

LOCK TABLES `quiz_questions` WRITE;
/*!40000 ALTER TABLE `quiz_questions` DISABLE KEYS */;
/*!40000 ALTER TABLE `quiz_questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quizzes`
--

DROP TABLE IF EXISTS `quizzes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `quizzes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `module_id` int(11) NOT NULL,
  `lesson_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `type` enum('quiz','survey') DEFAULT 'quiz',
  `description` text DEFAULT NULL,
  `passing_score` int(11) DEFAULT 80 COMMENT 'Porcentaje m├¡nimo para aprobar',
  `time_limit_minutes` int(11) DEFAULT 30,
  `max_attempts` int(11) DEFAULT 3,
  `is_published` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `lesson_id` (`lesson_id`),
  KEY `idx_module_id` (`module_id`),
  CONSTRAINT `quizzes_ibfk_1` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`) ON DELETE CASCADE,
  CONSTRAINT `quizzes_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quizzes`
--

LOCK TABLES `quizzes` WRITE;
/*!40000 ALTER TABLE `quizzes` DISABLE KEYS */;
/*!40000 ALTER TABLE `quizzes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resources`
--

DROP TABLE IF EXISTS `resources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `resources` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `module_id` int(11) DEFAULT NULL,
  `lesson_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `resource_type` enum('pdf','video','link','document','drive') NOT NULL,
  `url` text NOT NULL,
  `file_size` int(11) DEFAULT NULL COMMENT 'Tama├▒o en bytes',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_module_id` (`module_id`),
  KEY `idx_lesson_id` (`lesson_id`),
  CONSTRAINT `resources_ibfk_1` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`) ON DELETE CASCADE,
  CONSTRAINT `resources_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resources`
--

LOCK TABLES `resources` WRITE;
/*!40000 ALTER TABLE `resources` DISABLE KEYS */;
INSERT INTO `resources` VALUES
(1,1,NULL,'Gu├¡a R├ípida de Ciberseguridad','Una gu├¡a esencial para proteger tus datos.','pdf','https://www.cgr.go.cr/download/guia-seguridad.pdf',NULL,'2026-02-16 20:17:24'),
(2,9,NULL,'Lineamientos de Seguridad de la Informacion','2433','pdf','/uploads/resources/res-1771273382080-9232954.pdf',83209,'2026-02-16 20:23:02'),
(3,9,NULL,'Carpeta con archivos','https://drive.google.com/drive/folders/1bA684Gi7tETW_Q_DYdUl3m0I_oBLiIiT','drive','https://drive.google.com/drive/folders/1bA684Gi7tETW_Q_DYdUl3m0I_oBLiIiT',0,'2026-02-16 20:52:08');
/*!40000 ALTER TABLE `resources` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_directory`
--

DROP TABLE IF EXISTS `staff_directory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `staff_directory` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `position` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_department` (`department`)
) ENGINE=InnoDB AUTO_INCREMENT=698 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_directory`
--

LOCK TABLES `staff_directory` WRITE;
/*!40000 ALTER TABLE `staff_directory` DISABLE KEYS */;
INSERT INTO `staff_directory` VALUES
(1,'angtai.xie@cgr.go.cr','Xie Angtai','├ürea de Fiscalizaci├│n para el Desarrollo Local (LOC)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(2,'marco.oconitrillo@cgr.go.cr','Oconitrillo Gonz├ílez Marco Antonio','├ürea de Fiscalizaci├│n para el Desarrollo de las Finanzas P├║blicas (FIP)','Auxiliar de Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(3,'maria.calderon@cgr.go.cr','Calder├│n Ferrey Ma. de los ├üngeles','Division Juridica (DJ)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(4,'ingrid.noguera@cgr.go.cr','Noguera Garc├¡a Ingrid del Carmen','Unidad de Servicios de Proveedur├¡a (USP)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(5,'bianca.mena@cgr.go.cr','Mena Hern├índez Bianca Giselle','Unidad de Servicios de Proveedur├¡a (USP)','Oficinista','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(6,'benjamin.pavlotzky@cgr.go.cr','Pavlotzky Blank Benjam├¡n','Unidad de Gobierno Corporativo (UGC)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(7,'eneida.flores@cgr.go.cr','Flores Canales Eneida','Unidad de Servicios de Proveedur├¡a (USP)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(8,'alexa.valle@cgr.go.cr','Valle Valladares Alexa Lilibeth','├ürea de Fiscalizaci├│n para el Desarrollo Local (LOC)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(9,'xiomara.cisnado@cgr.go.cr','Cisnado Torres Xiomara','Unidad Centro de Capacitaci├│n (UCC)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(10,'marvin.novoa@cgr.go.cr','Novoa M├®ndez Marvin Ellendy','Unidad de Servicios Generales (USG)','Supervisor de Seguridad','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(11,'sonia.cheng@cgr.go.cr','Cheng Tam Sonia','├ürea de Seguimiento para la Mejora P├║blica (SEM)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(12,'sofia.camacho@cgr.go.cr','Camacho Alc├│cer Sof├¡a Keyrin','├ürea de Fiscalizaci├│n para el Desarrollo Sostenible (SOS)','Secretaria','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(13,'marcos.ortega@cgr.go.cr','Ortega Anch├¡a Marcos Josu├®','Unidad de Gesti├│n del Potencial Humano (UGPH)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(14,'krisberlyn.solano@cgr.go.cr','Solano Mora Krisberlyn Yarelis','Auditor├¡a Interna (AIG)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(15,'joberlin.mena@cgr.go.cr','Mena Loaiza Joberlin Andrea','├ürea de Fiscalizaci├│n para el Desarrollo del Bienestar Social (BIS)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(16,'gabriela.lopez@cgr.go.cr','L├│pez Ure├▒a Gabriela Alejandra','├ürea para la Innovaci├│n y Aprendizaje en la Fiscalizaci├│n (IAF)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(17,'giancarlos.murillo@cgr.go.cr','Murillo V├ísquez Giancarlos','Unidad de Servicios Generales (USG)','Supervisor de Seguridad','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(18,'felix.vasquez@cgr.go.cr','V├ísquez Ort├¡z F├®lix','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Asistente T├®cnico','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(19,'shirley.carranza@cgr.go.cr','Carranza P├®rez Shirley','├ürea de Fiscalizaci├│n para el Desarrollo del Bienestar Social (BIS)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(20,'melissa.fallas@cgr.go.cr','Fallas Morales Wendy Melissa','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(21,'jose.porras@cgr.go.cr','Porras Brenes Jos├® Alexis','Unidad de Administraci├│n Financiera (UAF)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(22,'violeta.medina@cgr.go.cr','Medina Garc├¡a Eida Violeta','├ürea de Fiscalizaci├│n para el Desarrollo Local (LOC)','Secretaria','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(23,'keider.morales@cgr.go.cr','Morales Hern├índez Keider Ivanhoe','Unidad de Servicios Generales (USG)','Supervisor de Seguridad','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(24,'ricardo.rodriguez@cgr.go.cr','Rodr├¡guez Hern├índez Ricardo Alonso','├ürea de Fiscalizaci├│n para el Desarrollo de las Ciudades (CIU)','Asistente T├®cnico','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(25,'adrian.perez@cgr.go.cr','P├®rez P├®rez Adri├ín de los ├üngeles','Unidad de Servicios Generales (USG)','Oficial de Seguridad','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(26,'jessica.viquez@cgr.go.cr','V├¡quez Alvarado Jessica Elena','├ürea para la Innovaci├│n y Aprendizaje en la Fiscalizaci├│n (IAF)','Gerente de Area/Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(27,'carolina.munoz@cgr.go.cr','Mu├▒oz Vega Carolina','├ürea de Fiscalizaci├│n para el Desarrollo del Bienestar Social (BIS)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(28,'michael.fernandez@cgr.go.cr','Fern├índez Uma├▒a Michael Josu├®','Unidad de Servicios Generales (USG)','Trabajador Auxiliar','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(29,'alvaro.chaverri@cgr.go.cr','Chaverri Matamoros ├ülvaro Jos├®','Unidad de Servicios Generales (USG)','Oficial de Seguridad','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(30,'alberto.gamboa@cgr.go.cr','Gamboa Cabezas Luis Alberto','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(31,'hansel.arias@cgr.go.cr','Arias Ram├¡rez Hansel','Division Juridica (DJ)','Gerente de Area/Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(32,'jose.manuel.espinoza@cgr.go.cr','Espinoza Reyes Jos├® Manuel','├ürea para la Innovaci├│n y Aprendizaje en la Fiscalizaci├│n (IAF)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(33,'esmeralda.mendez@cgr.go.cr','M├®ndez Guti├®rrez Esmeralda','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(34,'jorge.zeledon@cgr.go.cr','Zeled├│n Guti├®rrez Jorge E.','Unidad de Servicios Generales (USG)','Trabajador Auxiliar','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(35,'marta.acosta@cgr.go.cr','Acosta Z├║├▒iga Marta Eugenia','Despacho Contralor (DC)','Contralor (a) General','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(36,'leidy.gonzalez@cgr.go.cr','Gonz├ílez Quesada Leidy Melissa','├ürea de Fiscalizaci├│n para el Desarrollo Sostenible (SOS)','Auxiliar de Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(37,'adriana.castrillo@cgr.go.cr','Castrillo Gonz├ílez Adriana','├ürea de Fiscalizaci├│n para el Desarrollo de Capacidades (CAP)','Auxiliar de Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(38,'keylor.gutierrez@cgr.go.cr','Guti├®rrez Alvarado Keylor','├ürea de Fiscalizaci├│n para el Desarrollo de las Finanzas P├║blicas (FIP)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(39,'daniela.aviles@cgr.go.cr','Avil├®s Pizarro Daniela','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(40,'hellen.alvarado@cgr.go.cr','Alvarado Ord├│├▒ez Hellen Paola','├ürea de Fiscalizaci├│n para el Desarrollo Sostenible (SOS)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(41,'alejandra.morice@cgr.go.cr','Morice Sandoval Mar├¡a Alejandra','├ürea de Fiscalizaci├│n para el Desarrollo de las Ciudades (CIU)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(42,'erick.alvarado@cgr.go.cr','Alvarado Mu├▒oz Erick Antonio','├ürea de Fiscalizaci├│n para el Desarrollo Sostenible (SOS)','Asistente T├®cnico','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(43,'fabio.vilchez@cgr.go.cr','Vilchez Cort├®s Fabio Enrique','Auditor├¡a Interna (AIG)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(44,'jose.marchena@cgr.go.cr','Marchena Viales Jos├® Heriberto','Unidad de Servicios Generales (USG)','Oficial de Seguridad','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(45,'carolina.guevara@cgr.go.cr','Guevara Cabalceta Carolina','Unidad de Servicios de Proveedur├¡a (USP)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(46,'elena.alvarado@cgr.go.cr','Alvarado Mu├▒oz Mar├¡a Elena','Division Juridica (DJ)','Secretaria de Gerencia','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(47,'walter.guido@cgr.go.cr','Guido Espinoza Walter','Unidad de Servicios de Informaci├│n (USI)','Jefe de Unidad','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(48,'ashly.morales@cgr.go.cr','Morales Chac├│n Ashly Michelle','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Auxiliar de Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(49,'mauricio.rojas@cgr.go.cr','Rojas Segnini Mauricio','├ürea de Fiscalizaci├│n para el Desarrollo de la Gobernanza (GOB)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(50,'melissa.vargas@cgr.go.cr','Vargas Barrantes Melissa Andrea','Division Juridica (DJ)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(51,'sinai.arroyo@cgr.go.cr','Arroyo Alfaro Sina├¡','Division Juridica (DJ)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(52,'angie.viquez@cgr.go.cr','V├¡quez G├│mez Angie Vanessa','├ürea de Fiscalizaci├│n para el Desarrollo del Bienestar Social (BIS)','Secretaria','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(53,'josselinne.hernandez@cgr.go.cr','Hern├índez Rodr├¡guez Josselinne Tattiana','├ürea de Fiscalizaci├│n para el Desarrollo de las Finanzas P├║blicas (FIP)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(54,'greivin.guido@cgr.go.cr','Guido Bustos Greivin Alfredo','Unidad de Servicios de Informaci├│n (USI)','Oficinista','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(55,'mariel.fonseca@cgr.go.cr','Fonseca Guti├®rrez Mariel Melissa','├ürea de Seguimiento para la Mejora P├║blica (SEM)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(56,'fernando.vargas@cgr.go.cr','Vargas Hern├índez Fernando Isa├¡as','Unidad Centro de Capacitaci├│n (UCC)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(57,'dennis.vargas@cgr.go.cr','Vargas Bola├▒os Dennis Arturo','Auditor├¡a Interna (AIG)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(58,'andrea.garro@cgr.go.cr','Garro Arias Andrea Melissa','├ürea de Fiscalizaci├│n para el Desarrollo Sostenible (SOS)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(59,'georgina.azofeifa@cgr.go.cr','Azofeifa Vindas Georgina Mar├¡a','├ürea de Fiscalizaci├│n para el Desarrollo de Capacidades (CAP)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(60,'adriana.delgado@cgr.go.cr','Delgado Fern├índez Adriana Rebeca','Division Juridica (DJ)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(61,'viria.viquez@cgr.go.cr','V├¡quez Alfaro Viria Vanessa','Unidad de Administraci├│n Financiera (UAF)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(62,'catalina.vargas@cgr.go.cr','Vargas Ram├¡rez Ana Catalina','Division Juridica (DJ)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(63,'marvin.mejia@cgr.go.cr','Mej├¡a Vargas Marvin','├ürea de Fiscalizaci├│n para el Desarrollo de la Gobernanza (GOB)','Asistente T├®cnico','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(64,'iris.vargas@cgr.go.cr','Vargas Barquero Iris','├ürea de Fiscalizaci├│n para el Desarrollo Local (LOC)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(65,'marcela.bonilla@cgr.go.cr','Bonilla Gonz├ílez Marcela Mar├¡a','├ürea de Fiscalizaci├│n para el Desarrollo de las Finanzas P├║blicas (FIP)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(66,'karen.castro@cgr.go.cr','Castro Montero Karen Mar├¡a','Divisi├│n de Contratacion Publica (DCP)','Asistente T├®cnico','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(67,'marianela.bonilla@cgr.go.cr','Bonilla Vargas Marianela','Unidad de Gesti├│n del Potencial Humano (UGPH)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(68,'erick.porras@cgr.go.cr','Porras Chac├│n Erick Jos├®','Unidad de Servicios de Proveedur├¡a (USP)','Oficinista','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(69,'diego.ramirez@cgr.go.cr','Ram├¡rez Gonz├ílez Luis Diego','Division Juridica (DJ)','Gerente de Division','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(70,'monica.aguilar@cgr.go.cr','Aguilar Mora M├│nica de los ├üngeles','Unidad de Servicios de Informaci├│n (USI)','Secretaria','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(71,'ileana.gonzalez@cgr.go.cr','Gonz├ílez Chaverri Ileana','├ürea de Fiscalizaci├│n para el Desarrollo de la Gobernanza (GOB)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(72,'javier.villalobos@cgr.go.cr','Villalobos Cruz Francisco Javier','Unidad de Gesti├│n del Potencial Humano (UGPH)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(73,'gerardo.villalobos@cgr.go.cr','Villalobos Guill├®n Gerardo Alberto','Divisi├│n de Contratacion Publica (DCP)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(74,'heidy.artavia@cgr.go.cr','Artavia Bola├▒os Heidy','├ürea de Fiscalizaci├│n para el Desarrollo Sostenible (SOS)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(75,'isaac.gonzalez@cgr.go.cr','Gonz├ílez S├ínchez Isaac Gerardo','Unidad de Servicios Generales (USG)','Supervisor de Seguridad','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(76,'marcela.herrera@cgr.go.cr','Herrera Garro Marcela','Unidad de Administraci├│n Financiera (UAF)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(77,'yirlane.orozco@cgr.go.cr','Orozco Sancho Yirlane','Unidad de Tecnolog├¡as de Informaci├│n (UTI)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(78,'juan.luis.camacho@cgr.go.cr','Camacho Segura Juan Luis','├ürea de Fiscalizaci├│n para el Desarrollo Sostenible (SOS)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(79,'jorge.hernandez@cgr.go.cr','Hern├índez Carballo Jorge','Auditor├¡a Interna (AIG)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(80,'gustavo.camacho@cgr.go.cr','Camacho Chaves Gustavo','├ürea de Fiscalizaci├│n para el Desarrollo del Bienestar Social (BIS)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(81,'alvaro.camacho@cgr.go.cr','Camacho Soto Alvaro de Jes├║s','Unidad Centro de Capacitaci├│n (UCC)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(82,'marco.alvarado@cgr.go.cr','Alvarado Quesada Marco Vinicio','Unidad de Servicios de Proveedur├¡a (USP)','Jefe de Unidad','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(83,'manuel.martinez@cgr.go.cr','Mart├¡nez Sequeira Manuel','Divisi├│n de Gesti├│n de Apoyo (DGA)','Gerente de Division','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(84,'rachel.gomez@cgr.go.cr','G├│mez Brenes Rachel Fabiola','Unidad de Servicios de Informaci├│n (USI)','Oficinista','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(85,'monserrat.solis@cgr.go.cr','Sol├¡s Carvajal Monserrat','Unidad de Servicios de Informaci├│n (USI)','Secretaria','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(86,'andres.saborio@cgr.go.cr','Sabor├¡o Arrieta Andr├®s Antonio','├ürea de Fiscalizaci├│n para el Desarrollo de las Ciudades (CIU)','Auxiliar de Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(87,'carlos.calderon@cgr.go.cr','Calder├│n Camacho Luis Carlos','├ürea de Fiscalizaci├│n para el Desarrollo de las Finanzas P├║blicas (FIP)','Auxiliar de Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(88,'stiven.rojas@cgr.go.cr','Rojas Murillo Stiven Eduardo','Unidad de Tecnolog├¡as de Informaci├│n (UTI)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(89,'jean.carlo.alfaro@cgr.go.cr','Alfaro Ram├¡rez Jean Carlo','Unidad de Tecnolog├¡as de Informaci├│n (UTI)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(90,'ashly.aguilar@cgr.go.cr','Aguilar Barboza Ashly Valeria','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Secretaria','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(91,'marcia.vivas@cgr.go.cr','Vivas Mena Marcia de los ├üngeles','├ürea de Seguimiento para la Mejora P├║blica (SEM)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(92,'alina.jimenez@cgr.go.cr','Jim├®nez Brenes Alina de los ├üngeles','├ürea de Fiscalizaci├│n para el Desarrollo de las Finanzas P├║blicas (FIP)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(93,'keilyn.brenes@cgr.go.cr','Brenes Rojas Keilyn Roxana','├ürea de Fiscalizaci├│n para el Desarrollo de Capacidades (CAP)','Auxiliar de Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(94,'oscar.herrera@cgr.go.cr','Herrera Montero Oscar Andr├®s','Unidad de Tecnolog├¡as de Informaci├│n (UTI)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(95,'jonnathan.molina@cgr.go.cr','Molina Campos Jonnathan Andrey','Division Juridica (DJ)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(96,'daniela.gutierrez@cgr.go.cr','Guti├®rrez Montero Karen Daniela','Unidad de Gobierno Corporativo (UGC)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(97,'daniel.velasquez@cgr.go.cr','Vel├ísquez Arias Daniel Octavio','├ürea de Fiscalizaci├│n para el Desarrollo Local (LOC)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(98,'luis.picado@cgr.go.cr','Picado Rivera Luis Alejandro','├ürea de Fiscalizaci├│n para el Desarrollo de las Ciudades (CIU)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(99,'oscar.coto@cgr.go.cr','Coto Morales Oscar Mario','├ürea de Fiscalizaci├│n para el Desarrollo de las Finanzas P├║blicas (FIP)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(100,'david.cespedes@cgr.go.cr','C├®spedes Cambronero David Alexander','Division Juridica (DJ)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(101,'#N/D','Campos Rodr├¡guez Joseph Antonio','├ürea de Fiscalizaci├│n para el Desarrollo de la Gobernanza (GOB)','Auxiliar de Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(102,'ana.solano@cgr.go.cr','Solano Granados Ana Cristina','Unidad Centro de Capacitaci├│n (UCC)','Secretaria','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(103,'allison.godinez@cgr.go.cr','God├¡nez Ure├▒a Allison Cristina','├ürea de Fiscalizaci├│n para el Desarrollo Local (LOC)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(104,'monica.torres@cgr.go.cr','Torres Rojas M├│nica','Unidad de Servicios de Informaci├│n (USI)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(105,'marvin.barrios@cgr.go.cr','Barrios Navarro Marvin Jos├®','├ürea para la Innovaci├│n y Aprendizaje en la Fiscalizaci├│n (IAF)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(106,'maria.laura.arce@cgr.go.cr','Arce Aguilar Mar├¡a Laura','├ürea de Fiscalizaci├│n para el Desarrollo Local (LOC)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(107,'daniel.alfaro@cgr.go.cr','Alfaro Ballestero Daniel Jos├®','├ürea para la Innovaci├│n y Aprendizaje en la Fiscalizaci├│n (IAF)','Auxiliar de Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(108,'ivannia.badilla@cgr.go.cr','Badilla Ram├¡rez Ivannia Luc├¡a','├ürea de Fiscalizaci├│n para el Desarrollo de Capacidades (CAP)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(109,'monica.moreno@cgr.go.cr','Moreno Calvo M├│nica Mar├¡a','├ürea para la Innovaci├│n y Aprendizaje en la Fiscalizaci├│n (IAF)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(110,'joselyne.delgado@cgr.go.cr','Delgado Guti├®rrez Joselyne Mar├¡a','├ürea de Fiscalizaci├│n para el Desarrollo de Capacidades (CAP)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(111,'monica.navarro@cgr.go.cr','Navarro M├®ndez M├│nica de los ├üngeles','Divisi├│n de Contratacion Publica (DCP)','Secretaria','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(112,'daniela.zuniga@cgr.go.cr','Z├║├▒iga Carballo Daniela','├ürea de Fiscalizaci├│n para el Desarrollo Local (LOC)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(113,'tracy.barquero@cgr.go.cr','Barquero Picado Trayci Mar├¡a','Unidad de Servicios de Informaci├│n (USI)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(114,'ronald.segura@cgr.go.cr','Segura Quir├│s Ronald David','Divisi├│n de Contratacion Publica (DCP)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(115,'laskmi.barrantes@cgr.go.cr','Barrantes Ceciliano Laskmi Paula','├ürea de Fiscalizaci├│n para el Desarrollo Sostenible (SOS)','Asistente T├®cnico','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(116,'carlos.maroto@cgr.go.cr','Maroto Guti├®rrez Carlos Alberto','Division Juridica (DJ)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(117,'lizbeth.mora@cgr.go.cr','Mora Solano Lizbeth Fabiola','Despacho Contralor (DC)','Secretaria de Despacho','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(118,'marco.loaiciga@cgr.go.cr','Lo├íiciga Vargas Marco Antonio','Divisi├│n de Contratacion Publica (DCP)','Asistente T├®cnico','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(119,'diego.camacho@cgr.go.cr','Camacho Serrano Diego Armando','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(120,'rosaura.camacho@cgr.go.cr','Camacho S├ínchez Rosaura','├ürea para la Innovaci├│n y Aprendizaje en la Fiscalizaci├│n (IAF)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(121,'jonathan.cortes@cgr.go.cr','Cort├®s Mena Jonathan Gabriel','├ürea de Fiscalizaci├│n para el Desarrollo de las Ciudades (CIU)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(122,'daniela.aguero@cgr.go.cr','Ag├╝ero M├®ndez Daniela','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Secretaria de Gerencia','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(123,'raquel.vargas@cgr.go.cr','Vargas Moya Raquel Stephanie','├ürea de Fiscalizaci├│n para el Desarrollo de la Gobernanza (GOB)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(124,'sofia.delgado@cgr.go.cr','Delgado Quir├│s Sof├¡a Vanessa','├ürea de Fiscalizaci├│n para el Desarrollo de las Ciudades (CIU)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(125,'jaime.hidalgo@cgr.go.cr','Hidalgo Fuentes Jaime Andr├®s','├ürea de Fiscalizaci├│n para el Desarrollo de las Finanzas P├║blicas (FIP)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(126,'jose.molina@cgr.go.cr','Molina Chavarr├¡a Jos├® Adri├ín','├ürea de Fiscalizaci├│n para el Desarrollo Local (LOC)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(127,'nelson.sanabria@cgr.go.cr','Sanabria Loaiza Nelson','├ürea de Fiscalizaci├│n para el Desarrollo de Capacidades (CAP)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(128,'jerson.masis@cgr.go.cr','Mas├¡s Rodr├¡guez Jerson','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(129,'milagro.barboza@cgr.go.cr','Barboza Rojas Mar├¡a Milagro','├ürea de Fiscalizaci├│n para el Desarrollo de la Gobernanza (GOB)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(130,'alejandra.cabezas@cgr.go.cr','Cabezas Fonseca Alejandra','├ürea de Fiscalizaci├│n para el Desarrollo de las Ciudades (CIU)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(131,'victor.montenegro@cgr.go.cr','Montenegro Ugalde V├¡ctor Hugo','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(132,'mari.trini.vargas@cgr.go.cr','Vargas ├ülvarez Mari Trinidad','├ürea de Fiscalizaci├│n para el Desarrollo de Capacidades (CAP)','Asistente T├®cnico','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(133,'pablo.cerdas@cgr.go.cr','Cerdas Monge Pablo Alberto','Divisi├│n de Contratacion Publica (DCP)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(134,'salome.valladares@cgr.go.cr','Valladares Soto Mar├¡a Salom├®','├ürea de Seguimiento para la Mejora P├║blica (SEM)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(135,'lilliana.robles@cgr.go.cr','Villavicencio Robles Lilliana Carolina','├ürea de Seguimiento para la Mejora P├║blica (SEM)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(136,'adriana.badilla@cgr.go.cr','Badilla Fuentes Adriana Mar├¡a','├ürea de Fiscalizaci├│n para el Desarrollo Sostenible (SOS)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(137,'ingrid.rojas@cgr.go.cr','Rojas Mata Ingrid Graciela','Unidad de Servicios Generales (USG)','Supervisor de Seguridad','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(138,'alexis.moya@cgr.go.cr','Moya Sand├¡ Alexis Antonio','Unidad de Servicios Generales (USG)','Conductor','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(139,'alejandra.quiros@cgr.go.cr','Quir├│s Garc├¡a Mar├¡a Alejandra','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Asistente T├®cnico','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(140,'alberto.solano@cgr.go.cr','Solano P├®rez Alberto','Unidad de Servicios Generales (USG)','Oficial de Seguridad','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(141,'antonieta.salazar@cgr.go.cr','Salazar Quesada Mar├¡a Antonieta','Unidad de Gesti├│n del Potencial Humano (UGPH)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(142,'harold.quiros@cgr.go.cr','Quir├│s Rojas Harol de Jes├║s','Unidad de Servicios Generales (USG)','Conductor','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(143,'fernando.castillo@cgr.go.cr','Castillo Quir├│s Fernando','Unidad de Servicios Generales (USG)','Trabajador Auxiliar','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(144,'maritza.sanabria@cgr.go.cr','Sanabria Mas├¡s Maritza','Unidad de Gobierno Corporativo (UGC)','Jefe de Unidad','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(145,'mariana.viquez@cgr.go.cr','V├¡quez Santamar├¡a Mariana','├ürea para la Innovaci├│n y Aprendizaje en la Fiscalizaci├│n (IAF)','Auxiliar de Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(146,'valeria.castro@cgr.go.cr','Castro Matamoros Valeria','Division Juridica (DJ)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(147,'luis.madrigal@cgr.go.cr','Madrigal Ram├¡rez Luis Alonso','Unidad de Gobierno Corporativo (UGC)','Auxiliar de Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(148,'sergio.arguello@cgr.go.cr','Arg├╝ello N├║├▒ez Sergio Andr├®s','├ürea de Fiscalizaci├│n para el Desarrollo de las Finanzas P├║blicas (FIP)','Auxiliar de Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(149,'milena.torres@cgr.go.cr','Torres Chaves Milena de los ├üngeles','Unidad de Servicios de Informaci├│n (USI)','Secretaria de Gerencia','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(150,'norlan.maclean@cgr.go.cr','Maclean Vargas Norlan Godfry','├ürea de Fiscalizaci├│n para el Desarrollo de las Finanzas P├║blicas (FIP)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(151,'steven.ruiz@cgr.go.cr','Ru├¡z Benavides Steven Enrique','Unidad de Administraci├│n Financiera (UAF)','Secretaria de Gerencia','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(152,'maria.cambronero@cgr.go.cr','Cambronero Badilla Mar├¡a Valeria','├ürea de Fiscalizaci├│n para el Desarrollo de las Ciudades (CIU)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(153,'karina.castro@cgr.go.cr','Castro Dur├ín Karina','├ürea de Fiscalizaci├│n para el Desarrollo de Capacidades (CAP)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(154,'jeaustin.matamoros@cgr.go.cr','Matamoros Araya Jeaustin Alonso','Division Juridica (DJ)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(155,'daniela.arrieta@cgr.go.cr','Arrieta Arrieta Daniela Mar├¡a','├ürea de Fiscalizaci├│n para el Desarrollo del Bienestar Social (BIS)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(156,'karol.corrales@cgr.go.cr','Corrales Montoya Karol Stephanie','├ürea de Fiscalizaci├│n para el Desarrollo del Bienestar Social (BIS)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(157,'ana.perez@cgr.go.cr','P├®rez Ram├¡rez Ana Bel├®n','Division Juridica (DJ)','Secretaria','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(158,'yanina.viquez@cgr.go.cr','V├¡quez Morales Yanina de los ├üngeles','Unidad de Gesti├│n del Potencial Humano (UGPH)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(159,'yeison.mena@cgr.go.cr','Mena Rodr├¡guez Yeison Jos├®','├ürea de Fiscalizaci├│n para el Desarrollo Sostenible (SOS)','Auxiliar de Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(160,'brayan.villalta@cgr.go.cr','Villalta Rivera Brayan Jos├®','Unidad de Servicios Generales (USG)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(161,'johanna.murillo@cgr.go.cr','Murillo Rodr├¡guez Johanna Vanessa','Unidad de Servicios Generales (USG)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(162,'janice.monge@cgr.go.cr','Monge Paniagua Janice Elena','├ürea de Fiscalizaci├│n para el Desarrollo Local (LOC)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(163,'itzel.castillo@cgr.go.cr','Castillo Bola├▒os Itzel Socorro','├ürea de Fiscalizaci├│n para el Desarrollo Local (LOC)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(164,'sailyn.vargas@cgr.go.cr','Vargas Carrillo Sailyn Adriana','Unidad de Servicios Generales (USG)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(165,'karina.bonilla@cgr.go.cr','Bonilla Corrales Karina Mar├¡a','Divisi├│n de Fiscalizaci├│n Operativa y Evaluativa (DFOE)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(166,'alejandra.rojas@cgr.go.cr','Rojas Guillen Mar├¡a Alejandra','├ürea de Fiscalizaci├│n para el Desarrollo Sostenible (SOS)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(167,'jordan.perez@cgr.go.cr','P├®rez Alfaro Jordan Miguel','├ürea de Fiscalizaci├│n para el Desarrollo de las Finanzas P├║blicas (FIP)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(168,'laura.medina@cgr.go.cr','Medina Obando Mar├¡a Laura','Divisi├│n de Contratacion Publica (DCP)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(169,'yuliana.quiros@cgr.go.cr','Quir├│s Acu├▒a Grace Yuliana','├ürea de Fiscalizaci├│n para el Desarrollo de las Ciudades (CIU)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(170,'karina.arias@cgr.go.cr','Arias S├íenz Karina Mar├¡a','Division Juridica (DJ)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(171,'carolina.mendez@cgr.go.cr','M├®ndez Lara Mar├¡a Carolina','├ürea para la Innovaci├│n y Aprendizaje en la Fiscalizaci├│n (IAF)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(172,'marigrei.naranjo@cgr.go.cr','Naranjo Salas Marigrei','├ürea de Fiscalizaci├│n para el Desarrollo de Capacidades (CAP)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(173,'carolina.altamirano@cgr.go.cr','Altamirano Mora Carolina','├ürea de Fiscalizaci├│n para el Desarrollo Local (LOC)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(174,'ivan.moreira@cgr.go.cr','Moreira Chaverri Iv├ín David','├ürea de Fiscalizaci├│n para el Desarrollo Sostenible (SOS)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(175,'humberto.perera@cgr.go.cr','Perera Fonseca Humberto Jos├®','├ürea de Fiscalizaci├│n para el Desarrollo de Capacidades (CAP)','Gerente de Area/Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(176,'gabriela.villalobos@cgr.go.cr','Villalobos Rodr├¡guez Gabriela Mar├¡a','├ürea para la Innovaci├│n y Aprendizaje en la Fiscalizaci├│n (IAF)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(177,'ricardo.solorzano@cgr.go.cr','Sol├│rzano S├ínchez Ricardo Antonio','├ürea de Fiscalizaci├│n para el Desarrollo del Bienestar Social (BIS)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(178,'david.oconitrillo@cgr.go.cr','Oconitrillo Fonseca David','Division Juridica (DJ)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(179,'freddy.fernandez@cgr.go.cr','Fern├índez M├®ndez Freddy Alberto','├ürea de Fiscalizaci├│n para el Desarrollo de la Gobernanza (GOB)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(180,'greivin.barrantes@cgr.go.cr','Barrantes Navarro Greivin Alberto','Unidad de Tecnolog├¡as de Informaci├│n (UTI)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(181,'fernando.madrigal@cgr.go.cr','Madrigal Morera Fernando Alberto','Divisi├│n de Contratacion Publica (DCP)','Gerente de Area/Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(182,'sirley.vargas@cgr.go.cr','Vargas Salazar Sirley','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(183,'nelson.herrera@cgr.go.cr','Herrera Vargas Nelson','Unidad de Administraci├│n Financiera (UAF)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(184,'mariela.rodriguez@cgr.go.cr','Rodr├¡guez Arguedas Mar├¡a Mariela','├ürea de Fiscalizaci├│n para el Desarrollo de Capacidades (CAP)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(185,'wilmar.avendano@cgr.go.cr','Avenda├▒o Morera Wilmar de Jes├║s','Unidad Centro de Capacitaci├│n (UCC)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(186,'greivin.porras@cgr.go.cr','Porras Rodr├¡guez Greivin','├ürea de Fiscalizaci├│n para el Desarrollo Local (LOC)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(187,'juan.rodriguez@cgr.go.cr','Rodr├¡guez Alp├¡zar Juan Miguel','├ürea de Fiscalizaci├│n para el Desarrollo del Bienestar Social (BIS)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(188,'dixie.murillo@cgr.go.cr','Murillo V├¡quez Dixie Vanessa','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(189,'karen.zamora@cgr.go.cr','Zamora Gallo Karen Susana','Division Juridica (DJ)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(190,'hazel.fallas@cgr.go.cr','Fallas G├│ngora Hazel Enid','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Secretaria','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(191,'cristian.vargas@cgr.go.cr','Vargas Sol├│rzano Cristian','├ürea de Fiscalizaci├│n para el Desarrollo de las Ciudades (CIU)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(192,'andrea.zuniga@cgr.go.cr','Z├║├▒iga Rojas Andrea Sof├¡a','├ürea para la Innovaci├│n y Aprendizaje en la Fiscalizaci├│n (IAF)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(193,'glory.murillo@cgr.go.cr','Murillo Vega Glory Elena','Division Juridica (DJ)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(194,'pablo.arguedas@cgr.go.cr','Arguedas Fuentes Pablo','Unidad de Administraci├│n Financiera (UAF)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(195,'sujey.montoya@cgr.go.cr','Montoya Espinoza Sujey','├ürea de Fiscalizaci├│n para el Desarrollo Local (LOC)','Asistente T├®cnico','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(196,'diego.sancho@cgr.go.cr','Sancho Bola├▒os Diego Francisco','├ürea de Fiscalizaci├│n para el Desarrollo Local (LOC)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(197,'alex.segura@cgr.go.cr','Segura Segura Alexander','├ürea de Fiscalizaci├│n para el Desarrollo Local (LOC)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(198,'rebeca.villegas@cgr.go.cr','Villegas Campos Rebeca','├ürea de Fiscalizaci├│n para el Desarrollo de Capacidades (CAP)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(199,'yeimy.mora@cgr.go.cr','Mora Ugalde Yeimy','Unidad de Servicios de Proveedur├¡a (USP)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(200,'jeizel.barrantes@cgr.go.cr','Barrantes Fern├índez Jeizel Tatiana','├ürea de Fiscalizaci├│n para el Desarrollo de las Finanzas P├║blicas (FIP)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(201,'carlos.leal@cgr.go.cr','Leal Vargas Carlos Gerardo','Divisi├│n de Contratacion Publica (DCP)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(202,'jesus.molina@cgr.go.cr','Molina Mart├¡nez Jes├║s','├ürea de Fiscalizaci├│n para el Desarrollo de la Gobernanza (GOB)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(203,'sujey.monge@cgr.go.cr','Monge Solano Sugey Elisa','Division Juridica (DJ)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(204,'elizabeth.mora@cgr.go.cr','Mora Alvarado Elizabeth de Jes├║s','Unidad de Servicios de Informaci├│n (USI)','Oficinista','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(205,'jesus.gonzalez@cgr.go.cr','Gonz├ílez Hidalgo Jes├║s','Division Juridica (DJ)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(206,'rolando.brenes@cgr.go.cr','Brenes Vindas Rolando Alfredo','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(207,'pablo.pacheco@cgr.go.cr','Pacheco Soto Pablo','Divisi├│n de Contratacion Publica (DCP)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(208,'lizeth.zumbado@cgr.go.cr','Zumbado Carvajal Ana Lizeth','├ürea para la Innovaci├│n y Aprendizaje en la Fiscalizaci├│n (IAF)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(209,'ricardo.gongora@cgr.go.cr','G├│ngora Hurtado Ricardo','Unidad de Servicios Generales (USG)','Trabajador Auxiliar','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(210,'jorge.suarez@cgr.go.cr','Su├írez Esquivel Jorge Alberto','Auditor├¡a Interna (AIG)','Auditor Interno','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(211,'laura.espinoza@cgr.go.cr','Espinoza Molina Laura','Unidad de Gobierno Corporativo (UGC)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(212,'oscar.torres@cgr.go.cr','Torres Salazar Oscar Mario','├ürea de Fiscalizaci├│n para el Desarrollo Sostenible (SOS)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(213,'bernal.duran@cgr.go.cr','Dur├ín Bonilla Bernal','├ürea de Fiscalizaci├│n para el Desarrollo de las Finanzas P├║blicas (FIP)','Asistente T├®cnico','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(214,'juan.carlos.barboza@cgr.go.cr','Barboza S├ínchez Juan Carlos','├ürea de Fiscalizaci├│n para el Desarrollo de Capacidades (CAP)','Asistente T├®cnico','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(215,'felix.hidalgo@cgr.go.cr','Hidalgo Badilla F├®lix','Divisi├│n de Contratacion Publica (DCP)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(216,'rosa.iris.solis@cgr.go.cr','Sol├¡s Alfaro Rosa Iris','Unidad de Tecnolog├¡as de Informaci├│n (UTI)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(217,'kianny.solis@cgr.go.cr','Sol├¡s Cascante Kianny Fabiola','├ürea de Seguimiento para la Mejora P├║blica (SEM)','Secretaria','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(218,'keyla.paniagua@cgr.go.cr','Paniagua orozco Keyla Rachely','Unidad de Servicios de Informaci├│n (USI)','Secretaria','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(219,'sharon.arce@cgr.go.cr','Arce Varela Sharon Nicole','Divisi├│n de Fiscalizaci├│n Operativa y Evaluativa (DFOE)','Auxiliar de Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(220,'fiorella.parra@cgr.go.cr','Parra Jim├®nez Fiorella Mar├¡a','Division Juridica (DJ)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(221,'jose.rojas@cgr.go.cr','Rojas Barrantes Jos├® Pablo','Division Juridica (DJ)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(222,'camila.salazar@cgr.go.cr','Salazar Ram├¡rez Camila','├ürea de Fiscalizaci├│n para el Desarrollo de Capacidades (CAP)','Auxiliar de Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(223,'paula.montero@cgr.go.cr','Montero Castro Mar├¡a Paula','Divisi├│n de Contratacion Publica (DCP)','Secretaria','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(224,'jose.guido@cgr.go.cr','Guido Fern├índez Jos├® Daniel','├ürea de Fiscalizaci├│n para el Desarrollo de Capacidades (CAP)','Auxiliar de Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(225,'walezka.oreamuno@cgr.go.cr','Oreamuno Huete Walezka Lizeth','├ürea de Fiscalizaci├│n para el Desarrollo del Bienestar Social (BIS)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(226,'nayerly.corrales@cgr.go.cr','Corrales Mena Nayerly Mar├¡a','├ürea de Fiscalizaci├│n para el Desarrollo de las Finanzas P├║blicas (FIP)','Auxiliar de Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(227,'jeremy.gonzalez@cgr.go.cr','Gonz├ílez Rivera Jeremy de los ├üngeles','Unidad de Servicios de Informaci├│n (USI)','Auxiliar de Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(228,'jimena.gomez@cgr.go.cr','G├│mez Chaverri Jimena','Unidad de Servicios de Informaci├│n (USI)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(229,'kendal.quesada@cgr.go.cr','Quesada Segura Kendal Antonio','├ürea de Fiscalizaci├│n para el Desarrollo de Capacidades (CAP)','Auxiliar de Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(230,'sebastian.gutierrez@cgr.go.cr','Guti├®rrez Quesada Sebasti├ín Andr├®','Unidad de Servicios de Informaci├│n (USI)','Auxiliar de Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(231,'nikole.carvajal@cgr.go.cr','Carvajal Ram├¡rez Nikole','├ürea de Fiscalizaci├│n para el Desarrollo Sostenible (SOS)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(233,'angie.montiel@cgr.go.cr','Montiel Cajina Angie Valeria','Divisi├│n de Fiscalizaci├│n Operativa y Evaluativa (DFOE)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(234,'jose.vega@cgr.go.cr','Vega Redondo Jos├® Pablo','├ürea de Fiscalizaci├│n para el Desarrollo del Bienestar Social (BIS)','Auxiliar de Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(235,'jason.perez@cgr.go.cr','P├®rez White Jason Dario','Unidad de Servicios de Informaci├│n (USI)','Trabajador Especializado 1','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(236,'gabriel.badilla@cgr.go.cr','Badilla Valverde Gabriel El├¡as','Unidad de Gobierno Corporativo (UGC)','Auxiliar de Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(237,'ana.leon@cgr.go.cr','Le├│n Rom├ín Ana Luc├¡a','├ürea de Fiscalizaci├│n para el Desarrollo de las Finanzas P├║blicas (FIP)','Auxiliar de Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(238,'britany.valenciano@cgr.go.cr','Valenciano Calvo Britany','├ürea de Fiscalizaci├│n para el Desarrollo de las Finanzas P├║blicas (FIP)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(239,'lesly.hidalgo@cgr.go.cr','Hidalgo Ilama Lesly Tamara','Divisi├│n de Contratacion Publica (DCP)','Secretaria','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(240,'laura.castillo@cgr.go.cr','Castillo Murillo Laura Nathalia','├ürea de Fiscalizaci├│n para el Desarrollo del Bienestar Social (BIS)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(241,'stephanie.lewis@cgr.go.cr','Lewis Cordero Stephanie','Divisi├│n de Contratacion Publica (DCP)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(242,'jered.castillo@cgr.go.cr','Castillo Torres Jered Gabriel','Divisi├│n de Contratacion Publica (DCP)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(243,'yuliana.chacon@cgr.go.cr','Chac├│n Madrigal Yuliana','├ürea de Seguimiento para la Mejora P├║blica (SEM)','Secretaria de Gerencia','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(244,'ana.solis@cgr.go.cr','Sol├¡s Hern├índez Ana Laura','Unidad de Tecnolog├¡as de Informaci├│n (UTI)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(245,'elbert.poveda@cgr.go.cr','Poveda Quir├│s Elvert David','Unidad de Tecnolog├¡as de Informaci├│n (UTI)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(246,'douglas.zumbado@cgr.go.cr','Zumbado Mena Douglas Andr├®s','├ürea de Fiscalizaci├│n para el Desarrollo Sostenible (SOS)','Auxiliar de Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(247,'joel.araya@cgr.go.cr','Araya Jim├®nez Joel Francisco','Unidad de Servicios de Informaci├│n (USI)','Oficinista','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(248,'jefferson.cabrera@cgr.go.cr','Cabrera Picado Jefferson Gabriel','Unidad Centro de Capacitaci├│n (UCC)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(249,'marco.rapso@cgr.go.cr','Rapso Henr├¡quez Marco Andr├®s','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(250,'keilyn.abarca@cgr.go.cr','Abarca Serrano Keilyn Dayanna','Unidad de Servicios de Informaci├│n (USI)','Secretaria de Gerencia','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(251,'maria.arce@cgr.go.cr','Arce Badilla Mar├¡a Rosibel','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(252,'valeria.cordoba@cgr.go.cr','C├│rdoba Sand├¡ Valeria Fernanda','├ürea de Fiscalizaci├│n para el Desarrollo Local (LOC)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(253,'laura.fernandez@cgr.go.cr','Fern├índez Hidalgo Laura','├ürea de Fiscalizaci├│n para el Desarrollo de Capacidades (CAP)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(254,'francisco.sibaja@cgr.go.cr','Hern├índez Sibaja Francisco Javier','Unidad de Servicios de Informaci├│n (USI)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(255,'maria.jimenez@cgr.go.cr','Jim├®nez Corrales Mar├¡a Fernanda','├ürea de Fiscalizaci├│n para el Desarrollo de la Gobernanza (GOB)','Secretaria','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(256,'jacqueline.vargas@cgr.go.cr','Vargas Delgado Jacqueline','├ürea de Fiscalizaci├│n para el Desarrollo del Bienestar Social (BIS)','Auxiliar de Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(257,'alejandro.guevara@cgr.go.cr','Guevara Vega Alejandro Jos├®','├ürea de Fiscalizaci├│n para el Desarrollo de las Finanzas P├║blicas (FIP)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(258,'alfredo.guerrero@cgr.go.cr','Guerrero Gonz├ílez Alfredo Antonio','Unidad Centro de Capacitaci├│n (UCC)','Oficinista','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(259,'nataly.chaves@cgr.go.cr','Chaves Salas Nataly Nicole','├ürea de Fiscalizaci├│n para el Desarrollo de Capacidades (CAP)','Secretaria de Gerencia','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(260,'daniel.fallas@cgr.go.cr','Fallas Mora Andrey Daniel','├ürea de Fiscalizaci├│n para el Desarrollo Sostenible (SOS)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(261,'jordy.martinez@cgr.go.cr','Mart├¡nez God├¡nez Jordy Javier','Auditor├¡a Interna (AIG)','Auxiliar de Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(262,'marilyn.molina@cgr.go.cr','Molina Rivera Marilyn Andrea','├ürea de Seguimiento para la Mejora P├║blica (SEM)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(263,'karla.perez@cgr.go.cr','P├®rez Madrigal Karla Nicole','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(264,'melanie.vega@cgr.go.cr','Vega Quesada Melanie Michelle','Unidad de Gobierno Corporativo (UGC)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(265,'brandon.ruiz@cgr.go.cr','Ruiz Miranda Brandon Jos├®','Unidad de Servicios de Informaci├│n (USI)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(266,'yanio.zuniga@cgr.go.cr','Z├║├▒iga Calvo Yanio','Unidad de Gesti├│n del Potencial Humano (UGPH)','Secretaria de Gerencia','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(267,'maria.rodriguez@cgr.go.cr','Rodr├¡guez Palma Mar├¡a Antonieta','├ürea de Fiscalizaci├│n para el Desarrollo Sostenible (SOS)','Secretaria','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(268,'yendry.duran@cgr.go.cr','Dur├ín Medina Yendry Michell','├ürea de Fiscalizaci├│n para el Desarrollo de la Gobernanza (GOB)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(269,'lina.venegas@cgr.go.cr','Venegas Sand├¡ Carmen Lina','├ürea para la Innovaci├│n y Aprendizaje en la Fiscalizaci├│n (IAF)','Secretaria de Gerencia','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(270,'joseph.bejarano@cgr.go.cr','Bejarano S├ínchez Joseph Gustavo','├ürea de Fiscalizaci├│n para el Desarrollo de las Ciudades (CIU)','Auxiliar de Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(271,'karolina.romero@cgr.go.cr','Romero Rivera Karolina','Unidad Centro de Capacitaci├│n (UCC)','Secretaria de Gerencia','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(273,'natalia.castro@cgr.go.cr','Castro Bonilla Natalia Mar├¡a','├ürea de Fiscalizaci├│n para el Desarrollo Sostenible (SOS)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(274,'johanna.villalobos@cgr.go.cr','Villalobos Jim├®nez Johanna Mar├¡a','Division Juridica (DJ)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(275,'yensy.herrera@cgr.go.cr','Herrera Parra Yensy Josette','Divisi├│n de Contratacion Publica (DCP)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(276,'maria.blanco@cgr.go.cr','Blanco Mora Mar├¡a Fernanda','├ürea de Fiscalizaci├│n para el Desarrollo de las Finanzas P├║blicas (FIP)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(277,'steven.gonzalez@cgr.go.cr','Gonz├ílez Manzanares Steven','├ürea de Fiscalizaci├│n para el Desarrollo de las Finanzas P├║blicas (FIP)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(278,'marisabel.elizondo@cgr.go.cr','Elizondo Guzm├ín Marisabel de Jes├║s','├ürea de Fiscalizaci├│n para el Desarrollo Local (LOC)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(279,'dayana.sanchez@cgr.go.cr','S├ínchez Alvarado Dayana Paola','Despacho Contralor (DC)','Secretaria de Despacho','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(280,'suzanne.carrillo@cgr.go.cr','Carrillo Hidalgo Suzanne Amanda','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(281,'andrea.cubero@cgr.go.cr','Cubero Medina Daisy Andrea','Unidad Jur├¡dica Interna (UJI)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(282,'bryan.guevara@cgr.go.cr','Guevara G├│mez Bryan Josu├®','├ürea de Fiscalizaci├│n para el Desarrollo Sostenible (SOS)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(283,'silliana.chinchilla@cgr.go.cr','Chinchilla Miranda Silliana Pamela','├ürea de Fiscalizaci├│n para el Desarrollo del Bienestar Social (BIS)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(284,'maria.arburola@cgr.go.cr','Arburola Chaves Mar├¡a Jos├®','├ürea de Fiscalizaci├│n para el Desarrollo de las Finanzas P├║blicas (FIP)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(285,'anatoly.solis@cgr.go.cr','Sol├¡s Atyasov Anatoly','├ürea de Fiscalizaci├│n para el Desarrollo de las Finanzas P├║blicas (FIP)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(286,'leyner.cordero@cgr.go.cr','Cordero Rojas Leyner Jes├║s','Unidad de Servicios de Informaci├│n (USI)','Secretaria','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(287,'josua.valverde@cgr.go.cr','Valverde Garc├¡a Josua Alfredo','Unidad Centro de Capacitaci├│n (UCC)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(288,'angie.aguilar@cgr.go.cr','Aguilar Naranjo Angie Jazm├¡n','Unidad de Servicios Generales (USG)','Trabajador Auxiliar','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(289,'graciela.obando@cgr.go.cr','Obando Araya Mar├¡a Graciela','├ürea de Fiscalizaci├│n para el Desarrollo de las Ciudades (CIU)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(290,'yariela.ugalde@cgr.go.cr','Ugalde Enriquez Yariela Alexandra','Unidad de Servicios de Informaci├│n (USI)','Oficinista','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(291,'naki.rodriguez@cgr.go.cr','Rodr├¡guez Carranza Naki Jazm├¡n','├ürea de Seguimiento para la Mejora P├║blica (SEM)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(292,'natalia.molina@cgr.go.cr','Molina Uma├▒a Natalia Ruth','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(293,'ricardo.morales@cgr.go.cr','Morales Castro Ricardo Antonio','├ürea de Fiscalizaci├│n para el Desarrollo de Capacidades (CAP)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(294,'kevin.solorzano@cgr.go.cr','Sol├│rzano Castillo Kevin Norberto','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(295,'andrey.padilla@cgr.go.cr','Padilla Jim├®nez Andrey Isidro','Unidad de Servicios de Informaci├│n (USI)','Secretaria de Gerencia','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(296,'natalia.cespedes@cgr.go.cr','C├®spedes Porras Natalia','Unidad de Gesti├│n del Potencial Humano (UGPH)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(297,'juan.angulo@cgr.go.cr','Angulo Villalobos Juan Carlos','├ürea de Fiscalizaci├│n para el Desarrollo de las Ciudades (CIU)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(298,'loren.carranza@cgr.go.cr','Carranza Castro Loren Mar├¡a','Unidad de Administraci├│n Financiera (UAF)','Secretaria','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(299,'maria.lascarez@cgr.go.cr','L├íscarez Granados Mar├¡a Jos├®','├ürea de Fiscalizaci├│n para el Desarrollo Local (LOC)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(300,'jose.gonzalez@cgr.go.cr','Gonz├ílez Chaves Jos├® Roberto','├ürea para la Innovaci├│n y Aprendizaje en la Fiscalizaci├│n (IAF)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(301,'daniela.hidalgo@cgr.go.cr','Hidalgo Porras Daniela del Carmen','├ürea de Fiscalizaci├│n para el Desarrollo de Capacidades (CAP)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(302,'luis.herra@cgr.go.cr','Herra G├│mez Luis Diego','├ürea de Fiscalizaci├│n para el Desarrollo Sostenible (SOS)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(303,'clendy.abarca@cgr.go.cr','Abarca Abarca Clendy Jes├║s','Unidad de Servicios Generales (USG)','Oficial de Seguridad','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(304,'kimberly.hernandez@cgr.go.cr','Hern├índez Cascante Kimberly Mar├¡a','├ürea de Seguimiento para la Mejora P├║blica (SEM)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(305,'bryan.rodriguez@cgr.go.cr','Rodr├¡guez Rojas Bryan Andr├®s','Unidad de Servicios de Informaci├│n (USI)','Oficinista','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(306,'maria.madrigal@cgr.go.cr','Madrigal Salas Mar├¡a Fernanda','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(307,'lady.diaz@cgr.go.cr','D├¡az Rivera Lady Jazm├¡n','Divisi├│n de Fiscalizaci├│n Operativa y Evaluativa (DFOE)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(308,'yoselyn.chaverri@cgr.go.cr','Chaverri Artavia Yoselyn Fabiola','Unidad de Servicios Generales (USG)','Oficial de Seguridad','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(309,'natalia.cordero@cgr.go.cr','Cordero Bonilla Natalia Estefania','├ürea de Fiscalizaci├│n para el Desarrollo de Capacidades (CAP)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(310,'fernanda.brenes@cgr.go.cr','Brenes Valverde Mar├¡a Fernanda','Unidad de Servicios de Informaci├│n (USI)','Secretaria de Gerencia','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(311,'angeles.vindas@cgr.go.cr','Vindas Montero ├üngeles Mar├¡a','├ürea de Fiscalizaci├│n para el Desarrollo de las Finanzas P├║blicas (FIP)','Secretaria de Gerencia','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(312,'korina.quiros@cgr.go.cr','Quir├│s Sol├¡s Korina Sof├¡a','├ürea para la Innovaci├│n y Aprendizaje en la Fiscalizaci├│n (IAF)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(313,'josue.solanov@cgr.go.cr','Solano Vindas Josu├®','├ürea de Fiscalizaci├│n para el Desarrollo de Capacidades (CAP)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(314,'luis.richmond@cgr.go.cr','Richmond Portuguez Luis Alonso','Division Juridica (DJ)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(315,'esteban.fernandez@cgr.go.cr','Fern├índez Monge Esteban','├ürea de Fiscalizaci├│n para el Desarrollo Sostenible (SOS)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(316,'maria.nunez@cgr.go.cr','N├║├▒ez Flores Mar├¡a Jos├®','Unidad de Gobierno Corporativo (UGC)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(317,'maria.hernandez@cgr.go.cr','Hern├índez Vargas Mar├¡a Jos├®','Unidad de Gesti├│n del Potencial Humano (UGPH)','Secretaria','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(318,'diego.masis@cgr.go.cr','Mas├¡s Garro Diego Jos├®','├ürea de Fiscalizaci├│n para el Desarrollo del Bienestar Social (BIS)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(319,'oscar.aburto@cgr.go.cr','Aburto Moya Oscar Jes├║s','Divisi├│n de Contratacion Publica (DCP)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(320,'yoselyn.cordero@cgr.go.cr','Cordero Arias Yoselyn','Unidad de Tecnolog├¡as de Informaci├│n (UTI)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(321,'isabel.marin@cgr.go.cr','Mar├¡n Mora Isabel Dayana','├ürea de Fiscalizaci├│n para el Desarrollo Local (LOC)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(322,'rosaura.garro@cgr.go.cr','Garro Vargas Rosaura Mar├¡a','Divisi├│n de Contratacion Publica (DCP)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(323,'monica.montero@cgr.go.cr','Montero Quir├│s M├│nica Pamela','Unidad de Servicios de Informaci├│n (USI)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(324,'alex.fabian.ramirez@cgr.go.cr','Ram├¡rez Alp├¡zar Alex Fabi├ín','├ürea de Fiscalizaci├│n para el Desarrollo de las Ciudades (CIU)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(325,'diala.brenes@cgr.go.cr','Brenes Castro Dial├í Pamela','Unidad de Administraci├│n Financiera (UAF)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(326,'meilyn.artavia@cgr.go.cr','Artavia Quir├│s Meilyn Andrea','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(327,'anthony.mora@cgr.go.cr','Mora Garita Anthony Josu├®','├ürea de Fiscalizaci├│n para el Desarrollo de Capacidades (CAP)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(328,'silvia.bejarano@cgr.go.cr','Bejarano Tort├│s Silvia Milagro','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Secretaria de Gerencia','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(329,'jennifer.arce@cgr.go.cr','Arce Guzm├ín Jennifer Mar├¡a','Unidad de Administraci├│n Financiera (UAF)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(330,'nathalie.calderon@cgr.go.cr','Calder├│n S├ínchez Nathalie Vanessa','Unidad de Servicios de Informaci├│n (USI)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(331,'paola.marchena@cgr.go.cr','Marchena Toru├▒o Paola','Unidad de Servicios de Informaci├│n (USI)','Secretaria de Gerencia','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(332,'evelyn.arroyo@cgr.go.cr','Arroyo Calder├│n Evelyn Melissa','Unidad de Servicios de Informaci├│n (USI)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(333,'karla.picado@cgr.go.cr','Picado Varela Karla','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(334,'noelia.badilla@cgr.go.cr','Badilla Calder├│n Noelia','├ürea de Fiscalizaci├│n para el Desarrollo de Capacidades (CAP)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(335,'allan.hernandez@cgr.go.cr','Hern├índez S├ínchez Allan Mauricio','Unidad de Servicios Generales (USG)','Trabajador Especializado 1','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(336,'veronica.carvajal@cgr.go.cr','Carvajal V├ísquez Ver├│nica','Unidad de Gobierno Corporativo (UGC)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(337,'raquel.espinoza@cgr.go.cr','Espinoza P├®rez Raquel Mar├¡a','Unidad de Servicios de Proveedur├¡a (USP)','Secretaria de Gerencia','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(338,'veronica.hidalgo@cgr.go.cr','Hidalgo Calder├│n Ana Ver├│nica','Unidad de Servicios de Informaci├│n (USI)','Secretaria de Gerencia','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(339,'kevin.rodriguez@cgr.go.cr','Rodr├¡guez Mu├▒oz Kevin','├ürea de Fiscalizaci├│n para el Desarrollo Local (LOC)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(340,'alejandra.escalona@cgr.go.cr','Escalona Guti├®rrez Mar├¡a Alejandra','├ürea de Fiscalizaci├│n para el Desarrollo del Bienestar Social (BIS)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(341,'direy.morales@cgr.go.cr','Morales Leit├│n Direy','├ürea de Fiscalizaci├│n para el Desarrollo de Capacidades (CAP)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(342,'diana.fuentes@cgr.go.cr','Fuentes Guti├®rrez Diana Priscila','├ürea de Fiscalizaci├│n para el Desarrollo del Bienestar Social (BIS)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(343,'fernanda.zuniga@cgr.go.cr','Z├║├▒iga ├ülvarez Mar├¡a Fernanda','├ürea de Fiscalizaci├│n para el Desarrollo Sostenible (SOS)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(344,'andrea.bermudez@cgr.go.cr','Berm├║dez Ling Andrea','Division Juridica (DJ)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(345,'yenny.rodriguez@cgr.go.cr','Rodr├¡guez Campos Yenny Roc├¡o','├ürea de Fiscalizaci├│n para el Desarrollo del Bienestar Social (BIS)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(346,'daniel.alvarado@cgr.go.cr','Alvarado Padilla Daniel Humberto','├ürea de Fiscalizaci├│n para el Desarrollo del Bienestar Social (BIS)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(347,'leslye.rodriguez@cgr.go.cr','Rodr├¡guez S├ínchez Leslye Tatiana','├ürea de Fiscalizaci├│n para el Desarrollo del Bienestar Social (BIS)','Secretaria de Gerencia','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(348,'valeria.corrales@cgr.go.cr','Corrales Rojas Valeria Vanessa','├ürea de Seguimiento para la Mejora P├║blica (SEM)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(349,'karina.jerez@cgr.go.cr','Jer├®z Amador Karina Joselyn','├ürea de Seguimiento para la Mejora P├║blica (SEM)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(350,'yuliana.sandoval@cgr.go.cr','Sandoval ├ülvarez Yuliana Mar├¡a','├ürea de Fiscalizaci├│n para el Desarrollo de las Ciudades (CIU)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(351,'stephannie.torres@cgr.go.cr','Torres Chinchilla Stephanie Gabriela','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(352,'kimberly.barrientos@cgr.go.cr','Barrientos Portuguez Kimberly Dayana','├ürea de Fiscalizaci├│n para el Desarrollo de Capacidades (CAP)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(353,'paola.umana@cgr.go.cr','Uma├▒a Solano Andrea Paola','Divisi├│n de Contratacion Publica (DCP)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(354,'fabiola.garnier@cgr.go.cr','Garnier Murillo Fabiola','Unidad de Gesti├│n del Potencial Humano (UGPH)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(355,'natalia.segura@cgr.go.cr','Segura Murcia Natalia','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(356,'natalia.rivera@cgr.go.cr','Rivera God├¡nez Natalia','Divisi├│n de Contratacion Publica (DCP)','Secretaria de Gerencia','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(357,'mairon.loaiza@cgr.go.cr','Loaiza Monge Mairon Emmanuel','├ürea de Fiscalizaci├│n para el Desarrollo Sostenible (SOS)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(358,'ana.quesada@cgr.go.cr','Quesada Solano Ana Karen','Divisi├│n de Contratacion Publica (DCP)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(359,'daisy.carvajal@cgr.go.cr','Carvajal Guti├®rrez Daisy Mar├¡a','Division Juridica (DJ)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(360,'karen.salas@cgr.go.cr','Salas Araya Karen Stephanie','├ürea de Seguimiento para la Mejora P├║blica (SEM)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(361,'natasha.dejuk@cgr.go.cr','Dejuk Protti Natasha Mar├¡a','├ürea de Fiscalizaci├│n para el Desarrollo Sostenible (SOS)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(362,'saray.quesada@cgr.go.cr','Quesada Mar├¡n Saray','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(363,'laura.espinoza.arce@cgr.go.cr','Espinoza Arce Laura Stephanie','├ürea de Seguimiento para la Mejora P├║blica (SEM)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(364,'estefany.campos@cgr.go.cr','Campos Granados Estefany','├ürea de Fiscalizaci├│n para el Desarrollo del Bienestar Social (BIS)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(365,'shirley.pereira@cgr.go.cr','Pereira Zamora Shirley','├ürea de Seguimiento para la Mejora P├║blica (SEM)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(366,'maricela.zamora@cgr.go.cr','Zamora Villarreal Maricela','├ürea de Fiscalizaci├│n para el Desarrollo del Bienestar Social (BIS)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(367,'veronica.zamora@cgr.go.cr','Zamora Enr├¡quez Sayleen Ver├│nica','├ürea de Seguimiento para la Mejora P├║blica (SEM)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(368,'carlos.morales@cgr.go.cr','Morales Castro Carlos Ricardo','├ürea de Seguimiento para la Mejora P├║blica (SEM)','Gerente de Area/Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(369,'diana.flores@cgr.go.cr','Flores Chaves Diana','Unidad de Administraci├│n Financiera (UAF)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(370,'dayan.peraza@cgr.go.cr','Peraza Quir├│s Dayan','Unidad de Administraci├│n Financiera (UAF)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(371,'teresita.leon@cgr.go.cr','Le├│n Peralta Teresita Mar├¡a','├ürea de Fiscalizaci├│n para el Desarrollo Local (LOC)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(372,'luis.campos@cgr.go.cr','Campos Ram├¡rez Luis Fernando','Unidad de Tecnolog├¡as de Informaci├│n (UTI)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(373,'fabio.jimenez@cgr.go.cr','Jim├®nez M├®ndez Jos├® Fabio','├ürea de Fiscalizaci├│n para el Desarrollo de la Gobernanza (GOB)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(374,'vivian.castillo@cgr.go.cr','Castillo Calvo Vivian Bettel','Division Juridica (DJ)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(375,'anthony.aguilar@cgr.go.cr','Aguilar Mora Anthony','├ürea de Fiscalizaci├│n para el Desarrollo de Capacidades (CAP)','Secretaria','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(376,'natalia.ramirez@cgr.go.cr','Ram├¡rez Garc├¡a Natalia','├ürea de Fiscalizaci├│n para el Desarrollo de Capacidades (CAP)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(377,'mario.andres.zamora@cgr.go.cr','Zamora Madr├¡z Mario Andr├®s','Divisi├│n de Gesti├│n de Apoyo (DGA)','Oficial de Seguridad de la Informaci├│n','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(378,'mario.reyes@cgr.go.cr','Reyes Mej├¡as Mario Andr├®s','├ürea de Fiscalizaci├│n para el Desarrollo Sostenible (SOS)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(379,'jorge.madrigal@cgr.go.cr','Madrigal Salazar Jorge Isaac','├ürea para la Innovaci├│n y Aprendizaje en la Fiscalizaci├│n (IAF)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(380,'jose.mario.mora@cgr.go.cr','Mora Fonseca Jos├® Mario','Unidad de Gesti├│n del Potencial Humano (UGPH)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(381,'eliecer.chavarria@cgr.go.cr','Chavarr├¡a Rojas Eli├®cer Felipe','├ürea de Fiscalizaci├│n para el Desarrollo Sostenible (SOS)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(382,'pamela.carcache@cgr.go.cr','Carcache Castillo Susan Pamela','Division Juridica (DJ)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(383,'mauricio.madrigal@cgr.go.cr','Madrigal Rivas Mauricio Alberto','Divisi├│n de Contratacion Publica (DCP)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(384,'keren.abarca@cgr.go.cr','Abarca ├ülvarez Keren','Unidad de Tecnolog├¡as de Informaci├│n (UTI)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(385,'leonardo.jimenez@cgr.go.cr','Jim├®nez Cascante Leonardo Fabio','├ürea de Fiscalizaci├│n para el Desarrollo de las Ciudades (CIU)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(386,'josue.calderon@cgr.go.cr','Calder├│n Chaves Josu├® Mart├¡n','├ürea de Fiscalizaci├│n para el Desarrollo del Bienestar Social (BIS)','Asistente T├®cnico','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(387,'eduardo.jarquin@cgr.go.cr','Jarqu├¡n Bonilla Jos├® Eduardo','├ürea para la Innovaci├│n y Aprendizaje en la Fiscalizaci├│n (IAF)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(388,'carlos.duran@cgr.go.cr','Dur├ín Hern├índez Carlos Roberto','├ürea de Fiscalizaci├│n para el Desarrollo del Bienestar Social (BIS)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(389,'karolina.chacon@cgr.go.cr','Chac├│n Monge Karolina','├ürea para la Innovaci├│n y Aprendizaje en la Fiscalizaci├│n (IAF)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(390,'keith.mora@cgr.go.cr','Mora Prado Keith Aurora','├ürea de Fiscalizaci├│n para el Desarrollo de la Gobernanza (GOB)','Auxiliar de Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(391,'alexander.loaiza@cgr.go.cr','Loaiza Rojas Alexander','├ürea de Fiscalizaci├│n para el Desarrollo de la Gobernanza (GOB)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(392,'carlos.ballestero@cgr.go.cr','Ballestero Quesada Carlos','Unidad de Servicios de Informaci├│n (USI)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(393,'alexa.gonzalez@cgr.go.cr','Gonz├ílez Chaves Alexa','├ürea para la Innovaci├│n y Aprendizaje en la Fiscalizaci├│n (IAF)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(394,'melissa.vega@cgr.go.cr','Vega Vega Melissa Mar├¡a','├ürea de Fiscalizaci├│n para el Desarrollo de Capacidades (CAP)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(395,'jose.corrales@cgr.go.cr','Corrales Chac├│n Jos├® Alejandro','Auditor├¡a Interna (AIG)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(396,'mercedes.gonzalez@cgr.go.cr','Gonz├ílez Castro Mercedes','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(397,'yency.hidalgo@cgr.go.cr','Hidalgo Garc├¡a Yency Mar├¡a','├ürea de Seguimiento para la Mejora P├║blica (SEM)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(398,'karen.quiros@cgr.go.cr','Quir├│s Cascante Karen Zelmira','Divisi├│n de Contratacion Publica (DCP)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(399,'eduardo.perez@cgr.go.cr','P├®rez Ru├¡z Eduardo','├ürea de Fiscalizaci├│n para el Desarrollo de Capacidades (CAP)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(400,'alexia.umana@cgr.go.cr','Uma├▒a Alvarado Alexia Mar├¡a','├ürea de Seguimiento para la Mejora P├║blica (SEM)','Asistente T├®cnico','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(401,'melina.mora@cgr.go.cr','Mora Garc├¡a Melina Gabriela','Unidad de Servicios Generales (USG)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(402,'zusette.abarca@cgr.go.cr','Abarca Mussio Zusette','Divisi├│n de Contratacion Publica (DCP)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(403,'juan.bolanos@cgr.go.cr','Bola├▒os Rojas Juan Diego','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(404,'leticia.gomez@cgr.go.cr','G├│mez Araya Leticia de los ├üngeles','Unidad de Servicios de Proveedur├¡a (USP)','Trabajador Auxiliar','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(405,'karol.zuniga@cgr.go.cr','Z├║├▒iga Soto Karol Andrea','├ürea de Seguimiento para la Mejora P├║blica (SEM)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(406,'juan.navarro@cgr.go.cr','Navarro Naranjo Juan Carlos','Unidad de Tecnolog├¡as de Informaci├│n (UTI)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(407,'priscilla.brenes@cgr.go.cr','Brenes Jim├®nez Priscilla','Division Juridica (DJ)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(408,'maria.castillo@cgr.go.cr','Castillo Castro Mar├¡a','Despacho Contralor (DC)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(409,'josue.solano@cgr.go.cr','Solano Morales Josu├® Francisco','├ürea para la Innovaci├│n y Aprendizaje en la Fiscalizaci├│n (IAF)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(410,'ivannia.navas@cgr.go.cr','Navas Z├║├▒iga Ivannia','├ürea de Fiscalizaci├│n para el Desarrollo del Bienestar Social (BIS)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(411,'ana.aguilar@cgr.go.cr','Aguilar Porras Ana Isabel','├ürea de Fiscalizaci├│n para el Desarrollo Sostenible (SOS)','Asistente T├®cnico','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(412,'hannia.garro@cgr.go.cr','Garro Benavides Hannia','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(413,'adriana.mora@cgr.go.cr','Mora Cordero Adriana','├ürea de Fiscalizaci├│n para el Desarrollo de Capacidades (CAP)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(414,'greivin.sibaja@cgr.go.cr','Sibaja Salazar Greivin Gilberto','Unidad de Servicios Generales (USG)','Oficial de Seguridad','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(415,'gabriel.gonzalez@cgr.go.cr','Gonz├ílez Cabezas Gabriel Antonio','├ürea de Seguimiento para la Mejora P├║blica (SEM)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(416,'victor.marin@cgr.go.cr','Mar├¡n Berm├║dez Jos├® V├¡ctor','├ürea de Fiscalizaci├│n para el Desarrollo de las Ciudades (CIU)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(417,'julio.araya@cgr.go.cr','Araya Camacho Julio C├®sar','├ürea de Fiscalizaci├│n para el Desarrollo de las Ciudades (CIU)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(418,'lia.barrantes@cgr.go.cr','Barrantes Le├│n L├¡a','├ürea de Fiscalizaci├│n para el Desarrollo Sostenible (SOS)','Gerente de Area/Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(419,'andrea.lizano@cgr.go.cr','Lizano Lor├¡a Andrea','├ürea de Fiscalizaci├│n para el Desarrollo de la Gobernanza (GOB)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(420,'grettel.chavarria@cgr.go.cr','Chavarr├¡a Camacho Grettel Pamela','Division Juridica (DJ)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(421,'oscar.centeno@cgr.go.cr','Centeno Mora Oscar Javier','├ürea de Fiscalizaci├│n para el Desarrollo Sostenible (SOS)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(422,'marjorie.garro@cgr.go.cr','Garro Rojas Marjorie de los ├üngeles','├ürea de Fiscalizaci├│n para el Desarrollo Local (LOC)','Secretaria de Gerencia','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(423,'evelyn.valverde@cgr.go.cr','Valverde Picado Evelyn','├ürea de Fiscalizaci├│n para el Desarrollo Sostenible (SOS)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(424,'jose.arroyo@cgr.go.cr','Arroyo Castro Jos├® Pablo','├ürea de Fiscalizaci├│n para el Desarrollo de la Gobernanza (GOB)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(425,'nancy.ortiz@cgr.go.cr','Ort├¡z Cascante Nancy','├ürea para la Innovaci├│n y Aprendizaje en la Fiscalizaci├│n (IAF)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(426,'carlosm.gonzalez@cgr.go.cr','Gonz├ílez Barrantes Carlos Manuel','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(427,'viria.rodriguez@cgr.go.cr','Rodr├¡guez Salas Viria Melissa','├ürea de Fiscalizaci├│n para el Desarrollo del Bienestar Social (BIS)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(428,'yuri.herrera@cgr.go.cr','Herrera Chaves Yuri Mar├¡a','Unidad de Servicios Generales (USG)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(429,'silvia.barrientos@cgr.go.cr','Barrientos Alvarez Silvia Mar├¡a','├ürea de Fiscalizaci├│n para el Desarrollo de Capacidades (CAP)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(430,'marianela.sanchez@cgr.go.cr','S├ínchez Chavarr├¡a Marianela','Unidad de Servicios de Informaci├│n (USI)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(431,'alejandro.cordoba@cgr.go.cr','C├│rdoba Ram├¡rez Alejandro Andr├®s','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(432,'anita.gomez@cgr.go.cr','G├│mez Monge Anita','├ürea para la Innovaci├│n y Aprendizaje en la Fiscalizaci├│n (IAF)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(433,'andres.cabrera@cgr.go.cr','Cabrera S├íenz German Andr├®s','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(434,'ileana.araya@cgr.go.cr','Araya Arias Ileana Marcela','Unidad de Tecnolog├¡as de Informaci├│n (UTI)','Secretaria de Gerencia','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(435,'rebeca.cordero@cgr.go.cr','Cordero Leiva Rebeca Natalia','Unidad de Administraci├│n Financiera (UAF)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(436,'ana.leiton@cgr.go.cr','Leit├│n Matamoros Ana Carolina','Unidad Centro de Capacitaci├│n (UCC)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(437,'wendy.morales@cgr.go.cr','Morales Chan Wendy Yanina','├ürea de Fiscalizaci├│n para el Desarrollo de Capacidades (CAP)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(438,'veronica.cerdas@cgr.go.cr','Cerdas Benavides Ver├│nica','├ürea de Fiscalizaci├│n para el Desarrollo del Bienestar Social (BIS)','Asistente T├®cnico','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(439,'milagro.rosales@cgr.go.cr','Rosales Valladares Mar├¡a del Milagro','├ürea de Fiscalizaci├│n para el Desarrollo Local (LOC)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(440,'jennifer.villarreal@cgr.go.cr','Villarreal Sequeira Jennifer Priscilla','├ürea de Fiscalizaci├│n para el Desarrollo Sostenible (SOS)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(441,'maria.induni@cgr.go.cr','Induni Vizca├¡no Mar├¡a Jes├║s','Division Juridica (DJ)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(442,'alfredo.aguilar@cgr.go.cr','Aguilar Arguedas Alfredo','Divisi├│n de Contratacion Publica (DCP)','Gerente de Area/Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(443,'luis.diego.jimenez@cgr.go.cr','Jim├®nez Alp├¡zar Luis Diego','├ürea de Fiscalizaci├│n para el Desarrollo del Bienestar Social (BIS)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(444,'jorge.carmona@cgr.go.cr','Carmona Jim├®nez Jorge Alberto','Divisi├│n de Contratacion Publica (DCP)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(445,'daniel.zuniga@cgr.go.cr','Z├║├▒iga Picado Daniel Alejandro','├ürea de Fiscalizaci├│n para el Desarrollo de las Finanzas P├║blicas (FIP)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(446,'fabiola.corrales@cgr.go.cr','Corrales V├ísquez Fabiola','Unidad de Administraci├│n Financiera (UAF)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(447,'yahaira.barquero@cgr.go.cr','Barquero Zamora Yahaira Vanessa','├ürea de Fiscalizaci├│n para el Desarrollo de la Gobernanza (GOB)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(448,'tatiana.garcia@cgr.go.cr','Garc├¡a Guti├®rrez Tatiana','├ürea de Fiscalizaci├│n para el Desarrollo de la Gobernanza (GOB)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(449,'hilda.rojas@cgr.go.cr','Rojas Zamora Hilda Natalia','├ürea de Seguimiento para la Mejora P├║blica (SEM)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(450,'jose.pablo.padilla@cgr.go.cr','Padilla Gonz├ílez Jos├® Pablo','Unidad de Servicios Generales (USG)','Trabajador Especializado 1','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(451,'gabriela.delgado@cgr.go.cr','Delgado Villalta Gabriela','├ürea de Fiscalizaci├│n para el Desarrollo de Capacidades (CAP)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(452,'luis.calderon@cgr.go.cr','Calder├│n S├ínchez Luis Fernando','├ürea de Fiscalizaci├│n para el Desarrollo de las Finanzas P├║blicas (FIP)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(453,'juan.gabriel.monge@cgr.go.cr','Monge Obando Juan Gabriel','Division Juridica (DJ)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(454,'carolina.retana@cgr.go.cr','Retana Valverde Carolina','├ürea de Fiscalizaci├│n para el Desarrollo del Bienestar Social (BIS)','Gerente de Area/Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(455,'kimberlyn.castro@cgr.go.cr','Castro Contreras Kimberlyn','├ürea de Fiscalizaci├│n para el Desarrollo de Capacidades (CAP)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(456,'maricruz.solis@cgr.go.cr','Sol├¡s Quintanilla Maricruz','├ürea de Fiscalizaci├│n para el Desarrollo Local (LOC)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(457,'guisella.araya@cgr.go.cr','Araya Ram├¡rez Guisella Vanessa','├ürea de Seguimiento para la Mejora P├║blica (SEM)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(458,'david.quesada@cgr.go.cr','Quesada Mas├¡s David','Unidad de Gesti├│n del Potencial Humano (UGPH)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(459,'karen.garro@cgr.go.cr','Garro Vargas Karen Vanessa','├ürea de Fiscalizaci├│n para el Desarrollo de las Finanzas P├║blicas (FIP)','Asistente T├®cnico','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(460,'kenlly.mata@cgr.go.cr','Mata Barboza Kenlly','├ürea de Seguimiento para la Mejora P├║blica (SEM)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(461,'alejandro.villalobos@cgr.go.cr','Villalobos Alvarez Alejandro','Unidad de Gobierno Corporativo (UGC)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(462,'carlos.picado@cgr.go.cr','Picado Vargas Carlos Humberto','├ürea de Fiscalizaci├│n para el Desarrollo Sostenible (SOS)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(463,'falon.arias@cgr.go.cr','Arias Calero Falon Stephany','├ürea de Fiscalizaci├│n para el Desarrollo de la Gobernanza (GOB)','Gerente de Area/Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(464,'natalia.romero@cgr.go.cr','Romero L├│pez Natalia','├ürea de Fiscalizaci├│n para el Desarrollo de la Gobernanza (GOB)','Asistente T├®cnico','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(465,'vivian.carvajal@cgr.go.cr','Carvajal Rodr├¡guez Vivian Stephanie','├ürea de Fiscalizaci├│n para el Desarrollo de Capacidades (CAP)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(466,'suraye.zaglul@cgr.go.cr','Zaglul Fiatt Suraye','Divisi├│n de Contratacion Publica (DCP)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(467,'johanna.rodriguez@cgr.go.cr','Rodr├¡guez Monestel Johanna','Division Juridica (DJ)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(468,'diego.leiva@cgr.go.cr','Leiva Mora Diego','├ürea de Fiscalizaci├│n para el Desarrollo de las Ciudades (CIU)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(469,'edgar.robles@cgr.go.cr','Robles Cascante Edgar Alexander','Unidad de Servicios de Informaci├│n (USI)','Mensajero','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(470,'yorleny.rojas.ortega@cgr.go.cr','Rojas Ortega Yorlene','├ürea de Fiscalizaci├│n para el Desarrollo de las Ciudades (CIU)','Asistente T├®cnico','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(471,'tatiana.mendez@cgr.go.cr','M├®ndez Flores Tatiana Mar├¡a','├ürea de Fiscalizaci├│n para el Desarrollo de la Gobernanza (GOB)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(472,'ericka.elizondo@cgr.go.cr','Elizondo Coronado Ericka Patricia','Unidad de Servicios Generales (USG)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(473,'marilyn.ruiz@cgr.go.cr','Ruiz Valverde Marilyn R.','├ürea de Fiscalizaci├│n para el Desarrollo Sostenible (SOS)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(474,'erick.solorzano@cgr.go.cr','Sol├│rzano Navarro Erick Mauricio','├ürea de Fiscalizaci├│n para el Desarrollo de las Finanzas P├║blicas (FIP)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(475,'maykol.quesada@cgr.go.cr','Quesada Cerdas Maykol Gerardo','Divisi├│n de Gesti├│n de Apoyo (DGA)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(476,'hazel.mena@cgr.go.cr','Mena Monge Hazel','├ürea de Seguimiento para la Mejora P├║blica (SEM)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(477,'grettel.camacho@cgr.go.cr','Camacho Aguilar Grettel','├ürea de Fiscalizaci├│n para el Desarrollo de las Ciudades (CIU)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(478,'yorleny.mora@cgr.go.cr','Mora G├│mez Yorleny','Unidad de Servicios de Informaci├│n (USI)','Oficinista','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(479,'adriana.campos@cgr.go.cr','Campos Chavarr├¡a Adriana','├ürea de Fiscalizaci├│n para el Desarrollo de Capacidades (CAP)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(480,'isabel.solera@cgr.go.cr','Solera Garc├¡a Mar├¡a Isabel','Unidad de Servicios de Informaci├│n (USI)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(481,'jose.pablo.piedra@cgr.go.cr','Piedra Ampi├®e Jos├® Pablo','├ürea de Fiscalizaci├│n para el Desarrollo del Bienestar Social (BIS)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(482,'angie.mora@cgr.go.cr','Mora Chac├│n Angie','├ürea de Fiscalizaci├│n para el Desarrollo de las Ciudades (CIU)','Asistente T├®cnico','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(483,'trilcy.robles@cgr.go.cr','Robles Cruz Trilcy','Unidad de Servicios de Informaci├│n (USI)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(484,'laura.prado@cgr.go.cr','Prado Z├║├▒iga Laura','├ürea de Fiscalizaci├│n para el Desarrollo de la Gobernanza (GOB)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(485,'adriana.artavia@cgr.go.cr','Artavia Guzm├ín Adriana','Divisi├│n de Contratacion Publica (DCP)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(486,'vanessa.hernandez@cgr.go.cr','Hern├índez C├│rdoba Vanessa','Unidad de Servicios de Informaci├│n (USI)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(487,'alejandra.azofeifa@cgr.go.cr','Azofeifa Ure├▒a Mar├¡a Alejandra','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(488,'marcelo.quesada@cgr.go.cr','Quesada Mora Marcelo','Unidad de Servicios Generales (USG)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(489,'alejandra.montero@cgr.go.cr','Montero Quesada Alejandra Cristina','├ürea de Fiscalizaci├│n para el Desarrollo del Bienestar Social (BIS)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(490,'manuel.montero@cgr.go.cr','Montero Dur├ín Manuel Alejandro','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(491,'gabriela.perez@cgr.go.cr','P├®rez L├│pez Mar├¡a Gabriela','Division Juridica (DJ)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(492,'joseph.cheung@cgr.go.cr','Cheung Chan Joseph Anthony','├ürea de Fiscalizaci├│n para el Desarrollo de las Ciudades (CIU)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(493,'hellen.bolanos@cgr.go.cr','Bola├▒os Herrera Hellen','├ürea de Fiscalizaci├│n para el Desarrollo del Bienestar Social (BIS)','Asistente T├®cnico','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(494,'michael.jimenez@cgr.go.cr','Jim├®nez Miranda Michael Mauricio','Unidad de Servicios Generales (USG)','Conductor','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(495,'jorge.barrientos@cgr.go.cr','Barrientos Quir├│s Jorge','├ürea de Fiscalizaci├│n para el Desarrollo Local (LOC)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(496,'thayra.esquivel@cgr.go.cr','Esquivel Hern├índez Thayra','├ürea de Seguimiento para la Mejora P├║blica (SEM)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(497,'heilyn.jimenez@cgr.go.cr','Jim├®nez Young Heilyn','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(498,'rocio.alfaro@cgr.go.cr','Alfaro Vargas Roc├¡o','├ürea para la Innovaci├│n y Aprendizaje en la Fiscalizaci├│n (IAF)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(499,'david.venegas@cgr.go.cr','Venegas Rojas David','Divisi├│n de Contratacion Publica (DCP)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(500,'rodolfo.acon@cgr.go.cr','Ac├│n Fung Rodolfo','├ürea de Fiscalizaci├│n para el Desarrollo de las Finanzas P├║blicas (FIP)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(501,'wilmer.ramirez@cgr.go.cr','Ram├¡rez Morera Wilmer Iv├ín','├ürea de Fiscalizaci├│n para el Desarrollo de las Ciudades (CIU)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(502,'melissa.santandrea@cgr.go.cr','Santandrea Gamboa Karla Melissa','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(503,'sindy.perez@cgr.go.cr','P├®rez Ulloa Sindy Marcela','Divisi├│n de Gesti├│n de Apoyo (DGA)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(504,'ana.corrales@cgr.go.cr','Corrales Z├║├▒iga Ana Catalina','├ürea de Fiscalizaci├│n para el Desarrollo Sostenible (SOS)','Fiscalizador Asistente','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(505,'salome.murillo@cgr.go.cr','Murillo Gonz├ílez Mar├¡a Salom├®','├ürea para la Innovaci├│n y Aprendizaje en la Fiscalizaci├│n (IAF)','Asistente T├®cnico','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(506,'christian.zamora@cgr.go.cr','Zamora P├®rez Christian Enrique','Division Juridica (DJ)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(507,'xinia.valverde@cgr.go.cr','Valverde Corrales Xinia','Unidad de Prensa (UPC)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(508,'ana.soto@cgr.go.cr','Soto Rodr├¡guez Ana Bel├®n','├ürea de Seguimiento para la Mejora P├║blica (SEM)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(509,'andy.camacho@cgr.go.cr','Camacho Corella Andy Esteban','Unidad de Servicios de Informaci├│n (USI)','Trabajador Especializado 1','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(510,'marcela.ramirez@cgr.go.cr','Ram├¡rez Rojas Marcela','├ürea de Fiscalizaci├│n para el Desarrollo de Capacidades (CAP)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(511,'cintya.jimenez@cgr.go.cr','Jim├®nez G├│mez Cintya Patricia','├ürea de Seguimiento para la Mejora P├║blica (SEM)','Asistente T├®cnico','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(512,'paula.calvo@cgr.go.cr','Calvo Delgado Paula Marcela','Unidad de Servicios Generales (USG)','Oficinista','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(513,'maria.sosa@cgr.go.cr','Sosa Brice├▒o Mar├¡a de los ├üngeles','├ürea de Fiscalizaci├│n para el Desarrollo de la Gobernanza (GOB)','Secretaria de Gerencia','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(514,'alejandro.zuniga@cgr.go.cr','Z├║├▒iga G├│mez Alejandro Jos├®','├ürea de Fiscalizaci├│n para el Desarrollo de la Gobernanza (GOB)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(515,'rebeca.calderon@cgr.go.cr','Calder├│n Rodr├¡guez Rebeca','├ürea de Fiscalizaci├│n para el Desarrollo de la Gobernanza (GOB)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(516,'graciela.delgado@cgr.go.cr','Delgado Arias Graciela','├ürea de Fiscalizaci├│n para el Desarrollo de las Ciudades (CIU)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(517,'marta.vega@cgr.go.cr','Vega Astorga Marta Mar├¡a','Unidad de Servicios Generales (USG)','Trabajador Auxiliar','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(518,'gabriel.rodriguez@cgr.go.cr','Rodr├¡guez Arias Gabriel','Divisi├│n de Contratacion Publica (DCP)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(519,'daniela.hernandez@cgr.go.cr','Hern├índez Salazar Daniela','├ürea de Fiscalizaci├│n para el Desarrollo de la Gobernanza (GOB)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(520,'enrique.gonzalez@cgr.go.cr','Gonz├ílez Rold├ín Enrique Agust├¡n','Unidad de Gobierno Corporativo (UGC)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(521,'eddy.godinez@cgr.go.cr','God├¡nez Picado Eddy Roney','├ürea de Seguimiento para la Mejora P├║blica (SEM)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(522,'susana.batista@cgr.go.cr','Batista Varela Susana','Unidad de Tecnolog├¡as de Informaci├│n (UTI)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(523,'rafael.picado@cgr.go.cr','Picado L├│pez Rafael','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Gerente de Area/Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(524,'milena.bulgarelli@cgr.go.cr','Bulgarelli Fuentes Milena Patricia','├ürea de Fiscalizaci├│n para el Desarrollo de las Finanzas P├║blicas (FIP)','Fiscalizador','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(525,'guido.arquin@cgr.go.cr','Arqu├¡n Lobo Guido Alberto','├ürea de Fiscalizaci├│n para el Desarrollo Local (LOC)','Fiscalizador Asociado','2026-02-09 15:32:04','2026-02-09 15:32:04'),
(526,'maribel.astua@cgr.go.cr','Ast├║a Jim├®nez Maribel','├ürea de Fiscalizaci├│n para el Desarrollo de las Finanzas P├║blicas (FIP)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(527,'carol.hernandez@cgr.go.cr','Hern├índez Castro Carol Milenia','Divisi├│n de Contratacion Publica (DCP)','Secretaria de Gerencia','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(528,'francela.munoz@cgr.go.cr','Mu├▒oz Gonz├ílez Francela','├ürea de Fiscalizaci├│n para el Desarrollo de Capacidades (CAP)','Fiscalizador Asistente','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(529,'victoria.araya@cgr.go.cr','Araya Herrera Mar├¡a Victoria','Divisi├│n de Contratacion Publica (DCP)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(530,'fabiola.rodriguez@cgr.go.cr','Rodr├¡guez Mar├¡n Fabiola Andrea','├ürea de Fiscalizaci├│n para el Desarrollo Local (LOC)','Asistente T├®cnico','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(531,'allan.obando@cgr.go.cr','Obando Fern├índez Allan Vinicio','Division Juridica (DJ)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(532,'juan.carlos.rivera@cgr.go.cr','Rivera Fallas Juan Carlos','├ürea de Seguimiento para la Mejora P├║blica (SEM)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(533,'andrea.munoz@cgr.go.cr','Mu├▒oz Cerdas Ana Andrea','Divisi├│n de Contratacion Publica (DCP)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(534,'natalia.lopez@cgr.go.cr','L├│pez Quir├│s Natalia','Divisi├│n de Contratacion Publica (DCP)','Fiscalizador Asociado','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(535,'adrian.obando@cgr.go.cr','Obando Rodr├¡guez Adri├ín Jos├®','Unidad de Gesti├│n del Potencial Humano (UGPH)','Fiscalizador Asociado','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(536,'yildred.valladares@cgr.go.cr','Valladares Acu├▒a Yildred Mar├¡a','├ürea de Fiscalizaci├│n para el Desarrollo Local (LOC)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(537,'rafael.arguedas@cgr.go.cr','Arguedas Segura Rafael','├ürea de Fiscalizaci├│n para el Desarrollo Local (LOC)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(538,'susana.alpizar@cgr.go.cr','Alp├¡zar Barrantes Susana','├ürea de Fiscalizaci├│n para el Desarrollo del Bienestar Social (BIS)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(539,'alonso.corrales@cgr.go.cr','Corrales Ast├║a Luis Alonso','Unidad Jur├¡dica Interna (UJI)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(540,'lorena.valverde@cgr.go.cr','Valverde Sabor├¡o Ana Lorena','Unidad de Tecnolog├¡as de Informaci├│n (UTI)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(541,'grettel.zuniga@cgr.go.cr','Z├║├▒iga Artavia Grettel','├ürea de Fiscalizaci├│n para el Desarrollo de las Ciudades (CIU)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(542,'julissa.saenz@cgr.go.cr','S├íenz Leiva Julissa','├ürea de Fiscalizaci├│n para el Desarrollo de las Finanzas P├║blicas (FIP)','Gerente de Area/Asociado','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(543,'ivannia.monge@cgr.go.cr','Monge L├│pez Ivannia Patricia','├ürea de Fiscalizaci├│n para el Desarrollo de las Ciudades (CIU)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(544,'hazel.chavarria@cgr.go.cr','Chavarr├¡a Arroyo Hazel','├ürea de Seguimiento para la Mejora P├║blica (SEM)','Asistente T├®cnico','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(545,'silvia.castro@cgr.go.cr','Castro Monge Silvia Elena','Unidad de Servicios de Proveedur├¡a (USP)','Fiscalizador Asociado','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(546,'raul.castro@cgr.go.cr','Castro Borb├│n Ra├║l Alberto','Despacho Contralor (DC)','Asistente','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(547,'allan.quesada@cgr.go.cr','Quesada Monge Allan Gerardo','Divisi├│n de Contratacion Publica (DCP)','Fiscalizador Asociado','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(548,'grettel.cisneros@cgr.go.cr','Cisneros Valverde Grettel Jeannette','Division Juridica (DJ)','Gerente de Area/Asociado','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(549,'jeimy.salazar@cgr.go.cr','Salazar Montoya Jeimy','├ürea de Fiscalizaci├│n para el Desarrollo del Bienestar Social (BIS)','Fiscalizador Asistente','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(550,'giselle.hernandez@cgr.go.cr','Hern├índez Jim├®nez Giselle','├ürea de Fiscalizaci├│n para el Desarrollo de la Gobernanza (GOB)','Fiscalizador Asistente','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(551,'ember.segura@cgr.go.cr','Segura Molina Ember Gerardo','Divisi├│n de Contratacion Publica (DCP)','Fiscalizador Asociado','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(552,'gerardo.hernandezq@cgr.go.cr','Hern├índez Quiel Gerardo','Unidad de Servicios Generales (USG)','Oficial de Seguridad','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(553,'jenny.mora@cgr.go.cr','Mora L├│pez Jenny','├ürea de Seguimiento para la Mejora P├║blica (SEM)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(554,'evelyn.mora@cgr.go.cr','Mora Barrantes Evelyn','├ürea para la Innovaci├│n y Aprendizaje en la Fiscalizaci├│n (IAF)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(555,'geisy.vindas@cgr.go.cr','Vindas Quir├│s Geisy Edith','Divisi├│n de Contratacion Publica (DCP)','Fiscalizador Asociado','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(556,'adriana.pacheco@cgr.go.cr','Pacheco Vargas Adriana','Divisi├│n de Contratacion Publica (DCP)','Gerente de Area/Asociado','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(557,'martina.ramirez@cgr.go.cr','Ram├¡rez Montoya Martina','Divisi├│n de Contratacion Publica (DCP)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(558,'cinthya.acuna@cgr.go.cr','Acu├▒a Vargas Cinthya Guiselle','├ürea de Fiscalizaci├│n para el Desarrollo de la Gobernanza (GOB)','Fiscalizador Asociado','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(559,'nancy.campos@cgr.go.cr','Campos Jim├®nez Nancy Isela','├ürea para la Innovaci├│n y Aprendizaje en la Fiscalizaci├│n (IAF)','Asistente T├®cnico','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(560,'jose.monge@cgr.go.cr','Monge Navas Jos├® Francisco','Unidad de Servicios Generales (USG)','Conductor','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(561,'maria.solano@cgr.go.cr','Solano Delgado Mar├¡a Gabriela','Unidad de Servicios de Proveedur├¡a (USP)','Fiscalizador Asistente','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(562,'ana.paula.hernandez@cgr.go.cr','Hern├índez Cordero Ana Paula','├ürea de Fiscalizaci├│n para el Desarrollo de las Ciudades (CIU)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(563,'rolando.tenorio@cgr.go.cr','Tenorio P├®rez Rolando Alberto','Unidad de Servicios de Informaci├│n (USI)','Fiscalizador Asociado','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(564,'teresita.araya@cgr.go.cr','Araya Brenes Teresita','├ürea de Fiscalizaci├│n para el Desarrollo Sostenible (SOS)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(565,'marina.fernandez@cgr.go.cr','Fern├índez-Cuesta Rom├ín Marina','├ürea de Fiscalizaci├│n para el Desarrollo Local (LOC)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(566,'marcela.campos@cgr.go.cr','Campos Chaverri Marcela','├ürea de Fiscalizaci├│n para el Desarrollo de la Gobernanza (GOB)','Fiscalizador Asistente','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(567,'pablo.rosales@cgr.go.cr','Rosales Granados Pablo','Unidad de Servicios Generales (USG)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(568,'rebeca.bejarano@cgr.go.cr','Bejarano Ram├¡rez Rebeca','Divisi├│n de Contratacion Publica (DCP)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(569,'veronica.zuniga@cgr.go.cr','Z├║├▒iga Tenorio Ver├│nica Raquel','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(570,'kenneth.monge@cgr.go.cr','Monge Quir├│s Kenneth Irvin','├ürea para la Innovaci├│n y Aprendizaje en la Fiscalizaci├│n (IAF)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(571,'angie.chaves@cgr.go.cr','Chaves Vargas Angie','├ürea para la Innovaci├│n y Aprendizaje en la Fiscalizaci├│n (IAF)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(572,'eric.lopez@cgr.go.cr','L├│pez Seas Eric Alonso','Unidad de Servicios Generales (USG)','Trabajador Especializado 1','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(573,'karla.salas@cgr.go.cr','Salas Solano Karla','├ürea de Fiscalizaci├│n para el Desarrollo del Bienestar Social (BIS)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(574,'cesar.munoz@cgr.go.cr','Mu├▒oz Campos C├®sar','Unidad de Tecnolog├¡as de Informaci├│n (UTI)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(575,'scarlett.esquivel@cgr.go.cr','Esquivel Arguedas Scarlett de los├üngeles','Unidad de Servicios Generales (USG)','Oficial de Seguridad','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(576,'jainse.marin@cgr.go.cr','Mar├¡n Jim├®nez Ja├¡nse','Division Juridica (DJ)','Gerente de Area/Asociado','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(577,'lucia.golcher@cgr.go.cr','Golcher Beirute Luc├¡a','Divisi├│n de Contratacion Publica (DCP)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(578,'alejandro.herrera@cgr.go.cr','Herrera L├│pez Juan Alejandro','Unidad Jur├¡dica Interna (UJI)','Jefe de Unidad','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(579,'randall.montes@cgr.go.cr','Montes Porras Randall','Unidad de Gobierno Corporativo (UGC)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(580,'yira.sanchez@cgr.go.cr','S├ínchez Palma Yira','Auditor├¡a Interna (AIG)','Fiscalizador Asistente','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(581,'juan.manuel.jimenez@cgr.go.cr','Jim├®nez Silva Juan Manuel','Division Juridica (DJ)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(582,'francella.navarro@cgr.go.cr','Navarro Moya Sonia Francella','Division Juridica (DJ)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(583,'glenda.flores@cgr.go.cr','Flores Dom├¡nguez Glenda','├ürea de Fiscalizaci├│n para el Desarrollo Local (LOC)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(584,'andrea.serrano@cgr.go.cr','Serrano Rodr├¡guez Andrea Mar├¡a','Divisi├│n de Contratacion Publica (DCP)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(585,'luis.morales@cgr.go.cr','Morales Barquero Luis Fernando','Unidad de Tecnolog├¡as de Informaci├│n (UTI)','Fiscalizador Asistente','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(586,'gustavo.mayorga@cgr.go.cr','Mayorga Campos Gustavo Alonso','Unidad de Servicios Generales (USG)','Trabajador Auxiliar','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(587,'edgar.herrera@cgr.go.cr','Herrera Loaiza Edgar Ricardo','Divisi├│n de Contratacion Publica (DCP)','Asistente T├®cnico','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(588,'monica.murillo@cgr.go.cr','Murillo Aguilar M├│nica','Unidad de Gobierno Corporativo (UGC)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(589,'alexander.corella@cgr.go.cr','Corella Chavarr├¡a Alexander','Division Juridica (DJ)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(590,'jose.francisco.monge@cgr.go.cr','Monge Fonseca Jos├® Francisco','├ürea de Fiscalizaci├│n para el Desarrollo de las Ciudades (CIU)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(591,'laureen.castillo@cgr.go.cr','Castillo Smith Laureen de los ├üngeles','Unidad de Servicios Generales (USG)','Oficial de Seguridad','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(592,'hernan.monge@cgr.go.cr','Monge Arce Hern├ín','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(593,'ivan.quesada@cgr.go.cr','Quesada Rodr├¡guez Iv├ín','Division Juridica (DJ)','Gerente de Area/Asociado','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(594,'gabriela.cordero@cgr.go.cr','Cordero Quesada Mar├¡a Gabriela','Unidad de Gesti├│n del Potencial Humano (UGPH)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(595,'ivannia.barrientos@cgr.go.cr','Barrientos Leit├│n Ivannia Mar├¡a','Unidad de Servicios Generales (USG)','Secretaria de Gerencia','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(596,'roberto.rodriguez@cgr.go.cr','Rodr├¡guez Araica Roberto','Divisi├│n de Contratacion Publica (DCP)','Gerente de Division','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(597,'yessenia.soto@cgr.go.cr','Soto Salazar Yesennia','├ürea de Fiscalizaci├│n para el Desarrollo Local (LOC)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(598,'alexander.vega@cgr.go.cr','Vega Cerdas Alexander','Unidad de Servicios Generales (USG)','Conductor','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(599,'roy.porras@cgr.go.cr','Porras Villalta Roy Nelson','Unidad de Tecnolog├¡as de Informaci├│n (UTI)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(600,'grettel.cubero@cgr.go.cr','Cubero Solano Grettel','Divisi├│n de Gesti├│n de Apoyo (DGA)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(601,'flor.alfaro@cgr.go.cr','Alfaro G├│mez Flor de Mar├¡a','├ürea de Fiscalizaci├│n para el Desarrollo de Capacidades (CAP)','Asistente T├®cnico','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(602,'ruth.houed@cgr.go.cr','Houed Caama├▒o Ruth Isabel','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Asistente T├®cnico','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(603,'marianella.gomez@cgr.go.cr','G├│mez Solano Marianella de los ├üngeles','Divisi├│n de Fiscalizaci├│n Operativa y Evaluativa (DFOE)','Secretaria de Gerencia','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(604,'walter.araya@cgr.go.cr','Araya G├│chez Walter','Unidad de Servicios de Proveedur├¡a (USP)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(605,'viviana.vargas@cgr.go.cr','Vargas Rivera Viviana','Unidad de Servicios de Informaci├│n (USI)','Fiscalizador Asociado','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(606,'milena.montero@cgr.go.cr','Montero Rodr├¡guez Digna Milena','Unidad Jur├¡dica Interna (UJI)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(607,'rosemary.delgado@cgr.go.cr','Delgado Valverde Rose Mery','Unidad de Servicios de Informaci├│n (USI)','Fiscalizador Asistente','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(608,'marta.rodriguez@cgr.go.cr','Rodr├¡guez Ag├╝ero Marta','Unidad de Gobierno Corporativo (UGC)','Secretaria de Gerencia','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(609,'erick.lobo@cgr.go.cr','Lobo Mar├¡n Erick','Unidad de Tecnolog├¡as de Informaci├│n (UTI)','Asistente T├®cnico','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(610,'monica.bustamante@cgr.go.cr','Bustamante Berm├║dez M├│nica Mar├¡a','├ürea de Fiscalizaci├│n para el Desarrollo del Bienestar Social (BIS)','Fiscalizador Asociado','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(611,'noemy.valverde@cgr.go.cr','Valverde Serrano Noemy','Auditor├¡a Interna (AIG)','Secretaria de Gerencia','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(612,'guadalupe.flores@cgr.go.cr','Flores Sand├¡ Ma. Guadalupe','Unidad de Gesti├│n del Potencial Humano (UGPH)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(613,'marlen.munoz@cgr.go.cr','Mu├▒oz Herrera Marlen','├ürea de Fiscalizaci├│n para el Desarrollo Local (LOC)','Fiscalizador Asociado','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(614,'rosa.fallas@cgr.go.cr','Fallas Ib├í├▒ez Rosa Mar├¡a','Division Juridica (DJ)','Gerente de Area/Asociado','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(615,'amelia.jimenez@cgr.go.cr','Jim├®nez Rueda Amelia','Divisi├│n de Fiscalizaci├│n Operativa y Evaluativa (DFOE)','Gerente de Division','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(616,'gustavo.gatjens@cgr.go.cr','G├ñtjens Ortiz Gustavo','Unidad de Servicios de Informaci├│n (USI)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(617,'vivian.garbanzo@cgr.go.cr','Garbanzo Navarro Vivian','├ürea de Fiscalizaci├│n para el Desarrollo Local (LOC)','Gerente de Area/Asociado','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(618,'maria.cajiao@cgr.go.cr','Cajiao Jim├®nez Mar├¡a Virginia','├ürea de Fiscalizaci├│n para el Desarrollo Sostenible (SOS)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(619,'ingrid.porras@cgr.go.cr','Porras Guerrero Ingrid','├ürea de Fiscalizaci├│n para el Desarrollo de las Ciudades (CIU)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(620,'mariela.azofeifa@cgr.go.cr','Azofeifa Olivares Mariela','Unidad de Prensa (UPC)','Jefe de Unidad','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(621,'carlos.solera@cgr.go.cr','Solera Artavia Carlos','Unidad de Servicios Generales (USG)','Trabajador Especializado 2','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(622,'ligia.segura@cgr.go.cr','Segura Salazar Ligia','├ürea de Seguimiento para la Mejora P├║blica (SEM)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(623,'gabriela.araya@cgr.go.cr','Araya Barquero Gabriela','Divisi├│n de Gesti├│n de Apoyo (DGA)','Secretaria de Gerencia','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(624,'celina.mejia@cgr.go.cr','Mej├¡a Chavarr├¡a Celina','Divisi├│n de Contratacion Publica (DCP)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(625,'anabelle.chinchilla@cgr.go.cr','Chinchilla Berm├║dez Anabelle','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(626,'gustavo.picado@cgr.go.cr','Picado Schmidt Gustavo','├ürea de Fiscalizaci├│n para el Desarrollo Local (LOC)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(627,'bernal.piedra@cgr.go.cr','Piedra Castillo Bernal Jos├®','Unidad de Gobierno Corporativo (UGC)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(628,'ronald.mena@cgr.go.cr','Mena Fallas Ronald','├ürea de Fiscalizaci├│n para el Desarrollo de las Ciudades (CIU)','Fiscalizador Asociado','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(629,'ronald.monge@cgr.go.cr','Monge Salazar Ronald','Unidad de Servicios Generales (USG)','Jefe de Unidad','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(630,'marcela.aragon@cgr.go.cr','Arag├│n Sandoval Marcela','├ürea de Fiscalizaci├│n para el Desarrollo de las Ciudades (CIU)','Gerente de Area/Asociado','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(631,'rosita.perez@cgr.go.cr','P├®rez Matamoros Rosita','Division Juridica (DJ)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(632,'ivonne.monterrosa@cgr.go.cr','Monterrosa Palma Ivonne','├ürea de Fiscalizaci├│n para el Desarrollo Sostenible (SOS)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(633,'olga.villalobos@cgr.go.cr','Villalobos Le├│n Olga Estela','├ürea de Fiscalizaci├│n para el Desarrollo Sostenible (SOS)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(634,'pedro.jimenez@cgr.go.cr','Jim├®nez Garc├¡a Pedro','Divisi├│n de Contratacion Publica (DCP)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(635,'kathia.volio@cgr.go.cr','Volio Cordero Kathia Gabriela','Divisi├│n de Contratacion Publica (DCP)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(636,'jeannette.fallas@cgr.go.cr','Fallas Castro Jeannette','Unidad de Administraci├│n Financiera (UAF)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(637,'roxana.machado@cgr.go.cr','Machado Aguilar Roxana','Unidad de Servicios de Informaci├│n (USI)','Secretaria de Gerencia','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(638,'grettel.calderon@cgr.go.cr','Calder├│n Herrera Grettel','├ürea de Investigaci├│n para la Denuncia Ciudadana (DEC)','Asistente T├®cnico','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(639,'paula.serra@cgr.go.cr','Serra Brenes Paula','Division Juridica (DJ)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(640,'johnny.romero@cgr.go.cr','Romero Rojas Johnny','Unidad de Tecnolog├¡as de Informaci├│n (UTI)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(641,'ana.ruiz@cgr.go.cr','Ruiz C├®spedes Ana Mar├¡a','Unidad de Gobierno Corporativo (UGC)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(642,'rodrigo.paniagua@cgr.go.cr','Paniagua P├íez Rodrigo','├ürea de Fiscalizaci├│n para el Desarrollo del Bienestar Social (BIS)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(643,'yazmin.castro@cgr.go.cr','Castro S├ínchez Yazm├¡n','Divisi├│n de Contratacion Publica (DCP)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(644,'victor.zeledon@cgr.go.cr','Zeled├│n Chinchilla V├¡ctor Hugo','Unidad de Servicios Generales (USG)','Conductor','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(645,'marvin.ulate@cgr.go.cr','Ulate Bejarano Marvin Edwin','Unidad de Servicios Generales (USG)','Conductor','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(646,'rodrigo.carballo@cgr.go.cr','Carballo Solano Rodrigo Alonso','├ürea de Fiscalizaci├│n para el Desarrollo del Bienestar Social (BIS)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(647,'shirley.segura@cgr.go.cr','Segura Corrales Shirley','├ürea de Fiscalizaci├│n para el Desarrollo Sostenible (SOS)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(648,'gina.arroyo@cgr.go.cr','Arroyo Yannarella Gina','├ürea de Fiscalizaci├│n para el Desarrollo de las Finanzas P├║blicas (FIP)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(649,'nazira.montero@cgr.go.cr','Montero Moreno Nazira','Unidad de Servicios de Proveedur├¡a (USP)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(650,'sonia.vega@cgr.go.cr','Vega Sol├¡s Sonia Patricia','Auditor├¡a Interna (AIG)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(651,'lorena.sanchez@cgr.go.cr','S├ínchez Salas Ana Lorena','Unidad de Gesti├│n del Potencial Humano (UGPH)','Jefe de Unidad','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(652,'irene.monge@cgr.go.cr','Monge Naranjo Irene','Auditor├¡a Interna (AIG)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(653,'marco.quiros@cgr.go.cr','Quir├│s Morales Marco Vinicio','├ürea de Fiscalizaci├│n para el Desarrollo de las Ciudades (CIU)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(654,'ricardo.solano@cgr.go.cr','Solano Fallas Ricardo','Unidad de Servicios de Proveedur├¡a (USP)','Supervisor Administrativo','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(655,'alvaro.fallas@cgr.go.cr','Fallas Padilla Alvaro','Unidad de Servicios Generales (USG)','Oficial de Seguridad','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(656,'mario.guevara@cgr.go.cr','Guevara Montero Mario A.','Unidad de Servicios Generales (USG)','Trabajador Auxiliar','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(657,'alex.ramirez@cgr.go.cr','Ram├¡rez Mar├¡n Luis Alex','Unidad Centro de Capacitaci├│n (UCC)','Jefe de Unidad','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(658,'francisco.hernandez@cgr.go.cr','Hern├índez Herrera Francisco','├ürea de Fiscalizaci├│n para el Desarrollo Local (LOC)','Asistente T├®cnico','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(659,'eva.chavarria@cgr.go.cr','Chavarr├¡a Camacho Eva Patricia','├ürea de Fiscalizaci├│n para el Desarrollo del Bienestar Social (BIS)','Fiscalizador Asociado','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(660,'alex.monge@cgr.go.cr','Monge Lemaitre Alex Salom├│n','├ürea para la Innovaci├│n y Aprendizaje en la Fiscalizaci├│n (IAF)','Asistente T├®cnico','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(661,'oscar.cerdas@cgr.go.cr','Cerdas Calder├│n Oscar','Unidad de Servicios de Informaci├│n (USI)','Trabajador Especializado 1','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(662,'mauricio.mora@cgr.go.cr','Mora Ap├║ Mauricio Jos├®','Unidad de Servicios Generales (USG)','Trabajador Especializado 2','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(663,'jorge.enrique.vega@cgr.go.cr','Vega Jim├®nez Jorge Enrique','Unidad de Servicios Generales (USG)','Trabajador Especializado 1','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(664,'hazel.godinez@cgr.go.cr','God├¡nez Sol├¡s Hazel Nazira','├ürea de Fiscalizaci├│n para el Desarrollo de la Gobernanza (GOB)','Fiscalizador Asociado','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(665,'hannia.mena@cgr.go.cr','Mena Garro Hannia','├ürea de Fiscalizaci├│n para el Desarrollo de la Gobernanza (GOB)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(666,'ines.mora@cgr.go.cr','Mora Naranjo In├®s Patricia','├ürea de Seguimiento para la Mejora P├║blica (SEM)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(667,'guiselle.sanchez@cgr.go.cr','S├ínchez Lara Guiselle','├ürea de Fiscalizaci├│n para el Desarrollo Local (LOC)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(668,'jorge.leon@cgr.go.cr','Le├│n Rodr├¡guez Jorge','Unidad de Tecnolog├¡as de Informaci├│n (UTI)','Jefe de Unidad','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(669,'juan.carlos.zuniga@cgr.go.cr','Z├║├▒iga Jim├®nez Juan Carlos','├ürea de Fiscalizaci├│n para el Desarrollo del Bienestar Social (BIS)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(670,'guillermo.oviedo@cgr.go.cr','Oviedo Blanco Guillermo','Unidad de Tecnolog├¡as de Informaci├│n (UTI)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(671,'oscar.rojas@cgr.go.cr','Rojas Valverde Oscar Luis','Unidad de Gesti├│n del Potencial Humano (UGPH)','Fiscalizador Asociado','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(672,'carlos.madrigal@cgr.go.cr','Madrigal Bravo Carlos Luis','Unidad de Administraci├│n Financiera (UAF)','Jefe de Unidad','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(673,'vilma.amador@cgr.go.cr','Amador Segura Vilma','├ürea de Fiscalizaci├│n para el Desarrollo de las Ciudades (CIU)','Secretaria de Gerencia','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(674,'ronald.mora@cgr.go.cr','Mora Quesada Ronald','Unidad de Servicios de Informaci├│n (USI)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(675,'patricia.barrientos@cgr.go.cr','Barrientos Guzm├ín Ana Patricia','├ürea de Fiscalizaci├│n para el Desarrollo de las Ciudades (CIU)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(676,'javier.brenes@cgr.go.cr','Brenes Arrieta Javier','Unidad de Tecnolog├¡as de Informaci├│n (UTI)','Asistente T├®cnico','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(677,'jeanine.herrera@cgr.go.cr','Herrera Arias Jeanine','Despacho Contralor (DC)','Asesor','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(678,'laura.chinchilla@cgr.go.cr','Chinchilla Araya Laura','Divisi├│n de Contratacion Publica (DCP)','Asistente T├®cnico','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(679,'gonzalo.elizondo@cgr.go.cr','Elizondo Rojas Gonzalo','├ürea de Fiscalizaci├│n para el Desarrollo Local (LOC)','Asistente T├®cnico','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(680,'reynaldo.rivera@cgr.go.cr','Rivera Vargas Reynaldo','├ürea de Fiscalizaci├│n para el Desarrollo Sostenible (SOS)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(681,'gilbert.zuniga@cgr.go.cr','Z├║├▒iga Castro Gilbert Francisco','Unidad de Tecnolog├¡as de Informaci├│n (UTI)','Fiscalizador Asociado','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(682,'marilu.aguilar@cgr.go.cr','Aguilar Gonz├ílez Maril├║','├ürea de Fiscalizaci├│n para el Desarrollo de las Ciudades (CIU)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(683,'hellen.laverde@cgr.go.cr','Laverde Cambronero Hellen','├ürea de Fiscalizaci├│n para el Desarrollo de Capacidades (CAP)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(684,'allan.prendas@cgr.go.cr','Prendas Valverde Allan','Unidad de Tecnolog├¡as de Informaci├│n (UTI)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(685,'carlos.guerrero@cgr.go.cr','Guerrero Bazo Carlos Arturo','├ürea de Fiscalizaci├│n para el Desarrollo de Capacidades (CAP)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(686,'eduardo.zumbado@cgr.go.cr','Zumbado Esquivel Eduardo','Despacho Contralor (DC)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(687,'alfredo.luis.gomez@cgr.go.cr','G├│mez Gamboa Alfredo Luis','Unidad de Servicios Generales (USG)','Conductor','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(688,'juan.carlos.chavarria@cgr.go.cr','Chavarr├¡a Mora Juan Carlos de Jes├║s','Unidad de Servicios Generales (USG)','Conductor','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(689,'humberto.villalobos@cgr.go.cr','Villalobos Figueroa Humberto','Unidad de Servicios de Proveedur├¡a (USP)','Oficinista','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(690,'juan.carlos.solis@cgr.go.cr','Sol├¡s Ledezma Juan Carlos','Unidad de Tecnolog├¡as de Informaci├│n (UTI)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(691,'hannia.perez@cgr.go.cr','P├®rez Cede├▒o Hannia','├ürea de Fiscalizaci├│n para el Desarrollo de las Ciudades (CIU)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(692,'edwin.zuniga@cgr.go.cr','Z├║├▒iga Rojas Edwin','├ürea de Fiscalizaci├│n para el Desarrollo de las Finanzas P├║blicas (FIP)','Asistente T├®cnico','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(693,'bernardo.ramirez@cgr.go.cr','Ram├¡rez Castro Bernardo','├ürea de Fiscalizaci├│n para el Desarrollo de las Finanzas P├║blicas (FIP)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(694,'juan.ernesto.cruz@cgr.go.cr','Cruz Azofeifa Juan Ernesto','├ürea de Fiscalizaci├│n para el Desarrollo de las Finanzas P├║blicas (FIP)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(695,'carlos.gutierrez@cgr.go.cr','Guti├®rrez Schwanhauser Carlos F.','├ürea de Fiscalizaci├│n para el Desarrollo de las Ciudades (CIU)','Fiscalizador','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(696,'guillermo.barquero@cgr.go.cr','Barquero Chac├│n Guillermo','Despacho Contralor (DC)','Asesor','2026-02-09 15:32:05','2026-02-09 15:32:05'),
(697,'bernal.aragon@cgr.go.cr','Arag├│n Barquero Bernal','Despacho Contralor (DC)','Subcontralor (a) General','2026-02-09 15:32:05','2026-02-09 15:32:05');
/*!40000 ALTER TABLE `staff_directory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `system_settings` (
  `setting_key` varchar(100) NOT NULL,
  `setting_value` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
INSERT INTO `system_settings` VALUES
('bonus_perfect_score','25','2026-02-09 15:50:59','2026-02-09 15:50:59'),
('maintenance_mode','false','2026-02-12 17:30:23','2026-02-12 17:30:23'),
('points_per_lesson','9','2026-02-09 15:50:59','2026-02-09 21:07:37'),
('points_per_quiz','50','2026-02-09 15:50:59','2026-02-09 15:50:59');
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_badges`
--

DROP TABLE IF EXISTS `user_badges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_badges` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `badge_id` int(11) NOT NULL,
  `earned_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_badge` (`user_id`,`badge_id`),
  KEY `badge_id` (`badge_id`),
  CONSTRAINT `user_badges_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_badges_ibfk_2` FOREIGN KEY (`badge_id`) REFERENCES `badges` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_badges`
--

LOCK TABLES `user_badges` WRITE;
/*!40000 ALTER TABLE `user_badges` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_badges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_points`
--

DROP TABLE IF EXISTS `user_points`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_points` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `points` int(11) DEFAULT 0,
  `level` varchar(100) DEFAULT 'Novato',
  `badges` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Insignias obtenidas en formato JSON' CHECK (json_valid(`badges`)),
  `rank_position` int(11) DEFAULT NULL,
  `last_updated` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_points` (`user_id`),
  KEY `idx_points` (`points` DESC),
  KEY `idx_level` (`level`),
  CONSTRAINT `user_points_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=189 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_points`
--

LOCK TABLES `user_points` WRITE;
/*!40000 ALTER TABLE `user_points` DISABLE KEYS */;
INSERT INTO `user_points` VALUES
(1,3,0,'Novato',NULL,NULL,'2026-02-17 22:54:47','2026-02-09 15:21:00','2026-02-18 04:54:47');
/*!40000 ALTER TABLE `user_points` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_progress`
--

DROP TABLE IF EXISTS `user_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_progress` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `module_id` int(11) NOT NULL,
  `lesson_id` int(11) DEFAULT NULL,
  `status` enum('not_started','in_progress','completed') DEFAULT 'not_started',
  `progress_percentage` int(11) DEFAULT 0,
  `points_earned` int(11) DEFAULT 0,
  `time_spent_minutes` int(11) DEFAULT 0,
  `started_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `last_accessed` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_lesson` (`user_id`,`lesson_id`),
  KEY `lesson_id` (`lesson_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_module_id` (`module_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `user_progress_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_progress_ibfk_2` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_progress_ibfk_3` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=176 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_progress`
--

LOCK TABLES `user_progress` WRITE;
/*!40000 ALTER TABLE `user_progress` DISABLE KEYS */;
INSERT INTO `user_progress` VALUES
(173,3,9,19,'in_progress',0,0,0,NULL,NULL,'2026-02-18 06:57:21','2026-02-18 04:57:33','2026-02-18 12:57:21'),
(174,3,9,20,'in_progress',0,0,0,NULL,NULL,'2026-02-17 22:57:45','2026-02-18 04:57:45','2026-02-18 04:57:45'),
(175,3,9,21,'in_progress',0,0,0,NULL,NULL,'2026-02-17 22:57:47','2026-02-18 04:57:47','2026-02-18 04:57:47');
/*!40000 ALTER TABLE `user_progress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(50) DEFAULT NULL COMMENT 'C├®dula o ID de empleado',
  `email` varchar(255) NOT NULL,
  `google_id` varchar(255) DEFAULT NULL COMMENT 'Google OAuth ID',
  `password_hash` varchar(255) DEFAULT NULL COMMENT 'Hash de contrase├▒a (opcional si usa Google)',
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `profile_picture` text DEFAULT NULL COMMENT 'URL de foto de perfil de Google',
  `department` varchar(100) DEFAULT NULL,
  `position` varchar(100) DEFAULT NULL,
  `role` enum('student','instructor','admin') DEFAULT 'student',
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `employee_id` (`employee_id`),
  UNIQUE KEY `google_id` (`google_id`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_email` (`email`),
  KEY `idx_google_id` (`google_id`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'ADMIN001','admin@cgr.go.cr',NULL,'$2b$10$YourHashedPasswordHere','Administrador','Sistema',NULL,'TI','Administrador LMS','admin',1,NULL,'2026-02-09 15:17:26','2026-02-09 15:17:26'),
(3,NULL,'mario.andres.zamora@cgr.go.cr','100051220483603501350',NULL,'Mario Andr├®s','Zamora Madriz','https://lh3.googleusercontent.com/a-/ALV-UjWtHDk9zr6L09DQTLNUDeMN05kqucpMn8F1jOxOeDwiE39QEqjUAfKyZTqxEIXS-csJahCT_IL5MyUuWGagp0_Goysxv98HfrvjQLQRPRvexWZ0aRLJ1ul31O7EvLfq3Y7OYzsaIpSH7lDEtXVc4eIOcMMXy94mTIbDBfknzM9oJ9TyuGuuzDGT0jCL5G58mZKG0t-t1N4sECtWpHnDfgKKVdGN5ukZJZF8sIkuPCW_cxvGejFuM9FOWO9Jz3xPuxAIhpgjscCb2uoMAQBdV8eYArMLveUSGFWAkMgh1OuAsrwNyGVjluFBaGoOlrK_W8-qZK-8mYg-_1jb2snkgGffzsLoVHLpiNvq6zcqk57OqWnp8bow0u6Hl4JvRjAnMVptS2Ym3qkHQs2Ib49Vr8IOzYERkdHKWaVXZhdMCLfEdBCcxlX8JSZH_6XnzZ0gU1Jh-_JDy-ppJAPIrylzh-vpnG1yPzKdORtOpReq8QoCAPLBtHZjlJnV6_vs_9xpKXSLxA-4F_1hmd6Z8_xOOK9lPjEoBItue9jq6pdHZakiWHuNgQqBgZITwVjGcCIONzJa_WEB7LS1kPZHSRDVP2Hs7mmTX19iXpnlINUR5bKg9wfiFNdbef0bRIMx8xdSQCEwtEc7zGrvXaWTq4MMsdKpjqk1IJclH3I-ufANLBgTlhFITzVCq0_4QY5PRjZkgmb-i4vnju-7wTSKk46Tl_B2vLOUSv0M7s3CcjLDMXeI7YqEaxiTSgYCaqzO6ySq2HunEJO1GKBr6rgbuRp4lM-H_KZZpV69pO8UaujiOJOfT-z-IAuaSONx4faBrQ3TX05Egwp1JO19IPziaZMFACCaooJ5AoSmzqnd9wGCJCE-qmQipnoOsovK-Yy13tL4hENisaGWCEosxBrqDDuENBmfdLvNZO9JTGxywB0q4FkwAJz0pR2273jWBLEnAkIm70IxU4mhaiLND8YJJj6lEgd7dKT3TooUv1pfFfCwjI85HnejLiOk3p0399M_6xX6qG_o_pzD4lq9Ne1a_4mNfqK9nLPot1ARPJ_UjAZUj64I40aSv4dYYWZ59Q=s96-c','Divisi├│n de Gesti├│n de Apoyo (DGA)','Oficial de Seguridad de la Informaci├│n','admin',1,'2026-02-17 21:32:26','2026-02-09 15:21:00','2026-02-18 03:32:26');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-18 15:47:03
