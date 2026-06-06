// frontend/src/AuthContext.js
import React, { createContext, useContext, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import authApi from './api/authApi';
import { QUERY_KEYS } from './config/queryKeys';

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const queryClient = useQueryClient();

    // Lấy thông tin user (Chỉ gọi API nếu trong localStorage có token)
    const { data: currentUser, isLoading, refetch } = useQuery({
        queryKey: [QUERY_KEYS.MY_PROFILE],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            if (!token) return null;
            
            try {
                const response = await authApi.getMe(token);
                return response.success ? response.data : null;
            } catch (error) {
                return null;
            }
        },
        staleTime: 1000 * 60 * 5, 
        retry: false 
    });

    // 1. PHỤC HỒI HÀM NÀY: Để trang Login có thể cập nhật user sau khi đăng nhập thành công
    const setCurrentUser = (userData) => {
        queryClient.setQueryData([QUERY_KEYS.MY_PROFILE], userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        // 2. CHỈ XÓA DỮ LIỆU USER: Không dùng queryClient.clear() để tránh giết chết các query khác đang chạy
        queryClient.setQueryData([QUERY_KEYS.MY_PROFILE], null);
    };

    // Lắng nghe sự kiện 401 từ axios interceptor
    useEffect(() => {
        const handleUnauthorized = () => logout();
        window.addEventListener('auth_unauthorized', handleUnauthorized);
        return () => window.removeEventListener('auth_unauthorized', handleUnauthorized);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 3. THÊM setCurrentUser VÀO ĐÂY LẠI
    const value = {
        currentUser: currentUser || null,
        setCurrentUser, 
        isLoading,
        logout, 
        refreshProfile: refetch
    };

    return (
        <AuthContext.Provider value={value}>
            {isLoading ? (
                <div className="min-h-screen flex items-center justify-center bg-[#fff9f0] text-[#ff6b35] font-bold">
                    Đang tải thông tin hệ thống...
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};