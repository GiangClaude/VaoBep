import { useState, useEffect } from 'react';
import userApi from '../api/userApi';
import { useAuth } from '../AuthContext';
// Import thư viện fetch hoặc axios của bạn
// import axios from 'axios'; 

export const useProfile = (userId, currentUserId) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  // Xác định xem đây có phải profile của chính người đang đăng nhập không
  const isOwnProfile = currentUserId === userId;

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Thay thế bằng đường dẫn API thực tế của bạn
        // const response = await axios.get(`/api/users/${userId}`);
        // const data = response.data;
        
        // --- MOCK CALL API (Xóa đoạn này khi nối API thật) ---
        const response = await userApi.getMyProfile();
        
        // Backend trả về: { message: "...", data: [...] }
        const data = response.data?.data || [];
        // ---------------------------------------------------

        setUser(data);
        
        // Nếu không phải profile của mình, check xem đã follow chưa
        if (!isOwnProfile) {
            // const followStatus = await axios.get(`/api/users/${userId}/is-following`);
            // setIsFollowing(followStatus.data.isFollowing);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, currentUserId, isOwnProfile]);

  const handleFollowToggle = async () => {
    // Logic gọi API follow/unfollow
    setIsFollowing(!isFollowing);
  };

  return {
    user,
    loading,
    error,
    isOwnProfile,
    isFollowing,
    handleFollowToggle
  };
};

export const useUpdateProfile = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { setCurrentUser } = useAuth(); // Lấy hàm cập nhật context

    const updateProfile = async (formData) => {
        setLoading(true);
        setError(null);
        try {
            // Gọi API
            const response = await userApi.updateProfile(formData);

            if (response.data && response.data.success) {
                // Logic quan trọng: Cập nhật Global State (Context) ngay lập tức
                setCurrentUser(response.data.data);
                return { success: true, message: "Cập nhật hồ sơ thành công!" };
            } else {
                const msg = response.data?.message || "Cập nhật thất bại";
                return { success: false, message: msg };
            }
        } catch (err) {
            console.error("Update Profile Error:", err);
            const msg = err.response?.data?.message || "Lỗi kết nối server";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    };

    return { 
        updateProfile, 
        loading, 
        error 
    };
};