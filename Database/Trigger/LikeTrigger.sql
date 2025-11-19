DELIMITER //

CREATE TRIGGER after_like_insert
AFTER INSERT ON Likes
FOR EACH ROW
BEGIN
    -- Kiểm tra post_type và tăng like_count trong bảng tương ứng
    
    IF NEW.post_type = 'recipe' THEN
        UPDATE Recipes
        SET like_count = like_count + 1
        WHERE recipe_id = NEW.post_id;
        
    ELSEIF NEW.post_type = 'article' THEN
        UPDATE Article_Posts
        SET like_count = like_count + 1
        WHERE article_id = NEW.post_id;
        
    ELSEIF NEW.post_type = 'dish' THEN
        UPDATE Dictionary_Dishes
        SET like_count = like_count + 1
        WHERE dish_id = NEW.post_id;
        
    END IF;
END //

CREATE TRIGGER after_like_delete
AFTER DELETE ON Likes
FOR EACH ROW
BEGIN
    -- Kiểm tra post_type và giảm like_count trong bảng tương ứng
    
    IF OLD.post_type = 'recipe' THEN
        UPDATE Recipes
        SET like_count = like_count - 1
        WHERE recipe_id = OLD.post_id;
        
    ELSEIF OLD.post_type = 'article' THEN
        UPDATE Article_Posts
        SET like_count = like_count - 1
        WHERE article_id = OLD.post_id;
        
    ELSEIF OLD.post_type = 'dish' THEN
        UPDATE Dictionary_Dishes
        SET like_count = like_count - 1
        WHERE dish_id = OLD.post_id;
        
    END IF;
END //

DELIMITER ;
