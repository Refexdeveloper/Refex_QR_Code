-- MySQL dump 10.13  Distrib 8.0.41, for Linux (x86_64)
--
-- Host: localhost    Database: qrcode_3i_medtech_production
-- ------------------------------------------------------
-- Server version	8.0.41-0ubuntu0.22.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `brochure_distribution_list`
--

DROP TABLE IF EXISTS `brochure_distribution_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `brochure_distribution_list` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  `contact_number` varchar(15) DEFAULT NULL,
  `institution_name` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `brochure_distribution_list`
--

LOCK TABLES `brochure_distribution_list` WRITE;
/*!40000 ALTER TABLE `brochure_distribution_list` DISABLE KEYS */;
INSERT INTO `brochure_distribution_list` VALUES (1,'Test-Murugesh','kumarmurugesh14032001@gmail.com','+917305880787','Test','2024-05-08 12:18:37'),(2,'Murugesh-Test','murugesh.k@refex.co.in','+917305880787','Test','2024-05-09 05:35:06'),(3,'Manikandan S','maniinamsaravanan@gmail.com','8015244283','3i medtech Pvt Ltd ','2024-05-10 05:04:48'),(4,'K S Suresh','suresh.ks@3imedtech.com','9444026307','3i','2024-05-11 04:18:08'),(5,'K S Suresh','suresh.ks@3imedtech.com','9444026307','3i','2024-05-11 04:18:54'),(6,'NANTHA S KUMAR','nanthananthuzz2003@gmail.com','08281576732','Dr. Jeyasekharan Medical Trust, Nagercoil, Tamilnadu ','2024-05-11 04:40:10'),(7,'Anand','anand.k@3imedtech.com','7994976122','3i medtech','2024-05-11 04:56:57'),(8,'Ravi Dev PM','devravi463@gmail.com','7904745349','SRMiST','2024-05-11 09:02:17'),(9,'K.veerasivakumar','veerasivakumar05@gmail.com','7418950983','S.R.M IST ','2024-05-11 09:02:22'),(10,'Kalai Selvi','nkskalaiselvi2000@gmail.com','09677970547','Sctimst','2024-05-11 09:19:43'),(11,'Ampily R','ampilydamit@gmail.com','9995790577','DH kollam','2024-05-11 09:19:46'),(12,'Ampily','ampilydamit@gmail.com','9995790577','Dh kollam','2024-05-11 09:20:04'),(13,'Kalai Selvi','nkskalaiselvi2000@gmail.com','09677970547','SCTIMST','2024-05-11 09:20:31'),(14,'Ampily','ampilyelora@gmail.com','9995790577','DHkollam','2024-05-11 09:21:03'),(15,'Sr joisy','joisyhenry@gmail.com','9188156178','Holycross hospital kottiyam','2024-05-11 12:21:05'),(16,'H Joisy Rabakal','joisyhenry@gmail.com','9188156178','Holy cross hospital','2024-05-11 12:23:31'),(17,'Sofia','sofiashanbagamoorthi15@gmail.com','8940389401','Mother Teresa post graduate research institute of health and science ','2024-05-12 04:33:08'),(18,'Poornasri','poornasrisri76@gmail.com','9344549241','MTPG&RIHS','2024-05-12 04:33:40'),(19,'Sofia','sofiashanbagamoorthi15@gmail.com','8940389401','Mother Teresa post graduate research institute of health and science ','2024-05-12 04:34:06'),(20,'V. Logeshvari','vlogeshvari22@gmail.com','8680823636','MTPG&RIHS','2024-05-12 04:34:12'),(21,'Priyanga','priyangamaya23@gmail.com','9940652357','MTPG&RIHS','2024-05-12 04:35:06'),(22,'Sivasankari','sivasankari19292003@gmail.com','9150409344','Mother Theresa post graduate and research institute ','2024-05-12 04:35:37'),(23,'Jayapandian','jp12345@gmail.com','9790715729','Jain centre chennai','2024-05-12 05:44:08'),(24,'Sivakumar','sivakumar.d@3imedtech.com','9043815869','3i medtech','2024-05-12 05:44:54'),(25,'Monisha V','monishavasudevan003@gmail.com','08778442365','Maher','2024-05-12 07:36:07'),(26,'Rahul Desiganad scans','rahulkraju30@gmail.com','9745324106','Desiganad Scans ','2024-05-12 11:03:27'),(27,'Sharmilee','sharmirs2619@gmail.com','','3i','2024-06-28 09:48:52'),(28,'Gowtham S','gowtham.s@refex.co.in','9551933890','SRM','2024-07-10 07:23:35'),(29,'Sharmi','sharmilee.s@3imedtech.com','','3i','2024-08-06 05:36:09'),(30,'Sharmi Priscilla','sharmilee.s@3imedtech.com','','3i','2024-08-06 06:15:33');
/*!40000 ALTER TABLE `brochure_distribution_list` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `brochure_download_list`
--

DROP TABLE IF EXISTS `brochure_download_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `brochure_download_list` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `designation` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  `phone` varchar(10) DEFAULT NULL,
  `company` varchar(255) DEFAULT NULL,
  `downloaded_file` enum('All Product Brochure','Anamaya Brochure','Mini 90 Brochure','Drive Link') NOT NULL DEFAULT 'All Product Brochure',
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `brochure_download_list`
--

