// VỊ TRÍ: frontend/src/hooks/queries/useRecipeDetailQuery.js

import { useQuery } from '@tanstack/react-query';
import recipeApi from '../../api/recipeApi';
import { QUERY_KEYS } from '../../config/queryKeys';
import { normalizeRecipe } from '../../utils/normalizeRecipe';

export const useRecipeDetailQuery = (id) => {
    return useQuery({
        // Key này giúp React Query biết dữ liệu này thuộc về món ăn nào để cache
        queryKey: [QUERY_KEYS.RECIPE_DETAIL, id],
        
        queryFn: async () => {
            const response = await recipeApi.getRecipeById(id);
            // Dựa vào interceptor, response ở đây chính là { success, data, ... }
            if (response.success) {
                return normalizeRecipe(response.data);
            }
            throw new Error(response.message || 'Lỗi khi tải công thức');
        },
        
        // enabled: Chỉ gọi API khi id có giá trị (tránh gọi API với id = undefined)
        enabled: !!id,
    });
};