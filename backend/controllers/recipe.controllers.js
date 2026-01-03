const { keyword } = require('color-convert');
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
        let { title, 
            description, 
            servings, 
            cook_time, // Frontend nên gửi key là cook_time hoặc cookTime (map ở dưới)
            cookTime,  // Backup nếu frontend gửi camelCase
            total_calo,
            totalCalo, // Backup
            ingredients, 
            instructions,
            tags
        } = req.body;
        
        const finalCookTime = cook_time || cookTime || 60;
        const finalTotalCalo = total_calo || totalCalo || 0;
        const finalServings = servings || 1;
        let finalTags = [];

        if (tags) {
        try {
            finalTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
        } catch (e) {
            // Handle error or ignore
        }
    }

        if (typeof ingredients === 'string') {
            try {
                ingredients = JSON.parse(ingredients);
            } catch (e) {
                return res.status(400).json({ message: "Định dạng ingredients không hợp lệ" });
            }
        }

        // 3. Xử lý Ảnh Bìa (Cover Image) - Chỉ lấy file đầu tiên
        let coverImageName = null;
        if (req.files && req.files['cover_image'] && req.files['cover_image'].length > 0) {
            const file = req.files['cover_image'][0];
            // Tạo đường dẫn tương đối để Frontend dùng: /recipes/{id}/{filename}
            coverImageName = file.filename;
        }

        // 4. Xử lý Ảnh Thành Quả (Result Images) - Lấy danh sách
        let resultImagesList = [];
        if (req.files && req.files['result_images']) {
            resultImagesList = req.files['result_images'].map(file => ({
                url: file.filename, 
                description: "Thành phẩm"
            }));
        }

        
        // 5. Gọi Model để lưu tất cả
        const newRecipe = await RecipeModel.create({
            recipeId,
            userId,
            title,
            description,
            instructions,
            coverImage: coverImageName,
            servings: finalServings,
            cookTime: finalCookTime,
            totalCalo: finalTotalCalo,
            ingredientsData:ingredients,
            status: req.body.status || 'draft',
            resultImages: resultImagesList,
            tags: finalTags
        });

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

// recipe.controllers.js

const updateRecipe = async(req, res) => {
    try {
        const { recipeId } = req.params;
        const userId = req.user.user_id;

        // 1. Kiểm tra quyền sở hữu
        const canEdit = await checkRecipeOwner(recipeId, userId);
        if (!canEdit) {
            return res.status(403).json({ message: 'Forbidden: Không có quyền chỉnh sửa!' })
        }

        // 2. Lấy dữ liệu từ FormData (req.body phẳng)
        let { 
            title, 
            description, 
            servings, 
            cookTime, cook_time, // Xử lý cả 2 case
            totalCalo, total_calo,
            ingredients, 
            instructions,
            status,
            tags
        } = req.body;

        // Chuẩn hóa dữ liệu số
        const finalCookTime = cookTime || cook_time || 60;
        const finalTotalCalo = totalCalo || total_calo || 0;
        const finalServings = servings || 1;
        let finalTags = null;

        if (tags !== undefined) {
         try {
            finalTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
            } catch (e) {}
         }
        // 3. Parse Ingredients từ JSON String (Vì gửi qua FormData)
        let ingredientsList = [];
        if (typeof ingredients === 'string') {
            try {
                ingredientsList = JSON.parse(ingredients);
            } catch (e) {
                console.error("Lỗi parse ingredients:", e);
                return res.status(400).json({ message: "Dữ liệu nguyên liệu lỗi format" });
            }
        } else {
            ingredientsList = ingredients; // Trường hợp gửi JSON raw (ít gặp nếu dùng FormData)
        }

        // 4. Gom dữ liệu để update bảng Recipes
        const recipeData = {
            title,
            description,
            instructions,
            servings: finalServings,
            cook_time: finalCookTime,
            total_calo: finalTotalCalo,
            status: status || 'draft',
            finalTags
        };

        // 5. Xử lý Ảnh Bìa (Nếu có upload ảnh mới)
        // Nếu không gửi ảnh mới -> req.files['cover_image'] sẽ undefined -> Giữ nguyên ảnh cũ (Logic Model sẽ lo hoặc phải handle ở đây)
        if (req.files && req.files['cover_image'] && req.files['cover_image'].length > 0) {
            recipeData.cover_image = req.files['cover_image'][0].filename;
        }

        // 6. Gọi Model
        // Lưu ý: Mapping field amount -> quantity để khớp với Model bên dưới
        const mappedIngredients = ingredientsList.map(item => ({
            name: item.name,
            unit: item.unit, // Gửi tên đơn vị xuống Model
            quantity: item.amount || item.quantity // Frontend gửi amount, DB cần quantity
        }));

        const result = await RecipeModel.update(recipeId, recipeData, mappedIngredients);

        return res.status(200).json({
            success: true,
            message: result.message,
            notification: result.notification
        });

    } catch(err){
        console.log("Lỗi update Control: ", err.message);
        return res.status(500).json({ success: false, message: err.message });
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
            minCalo: req.query.minCalo,
            keyword : req.query.keyword,

            cookingTime: req.query.cookingTime, // Nhận chuỗi "0-30", "30-60"...
            difficulty: req.query.difficulty
            // ... (các filters khác)
        };

        // [THÊM] Logic lấy current User ID (Optional Auth)
        let currentUserId = null;
        
        // Kiểm tra header Authorization xem có token không
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            try {
                const token = req.headers.authorization.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET); // Đảm bảo đúng biến môi trường
                currentUserId = decoded.user_id; // Hoặc decoded.id tùy cấu hình JWT của bạn
            } catch (error) {
                console.log("Token invalid or expired, treating as guest");
            }
        }

        const {recipes, totalItems} = await RecipeModel.getRecipes(page, limit, filters, currentUserId);

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

