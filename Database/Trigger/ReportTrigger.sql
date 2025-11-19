DELIMITER //

CREATE TRIGGER after_report_insert
AFTER INSERT ON Reports
FOR EACH ROW
BEGIN
    -- Cập nhật report_count cho bảng tương ứng
    
    IF NEW.post_type = 'recipe' THEN
        UPDATE Recipes
        SET report_count = report_count + 1
        WHERE recipe_id = NEW.post_id;
        
    ELSEIF NEW.post_type = 'article' THEN
        UPDATE Article_Posts
        SET report_count = report_count + 1
        WHERE article_id = NEW.post_id;
        
    ELSEIF NEW.post_type = 'dish' THEN
        UPDATE Dictionary_Dishes
        SET report_count = report_count + 1
        WHERE dish_id = NEW.post_id;
        
    END IF;
END //

CREATE TRIGGER after_report_delete
AFTER DELETE ON Reports
FOR EACH ROW
BEGIN
    -- Giảm report_count cho bảng tương ứng
    
    IF OLD.post_type = 'recipe' THEN
        UPDATE Recipes
        SET report_count = report_count - 1
        WHERE recipe_id = OLD.post_id;
        
    ELSEIF OLD.post_type = 'article' THEN
        UPDATE Article_Posts
        SET report_count = report_count - 1
        WHERE article_id = OLD.post_id;
        
    ELSEIF OLD.post_type = 'dish' THEN
        UPDATE Dictionary_Dishes
        SET report_count = report_count - 1
        WHERE dish_id = OLD.post_id;
        
    END IF;
END //

DELIMITER ;