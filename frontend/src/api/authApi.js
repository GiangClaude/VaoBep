import apiClient from "./index";

const authApi = {
    login: async (credentials) => {
        const response = await apiClient.post('/auth/login', credentials);
        return response;
    },

    getMe: async (token) => {
        const response = await apiClient.get('/user/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response;
    },

    register: async (userData) => {
        const response = await apiClient.post('/auth/register', userData);
        console.log("Response from register API:", response);
        return response;
    },

    verifyOTP: async (data) => {
        const response = await apiClient.post('/auth/verify-otp', data);
        return response;
    },

    resendOTP: async (email) => {
    const response = await apiClient.post('/auth/resend-otp', { email });
    return response;
    },

    // Thêm vào trong object authApi
    requestPasswordReset: async (email) => {
        const response = await apiClient.post('/auth/request-password-reset', { email });
        return response;
    },

    resetPassword: async (data) => {
        const response = await apiClient.put('/auth/reset-password', data);
        return response;
    },

    activateAccount: async (data) => {
        const response = await apiClient.post('/auth/activate-account', data);
        return response;
    },

    changePassword: async (data) => {
        // Lưu ý: Token thường được đính kèm tự động bởi axios interceptor trong apiClient
        const response = await apiClient.put('/auth/change-password', data);
        return response;
    },
};

export default authApi;