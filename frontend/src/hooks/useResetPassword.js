import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authApi from '../api/authApi';

export const useResetPassword = () => {
    const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);
    
    const navigate = useNavigate();
    const location = useLocation();

    // Lấy email và otp từ trang VerifyOTP truyền sang
    const email = location.state?.email;
    const otp = location.state?.otp;

    // Bảo vệ trang: Không có email hoặc otp thì đá về trang quên mật khẩu
    useEffect(() => {
        if (!email || !otp) {
            navigate('/forgot-password');
        }
    }, [email, otp, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        // Validation
        const validatePassword = (pw) => {
            if (!pw) return 'Mật khẩu mới không được để trống';
            const rules = [];
            if (pw.length < 8) rules.push('ít nhất 8 ký tự');
            if (!/[a-z]/.test(pw)) rules.push('ít nhất 1 chữ thường');
            if (!/[A-Z]/.test(pw)) rules.push('ít nhất 1 chữ hoa');
            if (!/[0-9]/.test(pw)) rules.push('ít nhất 1 chữ số');
            if (!/[^A-Za-z0-9]/.test(pw)) rules.push('ít nhất 1 ký tự đặc biệt');
            if (rules.length) return `Mật khẩu phải chứa ${rules.join(', ')}`;
            return null;
        };

        const pwError = validatePassword(passwords.newPassword);
        if (pwError) newErrors.newPassword = pwError;

        if (!passwords.confirmPassword) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        } else if (passwords.newPassword !== passwords.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            setLoading(true);
            try {
                // Gọi API reset password
                const response = await authApi.resetPassword({
                    email,
                    otp,
                    newPassword: passwords.newPassword
                });

                setSuccessMessage(response.message || 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
            } catch (err) {
                setErrors({ api: err.response?.data?.error || 'OTP không hợp lệ hoặc đã hết hạn.' });
            } finally {
                setLoading(false);
            }
        }
    };

    return {
        passwords,
        setPasswords,
        errors,
        loading,
        handleSubmit,
        email,
        successMessage,
        clearSuccess: () => setSuccessMessage(null)
    };
};