import apiClient from './index';

const adminApi = {
    // 1. Dashboard
    getStats: () => {
        return apiClient.get('/admin/stats');
    },

    // 2. Quản lý User
    getUsers: (params) => {
        // params: { page, limit, search }
        return apiClient.get('/admin/users', { params });
    },
    
    createUser: (data) => {
        // data: { full_name, email, password, role }
        return apiClient.post('/admin/users', data);
    },

    updateUserStatus: (userId, status) => {
        // status: 'active' | 'blocked'
        return apiClient.put(`/admin/users/${userId}/status`, { status });
    },
    
    getUserDetail: (userId) => {
        return apiClient.get(`/admin/users/${userId}`);
    },

    // 3. Quản lý Recipe
    getRecipes: (params) => {
        // params: { page, limit, search }
        return apiClient.get('/admin/recipes', { params });
    },

    getRecipeDetail: (id) => apiClient.get(`/admin/recipes/${id}`),
    
    createRecipe: (formData) => {
        // Gửi FormData (có file)
        return apiClient.post('/admin/recipes', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    updateRecipe: (id, data) => {
        // data: { status, is_trust }
        return apiClient.put(`/admin/recipes/${id}`, data);
    },

    hideRecipe: (recipeId, status) => {
        return apiClient.put(`/admin/recipes/${recipeId}/hide`, { status });
    },

    // 4. Quản lý Nguyên liệu (Pending)
    getPendingIngredients: () => {
        return apiClient.get('/admin/ingredients/pending');
    },

    processIngredient: (ingredientId, data) => {
        // data: { action: 'approve' | 'reject', calo_per_100g: number }
        return apiClient.put(`/admin/ingredients/${ingredientId}/process`, data);
    },

    // 5. Quản lý Báo cáo
    getReports: () => {
        return apiClient.get('/admin/reports');
    },

    processReport: (data) => {
        // data: { report_id, action: 'hide_content' | 'ignore', post_id, post_type }
        return apiClient.post('/admin/reports/process', data);
    },

    getUserDetail: (userId) => {
        return apiClient.get(`/admin/users/${userId}`);
    },

    // [THÊM MỚI]
    updateUser: (userId, data) => {
        // data: { role, account_status }
        return apiClient.put(`/admin/users/${userId}`, data);
    },
};

export default adminApi;