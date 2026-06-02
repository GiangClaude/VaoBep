// VỊ TRÍ: backend/controllers/admin/adminRecipe.controller.js
const adminRecipeService = require('../../services/admin/adminRecipe.service');
const asyncHandler = require('../../utils/asyncHandler');

const getRecipes = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const sortKey = req.query.sortKey || 'created_at';
    const sortOrder = req.query.sortOrder || 'DESC';

    const result = await adminRecipeService.getRecipes(page, limit, search, sortKey, sortOrder);

    res.status(200).json({
        data: result.recipes,
        pagination: { page, limit, total: result.total, totalPages: result.totalPages }
    });
});

const hideRecipe = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const targetStatus = await adminRecipeService.hideRecipe(id, req.body.status);
    res.status(200).json({ message: `Recipe status updated to ${targetStatus}` });
});

const getRecipeDetail = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const recipe = await adminRecipeService.getRecipeDetail(id);
    res.status(200).json({ data: recipe });
});

const createAdminRecipe = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const recipeId = await adminRecipeService.createAdminRecipe(userId, req.body, req.file);
    res.status(201).json({ message: 'Tạo công thức thành công', recipeId });
});

const updateRecipe = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await adminRecipeService.updateRecipe(id, req.body);
    res.status(200).json({ message: 'Cập nhật công thức thành công' });
});

module.exports = { getRecipes, hideRecipe, createAdminRecipe, getRecipeDetail, updateRecipe };