const db = require('../config/db');
const pool = db.pool;
/**
 * Xây dựng các mảnh SQL dựa trên tham số lọc
 * @param {object} filters - Các tham số lọc từ req.query (tag, rating, calo, etc.)
 * @returns {object} {joinClauses, whereClauses, params}
 */

const buildRecipeQuery = (filters) => {
    let joinClauses = [];
    let whereClauses = ['R.status = "public"'];
    let params = [];

    if (filters.ingredients && filters.ingredients.length > 0){
        
        const placeholders = filters.ingredients.map(() => '?').join(', ');

        joinClauses.push('JOIN Recipe_Ingredients AS RI ON R.recipe_id = RI.recipe_id');
        whereClauses.push(`RI.ingredient_name IN (${placeholders})`);
        params.push(...filters.ingredients);
    }

    if (filters.keyword) {
        whereClauses.push('R.title LIKE ?');
        params.push(`%${filters.keyword}%`);
    }
    // 2. Lọc theo Nguyên liệu
    if (filters.ingredients && filters.ingredients.length > 0){
        const placeholders = filters.ingredients.map(() => '?').join(', ');
        // Logic lọc này có thể cần sửa lại nếu muốn tìm món chứa "tất cả" nguyên liệu (hiện tại là "bất kỳ")
        // Nhưng tạm thời giữ nguyên logic cũ của bạn
        joinClauses.push('JOIN Recipe_Ingredients AS RI ON R.recipe_id = RI.recipe_id');
        joinClauses.push('JOIN Ingredients AS Ing ON RI.ingredient_id = Ing.ingredient_id');
        whereClauses.push(`Ing.name IN (${placeholders})`);
        params.push(...filters.ingredients);
    }

    // 3. Lọc theo Tags (Category) - ĐÃ MỞ COMMENT
    if (filters.tags && filters.tags.length > 0) {
        const placeholders = filters.tags.map(() => '?').join(', ');
        
        // Chỉ cần Join bảng trung gian tag_post là đủ
        joinClauses.push('JOIN tag_post AS TP ON R.recipe_id = TP.post_id AND TP.post_type = "recipe"');
        
        // So sánh trực tiếp tag_id
        whereClauses.push(`TP.tag_id IN (${placeholders})`);
        params.push(...filters.tags);
    }

    if (filters.cookingTime) {
        // Frontend gửi lên: "0-30", "30-60", "60+"
        if (filters.cookingTime === '0-30') {
            whereClauses.push('R.cook_time < 30');
        } else if (filters.cookingTime === '30-60') {
            whereClauses.push('(R.cook_time >= 30 AND R.cook_time <= 60)');
        } else if (filters.cookingTime === '60+') {
            whereClauses.push('R.cook_time > 60');
        }
    }

    // --- [THÊM MỚI] LOGIC ĐỘ KHÓ ---
    // Lưu ý: Hiện tại DB bảng Recipes chưa có cột 'difficulty'. 
    // Nếu bạn đã thêm cột này vào DB thì bỏ comment dòng dưới.
    /*
    if (filters.difficulty) {
        whereClauses.push('R.difficulty = ?');
        params.push(filters.difficulty);
    }
    */


    // if (filters.tags && filters.tags.length > 0) {
    //     const placeholders = filters.tags.map(() => '?').join(', ');
        
    //     joinClauses.push('JOIN tag_post AS TP ON R.recipe_id = TP.post_id AND TP.post_type = "recipe"');
    //     whereClauses.push(`TP.tag_id IN (${placeholders})`);
    //     params.push(...filters.tags);
    // }

    if (filters.minRating && !isNaN(parseFloat(filters.minRating))) {
        whereClauses.push('R.rating_avg_score >= ?');
        params.push(parseFloat(filters.minRating));
    }

    if (filters.maxCalo) {
        whereClauses.push('R.total_calo <= ?');
        params.push(parseInt(filters.maxCalo, 10));
    }

    console.log("Debug buildRecipeQuery:", {joinClauses, whereClauses, params});

    return {joinClauses, whereClauses, params};
}

const checkRecipeOwner = async (recipeId, userId) => {
    if (!recipeId || !userId) return false;
    try {
        const sql = 'SELECT user_id FROM Recipes WHERE recipe_id = ?';
        const [owner] = await pool.execute(sql, [recipeId]);

        if (owner.length === 0) {
            return false;
        }

        const ownerId = owner[0].user_id;

        return ownerId === userId;
    } catch(error) {
        console.error("Lỗi khi kiểm tra quyền sở hữu recipe:", error);
        // An toàn là trên hết: trả về false nếu có lỗi DB
        return false;     
    }
}

module.exports = {
    buildRecipeQuery,
    checkRecipeOwner
};