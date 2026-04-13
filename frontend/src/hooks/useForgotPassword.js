import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../api/authApi';

export const useForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('Email không được để trống');
            return;
        } else if (!validateEmail(email)) {
            setError('Email không hợp lệ');
            return;
        }

        setLoading(true);
        try {
            // Gọi API gửi OTP về email
            await authApi.requestPasswordReset(email);
            
            // Chuyển sang trang nhập OTP, truyền kèm intent để trang OTP biết đây là luồng Reset
            navigate('/verify-otp', {
                state: { 
                    email: email,
                    intent: 'reset_password' 
                }
            });
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return {
        email,
        setEmail,
        error,
        loading,
        handleSubmit,
        navigate
    };
};