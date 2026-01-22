CREATE TABLE `Users` (
  `user_id` varchar(255) PRIMARY KEY DEFAULT (uuid()),
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) UNIQUE NOT NULL,
  `password` varchar(255) NOT NULL COMMENT 'Hashed password',
  `avatar` varchar(255),
  `bio` text,
  `role` ENUM ('user', 'vip', 'pro') NOT NULL DEFAULT 'user',
  `account_status` ENUM ('pending', 'active', 'blocked') NOT NULL DEFAULT 'active',
  `points` int NOT NULL DEFAULT 0,
  `created_at` timestamp DEFAULT (now()),
  `update_at` timestamp DEFAULT (now()),
  `verification_otp` varchar(7),
  `otp_expires_at` timestamp DEFAULT (now()+10*60*1000)
);

CREATE TABLE `Recipes` (
  `recipe_id` varchar(255) PRIMARY KEY DEFAULT (uuid()),
  `user_id` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `cover_image` varchar(255),
  `instructions` text NOT NULL,
  `total_calo` float,
  `status` ENUM ('public', 'draft', 'hidden', 'banned') NOT NULL DEFAULT 'draft',
  `is_trusted` boolean NOT NULL DEFAULT false,
  `created_at` timestamp DEFAULT (now()),
  `update_at` timestamp DEFAULT (now())
);

CREATE TABLE `Ingredients` (
  `ingredient_id` varchar(255) PRIMARY KEY DEFAULT (uuid()),
  `name` varchar(255) UNIQUE NOT NULL
);

CREATE TABLE `Article_Posts` (
  `article_id` varchar(255) PRIMARY KEY DEFAULT (uuid()),
  `user_id` varchar(255) NOT NULL COMMENT 'Author must have "pro" role',
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `status` ENUM ('public', 'draft', 'hidden', 'banned') NOT NULL DEFAULT 'draft',
  `created_at` timestamp DEFAULT (now()),
  `update_at` timestamp DEFAULT (now())
);

CREATE TABLE `Dictionary_Dishes` (
  `dish_id` varchar(255) PRIMARY KEY DEFAULT (uuid()),
  `name` varchar(255) NOT NULL,
  `history` text,
  `region` varchar(255),
  `admin_id` varchar(255) NOT NULL,
  `created_at` timestamp DEFAULT (now()),
  `update_at` timestamp DEFAULT (now())
);

CREATE TABLE `Likes` (
  `user_id` varchar(255) NOT NULL,
  `post_id` varchar(255) NOT NULL COMMENT 'FK to Recipes, Article_Posts, or Dictionary_Dishes',
  `post_type` ENUM ('recipe', 'article', 'dish') NOT NULL,
  `created_at` timestamp DEFAULT (now()),
  PRIMARY KEY (`user_id`, `post_id`, `post_type`)
);

CREATE TABLE `Comments` (
  `comment_id` varchar(255) PRIMARY KEY DEFAULT (uuid()),
  `user_id` varchar(255) NOT NULL,
  `post_id` varchar(255) NOT NULL COMMENT 'FK to Recipes, Article_Posts, or Dictionary_Dishes',
  `post_type` ENUM ('recipe', 'article', 'dish') NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp DEFAULT (now()),
  `update_at` timestamp DEFAULT (now())
);

CREATE TABLE `Ratings` (
  `user_id` varchar(255) NOT NULL,
  `post_id` varchar(255) NOT NULL COMMENT 'FK to Recipes, Article_Posts, or Dictionary_Dishes',
  `post_type` ENUM ('recipe', 'article', 'dish') NOT NULL,
  `score` int NOT NULL COMMENT 'Score from 1 to 5',
  PRIMARY KEY (`user_id`, `post_id`)
);

CREATE TABLE `Reports` (
  `report_id` varchar(255) PRIMARY KEY DEFAULT (uuid()),
  `reporter_user_id` varchar(255) NOT NULL,
  `post_id` varchar(255) NOT NULL COMMENT 'FK to various content tables or Users',
  `post_type` ENUM ('recipe', 'article', 'dish') NOT NULL,
  `reason` text NOT NULL,
  `status` ENUM ('pending', 'resolved') NOT NULL DEFAULT 'pending',
  `created_at` timestamp DEFAULT (now())
);

