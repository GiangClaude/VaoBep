// VỊ TRÍ: frontend/src/hooks/mutations/useProfileMutations.js

import { useMutation, useQueryClient } from '@tanstack/react-query';
import userApi from '../../api/userApi';
import authApi from '../../api/authApi';
import { rewardApi } from '../../api/rewardApi';
import { QUERY_KEYS } from '../../config/queryKeys';

export const useUpdateProfileMutation = () => {
    return useMutation({
        mutationFn: (formData) => userApi.updateProfile(formData),
        // onSuccess sẽ được xử lý ở Component để gọi hàm update Context Auth (User đang đăng nhập)
    });
};

export const useChangePasswordMutation = () => {
    return useMutation({
        mutationFn: (data) => authApi.changePassword(data)
    });
};

export const useCheckInMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => userApi.dailyCheckIn(),
        onSuccess: () => {
            // Cập nhật lại lịch sử điểm
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.POINTS_HISTORY] });
        }
    });
};

export const useGiftPointsMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => userApi.giftPoints(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.POINTS_HISTORY] });
        }
    });
};

export const useClaimRewardMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userRewardId) => rewardApi.claimReward(userRewardId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.REWARDS] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.POINTS_HISTORY] });
        }
    });
};