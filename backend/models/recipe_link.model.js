const db = require('../config/db');
const pool = db.pool;

class RecipeLinkModel {
    /**
     * Thêm các liên kết recipe vào một bài viết (Article)
     * @param {object} connection - Kết nối đang chạy Transaction
     * @param {string} sourceId - ID của Article
     * @param {array} linkedRecipeIds - Mảng các UUID của Recipe
     */
    static async addRecipeLinksToArticle(connection, sourceId, linkedRecipeIds) {
        // Giải thích: Hàm này dùng để chèn hàng loạt (Bulk Insert) 
        // vào bảng Recipe_Post_Links với type là 'recipe'
        if (!linkedRecipeIds || linkedRecipeIds.length === 0) return;

        const values = [];
        const placeholders = linkedRecipeIds.map(recipeId => {
            values.push(sourceId, recipeId, 'recipe');
            return '(?, ?, ?)';
        }).join(', ');

        const sql = `
            INSERT INTO Recipe_Post_Links (source_recipe_id, linked_post_id, linked_post_type) 
            VALUES ${placeholders}
        `;

        // Sử dụng connection truyền vào để đảm bảo tính nhất quán của Transaction
        await connection.execute(sql, values);
    }

    /**
     * Cập nhật liên kết (Xóa cũ - Thêm mới)
     * @param {object} connection - Kết nối đang chạy Transaction
     * @param {string} articleId - ID của Article
     * @param {array} newRecipeIds - Mảng ID recipe mới
     */
    static async updateRecipeLinksForArticle(connection, articleId, newRecipeIds) {
        // Giải thích: Trước khi thêm mới, ta phải dọn dẹp các liên kết cũ 
        // của bài viết này để tránh trùng lặp hoặc dư thừa.
        
        // 1. Xóa toàn bộ liên kết recipe cũ của Article này
        const sqlDelete = `
            DELETE FROM Recipe_Post_Links 
            WHERE source_recipe_id = ? AND linked_post_type = 'recipe'
        `;
        await connection.execute(sqlDelete, [articleId]);

        // 2. Gọi lại hàm add để thêm mảng mới
        if (newRecipeIds && newRecipeIds.length > 0) {
            await this.addRecipeLinksToArticle(connection, articleId, newRecipeIds);
        }
    }

    /**
     * Lấy danh sách Recipe đã gắn vào Article
     * @param {string} articleId 
     */
    static async getLinkedRecipesByArticleId(articleId) {
        // Giải thích: Hàm này join sang bảng Recipes để lấy thông tin hiển thị
        const sql = `
            SELECT r.recipe_id, r.title, r.cover_image, r.status, u.user_id as author_id, u.full_name as author_name
            FROM Recipes r
            JOIN Recipe_Post_Links rpl ON r.recipe_id = rpl.linked_post_id
            JOIN Users u ON r.user_id = u.user_id
            WHERE rpl.source_recipe_id = ? AND rpl.linked_post_type = 'recipe'
        `;
        const [rows] = await pool.execute(sql, [articleId]);
        return rows;
    }
}

module.exports = RecipeLinkModel;