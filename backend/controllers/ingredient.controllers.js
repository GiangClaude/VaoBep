const IngredientService = require('../services/ingredient.service');
const asyncHandler = require('../utils/asyncHandler');

const getAllIngredients = asyncHandler(async (req, res) => {
    // Controller chỉ gọi Service, không gọi Model
    const rows = await IngredientService.getAllIngredients();
    
    // Giữ nguyên y hệt định dạng trả về cũ để không gãy Frontend
    res.json(rows);
});

module.exports = {
    getAllIngredients
};