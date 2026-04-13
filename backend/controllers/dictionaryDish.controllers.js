const DictionaryDish = require('../models/dictionaryDish.model');
const DictionaryDishService = require('../utils/dictionaryDish.service');
const RecipeLinkModel = require('../models/recipe_link.model');
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
        const [dish, eateries, recipes] = await Promise.all([
            DictionaryDish.getById(id),
            DictionaryDish.getEateriesByDishId(id), // Gọi từ Model Dish
            RecipeLinkModel.getRecipesByPost(id, 'dish') // Gọi từ Model liên kết
        ]);
        // console.log("Dish detail: ", req);
        let interactionState = null;
        const userId = getUserIdFromToken(req);
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


module.exports = {
    getAllDishes,
    getDishDetail,
    getMapSummary,
    getMapAllDishes
};