// 1. Thêm hàm này vào file
const getPreviewComments = async (req, res) => {
    try {
        const { recipeId } = req.params;
        
        // Gọi Model
        const comments = await RecipeModel.getPreviewComments(recipeId);

        return res.status(200).json({
            success: true,
            data: comments
        });
    } catch (error) {
        console.error("Lỗi getPreviewComments Controller:", error.message);
        return res.status(500).json({
            success: false,
            message: "Lỗi server: " + error.message
        });
    }
}

const changeRecipeStatus = async (req, res) => {
    try {
        const { recipeId } = req.params;
        const { status } = req.body;
        const userId = req.user.user_id;

        // 1. Validate trạng thái hợp lệ
        // Hiện tại chỉ cho phép: public, hidden, draft. 
        // Sau này muốn thêm 'locked' thì thêm vào mảng này là xong.
        // TUYỆT ĐỐI KHÔNG cho user gửi lên 'banned'.
        const validStatuses = ['public', 'hidden', 'draft']; 
        
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ 
                message: 'Trạng thái không hợp lệ! Chỉ chấp nhận: ' + validStatuses.join(', ') 
            });
        }

        // 2. Kiểm tra quyền sở hữu (Chỉ chủ bài viết mới được đổi)
        const canEdit = await checkRecipeOwner(recipeId, userId);
        if (!canEdit) {
            return res.status(403).json({ message: 'Bạn không có quyền thay đổi trạng thái bài viết này.' });
        }

        // 3. Gọi Model update
        const success = await RecipeModel.updateStatus(recipeId, status);

        if (success) {
            return res.status(200).json({ 
                success: true, 
                message: `Đã chuyển trạng thái sang "${status}" thành công!`,
                newStatus: status
            });
        } else {
            return res.status(404).json({ success: false, message: 'Không tìm thấy công thức để cập nhật.' });
        }

    } catch (err) {
        console.error("Lỗi changeStatus:", err.message);
        return res.status(500).json({ success: false, message: "Lỗi server: " + err.message });
    }
}

const getSavedRecipes = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        
        // Nhận sortKey (time, like, rating) và sortOrder (asc, desc) từ query
        const { sortKey, sortOrder } = req.query;

        let currentUserId = null;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            try {
                const token = req.headers.authorization.split(' ')[1];
                // Thay 'YOUR_SECRET_KEY' bằng process.env.JWT_SECRET thực tế của bạn
                const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); 
                currentUserId = decoded.user_id;
            } catch (e) { /* Token lỗi hoặc hết hạn thì coi như khách */ }
        }


        const result = await RecipeModel.getSavedRecipes(userId, sortKey, sortOrder, limit, page);

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách đã lưu thành công",
            data: result.recipes,
            pagination: paginationHelper.createPagination(page, limit, result.total)
        });
    } catch (error) {
        console.error("Lỗi getSavedRecipes:", error.message);
        return res.status(500).json({ success: false, message: "Lỗi server: " + error.message });
    }
};

module.exports = {
    getRecipes,
    getRecentlyRecipes,
    getFeatureRecipes,
    createRecipe, 
    updateRecipe,
    getRecipeById,
    deleteRecipe,
    getOwnerRecipe, 
    getUserRecipe,
    getPreviewComments,
    changeRecipeStatus,
    getSavedRecipes
}