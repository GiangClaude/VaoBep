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