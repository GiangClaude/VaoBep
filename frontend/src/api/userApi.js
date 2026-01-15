import apiClient from "./index";

const userApi = {
    getMyProfile: async () => {
        const response = await apiClient.get('user/me');
        return response;
    },

    searchUsers: async (params) => {
        // params: { keyword, limit, sort, page }
        console.log("Calling API user with params:", params); // Log để check params trước khi gửi
        const response = await apiClient.get('/user/search', { params });
        return response;
    },
    
    updateProfile: async (formData) => {
        // Khi gửi formData, axios tự động set Content-Type là multipart/form-data
        const response = await apiClient.put('/user/me', formData);
        return response;
    },

    // [THÊM MỚI] --- Chức năng Điểm thưởng ---
    
    // Điểm danh hàng ngày
    dailyCheckIn: async () => {
        return await apiClient.post('/user/points/check-in');
    },

    // Lấy lịch sử điểm
    getPointHistory: async (params) => {
        // params: { page, month }
        return await apiClient.get('/user/points/history', { params });
    },

    // Tặng điểm
    giftPoints: async (data) => {
        // data: { recipientId, amount, message }
        return await apiClient.post('/user/points/gift', data);
    },

    // [THÊM MỚI] Lấy thông tin public profile của người khác
    getUserProfile: async (id) => {
        const response = await apiClient.get(`/user/${id}`);
        return response;
    },
    
}
export default userApi;