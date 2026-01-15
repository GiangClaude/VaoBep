import apiClient from './index';

const unitApi = {
  getAll: () => {
    // Lưu ý: Route này phải khớp với Backend bạn vừa sửa ở bước trước
    return apiClient.get('/units'); 
  },
};

export default unitApi;