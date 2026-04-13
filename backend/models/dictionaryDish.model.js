const { pool } = require('../config/db');
const RecipeLinkModel = require('./recipe_link.model');

const DictionaryDish = {
    // Lấy danh sách có phân trang và tìm kiếm
    getAll: async (limit, offset, search = '') => {
        const searchTerm = `%${search}%`;
        const query = `
            SELECT * FROM Dictionary_Dishes 
            WHERE original_name LIKE ? OR english_name LIKE ? 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        `;
        const [rows] = await pool.execute(query, [searchTerm, searchTerm, String(limit), String(offset)]);
        return rows;
    },

    // Đếm tổng số bản ghi để phân trang
    countAll: async (search = '') => {
        const searchTerm = `%${search}%`;
        const query = `
            SELECT COUNT(*) as total 
            FROM Dictionary_Dishes 
            WHERE original_name LIKE ? OR english_name LIKE ?
        `;
        const [rows] = await pool.execute(query, [searchTerm, searchTerm]);
        return rows[0].total;
    },

    // Lấy chi tiết một món ăn
    getById: async (id) => {
        const query = `SELECT * FROM Dictionary_Dishes WHERE dish_id = ?`;
        const [rows] = await pool.execute(query, [id]);
        return rows[0];
    },

    getEateriesByDishId: async (id) => {
        const [eateries] = await pool.execute(
            `SELECT name, address FROM Dish_Eateries WHERE dish_id = ?`, [id]
        );
        return eateries;
    },

    getMapSummary: async () => {
        const query = `
            SELECT 
                d.country, 
                c.lat, c.lng, 
                COUNT(*) as total_dishes,
                (SELECT image_url FROM Dictionary_Dishes d2 
                 WHERE d2.country = d.country ORDER BY point DESC LIMIT 1) as top_dish_image,
                (SELECT original_name FROM Dictionary_Dishes d2 
                 WHERE d2.country = d.country ORDER BY point DESC LIMIT 1) as top_dish_name
            FROM Dictionary_Dishes d
            JOIN Countries_Coordinates c ON d.country = c.country_name
            GROUP BY d.country
        `;
        const [rows] = await pool.execute(query);
        return rows;
    },

    getMapAllDishes: async () => {
        const query = `
            SELECT dish_id, original_name, english_name, description, image_url, point, country, latitude, longitude 
            FROM Dictionary_Dishes 
            WHERE latitude IS NOT NULL
        `;
        const [rows] = await pool.execute(query);
        return rows;
    },

    getFullDetail: async (id) => {
        // 1. Lấy thông tin cơ bản của món ăn
        const [dishRows] = await pool.execute(
            `SELECT * FROM Dictionary_Dishes WHERE dish_id = ?`, [id]
        );
        if (dishRows.length === 0) return null;
        const dish = dishRows[0];

        // 2. Lấy danh sách địa điểm ăn uống (Eateries)
        const [eateries] = await pool.execute(
            `SELECT name, address FROM Dish_Eateries WHERE dish_id = ?`, [id]
        );

        // 3. Lấy danh sách công thức liên kết (Recipes)
        // const recipes = await RecipeLinkModel.getRecipesByPost(id, 'dish');

        return { ...dish, eateries};
    }


};

module.exports = DictionaryDish;