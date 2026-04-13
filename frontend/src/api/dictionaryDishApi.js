import axios from 'axios';
import apiClient from "./index";
const API_URL = 'http://localhost:5000/api/dictionary-dishes';

const dictionaryDishApi = {
    // Lấy tóm tắt quốc gia (Zoom out)
    getMapSummary: async () =>{
        const response = await apiClient.get(`${API_URL}/map/summary`);
        return response;
    },

    // Lấy tất cả món ăn (Zoom in)
    getMapAllDishes: async () => {
        const response = await apiClient.get(`${API_URL}/map/all`);
        return response;
    },
    
    // Lấy chi tiết món khi click vào marker
    getDishDetail: async (id) => {
        const response = await apiClient.get(`${API_URL}/${id}`);
        return response;
    },

    voteRecipe: async (dishId, recipeId) => {
        const response = await apiClient.post(`${API_URL}/${dishId}/vote-recipe`, { recipeId });
        return response;
    }
};

export default dictionaryDishApi;