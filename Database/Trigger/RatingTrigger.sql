DELIMITER //

CREATE TRIGGER after_rating_insert_recipes
AFTER INSERT ON Ratings
FOR EACH ROW
BEGIN
    DECLARE new_avg FLOAT;
    
    IF NEW.post_type = 'recipe' THEN
        -- Cập nhật tổng điểm và tổng lượt đếm
        UPDATE Recipes
        SET 
            rating_sum_score = rating_sum_score + NEW.score,
            rating_count = rating_count + 1
        WHERE recipe_id = NEW.post_id;
        
        -- Lấy lại dữ liệu mới nhất (SQL cần phải tính toán lại trong 1 truy vấn)
        -- TÍNH TOÁN AVG VÀ GÁN LẠI
        SELECT (rating_sum_score / rating_count) INTO new_avg
        FROM Recipes WHERE recipe_id = NEW.post_id;
        
        UPDATE Recipes
        SET rating_avg_score = new_avg
        WHERE recipe_id = NEW.post_id;
    END IF;
END //

CREATE TRIGGER after_rating_update_recipes
AFTER UPDATE ON Ratings
FOR EACH ROW
BEGIN
    DECLARE new_avg FLOAT;
    
    -- Chỉ chạy nếu post_type là 'recipe' và điểm số có thay đổi
    IF NEW.post_type = 'recipe' AND NEW.score <> OLD.score THEN
        -- 1. Cập nhật Tổng điểm: Trừ điểm cũ, Cộng điểm mới
        UPDATE Recipes
        SET 
            rating_sum_score = rating_sum_score - OLD.score + NEW.score
        WHERE recipe_id = NEW.post_id;
        
        -- 2. Tính lại Điểm trung bình từ dữ liệu mới nhất
        SELECT (rating_sum_score / rating_count) INTO new_avg
        FROM Recipes WHERE recipe_id = NEW.post_id;
        
        -- 3. Gán giá trị AVG mới
        UPDATE Recipes
        SET rating_avg_score = new_avg
        WHERE recipe_id = NEW.post_id;
    END IF;
END //

CREATE TRIGGER after_rating_delete_recipes
AFTER DELETE ON Ratings
FOR EACH ROW
BEGIN
    DECLARE new_avg FLOAT;
    
    -- Chỉ chạy nếu post_type là 'recipe'
    IF OLD.post_type = 'recipe' THEN
        
        -- 1. Cập nhật tổng điểm và tổng lượt đếm
        UPDATE Recipes
        SET 
            -- Trừ điểm của đánh giá bị xóa
            rating_sum_score = rating_sum_score - OLD.score,
            -- Giảm lượt đếm
            rating_count = rating_count - 1
        WHERE recipe_id = OLD.post_id;
        
        -- 2. Tính toán lại Điểm trung bình
        
        -- Kiểm tra để tránh chia cho 0
        SELECT 
            CASE 
                WHEN R.rating_count > 0 
                THEN (R.rating_sum_score / R.rating_count) 
                ELSE 0.0 -- Nếu không còn đánh giá nào, điểm trung bình là 0
            END 
        INTO new_avg
        FROM Recipes AS R 
        WHERE R.recipe_id = OLD.post_id;
        
        -- 3. Gán giá trị AVG mới
        UPDATE Recipes
        SET rating_avg_score = new_avg
        WHERE recipe_id = OLD.post_id;
    END IF;
END //

DELIMITER ;