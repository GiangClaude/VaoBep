const LeaderboardModel = require('../models/leaderboard.model');

const getTopRecipes = async (req, res) => {
    try {
        const { month, year } = req.query;
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        // Kiểm tra xem client yêu cầu tháng hiện tại hay tháng quá khứ
        const isCurrentMonth = (!month && !year) || (parseInt(month) === currentMonth && parseInt(year) === currentYear);

        let data = [];
        if (isCurrentMonth) {
            data = await LeaderboardModel.getLiveTopRecipes(10);
        } else {
            if (!month || !year) return res.status(400).json({ success: false, message: "Thiếu tháng hoặc năm" });
            data = await LeaderboardModel.getHistoryLeaderboard('recipe', parseInt(month), parseInt(year), 10);
        }

        return res.status(200).json({ success: true, data, isCurrentMonth });
    } catch (error) {
        console.error("Lỗi getTopRecipes:", error);
        return res.status(500).json({ success: false, message: "Lỗi server: " + error.message });
    }
};

const getTopUsers = async (req, res) => {
    try {
        const { month, year } = req.query;
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        const isCurrentMonth = (!month && !year) || (parseInt(month) === currentMonth && parseInt(year) === currentYear);

        let data = [];
        if (isCurrentMonth) {
            data = await LeaderboardModel.getLiveTopUsers(10);
        } else {
            if (!month || !year) return res.status(400).json({ success: false, message: "Thiếu tháng hoặc năm" });
            data = await LeaderboardModel.getHistoryLeaderboard('user', parseInt(month), parseInt(year), 10);
        }

        return res.status(200).json({ success: true, data, isCurrentMonth });
    } catch (error) {
        console.error("Lỗi getTopUsers:", error);
        return res.status(500).json({ success: false, message: "Lỗi server: " + error.message });
    }
};

// Khuyến cáo: URL này nên được bảo mật (dùng cho Admin hoặc hệ thống tự gọi)
const triggerSnapshot = async (req, res) => {
    try {
        const result = await LeaderboardModel.runMonthlySnapshot();
        return res.status(200).json(result);
    } catch (error) {
        console.error("Lỗi triggerSnapshot:", error);
        return res.status(500).json({ success: false, message: "Lỗi server: " + error.message });
    }
};

module.exports = {
    getTopRecipes,
    getTopUsers,
    triggerSnapshot
};