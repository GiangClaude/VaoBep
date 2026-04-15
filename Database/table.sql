-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: localhost    Database: vaobep
-- ------------------------------------------------------
-- Server version	8.3.0

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
-- Table structure for table `article_posts`
--

DROP TABLE IF EXISTS `article_posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `article_posts` (
  `article_id` varchar(255) NOT NULL DEFAULT (uuid()),
  `user_id` varchar(255) NOT NULL COMMENT 'Author must have "pro" role',
  `title` varchar(255) NOT NULL,
  `cover_image` varchar(255) DEFAULT NULL,
  `description` text,
  `content` longtext,
  `status` enum('public','draft','hidden','banned') NOT NULL DEFAULT 'draft',
  `created_at` timestamp NULL DEFAULT (now()),
  `update_at` timestamp NULL DEFAULT (now()),
  `comment_count` int NOT NULL DEFAULT '0',
  `report_count` int NOT NULL DEFAULT '0',
  `read_time` int NOT NULL DEFAULT '1',
  `like_count` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`article_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `article_posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `badges`
--

DROP TABLE IF EXISTS `badges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `badges` (
  `badge_id` varchar(255) NOT NULL DEFAULT (uuid()),
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `icon_url` varchar(255) NOT NULL,
  PRIMARY KEY (`badge_id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `caloforcookingway`
--

DROP TABLE IF EXISTS `caloforcookingway`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `caloforcookingway` (
  `cooking_way_id` varchar(255) NOT NULL DEFAULT (uuid()),
  `name` varchar(100) NOT NULL,
  `calo_multiplier` float NOT NULL DEFAULT '1',
  PRIMARY KEY (`cooking_way_id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `caloforingredients`
--

DROP TABLE IF EXISTS `caloforingredients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `caloforingredients` (
  `ingredient_id` varchar(255) NOT NULL,
  `calo_per_100g` float NOT NULL,
  PRIMARY KEY (`ingredient_id`),
  CONSTRAINT `caloforingredients_ibfk_1` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`ingredient_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `challenges`
--

DROP TABLE IF EXISTS `challenges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `challenges` (
  `challenge_id` varchar(255) NOT NULL DEFAULT (uuid()),
  `title` varchar(255) NOT NULL,
  `description` text,
  `start_date` timestamp NOT NULL,
  `end_date` timestamp NOT NULL,
  `status` enum('upcoming','active','ended') NOT NULL DEFAULT 'upcoming',
  PRIMARY KEY (`challenge_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `comment_id` varchar(255) NOT NULL DEFAULT (uuid()),
  `user_id` varchar(255) NOT NULL,
  `post_id` varchar(255) NOT NULL COMMENT 'FK to Recipes, Article_Posts, or Dictionary_Dishes',
  `post_type` enum('recipe','article','dish') NOT NULL,
  `content` text NOT NULL,
  `media_url` text,
  `media_type` enum('text','image','video') DEFAULT 'text',
  `created_at` timestamp NULL DEFAULT (now()),
  `update_at` timestamp NULL DEFAULT (now()),
  `parent_id` varchar(255) DEFAULT NULL,
  `reply_count` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`comment_id`),
  KEY `fk_comment_parent` (`parent_id`),
  CONSTRAINT `fk_comment_parent` FOREIGN KEY (`parent_id`) REFERENCES `comments` (`comment_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `countries_coordinates`
--

DROP TABLE IF EXISTS `countries_coordinates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `countries_coordinates` (
  `country_name` varchar(255) NOT NULL,
  `lat` double NOT NULL,
  `lng` double NOT NULL,
  PRIMARY KEY (`country_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dictionary_dishes`
--

DROP TABLE IF EXISTS `dictionary_dishes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dictionary_dishes` (
  `dish_id` varchar(255) NOT NULL DEFAULT (uuid()),
  `history` text,
  `admin_id` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT (now()),
  `update_at` timestamp NULL DEFAULT (now()),
  `comment_count` int NOT NULL DEFAULT '0',
  `report_count` int NOT NULL DEFAULT '0',
  `country` varchar(255) DEFAULT NULL,
  `where_to_eat` varchar(255) DEFAULT NULL,
  `image_url` text,
  `description` text,
  `point` float DEFAULT '0',
  `original_name` varchar(255) DEFAULT NULL,
  `english_name` varchar(255) DEFAULT NULL,
  `like_count` int DEFAULT '0',
  `eatery_count` int DEFAULT '0',
  `recipe_link_count` int DEFAULT '0',
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  PRIMARY KEY (`dish_id`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `dictionary_dishes_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dish_eateries`
--

DROP TABLE IF EXISTS `dish_eateries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dish_eateries` (
  `eatery_id` varchar(255) NOT NULL,
  `dish_id` varchar(255) NOT NULL,
  `user_id` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `address` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`eatery_id`),
  KEY `dish_id` (`dish_id`),
  CONSTRAINT `dish_eateries_ibfk_1` FOREIGN KEY (`dish_id`) REFERENCES `dictionary_dishes` (`dish_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `follows`
--

DROP TABLE IF EXISTS `follows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `follows` (
  `follower_id` varchar(255) NOT NULL,
  `following_id` varchar(255) NOT NULL,
  PRIMARY KEY (`follower_id`,`following_id`),
  KEY `following_id` (`following_id`),
  CONSTRAINT `follows_ibfk_1` FOREIGN KEY (`follower_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `follows_ibfk_2` FOREIGN KEY (`following_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `follows_ibfk_3` FOREIGN KEY (`follower_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ingredients`
--

DROP TABLE IF EXISTS `ingredients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ingredients` (
  `ingredient_id` varchar(255) NOT NULL DEFAULT (uuid()),
  `name` varchar(255) NOT NULL,
  `status` enum('pending','approved','reject') NOT NULL DEFAULT 'pending',
  PRIMARY KEY (`ingredient_id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `likes`
--

DROP TABLE IF EXISTS `likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `likes` (
  `user_id` varchar(255) NOT NULL,
  `post_id` varchar(255) NOT NULL COMMENT 'FK to Recipes, Article_Posts, or Dictionary_Dishes',
  `post_type` enum('recipe','article','dish') NOT NULL,
  `created_at` timestamp NULL DEFAULT (now()),
  PRIMARY KEY (`user_id`,`post_id`,`post_type`),
  CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `menu_recipes`
--

DROP TABLE IF EXISTS `menu_recipes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_recipes` (
  `menu_id` varchar(255) NOT NULL,
  `recipe_id` varchar(255) NOT NULL,
  PRIMARY KEY (`menu_id`,`recipe_id`),
  KEY `recipe_id` (`recipe_id`),
  CONSTRAINT `menu_recipes_ibfk_1` FOREIGN KEY (`menu_id`) REFERENCES `menus` (`menu_id`),
  CONSTRAINT `menu_recipes_ibfk_2` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`recipe_id`),
  CONSTRAINT `menu_recipes_ibfk_3` FOREIGN KEY (`menu_id`) REFERENCES `menus` (`menu_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `menus`
--

DROP TABLE IF EXISTS `menus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menus` (
  `menu_id` varchar(255) NOT NULL DEFAULT (uuid()),
  `user_id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT (now()),
  PRIMARY KEY (`menu_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `menus_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `menus_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `token` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL,
  PRIMARY KEY (`token`),
  KEY `email` (`email`),
  CONSTRAINT `password_reset_tokens_ibfk_1` FOREIGN KEY (`email`) REFERENCES `users` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `point_history`
--

DROP TABLE IF EXISTS `point_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `point_history` (
  `history_id` varchar(255) NOT NULL DEFAULT (uuid()),
  `user_id` varchar(255) NOT NULL,
  `amount` int NOT NULL COMMENT 'Can be positive or negative',
  `description` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT (now()),
  PRIMARY KEY (`history_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `point_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `point_transactions`
--

DROP TABLE IF EXISTS `point_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `point_transactions` (
  `transaction_id` varchar(255) NOT NULL DEFAULT (uuid()),
  `user_id` varchar(255) NOT NULL COMMENT 'Người thực hiện hành động hoặc người bị trừ/cộng điểm',
  `type` enum('checkin','gift_sent','gift_received','redeem') NOT NULL,
  `amount` int NOT NULL COMMENT 'Số điểm thay đổi (+ hoặc -)',
  `related_user_id` varchar(255) DEFAULT NULL COMMENT 'Người nhận/gửi trong trường hợp tặng điểm',
  `message` text COMMENT 'Lời nhắn giao dịch',
  `created_at` timestamp NULL DEFAULT (now()),
  PRIMARY KEY (`transaction_id`),
  KEY `related_user_id` (`related_user_id`),
  KEY `idx_user_trans` (`user_id`,`created_at`),
  CONSTRAINT `point_transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `point_transactions_ibfk_2` FOREIGN KEY (`related_user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ratings`
--

DROP TABLE IF EXISTS `ratings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ratings` (
  `user_id` varchar(255) NOT NULL,
  `post_id` varchar(255) NOT NULL COMMENT 'FK to Recipes, Article_Posts, or Dictionary_Dishes',
  `post_type` enum('recipe','article','dish') NOT NULL,
  `score` int NOT NULL COMMENT 'Score from 1 to 5',
  PRIMARY KEY (`user_id`,`post_id`),
  CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `recipe_images`
--

DROP TABLE IF EXISTS `recipe_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipe_images` (
  `img_id` varchar(255) NOT NULL,
  `recipe_id` varchar(255) DEFAULT NULL,
  `imgLink` text,
  `description` text,
  `create_at` timestamp NULL DEFAULT (now()),
  PRIMARY KEY (`img_id`),
  KEY `fk_recipe_image` (`recipe_id`),
  CONSTRAINT `fk_recipe_image` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`recipe_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `recipe_ingredients`
--

DROP TABLE IF EXISTS `recipe_ingredients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipe_ingredients` (
  `recipe_id` varchar(255) NOT NULL,
  `ingredient_id` varchar(255) NOT NULL,
  `quantity` float NOT NULL,
  `unit_id` varchar(255) NOT NULL,
  PRIMARY KEY (`recipe_id`,`ingredient_id`),
  KEY `ingredient_id` (`ingredient_id`),
  KEY `unit_id` (`unit_id`),
  CONSTRAINT `fk_recipe_ingredients_recipe` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`recipe_id`) ON DELETE CASCADE,
  CONSTRAINT `recipe_ingredients_ibfk_2` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`ingredient_id`),
  CONSTRAINT `recipe_ingredients_ibfk_3` FOREIGN KEY (`unit_id`) REFERENCES `units` (`unit_id`),
  CONSTRAINT `recipe_ingredients_ibfk_4` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`recipe_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `recipe_link_votes`
--

DROP TABLE IF EXISTS `recipe_link_votes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipe_link_votes` (
  `user_id` varchar(255) NOT NULL,
  `recipe_id` varchar(255) NOT NULL,
  `post_id` varchar(255) NOT NULL,
  PRIMARY KEY (`user_id`,`recipe_id`,`post_id`),
  CONSTRAINT `recipe_link_votes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `recipe_post_links`
--

DROP TABLE IF EXISTS `recipe_post_links`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipe_post_links` (
  `source_recipe_id` varchar(255) NOT NULL,
  `linked_post_id` varchar(255) NOT NULL,
  `linked_post_type` enum('recipe','article','dish') NOT NULL,
  `vote_count` int DEFAULT '1',
  PRIMARY KEY (`source_recipe_id`,`linked_post_id`,`linked_post_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `recipes`
--

DROP TABLE IF EXISTS `recipes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipes` (
  `recipe_id` varchar(255) NOT NULL DEFAULT (uuid()),
  `user_id` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `cover_image` varchar(255) DEFAULT NULL,
  `instructions` text NOT NULL,
  `total_calo` float DEFAULT NULL,
  `status` enum('public','draft','hidden','banned') NOT NULL DEFAULT 'draft',
  `is_trusted` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT (now()),
  `update_at` timestamp NULL DEFAULT (now()),
  `like_count` int NOT NULL DEFAULT '0',
  `comment_count` int NOT NULL DEFAULT '0',
  `report_count` int NOT NULL DEFAULT '0',
  `rating_sum_score` int NOT NULL DEFAULT '0',
  `rating_count` int NOT NULL DEFAULT '0',
  `rating_avg_score` float NOT NULL DEFAULT '0',
  `servings` int DEFAULT '1',
  `cook_time` int DEFAULT '60',
  PRIMARY KEY (`recipe_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `recipes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `recipes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reports` (
  `report_id` varchar(255) NOT NULL DEFAULT (uuid()),
  `reporter_user_id` varchar(255) NOT NULL,
  `post_id` varchar(255) NOT NULL COMMENT 'FK to various content tables or Users',
  `post_type` enum('recipe','article','dish') NOT NULL,
  `reason` text NOT NULL,
  `status` enum('pending','resolved') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT (now()),
  PRIMARY KEY (`report_id`),
  KEY `reporter_user_id` (`reporter_user_id`),
  KEY `post_id` (`post_id`),
  CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`reporter_user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `reports_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `recipes` (`recipe_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rewards`
--

DROP TABLE IF EXISTS `rewards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rewards` (
  `reward_id` varchar(255) NOT NULL,
  `challenge_id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `type` enum('points','badge','promotion') NOT NULL,
  `value` varchar(255) DEFAULT NULL COMMENT 'e.g., "1000" for points, badge_id for a badge',
  PRIMARY KEY (`reward_id`,`challenge_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `saved_posts`
--

DROP TABLE IF EXISTS `saved_posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `saved_posts` (
  `user_id` varchar(255) NOT NULL,
  `post_id` varchar(255) NOT NULL,
  `post_type` enum('recipe','article','dish') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`post_id`,`post_type`),
  CONSTRAINT `saved_posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tag_post`
--

DROP TABLE IF EXISTS `tag_post`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tag_post` (
  `tag_id` varchar(255) NOT NULL,
  `post_id` varchar(255) NOT NULL,
  `post_type` varchar(20) NOT NULL,
  PRIMARY KEY (`tag_id`,`post_id`,`post_type`),
  CONSTRAINT `fk_tag_post_tag` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tags` (
  `tag_id` varchar(255) NOT NULL DEFAULT (uuid()),
  `name` varchar(100) NOT NULL,
  `tag_type` varchar(50) DEFAULT 'other' COMMENT 'Phân loại tag: cuisine, meal, ingredient, method, diet, taste, occasion, beverage, appliance',
  PRIMARY KEY (`tag_id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `transaction_id` varchar(255) NOT NULL DEFAULT (uuid()),
  `user_id` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'VND',
  `status` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT (now()),
  PRIMARY KEY (`transaction_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `units`
--

DROP TABLE IF EXISTS `units`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `units` (
  `unit_id` varchar(255) NOT NULL DEFAULT (uuid()),
  `name` varchar(50) NOT NULL,
  `grams_per_unit` float DEFAULT '1',
  PRIMARY KEY (`unit_id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_badges`
--

DROP TABLE IF EXISTS `user_badges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_badges` (
  `user_id` varchar(255) NOT NULL,
  `badge_id` varchar(255) NOT NULL,
  `earned_at` timestamp NULL DEFAULT (now()),
  PRIMARY KEY (`user_id`,`badge_id`),
  KEY `badge_id` (`badge_id`),
  CONSTRAINT `user_badges_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `user_badges_ibfk_2` FOREIGN KEY (`badge_id`) REFERENCES `badges` (`badge_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_challenges`
--

DROP TABLE IF EXISTS `user_challenges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_challenges` (
  `user_id` varchar(255) NOT NULL,
  `challenge_id` varchar(255) NOT NULL,
  `recipe_submission_id` varchar(255) NOT NULL,
  `submission_time` timestamp NULL DEFAULT (now()),
  PRIMARY KEY (`user_id`,`challenge_id`),
  UNIQUE KEY `recipe_submission_id` (`recipe_submission_id`),
  KEY `challenge_id` (`challenge_id`),
  CONSTRAINT `user_challenges_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `user_challenges_ibfk_2` FOREIGN KEY (`challenge_id`) REFERENCES `challenges` (`challenge_id`),
  CONSTRAINT `user_challenges_ibfk_3` FOREIGN KEY (`recipe_submission_id`) REFERENCES `recipes` (`recipe_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_rewards`
--

DROP TABLE IF EXISTS `user_rewards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_rewards` (
  `user_id` varchar(255) NOT NULL,
  `reward_id` varchar(255) NOT NULL,
  `claimed_at` timestamp NULL DEFAULT (now()),
  PRIMARY KEY (`user_id`,`reward_id`),
  KEY `reward_id` (`reward_id`),
  CONSTRAINT `user_rewards_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `user_rewards_ibfk_2` FOREIGN KEY (`reward_id`) REFERENCES `rewards` (`reward_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` varchar(255) NOT NULL DEFAULT (uuid()),
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL COMMENT 'Hashed password',
  `avatar` varchar(255) DEFAULT 'default.png',
  `bio` text,
  `role` enum('user','vip','pro','admin') NOT NULL DEFAULT 'user',
  `account_status` enum('pending','active','blocked') DEFAULT NULL,
  `points` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT (now()),
  `update_at` timestamp NULL DEFAULT (now()),
  `verification_otp` varchar(6) DEFAULT NULL,
  `otp_expires_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-14  2:44:07
