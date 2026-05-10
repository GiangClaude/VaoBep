const { v4: uuidv4 } = require('uuid');
const IngredientModel = require('../../models/ingredient.model');

const getPendingIngredients = async (req, res) => {
    try {
        const ingredients = await IngredientModel.getPendingIngredients();
        res.status(200).json({ data: ingredients });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const processIngredient = async (req, res) => {
    try {
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
            res.status(400).json({ message: 'Invalid action' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllIngredients = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createIngredient = async (req, res) => {
    try {
        const { name, calo_per_100g, status } = req.body;
        if (!name) return res.status(400).json({ message: 'Tên nguyên liệu không được để trống' });

        const ingredientId = uuidv4();
        const ingStatus = status || 'approved';

        await IngredientModel.create(ingredientId, name.trim(), ingStatus);

        if (calo_per_100g !== undefined && calo_per_100g !== null && calo_per_100g !== '') {
            await IngredientModel.updateCalo(ingredientId, calo_per_100g);
        }

        res.status(201).json({ message: 'Thêm nguyên liệu thành công', ingredientId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Tên nguyên liệu đã tồn tại' });
        res.status(500).json({ message: error.message });
    }
};

const updateIngredient = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, calo_per_100g, status } = req.body;

        if (name) await IngredientModel.updateName(id, name.trim());
        if (calo_per_100g !== undefined && calo_per_100g !== null && calo_per_100g !== '') await IngredientModel.updateCalo(id, calo_per_100g);
        if (status) await IngredientModel.updateStatus(id, status);

        res.status(200).json({ message: 'Cập nhật nguyên liệu thành công' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Tên nguyên liệu đã tồn tại' });
        res.status(500).json({ message: error.message });
    }
};

const deleteIngredient = async (req, res) => {
    try {
        const { id } = req.params;
        await IngredientModel.delete(id);
        res.status(200).json({ message: 'Xóa nguyên liệu thành công' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') return res.status(400).json({ message: 'Không thể xóa nguyên liệu này vì đang được sử dụng trong công thức.' });
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getPendingIngredients, processIngredient, getAllIngredients, createIngredient, updateIngredient, deleteIngredient };
