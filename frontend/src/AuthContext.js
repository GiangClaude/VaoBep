import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from './api'; // Import apiClient để gọi API

// Tạo Context
export const AuthContext = createContext(null);

// Hook để các component con sử dụng dễ dàng
export const useAuth = () => {
  return useContext(AuthContext);
};

// [THÊM MỚI] Component Provider chứa toàn bộ logic xác thực
export const AuthProvider = ({ children }) => {
  // 1. Chuyển State từ App.js sang đây
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMyProfile = async () => {
    const token = localStorage.getItem('token');
    
    // Check token ở client trước
    if (!token) {
      setIsLoading(false);
      setCurrentUser(null);
      return;
    }

    try {
      const response = await apiClient.get('/user/me', { 
          headers: { 'Authorization': `Bearer ${token}` } 
      });
      const data = response.data;
      setCurrentUser(data.data); 
    } catch (error) {
      // Xử lý lỗi
      if (error.response && error.response.status !== 401) {
          console.error("Lỗi hệ thống:", error);
      }
      // Nếu lỗi xác thực -> logout
      setCurrentUser(null);
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Chuyển useEffect (Check token) từ App.js sang đây
  useEffect(() => {
    fetchMyProfile();
  }, []);

  // 3. Hàm logout (Tiện ích thêm để dùng ở Header/Profile)
  const logout = () => {
      localStorage.removeItem('token');
      setCurrentUser(null);
  };

  // Giá trị cung cấp cho toàn bộ App
  const value = {
      currentUser,
      setCurrentUser,
      isLoading,
      logout, 
      refreshProfile: fetchMyProfile
  };

  // Render children
  return (
    <AuthContext.Provider value={value}>
      {!isLoading ? children : <div>Đang tải thông tin...</div>}
    </AuthContext.Provider>
  );
};