import { useState, useEffect, useCallback } from 'react';
import userApi from '../api/userApi';
import interactionApi from '../api/interactionApi';

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
            
            // [DEBUG] Xem response thực tế là gì
            console.log("👉 API Response for User:", response);

            // [FIX LỖI] Kiểm tra xem response có bọc trong .data không (do axios)
            // Nếu có interceptor thì response là data, nếu không thì response.data mới là data
            const actualData = response.data && response.data.success !== undefined ? response.data : response;

            if (actualData.success) {
                setUser(actualData.data);
            } else {
                setError(actualData.message || "Lỗi không xác định từ server");
            }

            // 2. Lấy danh sách công thức (Tạm thời để rỗng)
            setRecipes([]); 

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