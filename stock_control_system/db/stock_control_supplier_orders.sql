-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: stock_control
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `supplier_orders`
--

DROP TABLE IF EXISTS `supplier_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier_orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `supplier_id` int NOT NULL,
  `admin_id` int NOT NULL,
  `order_date` datetime DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `admin_id` (`admin_id`),
  KEY `supplier_id` (`supplier_id`),
  CONSTRAINT `supplier_orders_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE,
  CONSTRAINT `supplier_orders_ibfk_2` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supplier_orders`
--

LOCK TABLES `supplier_orders` WRITE;
/*!40000 ALTER TABLE `supplier_orders` DISABLE KEYS */;
INSERT INTO `supplier_orders` VALUES (2,1,1,'2025-04-21 00:01:33','Pending',3697.97),(3,2,1,'2025-04-21 00:09:50','Pending',6282.00),(4,2,1,'2025-04-21 22:12:03','Pending',999.95),(5,3,1,'2025-04-21 22:13:14','Pending',360.00),(6,1,1,'2025-04-21 22:53:22','Pending',3697.97),(7,3,1,'2025-04-21 22:54:14','Pending',1499.85),(8,2,1,'2025-04-21 23:35:49','Pending',7781.95),(9,1,1,'2025-04-21 23:37:30','Pending',3697.97),(10,3,1,'2025-04-21 23:43:17','Pending',659.97),(11,3,1,'2025-04-22 01:03:55','Pending',399.96),(12,1,1,'2025-04-22 01:04:12','Pending',600.00),(13,2,1,'2025-04-28 14:29:56','Pending',4188.00),(14,2,1,'2025-05-09 19:44:29','Pending',23999.75),(15,1,1,'2025-05-10 23:27:47','Pending',5548.50),(16,1,1,'2025-05-10 23:28:15','Pending',6998.00),(17,1,1,'2025-05-10 23:33:15','Pending',600.00),(18,1,1,'2025-05-10 23:33:36','Pending',450.00),(19,2,1,'2025-05-10 23:48:13','Pending',5246.97),(20,2,1,'2025-05-10 23:50:21','Pending',1047.00),(21,3,1,'2025-05-10 23:52:14','Pending',549.93),(22,2,1,'2025-05-10 23:54:35','Pending',1059.95);
/*!40000 ALTER TABLE `supplier_orders` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-14 21:55:37
