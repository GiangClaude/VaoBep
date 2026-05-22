import apiClient from "./index";

const menuApi = {
    createMenu: async (menuData) => {
        const response = await apiClient.post('/menus/create', menuData);
        return response.data;
    },

    getMyMenus: async () => {
        const response = await apiClient.get('/menus/me');
        return response.data;
    },

    getMenuById: async (menuId) => {
        const response = await apiClient.get(`/menus/${menuId}`);
        return response.data;
    },

    updateMenu: async (menuId, menuData) => {
        const response = await apiClient.put(`/menus/update/${menuId}`, menuData);
        return response.data;
    },

    deleteMenu: async (menuId) => {
        const response = await apiClient.delete(`/menus/delete/${menuId}`);
        return response.data;
    },

    getShoppingList: async (menuId) => {
        const response = await apiClient.get(`/menus/${menuId}/shopping-list`);
        return response.data;
    },

    getPublicMenus: async () => {
        const response = await apiClient.get('/menus/public');
        return response.data;
    },

    cloneMenu: async (menuId) => {
        const response = await apiClient.post(`/menus/clone/${menuId}`);
        return response.data;
    },

    getPublicMenusByUser: async (userId) => {
        const response = await apiClient.get(`/menus/user/${userId}`);
        return response.data;
    },

    consultAI: async (menuState) => {
        const response = await apiClient.post('/menus/ai/consult', menuState);
        return response.data;
    },

    generateMenuAuto: async (prompt) => {
        const response = await apiClient.post('/menus/ai/generate', { prompt });
        return response.data;
    },
};

export default menuApi;