import axios from 'axios';

const API_URL = 'http://localhost:5000/api/dictionary-dishes';

const dictionaryDishApi = {
    // Lấy tóm tắt quốc gia (Zoom out)
    getMapSummary: () => axios.get(`${API_URL}/map/summary`),
    
    // Lấy tất cả món ăn (Zoom in)
    getMapAllDishes: () => axios.get(`${API_URL}/map/all`),
    
    // Lấy chi tiết món khi click vào marker
    getDishDetail: (id) => axios.get(`${API_URL}/${id}`)
};

export default dictionaryDishApi;