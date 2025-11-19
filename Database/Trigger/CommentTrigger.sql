DELIMITER //

CREATE TRIGGER after_comment_insert
AFTER INSERT ON Comments
FOR EACH ROW
BEGIN
    -- Cập nhật comment_count cho bảng tương ứng
    
    IF NEW.post_type = 'recipe' THEN
        UPDATE Recipes
        SET comment_count = comment_count + 1
        WHERE recipe_id = NEW.post_id;
        
    ELSEIF NEW.post_type = 'article' THEN
        UPDATE Article_Posts
        SET comment_count = comment_count + 1
        WHERE article_id = NEW.post_id;
        
    ELSEIF NEW.post_type = 'dish' THEN
        UPDATE Dictionary_Dishes
        SET comment_count = comment_count + 1
        WHERE dish_id = NEW.post_id;
        
    END IF;
END //

CREATE TRIGGER after_comment_delete
AFTER DELETE ON Comments
FOR EACH ROW
BEGIN
    -- Giảm comment_count cho bảng tương ứng
    
    IF OLD.post_type = 'recipe' THEN
        UPDATE Recipes
        SET comment_count = comment_count - 1
        WHERE recipe_id = OLD.post_id;
        
    ELSEIF OLD.post_type = 'article' THEN
        UPDATE Article_Posts
        SET comment_count = comment_count - 1
        WHERE article_id = OLD.post_id;
        
    ELSEIF OLD.post_type = 'dish' THEN
        UPDATE Dictionary_Dishes
        SET comment_count = comment_count - 1
        WHERE dish_id = OLD.post_id;
        
    END IF;
END //


DELIMITER ;