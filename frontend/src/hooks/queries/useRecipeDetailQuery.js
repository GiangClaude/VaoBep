// VỊ TRÍ: frontend/src/hooks/queries/useRecipeDetailQuery.js

import { useQuery, useQueryClient } from '@tanstack/react-query';
import recipeApi from '../../api/recipeApi';
import { QUERY_KEYS } from '../../config/queryKeys';
import { normalizeRecipe } from '../../utils/normalizeRecipe';

const fetchRecipeDetailFn = async (id) => {
    const response = await recipeApi.getRecipeById(id);
    if (response.success) {
        return normalizeRecipe(response.data);
    }
    throw new Error(response.message || 'Lỗi khi tải công thức');
};

export const useRecipeDetailQuery = (id) => {
    return useQuery({
        queryKey: [QUERY_KEYS.RECIPE_DETAIL, id],
        queryFn: () => fetchRecipeDetailFn(id),
        enabled: !!id,
    });
};

//Cần đợi data trả về id mới thực hiện fetch 
export const useFetchRecipeDetailAsync = () => {
    const queryClient = useQueryClient();

    const fetchDetail = async (id) => {
        return await queryClient.fetchQuery({
            queryKey: [QUERY_KEYS.RECIPE_DETAIL, id],
            queryFn: () => fetchRecipeDetailFn(id),
            staleTime: 1000 * 60 * 5, // Cache 5 phút
        });
    };

    return fetchDetail;
};