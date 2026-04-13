import apiClient from "./index";

const articleApi = {
	getPublicArticles: async (params = {}) => {
		const response = await apiClient.get('/articles', { params });
		return response;
	},

	getArticleById: async (id) => {
		const response = await apiClient.get(`/articles/${id}`);
		return response;
	},

	getFeaturedArticles: async (params = {}) => {
		const response = await apiClient.get('/articles/featured', { params });
		return response;
	},

	getOwnerArticles: async () => {
		const response = await apiClient.get('/articles/me/owner');
		return response;
	},

	createArticle: async (formData) => {
		const response = await apiClient.post('/articles/create', formData);
		return response;
	},

	updateArticle: async (articleId, formData) => {
		const response = await apiClient.put(`/articles/update/${articleId}`, formData);
		return response;
	},

	deleteArticle: async (id) => {
		const response = await apiClient.delete(`/articles/delete/${id}`);
		return response;
	},

	getSavedArticles: async (params = {}) => {
        // params sẽ chứa page, limit, sort...
        const response = await apiClient.get('/articles/me/saved', { params });
        return response;
    },
};

export default articleApi;

