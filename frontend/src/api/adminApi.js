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

    // --- CÁC HÀM CŨ GIỮ NGUYÊN ---
  // getPendingIngredients: ...
  // processIngredient: ...

  // --- THÊM MỚI TỪ ĐÂY: API QUẢN LÝ TẤT CẢ NGUYÊN LIỆU ---
  
  // Lấy danh sách tất cả nguyên liệu (có phân trang)
  getAllIngredients: async (page = 1, limit = 10, search = '', sortKey = 'name', sortOrder = 'ASC') => {
    try {
        const response = await apiClient.get('/admin/ingredients/all', {
            params: { page, limit, search, sortKey, sortOrder }
        });
        return response;
    } catch (error) {
        throw error;
    }
  },

  // Tạo nguyên liệu mới
  createIngredient: async (data) => {
    try {
        // data: { name, calo_per_100g, status }
        const response = await apiClient.post('/admin/ingredients', data);
        return response;
    } catch (error) {
        throw error;
    }
  },

  // Cập nhật nguyên liệu
  updateIngredient: async (id, data) => {
    try {
        // data: { name, calo_per_100g, status }
        const response = await apiClient.put(`/admin/ingredients/${id}`, data);
        return response;
    } catch (error) {
        throw error;
    }
  },

  // Xóa nguyên liệu
  deleteIngredient: async (id) => {
    try {
        const response = await apiClient.delete(`/admin/ingredients/${id}`);
        return response;
    } catch (error) {
        throw error;
    }
  },
  // --- KẾT THÚC PHẦN THÊM MỚI ---

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

    // --- THÊM MỚI TỪ ĐÂY: API QUẢN LÝ TỪ ĐIỂN MÓN ĂN ---
  
  getDictionaryDishes: async (page = 1, limit = 10, search = '', sortKey = 'created_at', sortOrder = 'DESC') => {
    try {
        const response = await apiClient.get('/admin/dictionary', {
            params: { page, limit, search, sortKey, sortOrder }
        });
        return response;
    } catch (error) {
        throw error;
    }
  },

  createDictionaryDish: async (formData) => {
    try {
        // formData: Dùng FormData vì có upload file ảnh
        const response = await apiClient.post('/admin/dictionary', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response;
    } catch (error) {
        throw error;
    }
  },

  updateDictionaryDish: async (id, formData) => {
    try {
        // formData: Dùng FormData
        const response = await apiClient.put(`/admin/dictionary/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response;
    } catch (error) {
        throw error;
    }
  },

  deleteDictionaryDish: async (id) => {
    try {
        const response = await apiClient.delete(`/admin/dictionary/${id}`);
        return response;
    } catch (error) {
        throw error;
    }
  },

  // --- THÊM MỚI TỪ ĐÂY: API QUẢN LÝ BÀI VIẾT TỪ ĐIỂN ---
  
  getArticles: async (page = 1, limit = 10, search = '', status = 'all', sortKey = 'created_at', sortOrder = 'DESC') => {
    try {
        const response = await apiClient.get('/admin/articles', {
            params: { page, limit, search, status, sortKey, sortOrder }
        });
        return response;
    } catch (error) {
        throw error;
    }
  },

  getArticleDetail: async (id) => {
    try {
        const response = await apiClient.get(`/admin/articles/${id}`);
        return response;
    } catch (error) {
        throw error;
    }
  },

  updateArticleStatus: async (id, status) => {
    try {
        // status: 'public', 'draft', 'hidden', 'banned'
        const response = await apiClient.put(`/admin/articles/${id}/status`, { status });
        return response;
    } catch (error) {
        throw error;
    }
  },

  deleteArticle: async (id) => {
    try {
        const response = await apiClient.delete(`/admin/articles/${id}`);
        return response;
    } catch (error) {
        throw error;
    }
  },
  // --- KẾT THÚC PHẦN THÊM MỚI ---
  // --- KẾT THÚC PHẦN THÊM MỚI ---
};

export default adminApi;