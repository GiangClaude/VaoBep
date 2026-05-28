const DictionaryDishService = require('../services/dictionaryDish.service');
const { createPagination } = require('../utils/paginationHelper');
const { getUserIdFromToken } = require('../utils/auth.utils');
const asyncHandler = require('../utils/asyncHandler');

const getAllDishes = asyncHandler(async (req, res) => {
    // 1. Nhận data từ request
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    // 2. Chuyển qua Service xử lý
    const { totalItems, dishes } = await DictionaryDishService.getAllDishes(page, limit, search);

    // 3. Trả về format chuẩn
    res.status(200).json({
        success: true,
        data: { dishes, pagination: createPagination(page, limit, totalItems) }
    });
});

const getDishDetail = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = getUserIdFromToken(req);

    const dishData = await DictionaryDishService.getDishDetail(id, userId);

    res.status(200).json({ success: true, data: dishData });
});

const getMapSummary = asyncHandler(async (req, res) => {
    // Không gọi Model nữa, gọi Service
    const rows = await DictionaryDishService.getMapSummary();
    res.status(200).json({ success: true, data: rows });
});

const getMapAllDishes = asyncHandler(async (req, res) => {
    // Không gọi Model nữa, gọi Service
    const rows = await DictionaryDishService.getMapAllDishes();
    res.status(200).json({ success: true, data: rows });
});

const voteRecipeForDish = asyncHandler(async (req, res) => {
    const { id: dishId } = req.params;
    const { recipeId } = req.body;
    const userId = req.user.user_id;

    const action = await DictionaryDishService.voteRecipeForDish(dishId, recipeId, userId);

    res.status(200).json({ success: true, message: 'Bình chọn thành công!', action });
});

module.exports = { getAllDishes, getDishDetail, getMapSummary, getMapAllDishes, voteRecipeForDish };