// VỊ TRÍ: frontend/src/hooks/queries/useMiscQueries.js

import { useQuery } from '@tanstack/react-query';
import tagApi from '../../api/tagApi';
import ingredientApi from '../../api/ingredientApi';
import unitApi from '../../api/unitApi';
import { rewardApi } from '../../api/rewardApi';
import { QUERY_KEYS } from '../../config/queryKeys';

// Lấy Tags (Dữ liệu ít thay đổi, có thể cache Infinity)
export const useTagsQuery = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.TAGS],
        queryFn: async () => {
            const response = await tagApi.getAllTags();
            return response.success ? response.data : (Array.isArray(response.data) ? response.data : []);
        },
        staleTime: Infinity, // Không gọi lại API trong suốt phiên làm việc
    });
};

// Lấy hộp quà của tôi
export const useMyRewardsQuery = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.REWARDS, 'my_rewards'],
        queryFn: async () => {
            const response = await rewardApi.getMyRewards();
            return response.success ? response.data : [];
        }
    });
};

// Lấy danh sách nguyên liệu cho Form Tạo công thức
export const useIngredientsQuery = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.ADMIN_INGREDIENTS, 'all'],
        queryFn: async () => {
            const response = await ingredientApi.getAll();
            return response.success ? response.data : [];
        },
        staleTime: 1000 * 60 * 60, // Cache 1 tiếng
    });
};

// Lấy danh sách đơn vị đo
export const useUnitsQuery = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.UNITS],
        queryFn: async () => {
            const response = await unitApi.getAll();
            return response.success ? response.data : [];
        },
        staleTime: Infinity, // Đơn vị đo gần như không bao giờ đổi
    });
};