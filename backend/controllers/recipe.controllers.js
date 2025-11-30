const IngredientModel = require('../models/ingredient.model');
const RecipeModel = require('../models/recipe.model');
const paginationHelper = require('../utils/paginationHelper');
const { checkRecipeOwner } = require('../utils/recipe.utils');
// const paginationHelper;//Thêm vào utils

const createRecipe = async (req, res) => {
    try {
        // 1. Lấy ID đã được tạo sẵn ở Middleware
        const recipeId = req.savedRecipeId; 
        const userId = req.user.user_id;

        // 2. Lấy dữ liệu văn bản
        // Lưu ý: ingredients gửi qua FormData thường là chuỗi JSON, cần parse lại
        let { title, description, instructions, ingredients } = req.body;
        
        if (typeof ingredients === 'string') {
            try {
                ingredients = JSON.parse(ingredients);
            } catch (e) {
                return res.status(400).json({ message: "Định dạng ingredients không hợp lệ" });
            }
        }

        // 3. Xử lý Ảnh Bìa (Cover Image) - Chỉ lấy file đầu tiên
        let coverImageUrl = null;
        if (req.files && req.files['cover_image'] && req.files['cover_image'].length > 0) {
            const file = req.files['cover_image'][0];
            // Tạo đường dẫn tương đối để Frontend dùng: /recipes/{id}/{filename}
            coverImageUrl = `/recipes/${recipeId}/${file.filename}`;
        }

        // 4. Xử lý Ảnh Thành Quả (Result Images) - Lấy danh sách
        let resultImagesList = [];
        if (req.files && req.files['result_images']) {
            resultImagesList = req.files['result_images'].map(file => ({
                url: `/recipes/${recipeId}/${file.filename}`,
                description: "Thành phẩm" // Tạm thời để mặc định, hoặc bạn có thể mở rộng logic để lấy caption từ body
            }));
        }

        // 5. Gọi Model để lưu tất cả
        // Lưu ý: Mình truyền thêm resultImagesList vào để Model xử lý transaction 1 lần cho an toàn
        const newRecipe = await RecipeModel.create(
            recipeId, 
            userId, 
            title, 
            description, 
            instructions, 
            ingredients, // Dữ liệu nguyên liệu
            coverImageUrl, 
            resultImagesList // Dữ liệu ảnh phụ
        );

        res.status(201).json({
            message: "Tạo công thức thành công!",
            data: newRecipe
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Lỗi server: " + err.message
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

const getOwnerRecipe = async(req, res) => {
    try {
        const userId = req.user.user_id;
        const recipes = await RecipeModel.getOwnerRecipe(userId);

        return res.status(200).json({
            success: true,
            data: recipes
        });
    } catch (error) {
        console.log('UserController: ', error.message);
        return res.status(500).json({
            success: false,
            message: "Có lỗi xảy ra phía server: " + error.message
        });
    }
}

const getUserRecipe = async(req, res) => {
    try {
        const {userId} = req.params;
        const recipes = await RecipeModel.getUserRecipe(userId);

        return res.status(200).json({
            success: true,
            data: recipes
        });
    } catch (error) {
        console.log('UserController: ', error.message);
        return res.status(500).json({
            success: false,
            message: "Có lỗi xảy ra phía server: " + error.message
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
    deleteRecipe,
    getOwnerRecipe, 
    getUserRecipe
}