CREATE TABLE `Point_History` (
  `history_id` varchar(255) PRIMARY KEY DEFAULT (uuid()),
  `user_id` varchar(255) NOT NULL,
  `amount` int NOT NULL COMMENT 'Can be positive or negative',
  `description` varchar(255) NOT NULL,
  `created_at` timestamp DEFAULT (now())
);

CREATE TABLE `Menus` (
  `menu_id` varchar(255) PRIMARY KEY DEFAULT (uuid()),
  `user_id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp DEFAULT (now())
);

CREATE TABLE `Challenges` (
  `challenge_id` varchar(255) PRIMARY KEY DEFAULT (uuid()),
  `title` varchar(255) NOT NULL,
  `description` text,
  `start_date` timestamp NOT NULL,
  `end_date` timestamp NOT NULL,
  `status` ENUM ('upcoming', 'active', 'ended') NOT NULL DEFAULT 'upcoming'
);

CREATE TABLE `Rewards` (
  `reward_id` varchar(255) NOT NULL,
  `challenge_id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `type` ENUM ('points', 'badge', 'promotion') NOT NULL,
  `value` varchar(255) COMMENT 'e.g., "1000" for points, badge_id for a badge',
  PRIMARY KEY (`reward_id`, `challenge_id`)
);

CREATE TABLE `Badges` (
  `badge_id` varchar(255) PRIMARY KEY DEFAULT (uuid()),
  `name` varchar(255) UNIQUE NOT NULL,
  `description` text NOT NULL,
  `icon_url` varchar(255) NOT NULL
);

CREATE TABLE `Tags` (
  `tag_id` varchar(255) PRIMARY KEY DEFAULT (uuid()),
  `name` varchar(100) UNIQUE NOT NULL
);

CREATE TABLE `Password_Reset_Tokens` (
  `token` varchar(255) PRIMARY KEY,
  `email` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL
);

CREATE TABLE `Transactions` (
  `transaction_id` varchar(255) PRIMARY KEY DEFAULT (uuid()),
  `user_id` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'VND',
  `status` ENUM ('pending', 'completed', 'failed') NOT NULL DEFAULT 'pending',
  `created_at` timestamp DEFAULT (now())
);

CREATE TABLE `CaloForIngredients` (
  `ingredient_id` varchar(255) PRIMARY KEY,
  `calo_per_100g` float NOT NULL
);

CREATE TABLE `CaloForCookingWay` (
  `cooking_way_id` varchar(255) PRIMARY KEY DEFAULT (uuid()),
  `name` varchar(100) UNIQUE NOT NULL,
  `calo_multiplier` float NOT NULL DEFAULT 1
);

CREATE TABLE `Units` (
  `unit_id` varchar(255) PRIMARY KEY DEFAULT (uuid()),
  `name` varchar(50) UNIQUE NOT NULL
);

CREATE TABLE `tag_post` (
  `tag_id` varchar(255),
  `post_id` varchar(255),
  `post_type` varchar(255)
);

CREATE TABLE `Follows` (
  `follower_id` varchar(255) NOT NULL,
  `following_id` varchar(255) NOT NULL,
  PRIMARY KEY (`follower_id`, `following_id`)
);

CREATE TABLE `Saved_Posts` (
  `user_id` varchar(255) NOT NULL,
  `post_id` varchar(255) NOT NULL,
  `post_type` ENUM ('recipe', 'article', 'dish') NOT NULL,
  PRIMARY KEY (`user_id`, `post_id`, `post_type`)
);

CREATE TABLE `User_Badges` (
  `user_id` varchar(255) NOT NULL,
  `badge_id` varchar(255) NOT NULL,
  `earned_at` timestamp DEFAULT (now()),
  PRIMARY KEY (`user_id`, `badge_id`)
);

CREATE TABLE `Recipe_Ingredients` (
  `recipe_id` varchar(255) NOT NULL,
  `ingredient_id` varchar(255) NOT NULL,
  `quantity` float NOT NULL,
  `unit_id` varchar(255) NOT NULL,
  PRIMARY KEY (`recipe_id`, `ingredient_id`)
);

