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
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `customer_email` varchar(100) NOT NULL,
  `order_date` datetime DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `custom_order_id` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `custom_order_id` (`custom_order_id`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,1,'vivek@gmail.com','2025-04-01 14:34:45','Delivered',0.00,NULL),(2,1,'vivek@gmail.com','2025-04-07 18:08:09','Delivered',1749.93,NULL),(3,6,'paula@gmail.com','2025-04-07 21:16:32','Delivered',1749.93,NULL),(4,1,'vivek@gmail.com','2025-04-07 22:10:43','Delivered',1499.98,NULL),(5,1,'vivek@gmail.com','2025-04-07 22:18:55','Delivered',1499.98,NULL),(6,1,'vivek@gmail.com','2025-04-07 22:20:07','Delivered',1499.98,NULL),(7,1,'vivek@gmail.com','2025-04-07 22:20:49','Delivered',1499.98,NULL),(8,1,'vivek@gmail.com','2025-04-07 22:21:48','Delivered',1499.98,NULL),(9,1,'vivek@gmail.com','2025-04-07 22:25:56','Delivered',1499.98,NULL),(10,1,'vivek@gmail.com','2025-04-07 22:26:34','Delivered',1499.98,NULL),(11,1,'vivek@gmail.com','2025-04-07 22:33:43','Delivered',1499.98,NULL),(12,1,'vivek@gmail.com','2025-04-07 22:34:29','Delivered',1499.98,NULL),(13,1,'vivek@gmail.com','2025-04-07 22:35:28','Delivered',1499.98,NULL),(14,1,'vivek@gmail.com','2025-04-07 22:41:43','Delivered',1499.98,NULL),(15,1,'vivek@gmail.com','2025-04-07 22:44:23','Delivered',1499.98,NULL),(16,1,'vivek@gmail.com','2025-04-07 22:48:57','Delivered',2279.94,NULL),(17,1,'vivek@gmail.com','2025-04-07 22:55:13','Delivered',79.99,NULL),(18,1,'vivek@gmail.com','2025-04-07 23:31:56','Delivered',1499.98,NULL),(19,1,'vivek@gmail.com','2025-04-07 23:31:56','Delivered',79.99,NULL),(20,1,'vivek@gmail.com','2025-04-07 23:49:31','Delivered',1499.98,NULL),(21,1,'vivek@gmail.com','2025-04-07 23:53:10','Delivered',1499.98,NULL),(22,1,'vivek@gmail.com','2025-04-08 11:31:52','Delivered',79.99,NULL),(23,1,'vivek@gmail.com','2025-04-09 20:54:33','Delivered',1748.99,NULL),(24,1,'vivek@gmail.com','2025-04-09 21:01:58','Delivered',1748.99,NULL),(25,7,'ross@gmail.com','2025-04-13 16:17:10','Delivered',16338.93,NULL),(26,7,'ross@gmail.com','2025-04-13 16:23:21','Delivered',16338.93,NULL),(27,1,'vivek@gmail.com','2025-04-15 08:48:29','Delivered',2097.99,NULL),(28,1,'vivek@gmail.com','2025-04-15 08:49:07','Delivered',2097.99,NULL),(29,8,'sunita91@gmail.com','2025-04-15 08:51:27','Delivered',479.97,NULL),(30,1,'vivek@gmail.com','2025-04-15 08:58:34','Delivered',3778.50,NULL),(31,9,'anthony65@gmail.com','2025-04-15 09:04:29','Delivered',249.98,NULL),(32,10,'mrnob0dy@duck.com','2025-04-16 15:17:00','Delivered',698.00,NULL),(33,10,'mrnob0dy@duck.com','2025-04-16 15:18:13','Delivered',1399.99,NULL),(34,1,'vivek@gmail.com','2025-04-24 12:18:49','Delivered',6646.96,NULL),(35,1,'vivek@gmail.com','2025-04-24 12:21:52','Delivered',1848.98,NULL),(36,1,'vivek@gmail.com','2025-04-24 17:30:22','Delivered',4096.00,NULL),(37,13,'apu98avk@gmail.com','2025-04-24 22:56:11','Delivered',3497.98,NULL),(38,13,'apu98avk@gmail.com','2025-04-25 00:46:22','Delivered',3499.00,NULL),(39,1,'vivek@gmail.com','2025-04-28 13:22:01','Delivered',3497.98,'ORD39'),(40,1,'vivek@gmail.com','2025-04-28 15:40:00','Delivered',1047.00,'ORD40'),(41,6,'paula@gmail.com','2025-04-28 15:44:05','Delivered',1749.93,'ORD41'),(42,1,'vivek@gmail.com','2025-04-28 15:51:24','Delivered',1047.00,'ORD42'),(43,1,'vivek@gmail.com','2025-04-30 15:47:48','Delivered',3398.00,'ORD43'),(44,1,'vivek@gmail.com','2025-04-30 15:57:27','Delivered',3398.00,'ORD44'),(45,1,'vivek@gmail.com','2025-04-30 16:50:31','Delivered',899.98,'ORD45'),(46,1,'vivek@gmail.com','2025-04-30 16:58:28','Delivered',3398.00,'ORD46'),(47,1,'vivek@gmail.com','2025-04-30 16:59:21','Delivered',6837.00,'ORD47'),(48,1,'vivek@gmail.com','2025-05-07 22:58:18','Delivered',3099.95,'ORD48'),(49,1,'vivek@gmail.com','2025-05-07 23:04:32','Delivered',4199.97,'ORD49'),(50,2,'apu123@example.com','2025-05-08 10:39:29','Delivered',4199.97,'ORD50'),(51,15,'rhugvedt@gmail.com','2025-05-09 18:36:05','Delivered',3697.97,'ORD51'),(52,15,'rhugvedt@gmail.com','2025-05-09 18:36:15','Delivered',3697.97,'ORD52'),(53,1,'vivek@gmail.com','2025-05-10 23:32:00','Delivered',3199.00,'ORD53'),(54,6,'paula@gmail.com','2025-05-11 20:30:46','Packaging',1749.93,'ORD54'),(55,1,'vivek@gmail.com','2025-05-11 22:15:46','Packaging',3798.98,'ORD55'),(56,1,'vivek@gmail.com','2025-05-11 23:13:30','Packaging',2339.47,'ORD56'),(57,13,'apu98avk@gmail.com','2025-05-13 16:21:47','Pending',339.98,'ORD57'),(58,13,'apu98avk@gmail.com','2025-05-13 17:18:44','Pending',299.96,'ORD58'),(59,13,'apu98avk@gmail.com','2025-05-13 17:29:31','Pending',299.96,'ORD59');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
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
