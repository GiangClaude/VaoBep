// hooks/useChangePassword.js
import { useState } from 'react';
import authApi from '../api/authApi';

export const useChangePassword = () => {
    const [passwords, setPasswords] = useState({ 
        oldPassword: '', 
        newPassword: '', 
        confirmPassword: '' 
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

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

    const handleChangePassword = async () => {
        const newErrors = {};

        // Validation mật khẩu cũ
        if (!passwords.oldPassword) {
            newErrors.oldPassword = 'Vui lòng nhập mật khẩu hiện tại';
        }

        // Validation mật khẩu mới
        const pwError = validatePassword(passwords.newPassword);
        if (pwError) newErrors.newPassword = pwError;

        // Validation trùng mật khẩu cũ
        if (passwords.newPassword === passwords.oldPassword && passwords.oldPassword !== '') {
            newErrors.newPassword = 'Mật khẩu mới không được trùng mật khẩu cũ';
        }

        // Validation xác nhận
        if (!passwords.confirmPassword) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        } else if (passwords.newPassword !== passwords.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            setLoading(true);
            try {
                // Gọi API đổi mật khẩu (endpoint chủ động đổi)
                const response = await authApi.changePassword({
                    oldPassword: passwords.oldPassword,
                    newPassword: passwords.newPassword
                });
                setLoading(false);
                return { success: true, message: response.message };
            } catch (err) {
                setLoading(false);
                const apiError = err.response?.data?.error || 'Mật khẩu cũ không chính xác hoặc có lỗi xảy ra.';
                setErrors({ api: apiError });
                return { success: false, message: apiError };
            }
        }
        return { success: false, validation: true };
    };

    const resetFields = () => {
        setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setErrors({});
    };

    return {
        passwords,
        setPasswords,
        errors,
        loading,
        handleChangePassword,
        resetFields
    };
};