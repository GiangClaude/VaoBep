import { useNavigate } from "react-router-dom";
/**
 * Hàm lấy ngẫu nhiên một số lượng phần tử từ mảng.
 * Bằng cách sao chép mảng gốc và sắp xếp ngẫu nhiên dựa trên Math.random().
 * @param {Array} array - Mảng gốc cần lấy dữ liệu
 * @param {number} count - Số lượng phần tử muốn lấy ra
 * @returns {Array} Mảng chứa các phần tử đã được xáo trộn ngẫu nhiên
 */
export const getRandomItems = (array, count) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

/**
 * Hàm điều hướng người dùng sang trang tìm kiếm khi click vào một thẻ tag toàn cục.
 * Đã sửa lỗi: Nhận trực tiếp thực thể `Maps` từ component truyền vào để tuân thủ Rules of Hooks.
 */
export const handleTagClick = (navigate, tagId, type = 'recipes') => {

    // Chuyển hướng kèm query params và dùng trực tiếp navigate được truyền sang
    navigate(`/${type}?tab=${type}&tags=${tagId}`);
};