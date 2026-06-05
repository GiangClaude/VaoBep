// VỊ TRÍ: frontend/src/hooks/mutations/useAdminMutations.js

import { useMutation, useQueryClient } from '@tanstack/react-query';
import adminApi from '../../api/adminApi';
import { QUERY_KEYS } from '../../config/queryKeys';

export const useAdminUpdateUserStatusMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, status }) => adminApi.updateUserStatus(userId, status),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_USERS] })
    });
};

export const useAdminHideRecipeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ recipeId, status }) => adminApi.hideRecipe(recipeId, status),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_RECIPES] })
    });
};

export const useAdminProcessReportMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => adminApi.processReport(data), // { report_id, action, post_id, post_type }
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_REPORTS] });
            // Tùy chọn: Invalidate thêm bảng chứa nội dung bị xóa
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_RECIPES] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_ARTICLES] });
        }
    });
};

export const useAdminProcessIngredientMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ ingredientId, data }) => adminApi.processIngredient(ingredientId, data), // data: { action, calo_per_100g }
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_INGREDIENTS] });
        }
    });
};