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

    static async getPendingIngredients() {
        const query = `
            SELECT i.ingredient_id, i.name, i.status, c.calo_per_100g 
            FROM Ingredients i
            LEFT JOIN CaloForIngredients c ON i.ingredient_id = c.ingredient_id
            WHERE i.status = 'pending'
        `;
        const [rows] = await pool.execute(query); // Sửa db.execute -> pool.execute
        return rows;
    }

    // 2. Duyệt hoặc Từ chối nguyên liệu
    static async updateStatus(id, status){
        const query = `UPDATE Ingredients SET status = ? WHERE ingredient_id = ?`;
        const [result] = await pool.execute(query, [status, id]); // Sửa db.execute -> pool.execute
        return result;
    }
    
    // 3. Cập nhật Calo (Admin sửa lại calo cho đúng trước khi duyệt)
   static async updateCalo(id, calo) {
        const query = `
            INSERT INTO CaloForIngredients (ingredient_id, calo_per_100g) 
            VALUES (?, ?) 
            ON DUPLICATE KEY UPDATE calo_per_100g = ?
        `;
        const [result] = await pool.execute(query, [id, calo, calo]); // Sửa db.execute -> pool.execute
        return result;
    }
}

module.exports = Ingredient;