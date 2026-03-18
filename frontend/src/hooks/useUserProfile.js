import { useState, useEffect, useCallback } from 'react';
import userApi from '../api/userApi';
import interactionApi from '../api/interactionApi';
import recipeApi from '../api/recipeApi';
import { normalizeRecipeList } from '../utils/normalizeRecipe';
export const useUserProfile = (userId) => {
    const [user, setUser] = useState(null);
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUserProfile = useCallback(async () => {
        if (!userId) return;
        
        setLoading(true);
        setError(null); // Reset lỗi trước khi gọi
        try {
            // 1. Lấy thông tin User
            const response = await userApi.getUserProfile(userId);
            const recipe = await recipeApi.getUserRecipes(userId);
            // [DEBUG] Xem response thực tế là gì
            // console.log("👉 API Response for User:", response);
            // console.log("👉 API Response for Recipes:", recipe);

            // [FIX LỖI] Kiểm tra xem response có bọc trong .data không (do axios)
            // Nếu có interceptor thì response là data, nếu không thì response.data mới là data
            const actualData = response.data && response.data.success !== undefined ? response.data : response;

            if (actualData.success) {
                setUser(actualData.data);
            } else {
                setError(actualData.message || "Lỗi không xác định từ server");
            }

            // const API_BASE_URL = "http://localhost:5000";
            // const normalizedRecipes = (recipe.data.data || []).map(r => ({
            //     id: r.recipe_id || r.id,
            //     title: r.title || "",
            //     description: r.description || "",
            //     steps: r.steps || 5,
            //     cookTime: r.cook_time ? `${r.cook_time} phút` : "",
            //     servings: r.servings ? `${r.servings} người` : "",
            //     calories: r.total_calo !== undefined && r.total_calo !== null ? Number(r.total_calo) : 0,
            //     image: r.cover_image ? `${API_BASE_URL}/public/recipes/${r.recipe_id || r.id}/${r.cover_image}` : "/default.jpg",
            //     createdAt: r.created_at ? new Date(r.created_at).toLocaleDateString('vi-VN') : "",
            //     status: r.status || "public",
            //     likes: r.like_count !== undefined && r.like_count !== null ? Number(r.like_count) : 0,
            //     rating: r.rating_avg_score !== undefined && r.rating_avg_score !== null ? Number(r.rating_avg_score).toFixed(1) : "0.0",
            //     commentCount: r.comment_count !== undefined && r.comment_count !== null ? Number(r.comment_count) : 0,
            //     userName: r.author_name || "Thành viên Bếp",
            //     userAvatar: r.author_avatar
            //       ? `${API_BASE_URL}/public/user/${r.user_id}/${r.author_avatar}`
            //       : "/assets/avatar_default.png"
            // }));
            setRecipes(normalizeRecipeList(recipe.data.data || []));

        } catch (err) {
            console.error("❌ Error fetching user profile:", err);
            // Ưu tiên lấy message từ response server nếu có
            const errorMessage = err.response?.data?.message || err.message || "Không thể tải thông tin người dùng.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    // Hành động Follow
    const handleFollow = async () => {
        if (!user) return { success: false };

        // 1. Lưu trạng thái cũ để revert nếu lỗi
        const previousUser = { ...user };

        // 2. Optimistic Update (Cập nhật UI ngay lập tức)
        setUser(prev => {
            const isNowFollowing = !prev.isFollowing;
            return {
                ...prev,
                isFollowing: isNowFollowing,
                stats: {
                    ...prev.stats,
                    // Nếu đang follow -> unfollow (-1), ngược lại (+1)
                    followers: prev.stats.followers + (isNowFollowing ? 1 : -1)
                }
            };
        });

        try {
            // 3. Gọi API
            await interactionApi.followUser(userId);
            return { success: true };
        } catch (err) {
            console.error("Lỗi follow:", err);
            // 4. Nếu lỗi -> Revert lại trạng thái cũ
            setUser(previousUser);
            // Trả về lỗi để UI hiển thị toast nếu cần
            return { success: false, message: err.response?.data?.message || "Lỗi kết nối" }; 
        }
    };

    return {
        user,
        recipes,
        loading,
        error,
        handleFollow,
        refetch: fetchUserProfile
    };
};