import apiClient from './index';

export const leaderboardApi = {
    getTopRecipes: async (month, year) => {
        let url = '/leaderboard/recipes';
        if (month && year) {
            url += `?month=${month}&year=${year}`;
        }
        const response = await apiClient.get(url);
        return response.data;
    },

    getTopUsers: async (month, year) => {
        let url = '/leaderboard/users';
        if (month && year) {
            url += `?month=${month}&year=${year}`;
        }
        const response = await apiClient.get(url);
        return response.data;
    }
};