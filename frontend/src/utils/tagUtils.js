// Danh mục hiển thị Tiếng Việt cho các loại tag trong Database
export const TAG_TYPE_LABELS = {
    cuisine: "Vùng miền & Quốc gia",
    meal_time: "Bữa ăn trong ngày",
    ingredient: "Nguyên liệu chính",
    method: "Cách chế biến",
    diet: "Chế độ ăn & Sức khỏe",
    taste: "Hương vị",
    occasion: "Dịp & Sự kiện",
    appliance: "Dụng cụ nhà bếp",
    dish_type: "Loại món ăn",
    other: "Chủ đề khác"
};

// Thứ tự hiển thị ưu tiên trên giao diện
export const TAG_CATEGORY_ORDER = [
    'cuisine', 
    'meal_time', 
    'ingredient', 
    'diet', 
    'method', 
    'dish_type', 
    'occasion', 
    'taste', 
    'appliance', 
    'other'
];

/**
 * Hàm gom nhóm mảng tag phẳng thành object theo tag_type
 * @param {Array} tags - Mảng các tag từ API
 * @returns {Object} - Object đã gom nhóm { meal_time: [...], ingredient: [...] }
 */
export const groupTagsByType = (tags) => {
    if (!tags || !Array.isArray(tags)) return {};
    
    return tags.reduce((acc, tag) => {
        const type = tag.tag_type || 'other';
        if (!acc[type]) acc[type] = [];
        acc[type].push(tag);
        return acc;
    }, {});
};

/**
 * Hàm cắt mảng tags theo số lượng giới hạn và tính toán số lượng tag bị ẩn
 */
export const getDisplayTags = (tags = [], maxDisplay = 2) => {
  if (!Array.isArray(tags) || tags.length === 0) {
    return { displayedTags: [], hiddenCount: 0 };
  }
  
  const displayedTags = tags.slice(0, maxDisplay);
  const hiddenCount = tags.length > maxDisplay ? tags.length - maxDisplay : 0;
  
  return { displayedTags, hiddenCount };
};

/**
 * Hàm điều hướng người dùng sang trang tìm kiếm khi click vào một thẻ tag toàn cục.
 * Đã sửa lỗi: Nhận trực tiếp thực thể `Maps` từ component truyền vào để tuân thủ Rules of Hooks.
 */
export const handleTagClick = (navigate, tagId, type = 'recipes') => {

    // Chuyển hướng kèm query params và dùng trực tiếp navigate được truyền sang
    navigate(`/${type}?tab=${type}&tags=${tagId}`);
};