// backend/controllers/reward.controllers.js
const asyncHandler = require('../utils/asyncHandler');
const RewardService = require('../services/reward.service');

/**
 * Lấy danh sách hộp quà của người dùng hiện tại
 * Đã bọc asyncHandler để tránh lỗi Unhandled Promise Rejection
 */
const getMyRewards = asyncHandler(async (req, res) => {
    const userId = req.user.user_id;
    const boxes = await RewardService.getMyRewards(userId);
    
    res.status(200).json({ 
        success: true, 
        data: boxes 
    });
});

/**
 * Xử lý mở hộp quà (Claim Reward)
 */
const claimReward = asyncHandler(async (req, res) => {
    const { userRewardId } = req.body;
    const userId = req.user.user_id;

    const result = await RewardService.claimReward(userRewardId, userId);

    res.status(200).json({ 
        success: true, 
        message: result.message, 
        data: result.data 
    });
});

// Export theo dạng object thống nhất với toàn bộ dự án
module.exports = {
    getMyRewards,
    claimReward
};