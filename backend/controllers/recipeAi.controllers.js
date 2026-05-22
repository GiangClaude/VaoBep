// VỊ TRÍ TẠO FILE MỚI: backend/controllers/recipeAi.controllers.js

const recipeAiService = require('../services/recipeAi.service');

const analyzeRecipe = async (req, res) => {
    try {
        const { recipeContext } = req.body;
        
        if (!recipeContext) {
            return res.status(400).json({ success: false, message: 'Thiếu dữ liệu công thức (recipeContext)' });
        }

        const summary = await recipeAiService.generateRecipeSummary(recipeContext);
        
        return res.status(200).json({ success: true, data: summary });
    } catch (error) {
        console.error('Lỗi API analyzeRecipe:', error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const chatAboutRecipe = async (req, res) => {
    try {
        const { recipeContext, chatHistory } = req.body;

        if (!recipeContext || !chatHistory || !Array.isArray(chatHistory)) {
            return res.status(400).json({ success: false, message: 'Thiếu dữ liệu công thức hoặc lịch sử chat không hợp lệ' });
        }

        const answer = await recipeAiService.answerRecipeChat(recipeContext, chatHistory);

        return res.status(200).json({ success: true, data: answer });
    } catch (error) {
        console.error('Lỗi API chatAboutRecipe:', error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { analyzeRecipe, chatAboutRecipe };