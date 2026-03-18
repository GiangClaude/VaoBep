// utils/imageHelper.js
const API_URL = 'http://localhost:5000'; 

export const getAvatarUrl = (userId, avatarName) => {
    if (!avatarName) return '/assets/avatar_default.png';
    // [Safety Check] Nếu đã là link full hoặc blob thì trả về luôn
    if (avatarName.toString().startsWith('http') || avatarName.toString().startsWith('blob:')) {
        return avatarName;
    }

    if (avatarName === 'default.png') return '/assets/avatar_default.png'; 

    return `${API_URL}/public/user/${userId}/${avatarName}`;
};

export const getRecipeImageUrl = (recipeId, cover_image) => {
    if (!cover_image) return '/assets/avatar_default.png'; // Hoặc ảnh placeholder món ăn

    // [Safety Check] Nếu đã là link full hoặc blob thì trả về luôn
    if (cover_image.toString().startsWith('http') || cover_image.toString().startsWith('blob:')) {
        return cover_image;
    }

    if (cover_image === 'default.png') return '/assets/avatar_default.png'; 

    return `${API_URL}/public/recipes/${recipeId}/${cover_image}`;
};

// Hàm lấy đường dẫn ảnh bìa bài viết, fallback về ảnh mặc định nếu lỗi hoặc trống
export const getArticleImageUrl = (articleId, cover_image) => {
    if (!cover_image) return '/assets/image_default.png'; // Bạn có thể thay bằng ảnh placeholder tùy ý

    // [Safety Check] Nếu đã là link full hoặc blob thì trả về luôn
    if (cover_image.toString().startsWith('http') || cover_image.toString().startsWith('blob:')) {
        return cover_image;
    }

    if (cover_image === 'default.png') return '/assets/image_default.png'; 

    return `${API_URL}/public/articles/${articleId}/${cover_image}`;
};