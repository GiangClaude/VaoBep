// File: src/hooks/useLogin.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import authApi from '../api/authApi';

export const useLogin = () => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // Thêm state loading để làm UX tốt hơn
  
  const { setCurrentUser } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // 1. Logic Validation
    if (!loginData.email) {
      newErrors.email = 'Email không được để trống';
    } else if (!validateEmail(loginData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!loginData.password) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (loginData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setErrors(newErrors);

    // 2. Logic Gọi API và xử lý kết quả
    if (Object.keys(newErrors).length === 0) {
      setLoading(true); // Bật loading
      try {
        // Gọi API login
        const data = await authApi.login(loginData);
        const token = data.token;
        
        // Lưu token
        localStorage.setItem('token', token);

        // Gọi API lấy thông tin user
        const userData = await authApi.getMe(token);

        let finalUser = null;
          if (userData && userData.success) {
              finalUser = userData.data;
          } else {
              finalUser = userData;
          }

        // Cập nhật Context
        setCurrentUser(finalUser);

        // Chuyển trang
        if (finalUser && finalUser.role === 'admin') {
            navigate('/admin/dashboard'); // Chuyển sang Admin nếu là admin
        } else {
            navigate('/homepage');        // Chuyển sang Homepage nếu là user thường
        }

      } catch (error) {
        // Xử lý lỗi
        if (error.response) {
          const isNotVerified = error.response.status === 403;
          setErrors({
            api: error.response.data.error || 'Đã có lỗi xảy ra',
            notVerified: isNotVerified // Flag để hiện link xác thực
          });
        } else {
          setErrors({
            api: 'Không thể kết nối tới máy chủ.',
            notVerified: false
          });
        }
      } finally {
        setLoading(false); // Tắt loading dù thành công hay thất bại
      }
    }
  };

  // Trả về những gì UI cần dùng
  return {
    loginData,
    setLoginData,
    errors,
    loading,
    handleLoginSubmit
  };
};