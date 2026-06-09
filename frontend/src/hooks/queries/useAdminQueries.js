import { useQuery } from '@tanstack/react-query';
import adminApi from '../../api/adminApi';
import { QUERY_KEYS } from '../../config/queryKeys';
import { useQueryClient } from '@tanstack/react-query';

export const useAdminStatsQuery = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.ADMIN_STATS],
        queryFn: async () => {
            const res = await adminApi.getStats();
            if (!res.success) throw new Error(res.message);
            return res.data;
        }
    });
};

export const useAdminUsersQuery = (params) => {
    return useQuery({
        queryKey: [QUERY_KEYS.ADMIN_USERS, params],
        queryFn: async () => {
            const res = await adminApi.getUsers(params);
            if (!res.success) throw new Error(res.message);
            return { data: res.data || [], pagination: res.meta || {} };
        }
    });
};

export const useAdminRecipesQuery = (params) => {
    return useQuery({
        queryKey: [QUERY_KEYS.ADMIN_RECIPES, params],
        queryFn: async () => {
            const res = await adminApi.getRecipes(params);
            if (!res.success) throw new Error(res.message);
            return { data: res.data || [], pagination: res.meta || {} };
        }
    });
};

export const useAdminArticlesQuery = (params) => {
    return useQuery({
        queryKey: [QUERY_KEYS.ADMIN_ARTICLES, params],
        queryFn: async () => {
            const res = await adminApi.getArticles(params.page, params.limit, params.search, params.status, params.sortKey, params.sortOrder);
            if (!res.success) throw new Error(res.message);
            return { data: res.data || [], pagination: res.meta || {} };
        }
    });
};

export const useAdminIngredientsQuery = (params) => {
    return useQuery({
        queryKey: [QUERY_KEYS.ADMIN_INGREDIENTS, params],
        queryFn: async () => {
            const res = await adminApi.getAllIngredients(params.page, params.limit, params.search, params.sortKey, params.sortOrder);
            if (!res.success) throw new Error(res.message);
            return { data: res.data || [], pagination: res.meta || {} };
        }
    });
};

export const useAdminPendingIngredientsQuery = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.ADMIN_INGREDIENTS, 'pending'],
        queryFn: async () => {
            const res = await adminApi.getPendingIngredients();
            return res.success ? res.data : [];
        }
    });
};

export const useAdminReportsQuery = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.ADMIN_REPORTS],
        queryFn: async () => {
            const res = await adminApi.getReports();
            return res.success ? res.data : [];
        }
    });
};

export const useAdminDictionaryQuery = (params) => {
    return useQuery({
        queryKey: [QUERY_KEYS.ADMIN_DICTIONARY, params],
        queryFn: async () => {
            const res = await adminApi.getDictionaryDishes(params.page, params.limit, params.search, params.sortKey, params.sortOrder);
            if (!res.success) throw new Error(res.message);
            return { data: res.data || [], pagination: res.meta || {} };
        }
    });
};

export const useAdminFetchDetails = () => {
    const queryClient = useQueryClient();

    return {
        fetchUserDetail: (userId) => queryClient.fetchQuery({
            queryKey: [QUERY_KEYS.ADMIN_USERS, 'detail', userId],
            queryFn: async () => {
                const res = await adminApi.getUserDetail(userId);
                if (!res.success) throw new Error(res.message);
                return res.data;
            }
        }),
        fetchRecipeDetail: (recipeId) => queryClient.fetchQuery({
            queryKey: [QUERY_KEYS.ADMIN_RECIPES, 'detail', recipeId],
            queryFn: async () => {
                const res = await adminApi.getRecipeDetail(recipeId);
                if (!res.success) throw new Error(res.message);
                return res.data;
            }
        }),
        fetchArticleDetail: (articleId) => queryClient.fetchQuery({
            queryKey: [QUERY_KEYS.ADMIN_ARTICLES, 'detail', articleId],
            queryFn: async () => {
                const res = await adminApi.getArticleDetail(articleId);
                if (!res.success) throw new Error(res.message);
                return res.data.data || res.data; // Tùy cấu trúc bài viết của bạn
            }
        })
    };
};