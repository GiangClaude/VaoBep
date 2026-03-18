// utils/validation.js

// Kiểm tra postType hợp lệ
const isValidPostType = (type) => ['recipe', 'article', 'dish'].includes(type);

// Validate input cho báo cáo (report)
function validateReportInput({ postId, postType, reason }) {
    if (!postId || typeof postId !== 'string' || postId.trim() === '') {
        return { valid: false, message: 'Thiếu hoặc sai postId' };
    }
    if (!isValidPostType(postType)) {
        return { valid: false, message: 'postType không hợp lệ' };
    }
    if (!reason || typeof reason !== 'string' || reason.trim() === '') {
        return { valid: false, message: 'Vui lòng chọn một lý do báo cáo' };
    }
    return { valid: true };
}

// Có thể bổ sung thêm các hàm validate cho comment, rating, ...

module.exports = {
    isValidPostType,
    validateReportInput
};
