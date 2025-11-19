const RecipeModel = require('../models/recipe.model');
const paginationHelper = require('../utils/paginationHelper');
const { checkRecipeOwner } = require('../utils/recipe.utils');
// const paginationHelper;//Thêm vào utils

const createRecipe = async(req, res) => {
    try {
        const userId = req.user.user_id;

        const {title, description, instructions, ingredients} = req.body;

        // 3. (Kiểm tra dữ liệu đầu vào...)
        if (!title || !instructions) {
            return res.status(400).json({ message: "Title và instructions là bắt buộc." });
        }

        // Đoạn này cần gọi hàm để tính total Calo!

        // 4. Gọi Model để tạo mới
        const newRecipe = await RecipeModel.create(
            userId, 
            title, 
            description, 
            instructions, 
            ingredients
        );

        res.status(201).json({
            message: "Tạo công thức thành công!",
            data: newRecipe
        });
    } catch (err) {
        res.status(500).json({
            message: "Lỗi " + err.message
        });
    }
}

const updateRecipe = async(req, res) => {
    try {
        const {recipeId} = req.params;
        const userId = req.user.user_id;
        const {recipeData, ingredientsList } = req.body;

        const canEdit = await checkRecipeOwner(recipeId, userId);

        if (!canEdit) {
            return res.status(403).json({
                message: 'Forbidden: Không có quyền chỉnh sửa công thức người khác!'
            })
        }

        if (!recipeData || !ingredientsList){
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu đầu vào không hợp lệ'
            })
        }

        const result = await RecipeModel.update(recipeId, recipeData, ingredientsList);

        return res.status(200).json({
            success: true,
            message: result.message,
            Notification: result.notification
        });
    } catch(err){
        console.log("Lỗi update Control: ", err.message);
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

const deleteRecipe = async(req, res) => {
    try {
        const {recipeId} = req.params;
        const userId = req.user.user_id;

        const canEdit = await checkRecipeOwner(recipeId, userId);

        if (!canEdit) {
            return res.status(403).json({
                message: 'Forbidden: Không có quyền chỉnh sửa công thức người khác!'
            })
        }

        const result = await RecipeModel.deleteById(recipeId);

        return res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch {
        console.log("Lỗi delete Control: ", err.message);
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

const getRecipeById = async(req, res) => {
    try {
        const {recipeId} = req.params;

        
        const recipeData = await RecipeModel.findById(recipeId);

        if (!recipeData) {
            return res.status(404).json({
                success:false,
                message: 'Không tìm thấy công thức'
            })
        }

        return res.status(200).json({
            success: true,
            data: recipeData
        })
    } catch (error) {
        console.error('Lỗi khi lấy chi tiết công thức: ', error);
        res.status(500).json({
            error: "Có gì đó sai ở đây!"
        });
    }
}


const getRecipes = async(req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        // Lấy các tham số lọc từ req.query
        const filters = {
            // Chuyển chuỗi (ví dụ: "tag1,tag2") thành mảng
            ingredients: req.query.ingredients ? req.query.ingredients.split(',') : null,
            tags: req.query.tags ? req.query.tags.split(',') : null,
            minRating: req.query.minRating,
            minCalo: req.query.minCalo
            // ... (các filters khác)
        };

        const {recipes, totalItems} = await RecipeModel.getRecipes(page, limit, filters);

        const pagination = paginationHelper.createPagination(page, limit, totalItems);

        res.status(200).json({
            message: "Lấy danh sách công thức thành công",
            data: recipes,
            pagination:pagination
        })
    } catch(err) {
        res.status(500).json({
            message: "Lỗi " + err.message
        })
    }
}

const getRecentlyRecipes = async(req, res) => {
    try {
        const category = req.query.category || null;
        const tag = req.query.tag || null;

        const recipes = await RecipeModel.getRecentlyRecipes(category, tag, 10);

        if (recipes.length > 0) {
            res.status(200).json({
                message: "Lấy danh sách thành công",
                data: recipes
            })
        } else {
            res.status(404).json({
                message: "Không tìm thấy công thức nào gần đây"
            });
        }
    }   catch (err) {
        res.status(500).json({
            message: "Lỗi " + err.message
        });
    }
}

const getFeatureRecipes = async(req, res) => {
    try {
        const recipes = await RecipeModel.getFeatureRecipes();
        console.log("Vua lay recipe xong!");
        if (recipes.length <= 0) {
            res.status(404).json({
                message: "Khong cos feature thoa man",
            })
        } else {
            res.status(200).json({
                message: "Đã lấy được recipe đặc bịt!",
                data: recipes,
                count: recipes.length
            })
        }
    } catch (err) {
        res.status(500).json({
            message: "Lỗi " + err.message
        });
    }
}

module.exports = {
    getRecipes,
    getRecentlyRecipes,
    getFeatureRecipes,
    createRecipe, 
    updateRecipe,
    getRecipeById,
    deleteRecipe
}