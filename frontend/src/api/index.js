import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

const apiClient = axios.create({
    baseURL: `${API_BASE_URL}/api`, 
    // Do not set a fixed Content-Type here so axios can
    // correctly set multipart boundaries when sending FormData.
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// 3. [THÊM MỚI]: Response Interceptor để xử lý lỗi Global
apiClient.interceptors.response.use(
    (response) => {
        return response.data; // Trả về data bình thường nếu thành công
    },
    (error) => {
        // Bắt lỗi 401 (Unauthorized - Token hết hạn hoặc sai)
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token'); // Xóa token cũ
            // return Promise.reject(error.response.data);
            // Bắn một sự kiện ra window để AuthContext nhận diện và đẩy về Login
            // (Giúp tránh việc phải truyền useNavigate xuống tận file cấu hình)
            window.dispatchEvent(new Event('auth_unauthorized'));
        }
        return Promise.reject({
            success: false,
            message: error.message || 'Không thể kết nối đến máy chủ.'
        });
    }
);

export default apiClient;