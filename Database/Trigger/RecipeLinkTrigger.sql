DELIMITER //

-- Tăng số lượng công thức liên kết
CREATE TRIGGER after_recipe_link_insert
AFTER INSERT ON Recipe_Post_Links
FOR EACH ROW
BEGIN
    -- Chỉ cập nhật nếu liên kết này trỏ tới món ăn từ điển (dish)
    IF NEW.linked_post_type = 'dish' THEN
        UPDATE Dictionary_Dishes
        UPDATE Dictionary_Dishes
        SET recipe_link_count = recipe_link_count + 1
        WHERE dish_id = NEW.source_recipe_id; -- source_recipe_id đóng vai trò là dish_id trong ngữ cảnh này
    END IF;
END //

-- Giảm số lượng công thức liên kết khi xóa
CREATE TRIGGER after_recipe_link_delete
AFTER DELETE ON Recipe_Post_Links
FOR EACH ROW
BEGIN
    IF OLD.linked_post_type = 'dish' THEN
        UPDATE Dictionary_Dishes
        SET recipe_link_count = recipe_link_count - 1
        WHERE dish_id = OLD.source_recipe_id;
    END IF;
END //

DELIMITER ;