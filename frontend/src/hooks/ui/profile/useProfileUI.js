import { useState } from 'react';
import { useChangePasswordMutation, useCheckInMutation, useGiftPointsMutation } from '../../mutations/useProfileMutations';

export const useProfileUI = () => {
    const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [errors, setErrors] = useState({});
    
    const changePassMutation = useChangePasswordMutation();
    const checkInMutation = useCheckInMutation();
    const giftMutation = useGiftPointsMutation();

    const handleChangePassword = async () => {
        const newErrors = {};
        if (!passwords.oldPassword) newErrors.oldPassword = 'Nhập mật khẩu hiện tại';
        if (passwords.newPassword.length < 8) newErrors.newPassword = 'Mật khẩu > 8 ký tự';
        if (passwords.newPassword !== passwords.confirmPassword) newErrors.confirmPassword = 'Mật khẩu không khớp';

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return { success: false };

        try {
            const res = await changePassMutation.mutateAsync({
                oldPassword: passwords.oldPassword,
                newPassword: passwords.newPassword
            });
            return { success: true, message: res.message };
        } catch (err) {
            setErrors({ api: err.message });
            return { success: false };
        }
    };

    return {
        passwords, setPasswords, errors, resetFields: () => setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' }),
        isChangingPass: changePassMutation.isPending,
        handleChangePassword,
        handleCheckIn: () => checkInMutation.mutateAsync(),
        handleGiftPoints: (data) => giftMutation.mutateAsync(data)
    };
};