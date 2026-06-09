// VỊ TRÍ: frontend/src/hooks/queries/useLeaderboardQueries.js

import { useQuery } from '@tanstack/react-query';
import { leaderboardApi } from '../../api/leaderboardApi';
import { QUERY_KEYS } from '../../config/queryKeys';
import { normalizeRankedRecipe, normalizeRankedUser } from '../../utils/normalizeLeaderboard';

export const useTopRecipesQuery = (month, year) => {
    return useQuery({
        queryKey: [QUERY_KEYS.LEADERBOARD, 'recipes', month, year],
        queryFn: async () => {
            const response = await leaderboardApi.getTopRecipes(month, year);
            if (response.success) {
                const payload = response.data;
                return payload.data.map(item => normalizeRankedRecipe(item, payload.isCurrentMonth));
            }
            return [];
        }
    });
};

export const useTopUsersQuery = (month, year) => {
    return useQuery({
        queryKey: [QUERY_KEYS.LEADERBOARD, 'users', month, year],
        queryFn: async () => {
            const response = await leaderboardApi.getTopUsers(month, year);
            if (response.success) {
                const payload = response.data;
                return payload.data.map(item => normalizeRankedUser(item, payload.isCurrentMonth));
            }
            return [];
        }
    });
};