CREATE TABLE `Recipe_Post_Links` (
  `source_recipe_id` varchar(255) NOT NULL,
  `linked_post_id` varchar(255) NOT NULL,
  `linked_post_type` ENUM ('recipe', 'article', 'dish') NOT NULL,
  PRIMARY KEY (`source_recipe_id`, `linked_post_id`, `linked_post_type`)
);

CREATE TABLE `Menu_Recipes` (
  `menu_id` varchar(255) NOT NULL,
  `recipe_id` varchar(255) NOT NULL,
  PRIMARY KEY (`menu_id`, `recipe_id`)
);

CREATE TABLE `User_Challenges` (
  `user_id` varchar(255) NOT NULL,
  `challenge_id` varchar(255) NOT NULL,
  `recipe_submission_id` varchar(255) UNIQUE NOT NULL,
  `submission_time` timestamp DEFAULT (now()),
  PRIMARY KEY (`user_id`, `challenge_id`)
);

CREATE TABLE `User_Rewards` (
  `user_id` varchar(255) NOT NULL,
  `reward_id` varchar(255) NOT NULL,
  `claimed_at` timestamp DEFAULT (now()),
  PRIMARY KEY (`user_id`, `reward_id`)
);

Create table `Recipe_Images` (
	`img_id` varchar(255) primary key,
	`recipe_id` varchar(255),
    `imgLink` text,
    `description` text,
	`create_at` timestamp default (now()),
    
    -- Thiết lập khóa ngoại
    CONSTRAINT fk_recipe_image       -- Đặt tên cho constraint (tùy chọn, nhưng nên có)
    FOREIGN KEY (recipe_id) 
    REFERENCES Recipes(recipe_id) 
    ON DELETE CASCADE
);

-- Các phần thêm cột(Cần bổ sung sau vào lại bảng)
-- Thêm cột like_count vào bảng Recipes
ALTER TABLE `Recipes`
ADD COLUMN `like_count` INT NOT NULL DEFAULT 0;

ALTER TABLE `Recipes`
ADD COLUMN `comment_count` INT NOT NULL DEFAULT 0,  -- Bổ sung thêm Comment
ADD COLUMN `report_count` INT NOT NULL DEFAULT 0,   -- Bổ sung thêm Report
ADD COLUMN `rating_sum_score` INT NOT NULL DEFAULT 0,
ADD COLUMN `rating_count` INT NOT NULL DEFAULT 0,
ADD COLUMN `rating_avg_score` FLOAT NOT NULL DEFAULT 0.0; 

-- Thêm cột comment_count
ALTER TABLE Recipes ADD COLUMN comment_count INT NOT NULL DEFAULT 0;
ALTER TABLE Article_Posts ADD COLUMN comment_count INT NOT NULL DEFAULT 0;
ALTER TABLE Dictionary_Dishes ADD COLUMN comment_count INT NOT NULL DEFAULT 0;

-- Thêm cột report_count
ALTER TABLE Recipes ADD COLUMN report_count INT NOT NULL DEFAULT 0;
ALTER TABLE Article_Posts ADD COLUMN report_count INT NOT NULL DEFAULT 0;
ALTER TABLE Dictionary_Dishes ADD COLUMN report_count INT NOT NULL DEFAULT 0;

alter table ingredients add column status ENUM ('pending', 'approved', 'reject') not null default "pending";

ALTER TABLE units
ADD COLUMN grams_per_unit FLOAT DEFAULT 1;

ALTER TABLE recipes 
ADD COLUMN servings INT default 1;

ALTER TABLE recipes 
ADD COLUMN cook_time INT default 60;

alter table recipes
drop column cook_time;

-- Khi một Recipe bị xóa, các thành phần của nó cũng bị xóa
ALTER TABLE `Recipe_Ingredients`
    ADD FOREIGN KEY (`recipe_id`) REFERENCES `Recipes` (`recipe_id`)
    ON DELETE CASCADE; 
    -- ON UPDATE RESTRICT (Mặc định, giữ nguyên)

-- Khi một Recipe bị xóa, các bình luận của nó cũng bị xóa
ALTER TABLE `Comments`
    ADD FOREIGN KEY (`post_id`) REFERENCES `Recipes` (`recipe_id`)
    ON DELETE CASCADE;

