const db = require('../config/db');
const DictionaryDish = require('../models/dictionaryDish.model');
const DictionaryDishService = require('../utils/dictionaryDish.service');
const RecipeLinkModel = require('../models/recipe_link.model');
// const RecipeModel = require('../models/recipe.model');
const InteractionModel = require('../models/interaction.model');
const { createPagination } = require('../utils/paginationHelper');
// const { getUserById } = require('../config/db');
const { getUserIdFromToken } = require('../utils/auth.utils');

const getAllDishes = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        const totalItems = await DictionaryDish.countAll(search);
        const dishes = await DictionaryDish.getAll(limit, offset, search);

        const pagination = createPagination(page, limit, totalItems);

        res.status(200).json({
            success: true,
            data: {
                dishes,
                pagination
            }
        });
    } catch (error) {
        console.error('Error in getAllDishes:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};



const getDishDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = getUserIdFromToken(req);
        const [dish, eateries, recipes] = await Promise.all([
            DictionaryDish.getById(id),
            DictionaryDish.getEateriesByDishId(id), // Gọi từ Model Dish
            RecipeLinkModel.getRecipesByPost(userId, id, 'dish') // Gọi từ Model liên kết
        ]);
        console.log("Dish detail: ", recipes);
        let interactionState = null;
        console.log("User ID from token:", userId); // Debug log để kiểm tra userId
        if (userId) {
            interactionState= await InteractionModel.getUserInteractionState(userId, id, 'dish');
        }

        if (!dish) {
            return res.status(404).json({ success: false, message: 'Dish not found' });
        }

        res.status(200).json({
            success: true,
            data: {
                ...dish,
                eateries,
                recipes,
                interactionState
            }
        });
    } catch (error) {
        console.error('Error in getDishDetail:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const getMapSummary = async (req, res) => {
    try {
        const rows = await DictionaryDish.getMapSummary();
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// API 2: Lấy tất cả món ăn kèm tọa độ rải rác (Dành cho Zoom in)
const getMapAllDishes = async (req, res) => {
    try {
        const rows = await DictionaryDish.getMapAllDishes();
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const voteRecipeForDish = async (req, res) => {
    const connection = await db.pool.getConnection();
    try {
        const { id: dishId } = req.params; // ID của món ăn từ điển
        const { recipeId } = req.body;     // ID của công thức được vote/đề xuất
        const userId = req.user.user_id;;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Bạn cần đăng nhập để thực hiện chức năng này' });
        }

        const result = await RecipeLinkModel.toggleVote(connection, userId, recipeId, dishId, 'dish');
        res.status(200).json({ success: true, message: 'Bình chọn thành công!', action: result.action });

    } catch (error) {
        await connection.rollback();
        console.error('Error in voteRecipeForDish:', error);
        res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
    } finally {
        connection.release();
    }
};


module.exports = {
    getAllDishes,
    getDishDetail,
    getMapSummary,
    getMapAllDishes,
    voteRecipeForDish
};