import apiClient from "./index";

const menuApi = {
    createMenu: async (menuData) => {
        const response = await apiClient.post('/menus/create', menuData);
        return response;
    },

    getMyMenus: async () => {
        const response = await apiClient.get('/menus/me');
        return response;
    },

    getMenuById: async (menuId) => {
        const response = await apiClient.get(`/menus/${menuId}`);
        return response;
    },

    updateMenu: async (menuId, menuData) => {
        const response = await apiClient.put(`/menus/update/${menuId}`, menuData);
        return response;
    },

    deleteMenu: async (menuId) => {
        const response = await apiClient.delete(`/menus/delete/${menuId}`);
        return response;
    },

    getShoppingList: async (menuId) => {
        const response = await apiClient.get(`/menus/${menuId}/shopping-list`);
        return response;
    },

    getPublicMenus: async () => {
        const response = await apiClient.get('/menus/public');
        return response;
    },

    cloneMenu: async (menuId) => {
        const response = await apiClient.post(`/menus/clone/${menuId}`);
        return response;
    },

    getPublicMenusByUser: async (userId) => {
        const response = await apiClient.get(`/menus/user/${userId}`);
        return response;
    },

    consultAI: async (menuState) => {
        const response = await apiClient.post('/menus/ai/consult', menuState);
        return response;
    },

    generateMenuAuto: async (prompt) => {
        const response = await apiClient.post('/menus/ai/generate', { prompt });
        return response;
    },
};

export default menuApi;