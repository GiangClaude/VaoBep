import apiClient from "./index";

const authApi = {
    login: async (credentials) => {
        const response = await apiClient.post('/auth/login', credentials);
        return response.data;
    },

    getMe: async (token) => {
        const response = await apiClient.get('/user/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    },

    register: async (userData) => {
        const response = await apiClient.post('/auth/register', userData);
        return response.data;
    },

    verifyOTP: async (data) => {
        const response = await apiClient.post('/auth/verify-otp', data);
        return response.data;
    },

    resendOTP: async (email) => {
    const response = await apiClient.post('/auth/resend-otp', { email });
    return response.data;
    }
};

export default authApi;