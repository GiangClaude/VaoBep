const LeaderboardService = require('../services/leaderboard.service');
const asyncHandler = require('../utils/asyncHandler');

const getTopRecipes = asyncHandler(async (req, res) => {
    // 1. Chỉ lấy input
    const { month, year } = req.query;

    // 2. Giao phó toàn bộ logic xử lý rẽ nhánh cho Service
    const result = await LeaderboardService.getTopRecipes(month, year);

    // 3. Trả về đúng format cũ (result bao gồm cả { data, isCurrentMonth })
    return res.status(200).json({ 
        success: true, 
        ...result 
    });
});

const getTopUsers = asyncHandler(async (req, res) => {
    // 1. Chỉ lấy input
    const { month, year } = req.query;

    // 2. Gọi Service
    const result = await LeaderboardService.getTopUsers(month, year);

    // 3. Trả về format cũ
    return res.status(200).json({ 
        success: true, 
        ...result 
    });
});

// Khuyến cáo: URL này nên được bảo mật (dùng cho Admin hoặc hệ thống tự gọi)
const triggerSnapshot = asyncHandler(async (req, res) => {
    const result = await LeaderboardService.triggerSnapshot();
    return res.status(200).json(result);
});

module.exports = {
    getTopRecipes,
    getTopUsers,
    triggerSnapshot
};