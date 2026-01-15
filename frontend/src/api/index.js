import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api', 
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

export default apiClient;