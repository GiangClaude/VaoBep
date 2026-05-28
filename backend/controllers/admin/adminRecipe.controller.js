const { v4: uuidv4 } = require('uuid');
const RecipeModel = require('../../models/recipe.model');
const path = require('path');
const fs = require('fs');
const { addVectorSyncJob } = require('../../services/vectorQueue.service');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/AppError');

const getRecipes = asyncHandler(async (req, res) => {
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
});

const hideRecipe = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const targetStatus = status || 'banned';

    await RecipeModel.updateStatus(id, targetStatus);
    if (targetStatus === 'public' || targetStatus === 'hidden') addVectorSyncJob(id, 'recipe', 'upsert');
    else addVectorSyncJob(id, 'recipe', 'delete');
    res.status(200).json({ message: `Recipe status updated to ${targetStatus}` });
});

const getRecipeDetail = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const recipe = await RecipeModel.findById(id);
    if (!recipe) throw new AppError('Recipe not found', 404);
    res.status(200).json({ data: recipe });
});

const createAdminRecipe = asyncHandler(async (req, res) => {
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
            throw new AppError('Dữ liệu nguyên liệu không hợp lệ', 400);
        }
    }

    let tagsData = [];
    if (tags) {
        try { tagsData = JSON.parse(tags); } catch (e) { }
    }

    if (!title || !instructions) throw new AppError('Tên món và hướng dẫn không được để trống', 400);

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
});

const updateRecipe = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, is_trust } = req.body;
    await RecipeModel.adminUpdate(id, { status, is_trust });
    if (status) {
        if (status === 'public' || status === 'hidden') addVectorSyncJob(id, 'recipe', 'upsert');
        else addVectorSyncJob(id, 'recipe', 'delete');
    } else {
        addVectorSyncJob(id, 'recipe', 'upsert');
    }
    res.status(200).json({ message: 'Cập nhật công thức thành công' });
});

module.exports = { getRecipes, hideRecipe, createAdminRecipe, getRecipeDetail, updateRecipe };