-- Khi một Recipe bị xóa, các lượt like của nó cũng bị xóa
ALTER TABLE `Likes`
    ADD FOREIGN KEY (`post_id`) REFERENCES `Recipes` (`recipe_id`)
    ON DELETE CASCADE;

-- LỰA CHỌN B: Khi User bị xóa, Recipes của họ cũng bị xóa
ALTER TABLE `Recipes` 
    ADD FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`)
    ON DELETE CASCADE;

-- Khi User bị xóa, Article_Posts của họ cũng bị xóa
ALTER TABLE `Article_Posts` 
    ADD FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`)
    ON DELETE CASCADE;

-- Khi User bị xóa, Comments của họ cũng bị xóa
ALTER TABLE `Comments` 
    ADD FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`)
    ON DELETE CASCADE;

-- Ngăn việc xóa Ingredient nếu nó đang được dùng trong một công thức
ALTER TABLE `Recipe_Ingredients`
    ADD FOREIGN KEY (`ingredient_id`) REFERENCES `Ingredients` (`ingredient_id`)
    ON DELETE RESTRICT; -- (Hoặc không cần ghi gì, vì đây là mặc định)

-- Ngăn việc xóa Unit nếu nó đang được dùng
ALTER TABLE `Recipe_Ingredients`
    ADD FOREIGN KEY (`unit_id`) REFERENCES `Units` (`unit_id`)
    ON DELETE RESTRICT;
    
ALTER TABLE `Menus`
    ADD FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE RESTRICT;
    
ALTER TABLE `Menu_Recipes`
    ADD FOREIGN KEY (`menu_id`) REFERENCES `Menus` (`menu_id`)
    ON DELETE CASCADE
    ON UPDATE RESTRICT;

ALTER TABLE `Menu_Recipes`
    ADD FOREIGN KEY (`recipe_id`) REFERENCES `Recipes` (`recipe_id`)
    ON DELETE CASCADE
    ON UPDATE RESTRICT;

ALTER TABLE `Follows`
    ADD FOREIGN KEY (`follower_id`) REFERENCES `Users` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE RESTRICT;

ALTER TABLE `Follows`
    ADD FOREIGN KEY (`following_id`) REFERENCES `Users` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE RESTRICT;
    
-- Likes
ALTER TABLE `Likes`
    ADD FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE RESTRICT;
-- (Không thêm FK cho post_id)

-- Ratings
ALTER TABLE `Ratings`
    ADD FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE RESTRICT;
-- (Không thêm FK cho post_id)

-- Reports
ALTER TABLE `Reports`
    ADD FOREIGN KEY (`reporter_user_id`) REFERENCES `Users` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE RESTRICT;
-- (Không thêm FK cho post_id)

-- Saved_Posts
ALTER TABLE `Saved_Posts`
    ADD FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE RESTRICT;
-- (Không thêm FK cho post_id)


ALTER TABLE `Recipes` ADD FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`);

ALTER TABLE `Article_Posts` ADD FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`);

ALTER TABLE `Dictionary_Dishes` ADD FOREIGN KEY (`admin_id`) REFERENCES `Users` (`user_id`);

ALTER TABLE `Comments` ADD FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`);

ALTER TABLE `Point_History` ADD FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`);

ALTER TABLE `Menus` ADD FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`);

ALTER TABLE `Transactions` ADD FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`);

ALTER TABLE `Password_Reset_Tokens` ADD FOREIGN KEY (`email`) REFERENCES `Users` (`email`);

ALTER TABLE `CaloForIngredients` ADD FOREIGN KEY (`ingredient_id`) REFERENCES `Ingredients` (`ingredient_id`);

ALTER TABLE `Follows` ADD FOREIGN KEY (`follower_id`) REFERENCES `Users` (`user_id`);

ALTER TABLE `Follows` ADD FOREIGN KEY (`following_id`) REFERENCES `Users` (`user_id`);

ALTER TABLE `Saved_Posts` ADD FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`);

