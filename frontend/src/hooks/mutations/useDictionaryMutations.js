import { useMutation, useQueryClient } from '@tanstack/react-query';
import dictionaryDishApi from '../../api/dictionaryDishApi';
import { QUERY_KEYS } from '../../config/queryKeys';

export const useVoteRecipeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ dishId, recipeId }) => dictionaryDishApi.voteRecipe(dishId, recipeId),
        onSuccess: (data, variables) => {
            // Cập nhật lại chi tiết món ăn (để danh sách đề xuất tự động reload)
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DISH_DETAIL, variables.dishId] });
        }
    });
};