DELIMITER //

-- Tăng số lượng địa điểm khi thêm mới
CREATE TRIGGER after_eatery_insert
AFTER INSERT ON Dish_Eateries
FOR EACH ROW
BEGIN
    UPDATE Dictionary_Dishes
    SET eatery_count = eatery_count + 1
    WHERE dish_id = NEW.dish_id;
END //

-- Giảm số lượng địa điểm khi xóa
CREATE TRIGGER after_eatery_delete
AFTER DELETE ON Dish_Eateries
FOR EACH ROW
BEGIN
    UPDATE Dictionary_Dishes
    SET eatery_count = eatery_count - 1
    WHERE dish_id = OLD.dish_id;
END //

DELIMITER ;