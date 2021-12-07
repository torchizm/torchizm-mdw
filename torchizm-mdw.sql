-- --------------------------------------------------------
-- Sunucu:                       vlasttest.com
-- Sunucu sürümü:                10.6.4-MariaDB - mariadb.org binary distribution
-- Sunucu İşletim Sistemi:       Win64
-- HeidiSQL Sürüm:               11.1.0.6116
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- es_vlast için veritabanı yapısı dökülüyor
CREATE DATABASE IF NOT EXISTS `es_vlast` /*!40100 DEFAULT CHARACTER SET utf8mb3 */;
USE `es_vlast`;

-- tablo yapısı dökülüyor es_vlast.mdt_reports
CREATE TABLE IF NOT EXISTS `mdt_reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `char_id` int(11) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `incident` longtext DEFAULT NULL,
  `charges` longtext DEFAULT NULL,
  `author` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `date` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- Veri çıktısı seçilmemişti

-- tablo yapısı dökülüyor es_vlast.mdt_warrants
CREATE TABLE IF NOT EXISTS `mdt_warrants` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `char_id` int(11) DEFAULT NULL,
  `report_id` int(11) DEFAULT NULL,
  `report_title` varchar(255) DEFAULT NULL,
  `charges` longtext DEFAULT NULL,
  `date` varchar(255) DEFAULT NULL,
  `expire` varchar(255) DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `author` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- Veri çıktısı seçilmemişti

-- tablo yapısı dökülüyor es_vlast.mdw_evidences
CREATE TABLE IF NOT EXISTS `mdw_evidences` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `note` text DEFAULT NULL,
  `serial_number` varchar(50) DEFAULT NULL,
  `report_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=163 DEFAULT CHARSET=utf8mb3;

-- Veri çıktısı seçilmemişti

-- tablo yapısı dökülüyor es_vlast.mdw_images
CREATE TABLE IF NOT EXISTS `mdw_images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `citizenid` varchar(20) NOT NULL DEFAULT '0',
  `image_url` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `citizenid` (`citizenid`)
) ENGINE=InnoDB AUTO_INCREMENT=232 DEFAULT CHARSET=utf8mb3;

-- Veri çıktısı seçilmemişti

-- tablo yapısı dökülüyor es_vlast.mdw_reports
CREATE TABLE IF NOT EXISTS `mdw_reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` text NOT NULL,
  `description` text NOT NULL,
  `suspects` longtext NOT NULL CHECK (json_valid(`suspects`)),
  `polices` longtext NOT NULL CHECK (json_valid(`polices`)),
  `crimes` longtext NOT NULL CHECK (json_valid(`crimes`)),
  `photo_url` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=671 DEFAULT CHARSET=utf8mb3;

-- Veri çıktısı seçilmemişti

-- tablo yapısı dökülüyor es_vlast.mdw_wanteds
CREATE TABLE IF NOT EXISTS `mdw_wanteds` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `citizenid` varchar(25) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=224 DEFAULT CHARSET=utf8mb3;

-- Veri çıktısı seçilmemişti

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
