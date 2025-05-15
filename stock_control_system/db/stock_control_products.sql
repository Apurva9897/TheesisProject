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
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `category` varchar(255) DEFAULT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `stock` int NOT NULL,
  `supplier_id` int NOT NULL,
  `sold_quantity` int NOT NULL DEFAULT '0',
  `zone` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `supplier_id` (`supplier_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (9,'Sony WH-1000XM5','Small Equipments','Noise-cancelling headphones',349.00,20,2,34,'Zone A'),(10,'Dell XPS 15','Expensive Products','High-performance laptop for professionals',1399.99,20,2,44,'Zone B'),(11,'Logitech MX Master 3','Small Equipments','Advanced wireless mouse',99.99,20,3,41,'Zone A'),(12,'Amazon Echo Dot','Small Equipments','Smart speaker with Alexa',49.99,25,3,2,'Zone A'),(13,'Motherboard','Big Products','High-performance motherboard for PCs',150.00,20,1,17,'Zone C'),(14,'CPU','Big Products','Latest generation multi-core processor',299.99,22,2,17,'Zone C'),(15,'RAM','Small Equipments','16GB DDR4 Memory Module',79.99,20,2,11,'Zone A'),(16,'SSD','Special Conditions','1TB Solid State Drive',120.00,21,3,16,'Zone D'),(21,'MacBook M4 Pro','Expensive Products','Apple M4 chip with 10-core CPU',1599.50,22,1,10,'Zone B'),(22,'Mac Studio Display','Expensive Products','Immersive 27-inch 5K Retina display with 600 nits of brightness',1699.00,20,1,27,'Zone B'),(23,'Ethernet Cable','Special Conditions','Ethernet Cable 5m High Speed Network Cable 1000Mbps',49.99,19,2,14,'Zone D'),(24,'Dell Battery','Special Conditions','Dell Battery 42Wh 3 cells 3500mAh 11.4V Vostro Latitude',99.99,19,3,6,'Zone D');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-14 21:55:38
