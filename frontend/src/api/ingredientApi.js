import apiClient from './index'; // Import axios instance đã cấu hình

const ingredientApi = {
  getAll: () => {
    return apiClient.get('/ingredients');
  },
  // Sau này có thể thêm: create, update, delete...
};

export default ingredientApi;