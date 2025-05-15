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
-- Table structure for table `supplier_order_details`
--

DROP TABLE IF EXISTS `supplier_order_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier_order_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `supplier_order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `supplier_order_id` (`supplier_order_id`),
  CONSTRAINT `supplier_order_details_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `supplier_order_details_ibfk_2` FOREIGN KEY (`supplier_order_id`) REFERENCES `supplier_orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supplier_order_details`
--

LOCK TABLES `supplier_order_details` WRITE;
/*!40000 ALTER TABLE `supplier_order_details` DISABLE KEYS */;
INSERT INTO `supplier_order_details` VALUES (2,2,14,3,999.99,2999.97),(3,2,9,2,349.00,698.00),(4,3,9,18,349.00,6282.00),(5,4,14,3,299.99,899.97),(6,4,23,2,49.99,99.98),(7,5,16,3,120.00,360.00),(8,6,14,3,999.99,2999.97),(9,6,9,2,349.00,698.00),(10,7,11,15,99.99,1499.85),(11,8,9,18,349.00,6282.00),(12,8,14,5,299.99,1499.95),(13,9,14,3,999.99,2999.97),(14,9,9,2,349.00,698.00),(15,10,11,3,99.99,299.97),(16,10,16,3,120.00,360.00),(17,11,11,4,99.99,399.96),(18,12,13,4,150.00,600.00),(19,13,9,12,349.00,4188.00),(20,14,10,15,1399.99,20999.85),(21,14,14,10,299.99,2999.90),(22,15,13,5,150.00,750.00),(23,15,21,3,1599.50,4798.50),(24,16,13,4,150.00,600.00),(25,16,21,4,1599.50,6398.00),(26,17,13,4,150.00,600.00),(27,18,13,3,150.00,450.00),(28,19,9,3,349.00,1047.00),(29,19,10,3,1399.99,4199.97),(30,20,9,3,349.00,1047.00),(31,21,11,4,99.99,399.96),(32,21,12,3,49.99,149.97),(33,22,14,3,299.99,899.97),(34,22,15,2,79.99,159.98);
/*!40000 ALTER TABLE `supplier_order_details` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-14 21:55:36
