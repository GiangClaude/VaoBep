// VỊ TRÍ: frontend/src/hooks/queries/useDictionaryQueries.js

import { useQuery } from '@tanstack/react-query';
import dictionaryDishApi from '../../api/dictionaryDishApi';
import { QUERY_KEYS } from '../../config/queryKeys';

export const useDishMapSummaryQuery = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.DISH_MAP_SUMMARY],
        queryFn: async () => {
            const response = await dictionaryDishApi.getMapSummary();
            return response.success ? response.data : [];
        }
    });
};

export const useDishMapAllQuery = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.DISH_MAP_ALL],
        queryFn: async () => {
            const response = await dictionaryDishApi.getMapAllDishes();
            return response.success ? response.data : [];
        }
    });
};

export const useDishDetailQuery = (id) => {
    return useQuery({
        queryKey: [QUERY_KEYS.DISH_DETAIL, id],
        queryFn: async () => {
            const response = await dictionaryDishApi.getDishDetail(id);
            if (response.success) return response.data;
            throw new Error(response.message || 'Không tìm thấy món ăn');
        },
        enabled: !!id
    });
};