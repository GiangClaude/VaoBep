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

    // if (filters.tags && filters.tags.length > 0) {
    //     const placeholders = filters.tags.map(() => '?').join(', ');
        
    //     joinClauses.push('JOIN tag_post AS TP ON R.recipe_id = TP.post_id AND TP.post_type = "recipe"');
    //     whereClauses.push(`TP.tag_id IN (${placeholders})`);
    //     params.push(...filters.tags);
    // }

    if (filters.minRating) {
        whereClauses.push('R.rating_avg_score >= ?');
        params.push(parseFloat(filters.minRating));
    }

    if (filters.maxCalo) {
        whereClauses.push('R.total_calo <= ?');
        params.push(parseInt(filters.maxCalo, 10));
    }

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