const ReportModel = require('../../models/report.model');
const RecipeModel = require('../../models/recipe.model');
const ArticleModel = require('../../models/article.model');
const asyncHandler = require('../../utils/asyncHandler');

const getReports = asyncHandler(async (req, res) => {
    const reports = await ReportModel.getPendingReports();
    res.status(200).json({ data: reports });
});

const processReport = asyncHandler(async (req, res) => {
    const { report_id, action } = req.body;
    await ReportModel.resolveReport(report_id);

    if (action === 'hide_content') {
        const { post_id, post_type } = req.body;
        if (post_type === 'recipe') await RecipeModel.updateStatus(post_id, 'hidden');
        else if (post_type === 'article') await ArticleModel.updateStatus(post_id, 'hidden');
        return res.status(200).json({ message: 'Report resolved & Content hidden' });
    }

    res.status(200).json({ message: 'Report resolved (Ignored)' });
});

module.exports = { getReports, processReport };
