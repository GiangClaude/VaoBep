// VỊ TRÍ: frontend/src/hooks/mutations/useContentMutations.js

import { useMutation, useQueryClient } from '@tanstack/react-query';
import recipeApi from '../../api/recipeApi';
import articleApi from '../../api/articleApi';
import { QUERY_KEYS } from '../../config/queryKeys';

// --- RECIPES ---
export const useCreateRecipeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (formData) => recipeApi.createRecipe(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.OWNER_RECIPES] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPES_LIST] });
        }
    });
};

export const useUpdateRecipeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ recipeId, formData }) => recipeApi.updateRecipe(recipeId, formData),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPE_DETAIL, variables.recipeId] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.OWNER_RECIPES] });
        }
    });
};

export const useDeleteRecipeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (recipeId) => recipeApi.deleteRecipe(recipeId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.OWNER_RECIPES] });
        }
    });
};

export const useChangeRecipeStatusMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ recipeId, status }) => recipeApi.changeStatus(recipeId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.OWNER_RECIPES] });
        }
    });
};

// --- ARTICLES --- (Tương tự Recipes)
export const useCreateArticleMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (formData) => articleApi.createArticle(formData),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.OWNER_ARTICLES] })
    });
};

export const useDeleteArticleMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (articleId) => articleApi.deleteArticle(articleId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.OWNER_ARTICLES] })
    });
};

// Thêm vào frontend/src/hooks/mutations/useContentMutations.js

export const useChangeArticleStatusMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        // Tùy theo API của bà, có thể là articleApi.changeStatus hoặc articleApi.updateArticle
        mutationFn: ({ articleId, status }) => articleApi.updateArticle(articleId, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.OWNER_ARTICLES] });
        }
    });
};

// Thêm Mutation để cập nhật toàn bộ thông tin bài viết (Title, Content, Cover,...)
export const useUpdateArticleMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        // Gửi formData lên để update tương tự recipe
        mutationFn: ({ articleId, formData }) => articleApi.updateArticle(articleId, formData),
        onSuccess: (data, variables) => {
            // Refetch lại chi tiết bài viết và danh sách của tôi sau khi update
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ARTICLE_DETAIL, variables.articleId] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.OWNER_ARTICLES] });
        }
    });
};