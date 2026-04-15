import apiClient from './index';

export const rewardApi = {
    // Lấy danh sách hộp quà của tôi
    getMyRewards: () => apiClient.get('/rewards/my-rewards'),
    
    // Thực hiện mở hộp quà
    claimReward: (userRewardId) => apiClient.post('/rewards/claim', { userRewardId })
};