const { v4: uuidv4 } = require('uuid');
const RecipeModel = require('../../models/recipe.model');
const path = require('path');
const fs = require('fs');
const { addVectorSyncJob } = require('../../services/vectorQueue.service');

const getRecipes = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';

        const sortKey = req.query.sortKey || 'created_at';
        const sortOrder = req.query.sortOrder || 'DESC';

        const offset = (page - 1) * limit;

        const recipes = await RecipeModel.getAllRecipesForAdmin(limit, offset, search, sortKey, sortOrder);
        const total = await RecipeModel.countAllRecipes(search);

        res.status(200).json({
            data: recipes,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const hideRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const targetStatus = status || 'banned';

        await RecipeModel.updateStatus(id, targetStatus);
        if (targetStatus === 'public' || targetStatus === 'hidden') {
            addVectorSyncJob(id, 'recipe', 'upsert');
        } else {
            addVectorSyncJob(id, 'recipe', 'delete');
        }
        res.status(200).json({ message: `Recipe status updated to ${targetStatus}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getRecipeDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const recipe = await RecipeModel.findById(id);
        if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
        res.status(200).json({ data: recipe });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createAdminRecipe = async (req, res) => {
    try {
        const userId = req.user.id;
        const recipeId = uuidv4();

        const { title, description, instructions, servings, cook_time, total_calo, ingredients, tags } = req.body;

        let coverImage = 'default.png';
        if (req.file) {
            coverImage = req.file.filename;
            const tempPath = req.file.path;
            const targetDir = path.join(__dirname, '../../public/recipes', recipeId);
            const targetPath = path.join(targetDir, coverImage);
            try {
                if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
                fs.renameSync(tempPath, targetPath);
            } catch (moveError) {
                console.error('Lỗi di chuyển ảnh:', moveError);
            }
        }

        let ingredientsData = [];
        if (ingredients) {
            try {
                const rawIngredients = JSON.parse(ingredients);
                ingredientsData = rawIngredients.map(item => ({
                    name: item.name?.trim(),
                    unit: item.unit?.trim(),
                    quantity: parseFloat(item.quantity) || 0
                })).filter(item => item.name && item.unit);
            } catch (e) {
                return res.status(400).json({ message: 'Dữ liệu nguyên liệu không hợp lệ' });
            }
        }

        let tagsData = [];
        if (tags) {
            try { tagsData = JSON.parse(tags); } catch (e) { }
        }

        if (!title || !instructions) {
            return res.status(400).json({ message: 'Tên món và hướng dẫn không được để trống' });
        }

        await RecipeModel.create({
            recipeId,
            userId,
            title,
            description,
            instructions,
            coverImage,
            servings: parseInt(servings) || 1,
            cookTime: parseInt(cook_time) || 0,
            totalCalo: parseFloat(total_calo) || 0,
            ingredientsData,
            status: 'public',
            tags: tagsData
        });

        addVectorSyncJob(recipeId, 'recipe', 'upsert');

        res.status(201).json({ message: 'Tạo công thức thành công', recipeId });
    } catch (error) {
        console.error('Create Admin Recipe Error:', error);
        res.status(500).json({ message: error.message });
    }
};

const updateRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, is_trust } = req.body;
        await RecipeModel.adminUpdate(id, { status, is_trust });
        if (status) {
            if (status === 'public' || status === 'hidden') {
                addVectorSyncJob(id, 'recipe', 'upsert');
            } else {
                addVectorSyncJob(id, 'recipe', 'delete');
            }
        } else {
            // Nếu chỉ update is_trust mà không đổi status, vẫn gọi upsert để AI cập nhật metadata
            addVectorSyncJob(id, 'recipe', 'upsert');
        }
        res.status(200).json({ message: 'Cập nhật công thức thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getRecipes, hideRecipe, createAdminRecipe, getRecipeDetail, updateRecipe };
