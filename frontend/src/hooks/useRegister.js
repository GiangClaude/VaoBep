// File: src/hooks/useRegister.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../api/authApi';

export const useRegister = () => {
  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // 1. Validation Logic
    if (!registerData.fullName) newErrors.fullName = 'Họ tên không được để trống';

    if (!registerData.email) {
      newErrors.email = 'Email không được để trống';
    } else if (!validateEmail(registerData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!registerData.password) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (registerData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!registerData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (!agreedToTerms) {
      newErrors.terms = "Bạn phải đồng ý với Điều khoản dịch vụ và Chính sách bảo mật";
    }

    setErrors(newErrors);

    // 2. API Call Logic
    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      try {
        // Gọi API đăng ký
        // Lưu ý: Backend cần 'name', nhưng state frontend là 'fullName' -> phải map lại
        const response = await authApi.register({
            name: registerData.fullName,
            email: registerData.email,
            password: registerData.password
        });

        alert(response.message || "Đăng ký thành công!");

        // Chuyển hướng kèm state email
        navigate('/verify-otp', {
          state: { email: registerData.email }
        });

      } catch (error) {
        if (error.response && error.response.data) {
          setErrors({ api: error.response.data.error });
        } else {
          setErrors({ api: 'Không thể kết nối tới máy chủ.' });
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return {
    registerData,
    setRegisterData,
    errors,
    loading,
    agreedToTerms,
    setAgreedToTerms,
    handleRegisterSubmit
  };
};