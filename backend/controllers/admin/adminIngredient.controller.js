const { v4: uuidv4 } = require('uuid');
const IngredientModel = require('../../models/ingredient.model');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/AppError');

const getPendingIngredients = asyncHandler(async (req, res) => {
    const ingredients = await IngredientModel.getPendingIngredients();
    res.status(200).json({ data: ingredients });
});

const processIngredient = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { action, calo_per_100g } = req.body;

    if (action === 'approve') {
        await IngredientModel.updateStatus(id, 'approved');
        if (calo_per_100g) await IngredientModel.updateCalo(id, calo_per_100g);
        res.status(200).json({ message: 'Ingredient approved' });
    } else if (action === 'reject') {
        await IngredientModel.updateStatus(id, 'reject');
        res.status(200).json({ message: 'Ingredient rejected' });
    } else {
        throw new AppError('Invalid action', 400);
    }
});

const getAllIngredients = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const sortKey = req.query.sortKey || 'name';
    const sortOrder = req.query.sortOrder || 'ASC';
    const offset = (page - 1) * limit;

    const ingredients = await IngredientModel.getAllAdmin(limit, offset, search, sortKey, sortOrder);
    const total = await IngredientModel.countAllAdmin(search);

    res.status(200).json({
        data: ingredients,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
});

const createIngredient = asyncHandler(async (req, res) => {
    const { name, calo_per_100g, status } = req.body;
    if (!name) throw new AppError('Tên nguyên liệu không được để trống', 400);

        const ingredientId = uuidv4();
        const ingStatus = status || 'approved';

        await IngredientModel.create(ingredientId, name.trim(), ingStatus);

        if (calo_per_100g !== undefined && calo_per_100g !== null && calo_per_100g !== '') {
            await IngredientModel.updateCalo(ingredientId, calo_per_100g);
        }

    res.status(201).json({ message: 'Thêm nguyên liệu thành công', ingredientId });
});

const updateIngredient = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, calo_per_100g, status } = req.body;

    if (name) await IngredientModel.updateName(id, name.trim());
    if (calo_per_100g !== undefined && calo_per_100g !== null && calo_per_100g !== '') await IngredientModel.updateCalo(id, calo_per_100g);
    if (status) await IngredientModel.updateStatus(id, status);

    res.status(200).json({ message: 'Cập nhật nguyên liệu thành công' });
});

const deleteIngredient = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        await IngredientModel.delete(id);
        res.status(200).json({ message: 'Xóa nguyên liệu thành công' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') throw new AppError('Không thể xóa nguyên liệu này vì đang được sử dụng trong công thức.', 400);
        throw error;
    }
});

module.exports = { getPendingIngredients, processIngredient, getAllIngredients, createIngredient, updateIngredient, deleteIngredient };
