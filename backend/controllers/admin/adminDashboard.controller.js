// VỊ TRÍ: backend/controllers/admin/adminDashboard.controller.js
const adminDashboardService = require('../../services/admin/adminDashboard.service');
const asyncHandler = require('../../utils/asyncHandler');

const getDashboardStats = asyncHandler(async (req, res) => {
    const stats = await adminDashboardService.getDashboardStats();

    res.status(200).json({
        ...stats,
        message: 'Get stats successfully'
    });
});

module.exports = { getDashboardStats };