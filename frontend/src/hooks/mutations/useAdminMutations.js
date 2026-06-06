import { useMutation, useQueryClient } from '@tanstack/react-query';
import adminApi from '../../api/adminApi';
import { QUERY_KEYS } from '../../config/queryKeys';

// 1. USERS
export const useAdminUserMutations = () => {
    const queryClient = useQueryClient();
    const invalidate = () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_USERS] });
    
    return {
        toggleStatus: useMutation({ mutationFn: ({ userId, status }) => adminApi.updateUserStatus(userId, status), onSuccess: invalidate }),
        createUser: useMutation({ mutationFn: (data) => adminApi.createUser(data), onSuccess: invalidate }),
        updateUser: useMutation({ mutationFn: ({ userId, data }) => adminApi.updateUser(userId, data), onSuccess: invalidate })
    };
};

// 2. RECIPES
export const useAdminRecipeMutations = () => {
    const queryClient = useQueryClient();
    const invalidate = () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_RECIPES] });

    return {
        hideRecipe: useMutation({ mutationFn: ({ recipeId, status }) => adminApi.hideRecipe(recipeId, status), onSuccess: invalidate }),
        createRecipe: useMutation({ mutationFn: (formData) => adminApi.createRecipe(formData), onSuccess: invalidate }),
        updateRecipe: useMutation({ mutationFn: ({ recipeId, data }) => adminApi.updateRecipe(recipeId, data), onSuccess: invalidate })
    };
};

// 3. ARTICLES (Dựa theo hook cũ của bạn)
export const useAdminArticleMutations = () => {
    const queryClient = useQueryClient();
    const invalidate = () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_ARTICLES] });

    return {
        // Tương ứng với handleUpdateStatus cũ
        updateStatus: useMutation({ 
            mutationFn: ({ articleId, status }) => adminApi.updateArticleStatus(articleId, status), 
            onSuccess: invalidate 
        }),
        // Tương ứng với handleDeleteArticle cũ
        deleteArticle: useMutation({ 
            mutationFn: (articleId) => adminApi.deleteArticle(articleId), 
            onSuccess: invalidate 
        })
    };
};

// 4. INGREDIENTS
export const useAdminProcessIngredientMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ ingredientId, data }) => adminApi.processIngredient(ingredientId, data), // data: { action, calo_per_100g }
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_INGREDIENTS] })
    });
};

export const useAdminIngredientMutations = () => {
    const queryClient = useQueryClient();
    const invalidate = () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_INGREDIENTS] });

    return {
        createIngredient: useMutation({ mutationFn: (data) => adminApi.createIngredient(data), onSuccess: invalidate }),
        updateIngredient: useMutation({ mutationFn: ({ id, data }) => adminApi.updateIngredient(id, data), onSuccess: invalidate }),
        deleteIngredient: useMutation({ mutationFn: (id) => adminApi.deleteIngredient(id), onSuccess: invalidate })
    };
};

// 5. DICTIONARY DISHES
export const useAdminDictionaryMutations = () => {
    const queryClient = useQueryClient();
    const invalidate = () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_DICTIONARY] });

    return {
        createDish: useMutation({ mutationFn: (formData) => adminApi.createDictionaryDish(formData), onSuccess: invalidate }),
        updateDish: useMutation({ mutationFn: ({ id, formData }) => adminApi.updateDictionaryDish(id, formData), onSuccess: invalidate }),
        deleteDish: useMutation({ mutationFn: (id) => adminApi.deleteDictionaryDish(id), onSuccess: invalidate })
    };
};

// 6. REPORTS
export const useAdminReportMutations = () => {
    const queryClient = useQueryClient();
    return {
        processReport: useMutation({
            mutationFn: (data) => adminApi.processReport(data), // { report_id, action, post_id, post_type }
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_REPORTS] });
                // Cập nhật luôn các bảng nếu nội dung bị ẩn
                queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_RECIPES] });
                queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_ARTICLES] });
            }
        })
    };
};