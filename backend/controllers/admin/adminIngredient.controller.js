// VỊ TRÍ: backend/controllers/admin/adminIngredient.controller.js
const adminIngredientService = require('../../services/admin/adminIngredient.service');
const asyncHandler = require('../../utils/asyncHandler');

const getPendingIngredients = asyncHandler(async (req, res) => {
    const ingredients = await adminIngredientService.getPendingIngredients();
    res.status(200).json({ data: ingredients });
});

const processIngredient = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { action, calo_per_100g } = req.body;
    const message = await adminIngredientService.processIngredient(id, action, calo_per_100g);
    res.status(200).json({ message });
});

const getAllIngredients = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const sortKey = req.query.sortKey || 'name';
    const sortOrder = req.query.sortOrder || 'ASC';

    const result = await adminIngredientService.getAllIngredients(page, limit, search, sortKey, sortOrder);

    res.status(200).json({
        data: result.ingredients,
        pagination: { page, limit, total: result.total, totalPages: result.totalPages }
    });
});

const createIngredient = asyncHandler(async (req, res) => {
    const { name, calo_per_100g, status } = req.body;
    const ingredientId = await adminIngredientService.createIngredient(name, calo_per_100g, status);
    res.status(201).json({ message: 'Thêm nguyên liệu thành công', ingredientId });
});

const updateIngredient = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, calo_per_100g, status } = req.body;
    await adminIngredientService.updateIngredient(id, name, calo_per_100g, status);
    res.status(200).json({ message: 'Cập nhật nguyên liệu thành công' });
});

const deleteIngredient = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await adminIngredientService.deleteIngredient(id);
    res.status(200).json({ message: 'Xóa nguyên liệu thành công' });
});

module.exports = { getPendingIngredients, processIngredient, getAllIngredients, createIngredient, updateIngredient, deleteIngredient };