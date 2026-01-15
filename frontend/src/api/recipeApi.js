import apiClient from "./index";

const recipeApi = {
    getFeatureRecipes: async () => {
        const response = await apiClient.get('/recipes/feature');
        return response;
    },

    getRecentlyRecipes: async () => {
        const response = await apiClient.get('/recipes/recently');
        return response;
    },

    getOwnerRecipe: async () => {
        const response = await apiClient.get('/recipes/owner');
        return response;
    },

    // Hàm lấy chi tiết công thức
    getRecipeById: async (id) => {
        const response = await apiClient.get(`/recipes/${id}`);
        return response;
    },

    createRecipe: async (formData) => {
        // Ensure multipart is used for FormData uploads
        const response = await apiClient.post('/recipes/create', formData);
        return response;
    },

    updateRecipe: async (recipeId, formData) => {
        // Ensure multipart for update when files may be included
        const response = await apiClient.put(`/recipes/update/${recipeId}`, formData);
        return response;
    },

    deleteRecipe: async (id) => {
        // Method DELETE, route phải khớp với backend: /delete/:recipeId
        const response = await apiClient.delete(`/recipes/delete/${id}`);
        return response;
    },

    getPreviewComments: async (recipeId) => {
        // Backend route: /recipes/:recipeId/preview-comments
        const response = await apiClient.get(`/recipes/${recipeId}/preview-comments`);
        return response;
    },

    changeStatus: async (recipeId, newStatus) => {
        // Route này khớp với backend: router.patch('/status/:recipeId', ...)
        const response = await apiClient.patch(`/recipes/status/${recipeId}`, { status: newStatus });
        return response;
    },

    getAllRecipes: async (params) => {
        console.log("Calling API Recipes with params:", params); // Log để check params trước khi gửi
        const response = await apiClient.get('/recipes', { params });
        return response;
    },
    
    getSavedRecipes: async (params) => {
        // params: { page, limit, sortKey, sortOrder }
        const response = await apiClient.get('/recipes/saved', { params });
        return response;
    }
}
export default recipeApi;