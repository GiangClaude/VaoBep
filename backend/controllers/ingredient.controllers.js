const db = require('../config/db'); 
const IngredientModel = require('../models/ingredient.model');

// 2. Định nghĩa pool bằng cách lấy từ đối tượng db
const pool = db.pool;

const getAllIngredients = async (req, res) => {
    try {
        const result = await IngredientModel.getAll();
        const rows = result;
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi khi lấy danh sách nguyên liệu' });
    }
}

module.exports = {
    getAllIngredients
};