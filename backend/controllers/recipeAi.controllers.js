// VỊ TRÍ TẠO FILE MỚI: backend/controllers/recipeAi.controllers.js

const recipeAiService = require('../services/recipeAi.service');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const analyzeRecipe = asyncHandler(async (req, res) => {
    const { recipeContext } = req.body;
    if (!recipeContext) throw new AppError('Thiếu dữ liệu công thức (recipeContext)', 400);

    const summary = await recipeAiService.generateRecipeSummary(recipeContext);
    return res.status(200).json({ success: true, data: summary });
});

const chatAboutRecipe = asyncHandler(async (req, res) => {
    const { recipeContext, chatHistory } = req.body;
    if (!recipeContext || !chatHistory || !Array.isArray(chatHistory)) {
        throw new AppError('Thiếu dữ liệu công thức hoặc lịch sử chat không hợp lệ', 400);
    }

    const answer = await recipeAiService.answerRecipeChat(recipeContext, chatHistory);
    return res.status(200).json({ success: true, data: answer });
});

module.exports = { analyzeRecipe, chatAboutRecipe };