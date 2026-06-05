// VỊ TRÍ: frontend/src/hooks/queries/useRecipesQueries.js

import { useQuery } from '@tanstack/react-query';
import recipeApi from '../../api/recipeApi';
import { QUERY_KEYS } from '../../config/queryKeys';
import { normalizeRecipeList } from '../../utils/normalizeRecipe';

// 1. Lấy danh sách phân trang & lọc (Trang Recipes)
export const useRecipesListQuery = (params) => {
    return useQuery({
        // Đưa params vào key để React Query tự động refetch khi params thay đổi
        queryKey: [QUERY_KEYS.RECIPES_LIST, params],
        queryFn: async () => {
            const response = await recipeApi.getAllRecipes(params);
            if (response.success) {
                return {
                    data: normalizeRecipeList(response.data.data || response.data),
                    pagination: response.data.pagination || response.meta
                };
            }
            throw new Error('Lỗi tải danh sách công thức');
        },
        placeholderData: (previousData) => previousData, // Giữ data cũ mượt mà khi đổi trang
    });
};

// 2. Lấy công thức gần đây (Trang chủ)
export const useRecentRecipesQuery = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.RECENT_RECIPES],
        queryFn: async () => {
            const response = await recipeApi.getRecentlyRecipes();
            return response.success ? normalizeRecipeList(response.data) : [];
        }
    });
};

// 3. Lấy công thức của tôi (Trang Profile)
export const useOwnerRecipesQuery = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.OWNER_RECIPES],
        queryFn: async () => {
            const response = await recipeApi.getOwnerRecipe();
            return response.success ? normalizeRecipeList(response.data) : [];
        }
    });
};

// 4. Lấy công thức đã lưu
export const useSavedRecipesQuery = (sortParams) => {
    return useQuery({
        queryKey: [QUERY_KEYS.SAVED_RECIPES, sortParams],
        queryFn: async () => {
            const response = await recipeApi.getSavedRecipes(sortParams);
            // Dữ liệu Saved trả về cần check xem Backend có bọc trong data.data không
            return response.success ? normalizeRecipeList(response.data.data || response.data) : [];
        }
    });
};

// 5. Lấy công thức nổi bật (Trang chủ)
export const useFeaturedRecipesQuery = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.FEATURED_RECIPES],
        queryFn: async () => {
            const response = await recipeApi.getFeatureRecipes();
            return response.success ? normalizeRecipeList(response.data) : [];
        }
    });
};