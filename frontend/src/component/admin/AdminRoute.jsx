import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

const AdminRoute = () => {
    const { currentUser, isLoading } = useAuth();

    // 1. Đang tải thông tin user -> Hiển thị loading tránh redirect sai
    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Đang kiểm tra quyền...</div>;
    }

    // 2. Chưa đăng nhập -> Đá về Login
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    // 3. Đăng nhập rồi nhưng KHÔNG PHẢI ADMIN -> Đá về Homepage
    if (currentUser.role !== 'admin') {
        // Có thể thay bằng trang 403 Access Denied nếu muốn chuyên nghiệp hơn
        return <Navigate to="/homepage" replace />;
    }

    // 4. Hợp lệ -> Render các route con (AdminLayout)
    return <Outlet />;
};

export default AdminRoute;