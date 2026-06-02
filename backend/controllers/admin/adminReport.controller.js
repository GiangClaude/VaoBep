// VỊ TRÍ: backend/controllers/admin/adminReport.controller.js
const adminReportService = require('../../services/admin/adminReport.service');
const asyncHandler = require('../../utils/asyncHandler');

const getReports = asyncHandler(async (req, res) => {
    const reports = await adminReportService.getReports();
    res.status(200).json({ data: reports });
});

const processReport = asyncHandler(async (req, res) => {
    const { report_id, action, post_id, post_type } = req.body;
    
    const message = await adminReportService.processReport(report_id, action, post_id, post_type);
    
    res.status(200).json({ message });
});

module.exports = { getReports, processReport };