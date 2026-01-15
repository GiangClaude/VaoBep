const db = require('../config/db');
const pool = db.pool;

const ArticleModel = {
    // Admin lấy tất cả bài viết (bao gồm hidden/draft)
    getAllArticlesForAdmin: async (limit, offset, search) => {
        let query = `
            SELECT a.*, u.full_name as author_name 
            FROM Article_Posts a
            JOIN Users u ON a.user_id = u.user_id
        `;
        let params = [];

        if (search) {
            query += ` WHERE a.title LIKE ? `;
            params.push(`%${search}%`);
        }

        query += ` ORDER BY a.created_at DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const [rows] = await pool.execute(query, params);
        return rows;
    },

    // Đếm tổng số bài viết để phân trang
    countAllArticles: async (search) => {
        let query = `SELECT COUNT(*) as total FROM Article_Posts`;
        let params = [];
        
        if (search) {
            query += ` WHERE title LIKE ?`;
            params.push(`%${search}%`);
        }

        const [rows] = await pool.execute(query, params);
        return rows[0].total;
    },

    // Cập nhật trạng thái bài viết (Ẩn/Hiện)
    updateStatus: async (articleId, status) => {
        const query = `UPDATE Article_Posts SET status = ? WHERE article_id = ?`;
        const [result] = await db.execute(query, [status, articleId]);
        return result;
    }
};

module.exports = ArticleModel;