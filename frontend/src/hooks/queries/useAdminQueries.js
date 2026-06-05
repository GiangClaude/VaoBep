// VỊ TRÍ: frontend/src/hooks/queries/useAdminQueries.js

import { useQuery } from '@tanstack/react-query';
import adminApi from '../../api/adminApi';
import { QUERY_KEYS } from '../../config/queryKeys';

export const useAdminStatsQuery = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.ADMIN_STATS],
        queryFn: async () => {
            const response = await adminApi.getStats();
            return response.success ? response.data : response;
        }
    });
};

export const useAdminUsersQuery = (params) => {
    return useQuery({
        queryKey: [QUERY_KEYS.ADMIN_USERS, params],
        queryFn: async () => {
            const response = await adminApi.getUsers(params);
            if (response.success) {
                return { data: response.data, pagination: response.meta };
            }
            throw new Error('Lỗi tải danh sách người dùng');
        }
    });
};

export const useAdminRecipesQuery = (params) => {
    return useQuery({
        queryKey: [QUERY_KEYS.ADMIN_RECIPES, params],
        queryFn: async () => {
            const response = await adminApi.getRecipes(params);
            if (response.success) {
                return { data: response.data, pagination: response.meta };
            }
            throw new Error('Lỗi tải danh sách công thức');
        }
    });
};

export const useAdminArticlesQuery = (params) => {
    return useQuery({
        queryKey: [QUERY_KEYS.ADMIN_ARTICLES, params],
        queryFn: async () => {
            // map params object to arguments for getArticles
            const { page, limit, search, status, sortKey, sortOrder } = params;
            const response = await adminApi.getArticles(page, limit, search, status, sortKey, sortOrder);
            if (response.success) {
                return { data: response.data, pagination: response.meta };
            }
            throw new Error('Lỗi tải danh sách bài viết');
        }
    });
};

export const useAdminIngredientsQuery = (params) => {
    return useQuery({
        queryKey: [QUERY_KEYS.ADMIN_INGREDIENTS, params],
        queryFn: async () => {
            const { page, limit, search, sortKey, sortOrder } = params;
            const response = await adminApi.getAllIngredients(page, limit, search, sortKey, sortOrder);
            if (response.success) {
                return { data: response.data, pagination: response.meta };
            }
            throw new Error('Lỗi tải nguyên liệu');
        }
    });
};

export const useAdminPendingIngredientsQuery = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.ADMIN_INGREDIENTS, 'pending'],
        queryFn: async () => {
            const response = await adminApi.getPendingIngredients();
            return response.success ? response.data : [];
        }
    });
};

export const useAdminReportsQuery = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.ADMIN_REPORTS],
        queryFn: async () => {
            const response = await adminApi.getReports();
            return response.success ? response.data : [];
        }
    });
};

export const useAdminDictionaryQuery = (params) => {
    return useQuery({
        queryKey: [QUERY_KEYS.ADMIN_DICTIONARY, params],
        queryFn: async () => {
            const { page, limit, search, sortKey, sortOrder } = params;
            const response = await adminApi.getDictionaryDishes(page, limit, search, sortKey, sortOrder);
            if (response.success) {
                return { data: response.data, pagination: response.meta };
            }
            throw new Error('Lỗi tải từ điển món ăn');
        }
    });
};