ALTER TABLE `User_Badges` ADD FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`);

ALTER TABLE `User_Badges` ADD FOREIGN KEY (`badge_id`) REFERENCES `Badges` (`badge_id`);

ALTER TABLE `User_Challenges` ADD FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`);

ALTER TABLE `User_Challenges` ADD FOREIGN KEY (`challenge_id`) REFERENCES `Challenges` (`challenge_id`);

ALTER TABLE `User_Challenges` ADD FOREIGN KEY (`recipe_submission_id`) REFERENCES `Recipes` (`recipe_id`);

ALTER TABLE `User_Rewards` ADD FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`);

ALTER TABLE `User_Rewards` ADD FOREIGN KEY (`reward_id`) REFERENCES `Rewards` (`reward_id`);

ALTER TABLE `Recipe_Ingredients` ADD FOREIGN KEY (`recipe_id`) REFERENCES `Recipes` (`recipe_id`);

ALTER TABLE `Recipe_Ingredients` ADD FOREIGN KEY (`ingredient_id`) REFERENCES `Ingredients` (`ingredient_id`);

ALTER TABLE `Recipe_Ingredients` ADD FOREIGN KEY (`unit_id`) REFERENCES `Units` (`unit_id`);

ALTER TABLE `Menu_Recipes` ADD FOREIGN KEY (`menu_id`) REFERENCES `Menus` (`menu_id`);

ALTER TABLE `Menu_Recipes` ADD FOREIGN KEY (`recipe_id`) REFERENCES `Recipes` (`recipe_id`);

ALTER TABLE `Ratings` ADD FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`);

ALTER TABLE `Ratings` ADD FOREIGN KEY (`post_id`) REFERENCES `Recipes` (`recipe_id`);

ALTER TABLE `Ratings` ADD FOREIGN KEY (`post_id`) REFERENCES `Article_Posts` (`article_id`);

ALTER TABLE `Ratings` ADD FOREIGN KEY (`post_id`) REFERENCES `Dictionary_Dishes` (`dish_id`);

ALTER TABLE `Reports` ADD FOREIGN KEY (`reporter_user_id`) REFERENCES `Users` (`user_id`);

ALTER TABLE `Recipe_Post_Links` ADD FOREIGN KEY (`source_recipe_id`) REFERENCES `Recipes` (`recipe_id`);

ALTER TABLE `tag_post` ADD FOREIGN KEY (`tag_id`) REFERENCES `Tags` (`tag_id`);

ALTER TABLE `tag_post` ADD FOREIGN KEY (`post_id`) REFERENCES `Recipes` (`recipe_id`);

ALTER TABLE `tag_post` ADD FOREIGN KEY (`post_id`) REFERENCES `Article_Posts` (`article_id`);

ALTER TABLE `tag_post` ADD FOREIGN KEY (`post_id`) REFERENCES `Dictionary_Dishes` (`dish_id`);

ALTER TABLE `Comments` ADD FOREIGN KEY (`post_id`) REFERENCES `Dictionary_Dishes` (`dish_id`);

ALTER TABLE `Comments` ADD FOREIGN KEY (`post_id`) REFERENCES `Recipes` (`recipe_id`);

ALTER TABLE `Comments` ADD FOREIGN KEY (`post_id`) REFERENCES `Article_Posts` (`article_id`);

ALTER TABLE `Reports` ADD FOREIGN KEY (`post_id`) REFERENCES `Recipes` (`recipe_id`);

ALTER TABLE `Reports` ADD FOREIGN KEY (`post_id`) REFERENCES `Dictionary_Dishes` (`dish_id`);

ALTER TABLE `Reports` ADD FOREIGN KEY (`post_id`) REFERENCES `Article_Posts` (`article_id`);

ALTER TABLE `Likes` ADD FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`);

-- Khóa ngoại liên kết với các bảng nội dung (Nội dung nào được like)
ALTER TABLE `Likes` ADD FOREIGN KEY (`post_id`) REFERENCES `Recipes` (`recipe_id`);
ALTER TABLE `Likes` ADD FOREIGN KEY (`post_id`) REFERENCES `Article_Posts` (`article_id`);
ALTER TABLE `Likes` ADD FOREIGN KEY (`post_id`) REFERENCES `Dictionary_Dishes` (`dish_id`);