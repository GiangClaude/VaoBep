const db = require('../config/db');
const pool = db.pool;

class TagModel {
    static async getAll() {
        try {
            // Lấy tất cả các tag, sắp xếp theo tên
            const sql = "SELECT * FROM Tags ORDER BY name ASC";
            const [rows] = await pool.execute(sql);
            return rows;
        } catch (error) {
            console.error("Lỗi TagModel.getAll:", error);
            throw error;
        }
    }
}

module.exports = TagModel;