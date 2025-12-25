// ingredients.model.js
const db = require('../config/db');
const pool = db.pool;

class Ingredient {
    // ... các hàm create, update cũ của bạn ...
    static async getAll() {
        const [rows] = await pool.execute('SELECT * FROM ingredients');
        return rows;
    }

    // --- HÀM MỚI CHUYỂN SANG ---
    static async getByRecipeIds(recipeIds) {
        if (!recipeIds || recipeIds.length === 0) return [];
        
        // Tạo chuỗi dấu ? cho câu query IN (...)
        const placeholders = recipeIds.map(() => '?').join(',');
        
        // Query bảng trung gian recipe_ingredients JOIN với Ingredients
        const sql = `
            SELECT ri.recipe_id, i.name
            FROM recipe_ingredients ri
            JOIN Ingredients i ON ri.ingredient_id = i.ingredient_id
            WHERE ri.recipe_id IN (${placeholders})
        `;
        
        const [rows] = await pool.execute(sql, recipeIds);
        return rows;
    }
}

module.exports = Ingredient;