LOCK TABLES `brochure_download_list` WRITE;
/*!40000 ALTER TABLE `brochure_download_list` DISABLE KEYS */;
INSERT INTO `brochure_download_list` VALUES (1,'Murugesh Kumar V','Trainee','murugesh.k@refex.co.in','7305880787','Refex Industries Ltd','All Product Brochure','2025-01-21 13:17:02'),(2,'Murugesh Kumar V','Trainee','murugesh.k@refex.co.in','7305880787','Refex Industries Ltd','Anamaya Brochure','2025-01-21 13:17:50'),(3,'Murugesh Kumar V','Trainee','murugesh.k@refex.co.in','7305880787','Refex Industries Ltd','Mini 90 Brochure','2025-01-21 13:18:24'),(4,'Gowtham S','IT','gowtham2011995@gmail.com','9551933890','Ril','Mini 90 Brochure','2025-01-21 13:31:11'),(5,'Gowtham S','IT','gowtham2011995@gmail.com','9551933890','Ril','Mini 90 Brochure','2025-01-21 13:34:15'),(6,'Murugesh Kumar V','Test','mk@gmail.com','7305880787','Refex Industries Ltd','Mini 90 Brochure','2025-01-21 13:40:07'),(7,'Gowtham','it','gowtham.s@refex.co.in','9551933890','Ril','All Product Brochure','2025-01-21 13:42:13'),(8,'Arjun','Hi','gowtham.s@refex.co.in','9551933890','Ril','All Product Brochure','2025-01-21 13:47:05'),(9,'Jasmine ','IT','jasmine.a@refex.co.in','9962995365','ril','Mini 90 Brochure','2025-01-22 04:39:39'),(10,'Murugesh Kumar V','Test','murugesh.k@refex.co.in','7305880787','Refex Industries Ltd','Mini 90 Brochure','2025-01-22 05:21:10'),(11,'Gowtham S','It','gowtham2011995@gmail.com','9551933890','RIL','Anamaya Brochure','2025-01-22 05:22:23'),(12,'Murugesh Kumar V','Test','mk@gmail.com','7305880787','Refex Industries Ltd','Anamaya Brochure','2025-01-22 05:24:09'),(13,'Rahul Je','IT','gowtham.s@refex.co.in','9551933890','RIL','Anamaya Brochure','2025-01-22 05:24:10'),(14,'Dickson g','It','dickson.g@refex.co.in','9551933890','Ril','Anamaya Brochure','2025-01-22 05:25:10'),(15,'Mugesh M','IT','admin@refex.co.in','9962997343','Sherisha Technologies Pvt Ltd','Mini 90 Brochure','2025-01-22 05:29:35'),(16,'Murugesh Kumar V','IT-SD','murugesh.k@refex.co.in','7305880787','Refex Industries Ltd','Drive Link','2025-01-22 07:38:24'),(17,'Murugesh Kumar V','sdfsd','murugesh.k@refex.co.in','7305880787','Refex Industries Ltd','Drive Link','2025-01-22 07:43:42'),(18,'Gowtham S','IT','gowtham2011995@gmail.com','9551933890','RIL','Drive Link','2025-01-22 08:49:56'),(19,'Mugesh M','IT','admin@refex.co.in','9962997343','Sherisha Technologies Pvt Ltd','Mini 90 Brochure','2025-01-22 10:51:35'),(20,'Mugesh M','IT ','admin@refex.co.in','9962997343','Sherisha Technologies Pvt Ltd','All Product Brochure','2025-01-22 10:54:57'),(21,'Ganesh P','VP','ganesh.p@3imedtech.com','9940498298','3i','Anamaya Brochure','2025-01-22 11:02:27'),(22,'AMIT DIVEKAR','Radiologist','Adivekar2177@gmail.com','7666263821','Pune ','Drive Link','2025-01-22 11:24:48'),(23,'Bala M','Cura','msbala05@gmail.com','9176567333','CURA Healthcare','Drive Link','2025-01-22 11:25:44'),(24,'Anand K','Service engineer','anand.k@3imedtech.com','7994976122','3i medtech ','Drive Link','2025-01-22 11:26:22'),(25,'Anand K','Service engineer ','anand.k@3imedtech.com','7994976122','3i medtech','Anamaya Brochure','2025-01-22 11:28:54'),(26,'ANTO RAMESH DELVI DASS','Chairman and Managing Director ','anto@radblox.io','9916509090','RADBLOX HEALTHCARE SERVICES PVT LTD','Anamaya Brochure','2025-01-25 03:56:25'),(27,'Bireshwar Mukherjee ','COO','bobcool1974@gmail.com','9755549222','2nd opinion service ','All Product Brochure','2025-01-25 10:03:04'),(28,'Sudheer Kalyankar','Radiologist ','drsudheerk@gmail.com','9480050000','SonoScan','Anamaya Brochure','2025-01-26 04:55:40'),(29,'T Rajesh ','Fos ','rajesh.raji8454@gamil.com','6374759931','Denave india pvt ltd ','All Product Brochure','2025-01-26 06:03:02'),(30,'Veereswaran ','Technical Trainer','veeres4u@gmail.com','9600799235','Canon','Mini 90 Brochure','2025-01-26 06:05:02'),(31,'R.Barath kumar','Fos','barath0407@gmail.com','9566110124','Canon','Drive Link','2025-01-26 06:07:08'),(32,'Manikandan ','Radiology ','Rtk.manikandan@gmail.com','9047872657','KMH','Anamaya Brochure','2025-01-27 06:54:06');
/*!40000 ALTER TABLE `brochure_download_list` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `login_histories`
--

DROP TABLE IF EXISTS `login_histories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `login_histories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `user_name` varchar(50) DEFAULT NULL,
  `status` enum('Logged-In','Logged-Out') NOT NULL,
  `login_time` datetime NOT NULL,
  `logout_time` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `login_histories_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login_histories`
--

LOCK TABLES `login_histories` WRITE;
/*!40000 ALTER TABLE `login_histories` DISABLE KEYS */;
/*!40000 ALTER TABLE `login_histories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `user_name` varchar(50) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `photo` mediumblob,
  `role` varchar(10) DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
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

-- Dump completed on 2025-02-20  9:33:02
