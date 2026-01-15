import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// [THAY ĐỔI] Import AuthProvider và useAuth từ context đã tách
import { AuthProvider, useAuth } from './AuthContext';

import Header from './component/common/Header';
import { Footer } from './component/common/Footer';

// Các Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyOTPPage from './pages/VerifyOTPPage';
import HomePage from './pages/HomepagePage';
import ProfilePage from './pages/ProfilePage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import RecipesListPage from './pages/RecipesListPage';
import SearchPage from './pages/SearchPage';
import UserProfilePage from './pages/UserProfilePage';

// Layout chính
const MainLayout = () => {
  return (
    <div>
      <Header />
      <div className="w-full py-4 px-4">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

// [SỬA LỖI] Component bảo vệ Route (Dùng useAuth thay vì props truyền xuống)
const ProtectedRoute = () => {
  const { currentUser } = useAuth(); // Lấy từ Context
  if (!currentUser) return <Navigate to="/login" replace />;
  return <Outlet />;
};

// [SỬA LỖI] Logic tương tự cho ProtectedLayout (nếu bạn còn dùng)
// Lưu ý: Code cũ bạn viết `const user = useAuth()` là sai, phải destructuring `{ currentUser }`
const ProtectedLayout = () => {
  const { currentUser } = useAuth(); 
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />;
}

// [THÊM MỚI] Component xử lý chuyển hướng trang chủ (Route "/")
// Lý do: App không thể gọi useAuth() vì App nằm ngoài AuthProvider
const IndexRedirect = () => {
  const { currentUser } = useAuth();
  return currentUser ? <Navigate to="/homepage" replace /> : <Navigate to="/login" replace />;
};

function App() {
  // [ĐÃ XÓA] Toàn bộ logic useState, useEffect, check token ở đây.
  // AuthProvider sẽ lo việc đó.

  return (
    // [THAY ĐỔI] Bọc toàn bộ ứng dụng trong AuthProvider
    <AuthProvider>
      <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-otp" element={<VerifyOTPPage />} />

            {/* Main App Routes */}
            <Route element={<MainLayout />}>
              <Route path="/homepage" element={<HomePage />} />
              <Route path="/recipes" element={<RecipesListPage />} />
              <Route path="/recipe/:id" element={<RecipeDetailPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/user/:id" element={<UserProfilePage />} />
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                 <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Route>

            {/* Root Route - Dùng component con để xử lý */}
            <Route path="/" element={<IndexRedirect />} />
            
          </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;