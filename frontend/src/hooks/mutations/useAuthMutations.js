// frontend/src/hooks/mutations/useAuthMutations.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import authApi from '../../api/authApi';
import { QUERY_KEYS } from '../../config/queryKeys';

export const useLoginMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (credentials) => authApi.login(credentials),
        onSuccess: (data) => {
            if (data.data.token) {
                localStorage.setItem('token', data.data.token);
                // Ép React Query tải lại thông tin User ngay lập tức
                queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_PROFILE] });
            }
        }
    });
};

export const useRegisterMutation = () => {
    return useMutation({
        mutationFn: (userData) => authApi.register(userData)
    });
};

export const useVerifyOTPMutation = () => {
    return useMutation({
        mutationFn: (data) => authApi.activateAccount(data) // data: { email, otp }
    });
};

export const useForgotPasswordMutation = () => {
    return useMutation({
        mutationFn: (email) => authApi.requestPasswordReset(email)
    });
};

export const useResetPasswordMutation = () => {
    return useMutation({
        mutationFn: (data) => authApi.resetPassword(data)
    });
};

// Thêm vào cuối file frontend/src/hooks/mutations/useAuthMutations.js

export const useVerifyOTPOnlyMutation = () => {
    return useMutation({
        mutationFn: (data) => authApi.verifyOTP(data) // Chỉ kiểm tra OTP hợp lệ không (Dùng cho quên mật khẩu)
    });
};

export const useResendOTPMutation = () => {
    return useMutation({
        mutationFn: (email) => authApi.resendOTP(email) // Gửi lại OTP
    });
};