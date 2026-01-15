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