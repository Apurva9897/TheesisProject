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
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(120) NOT NULL,
  `password_hash` varchar(200) NOT NULL,
  `role` varchar(20) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `is_approved` tinyint(1) DEFAULT '0',
  `approval_token` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `approval_token` (`approval_token`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Vivek Kulkarni','vivek@gmail.com','$2b$12$j034nz7OwvmOaceIEM5bD.Z8DThfSYz0082iio4qKWl6zz1EW6T4e','client','2025-03-30 14:14:52',0,NULL),(2,'apurva98','apurva98@example.com','$2b$12$Yw/2lvA9nVH7zdeW2ijKTuihFV0.FQFvh3nEJZI8knc.tApDpEOPi','admin','2025-03-30 19:41:02',0,NULL),(4,'admin_test','admin@example.com','$2b$12$HPuYOxMHJ2ih9tOrYRwXVOyHnnqG.tfuhz2m4r3ol27KZ667szE/C','admin','2025-03-30 20:10:22',0,NULL),(5,'Apurva','apu123@example.com','$2b$12$shMIUEklooZyFBP5rRODyuAC93PUZHl3PJQXz4K4fISN8KChf4nZa','client','2025-04-03 16:54:27',0,NULL),(6,'avk123','avk@example.com','$2b$12$qzqpYhPK70ZrXlKDwJCY/ud5pd47VZlWUTTPGoXP3rITSvwERF5py','client','2025-04-03 17:02:51',0,NULL),(7,'vicky','vicky@gmail.com','$2b$12$oFsYaidA3LDUZHTrCkKajuH4a/At1W2ewfyH5pI/efUlx97LYkrUG','client','2025-04-03 17:12:59',0,NULL),(13,'xyz','xyz@yahoo.com','$2b$12$9SowlCUR52Zn.smmx09mrevQveZGd5TMbIGW68Wdk8k.E.NgffgMC','client','2025-04-03 17:17:48',0,NULL),(14,'admin2','admin2@example.com','$2b$12$Kv9m7QU6.9EfqpU7OxCWIO4am/HO7dIoXMXMYzlt7IU78Ecis7Qsu','admin','2025-04-04 05:42:09',0,NULL),(15,'Danielle','danielle@staff.com','$2b$12$f2zSRmreOr6uM5XD94xH0O5Ltp3L.oFkgAJOL8AwN87Kf4kZy5cR6','staff','2025-04-04 05:43:46',0,NULL),(16,'emma','emma@example.com','$2b$12$FU4YsuEw8xDxWjJ2.1z9ZOWm7w0.Uf1BsudGXTlvGOjwe0tTkzfxa','admin','2025-04-04 05:58:30',0,NULL),(17,'paula','paula@gmail.com','$2b$12$34WajeheNCM1VOc2CofT0uHhpy.HUK05iFmMM7/5XF6Sl4qLPxN/O','client','2025-04-04 10:41:13',0,NULL),(18,'admin3','admin3@example.com','$2b$12$RCzEoUvvj/tqCiCExgUvyeG8505.60f2Bf1Wbr34ieuIPa5d.7rLO','admin','2025-04-07 12:52:58',0,NULL),(19,'pheobe','pheobe@example.com','$2b$12$o3i5g3IPrHnVwXAgzqsks.lpL0M/961PMufmi6hjuPH5G0yZl8NdO','admin','2025-04-13 15:39:29',0,NULL),(20,'Ross Geller','ross@gmail.com','$2b$12$JiwKrjHFVjcFRyB3ras4DeFJlK5YcOoQpdxPDq1uQjWECrdCiXr3G','client','2025-04-13 16:15:59',0,NULL),(21,'sunita williams','sunita91@gmail.com','$2b$12$4cbysTEHUiSmTcJglAKMeuNbaDyp2G3InHPZOLD5phuROHPzWNmji','client','2025-04-15 08:50:40',0,NULL),(22,'Anthony Conway','anthony65@gmail.com','$2b$12$snjHBLPaQlOKrK1L6VPiwepm0IMIzBJH9X.eywP0fAlwrzmqPDIfa','client','2025-04-15 09:02:51',0,NULL),(23,'Mr.Nob0dy','mrnob0dy@duck.com','$2b$12$RgT0Yl8fey9r3zzU2/UB1eQGIWtsgYZ8L5CY4nqTg00ZAbjy0vaWG','client','2025-04-16 15:14:30',0,NULL),(24,'priya subedar','priya97@gmail.com','$2b$12$eYVJSsq7SbL7aD/S9gpHC.2YFCjHwtZDEJ/ivUo3RdtoQ5PjJs.pu','client','2025-04-17 21:05:48',0,NULL),(25,'purva honrao','purva2003@gmail.com','$2b$12$54TH3ViXUnW4f1jwnTaSPuuSRMN3JbG0CXcTtizf1oboECMjwaRtO','client','2025-04-17 21:35:53',0,NULL),(26,'Apurva Kulkarni','apu98avk@gmail.com','$2b$12$TVtZW59Sr8s0WNZ.kYtJF.EUbWbx2VoF.M8MdA.LClu3nbystoyXG','client','2025-04-24 22:47:25',0,NULL),(37,'rhugved','rhugvedt@gmail.com','$2b$12$L2Vqn820NT3nr4QPfh/xQubcka4AxzfojrVGGVqD7QaqCloER963O','client','2025-05-09 18:34:23',1,NULL),(39,'Ross','rachel@gmail.com','$2b$12$xB1TdWhZJwlH1XEK07OP8Oi7eMGLYyLP3FD0tQk1Qr0WW16Cqk/Yy','client','2025-05-12 23:30:43',1,NULL),(40,'Ujwala Kulkarni','apu1098avk@gmail.com','$2b$12$bH7o.WlgYFL3mcz1TTSwMuYxAKI.sQCuXWXlrJjDks/uAhdYxFSD.','admin','2025-05-14 20:30:11',1,NULL);
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

-- Dump completed on 2025-05-14 21:55:38
