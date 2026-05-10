const { v4: uuidv4 } = require('uuid');
const UserModel = require('../models/user.model');
const RecipeModel = require('../models/recipe.model');
const IngredientModel = require('../models/ingredient.model');
const ReportModel = require('../models/report.model');
const DictionaryDishModel = require('../models/dictionaryDish.model');
const ArticleModel = require('../models/article.model'); // Đảm bảo file này đã tạo ở bước trước
const path = require('path');
const fs = require('fs');
const emailUtils = require('../utils/email.utils');
const authUtils = require('../utils/auth.utils');

// --- A. DASHBOARD ---
const getDashboardStats = async (req, res) => {
    try {
        // 1. Lấy số liệu tổng
        const totalUsers = await UserModel.countUsers('');
        const totalRecipes = await RecipeModel.countAllRecipes('');
        const totalArticles = await ArticleModel.countAllArticles('');
        const totalDishes = await DictionaryDishModel.countAllDishes('');
        // 2. Tính chỉ số trung bình
        // Tránh chia cho 0
        const avgRecipePerUser = totalUsers > 0 ? (totalRecipes / totalUsers).toFixed(2) : 0;

        // 3. Lấy dữ liệu biểu đồ
        // Biểu đồ User tăng trưởng (7 ngày)
        const userGrowth = await UserModel.getUserGrowthStats(30); 
        
        // Biểu đồ Recipe tăng trưởng (Lấy 30 ngày để frontend tự filter 7/15/30)
        const recipeGrowth = await RecipeModel.getRecipeGrowthStats(30);

        // Biểu đồ Tròn: Recipe Status (Cũ)
        const recipeDistribution = await RecipeModel.getRecipeStatusDistribution();
        
        // Biểu đồ Tròn: User Roles (Mới)
        const userRoleDistribution = await UserModel.getUserRoleDistribution();

        res.status(200).json({
            summary: {
                users: totalUsers,
                recipes: totalRecipes,
                articles: totalArticles,
                avgRecipePerUser: parseFloat(avgRecipePerUser)
            },
            charts: {
                userGrowth,
                recipeGrowth,       // [MỚI]
                recipeDistribution,
                userRoleDistribution // [MỚI]
            },
            message: "Get stats successfully"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- B. USER MANAGEMENT ---
const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';

        const sortKey = req.query.sortKey || 'created_at';
        const sortOrder = req.query.sortOrder || 'DESC';

        const offset = (page - 1) * limit;

        const users = await UserModel.getAllUsers(limit, offset, search, sortKey, sortOrder);
        const total = await UserModel.countUsers(search);

        res.status(200).json({
            data: users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'active' hoặc 'blocked'

        if (!['active', 'blocked'].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        await UserModel.updateStatus(id, status);
        res.status(200).json({ message: `User status updated to ${status}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createUser = async (req, res) => {
    try {
        const { full_name, email, password, role } = req.body;
        
        // Validate role
        if (!['admin', 'vip', 'pro', 'user'].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }
        if (!email || !password || !full_name) {
            return res.status(400).json({ message: "Vui lòng điền đủ thông tin." });
        }

        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "Email đã tồn tại." });
        }


        // Hash password
        const hashedPassword = await authUtils.hashPassword(password);
        const userId = uuidv4();

        const otp = authUtils.generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // Hết hạn sau 10 phút
        console.log("In here 4");

        await UserModel.createWithRole({
            id: userId,
            full_name,
            email,
            passwordHash: hashedPassword,
            role,
            otp, 
            otpExpires
        });

        console.log("New userID: ", userId);

        const emailResult = await emailUtils.sendVerificationEmail(email, otp);
        
        if (!emailResult.success){
            return res.status(500).json({ error: 'Failed to send verification email.' });
        }
        
        //Tạo folder name
        const userFolderPath = path.join(__dirname, '../../public/user', userId.toString());
        
        // 3. Kiểm tra và tạo thư mục nếu chưa có
        if (!fs.existsSync(userFolderPath)) {
            fs.mkdirSync(userFolderPath, { recursive: true });
            // recursive: true giúp tạo cả thư mục cha nếu lỡ nó chưa tồn tại
         }

        res.status(201).json({ message: "User created successfully", userId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- C. RECIPE & INGREDIENT MANAGEMENT ---
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
        // Chuyển sang status 'hidden'
        await RecipeModel.updateStatus(id, targetStatus);
        res.status(200).json({ message: `Recipe status updated to ${targetStatus}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPendingIngredients = async (req, res) => {
    try {
        const search = req.query.search || '';
        const ingredients = await IngredientModel.getPendingIngredients();
        res.status(200).json({ data: ingredients });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const processIngredient = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, calo_per_100g } = req.body; // action: 'approve' | 'reject'

        if (action === 'approve') {
            await IngredientModel.updateStatus(id, 'approved');
            if (calo_per_100g) {
                await IngredientModel.updateCalo(id, calo_per_100g);
            }
            res.status(200).json({ message: "Ingredient approved" });
        } else if (action === 'reject') {
            await IngredientModel.updateStatus(id, 'reject'); // Hoặc xóa hẳn tùy logic
            res.status(200).json({ message: "Ingredient rejected" });
        } else {
            res.status(400).json({ message: "Invalid action" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- THÊM MỚI TỪ ĐÂY: CONTROLLER CHO INGREDIENT CRUD ---

const getAllIngredients = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        const ingredients = await IngredientModel.getAllAdmin(limit, offset, search);
        const total = await IngredientModel.countAllAdmin(search);

        res.status(200).json({
            data: ingredients,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createIngredient = async (req, res) => {
    try {
        const { name, calo_per_100g, status } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Tên nguyên liệu không được để trống" });
        }

        const ingredientId = uuidv4();
        const ingStatus = status || 'approved'; // Mặc định là approved nếu Admin tạo

        // Tạo nguyên liệu
        await IngredientModel.create(ingredientId, name.trim(), ingStatus);

        // Cập nhật calo nếu có
        if (calo_per_100g !== undefined && calo_per_100g !== null && calo_per_100g !== "") {
            await IngredientModel.updateCalo(ingredientId, calo_per_100g);
        }

        res.status(201).json({ message: "Thêm nguyên liệu thành công", ingredientId });
    } catch (error) {
        // Bắt lỗi trùng tên (MySQL error code 1062 - ER_DUP_ENTRY)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "Tên nguyên liệu đã tồn tại" });
        }
        res.status(500).json({ message: error.message });
    }
};

const updateIngredient = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, calo_per_100g, status } = req.body;

        if (name) {
            await IngredientModel.updateName(id, name.trim());
        }
        
        if (calo_per_100g !== undefined && calo_per_100g !== null && calo_per_100g !== "") {
            await IngredientModel.updateCalo(id, calo_per_100g);
        }

        if (status) {
            await IngredientModel.updateStatus(id, status);
        }

        res.status(200).json({ message: "Cập nhật nguyên liệu thành công" });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "Tên nguyên liệu đã tồn tại" });
        }
        res.status(500).json({ message: error.message });
    }
};

const deleteIngredient = async (req, res) => {
    try {
        const { id } = req.params;
        await IngredientModel.delete(id);
        res.status(200).json({ message: "Xóa nguyên liệu thành công" });
    } catch (error) {
        // Bắt lỗi khóa ngoại: Lỗi 1451 (ER_ROW_IS_REFERENCED_2)
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ 
                message: "Không thể xóa nguyên liệu này vì đang được sử dụng trong công thức." 
            });
        }
        res.status(500).json({ message: error.message });
    }
};

// --- KẾT THÚC PHẦN THÊM MỚI ---

// --- D. REPORT MANAGEMENT ---
const getReports = async (req, res) => {
    try {
        const reports = await ReportModel.getPendingReports();
        res.status(200).json({ data: reports });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const processReport = async (req, res) => {
    try {
        const { report_id, action } = req.body; 
        // action: 'hide_content' (Ẩn bài & resolve) | 'ignore' (Chỉ resolve)

        // 1. Lấy thông tin report để biết bài viết nào
        // (Lưu ý: Bạn cần thêm hàm getById cho ReportModel nếu muốn check kỹ, 
        // tạm thời giả sử FE gửi kèm post_id/post_type hoặc query DB tại đây)
        
        // Logic đơn giản hóa:
        await ReportModel.resolveReport(report_id);

        if (action === 'hide_content') {
            // Cần client gửi thêm post_id và type, hoặc query lại report để lấy
             const { post_id, post_type } = req.body; 
             
             if(post_type === 'recipe') {
                 await RecipeModel.updateStatus(post_id, 'hidden');
             } else if (post_type === 'article') {
                 await ArticleModel.updateStatus(post_id, 'hidden');
             }
             return res.status(200).json({ message: "Report resolved & Content hidden" });
        }

        res.status(200).json({ message: "Report resolved (Ignored)" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ... (các hàm cũ giữ nguyên: getDashboardStats, getUsers, toggleUserStatus, createUser...)

// [THÊM MỚI] Lấy chi tiết User
const getUserDetail = async (req, res) => {
    try {
        const { id } = req.params;
        // Sử dụng hàm findById của Model đã có sẵn logic lấy stats (recipes, followers) và ẩn password
        const user = await UserModel.findById(id); 
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ data: user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [THÊM MỚI] Admin cập nhật User (Chỉ Role & Status)
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, account_status } = req.body;

        // Validation cơ bản
        if (role && !['admin', 'vip', 'pro', 'user'].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }
        if (account_status && !['active', 'blocked', 'pending'].includes(account_status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        await UserModel.adminUpdateUser(id, { role, status: account_status });
        
        res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// [CẬP NHẬT FIX LỖI ẢNH] Admin tạo công thức
const createAdminRecipe = async (req, res) => {
    try {
        const userId = req.user.id; 
        
        // 1. [SỬA] Sinh ID trước để dùng cho việc tạo thư mục ảnh
        const recipeId = uuidv4();

        const { 
            title, description, instructions, 
            servings, cook_time, total_calo, 
            ingredients, tags 
        } = req.body;

        // 2. [SỬA] Xử lý ảnh bìa: Di chuyển từ temp sang folder recipe
        let coverImage = 'default.png';
        
        if (req.file) {
            coverImage = req.file.filename;

            // Đường dẫn file tạm do Multer vừa upload xong
            const tempPath = req.file.path;
            
            // Đường dẫn đích: public/recipes/{recipeId}
            const targetDir = path.join(__dirname, '../../public/recipes', recipeId);
            const targetPath = path.join(targetDir, coverImage);

            try {
                // Tạo thư mục nếu chưa tồn tại
                if (!fs.existsSync(targetDir)) {
                    fs.mkdirSync(targetDir, { recursive: true });
                }

                // Di chuyển file từ temp sang đích
                fs.renameSync(tempPath, targetPath);
            } catch (moveError) {
                console.error("Lỗi di chuyển ảnh:", moveError);
                // Không return lỗi, vẫn cho tạo recipe nhưng log lại để debug
            }
        }

        // Parse JSON string từ FormData
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
                return res.status(400).json({ message: "Dữ liệu nguyên liệu không hợp lệ" });
            }
        }

        let tagsData = [];
        if (tags) {
            try {
                tagsData = JSON.parse(tags); 
            } catch (e) {}
        }

        if (!title || !instructions) {
             return res.status(400).json({ message: "Tên món và hướng dẫn không được để trống" });
        }

        // Gọi Model tạo (giữ nguyên)
        await RecipeModel.create({
            recipeId, // Dùng ID đã sinh ở trên
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

        res.status(201).json({ message: "Tạo công thức thành công", recipeId });

    } catch (error) {
        console.error("Create Admin Recipe Error:", error);
        res.status(500).json({ message: error.message });
    }
};


const getRecipeDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const recipe = await RecipeModel.findById(id);
        
        if (!recipe) {
            return res.status(404).json({ message: "Recipe not found" });
        }
        res.status(200).json({ data: recipe });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [THÊM MỚI] Update Recipe (Status, Trust)
const updateRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, is_trust } = req.body;

        await RecipeModel.adminUpdate(id, { status, is_trust });
        res.status(200).json({ message: "Cập nhật công thức thành công" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- THÊM MỚI TỪ ĐÂY: CONTROLLER CHO DICTIONARY DISH CRUD ---

const getDictionaryDishes = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        const dishes = await DictionaryDishModel.getAll(limit, offset, search);
        const total = await DictionaryDishModel.countAll(search);

        res.status(200).json({
            data: dishes,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createDictionaryDish = async (req, res) => {
    try {
        const adminId = req.user.id; // Lấy ID của Admin từ token
        const dishId = uuidv4();     // Sinh ID trước cho món ăn
        
        const { original_name, english_name, description, history, country, latitude, longitude, eateries } = req.body;

        if (!original_name) {
            return res.status(400).json({ message: "Tên món ăn không được để trống" });
        }

        // 1. Xử lý Ảnh (Giống hệt cách bạn làm với Recipe)
        let image_url = null;
        if (req.file) {
            image_url = req.file.filename;
            const tempPath = req.file.path;
            const targetDir = path.join(__dirname, '../../public/dictionarydish', dishId);
            const targetPath = path.join(targetDir, image_url);

            try {
                if (!fs.existsSync(targetDir)) {
                    fs.mkdirSync(targetDir, { recursive: true });
                }
                fs.renameSync(tempPath, targetPath); // Di chuyển ảnh từ temp sang folder chính thức
            } catch (moveError) {
                console.error("Lỗi di chuyển ảnh từ điển:", moveError);
            }
        }

        // 2. Lưu vào bảng Dictionary_Dishes
        await DictionaryDishModel.createDish({
            dish_id: dishId,
            admin_id: adminId,
            original_name, english_name, description, history, country, image_url,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null
        });

        // 3. Xử lý danh sách địa điểm ăn uống (Eateries) - frontend gửi lên dưới dạng JSON string trong FormData
        if (eateries) {
            try {
                const parsedEateries = JSON.parse(eateries);
                if (parsedEateries.length > 0) {
                    const eateriesData = parsedEateries.map(e => ({
                        eatery_id: uuidv4(), // Sinh ID cho từng quán ăn
                        name: e.name,
                        address: e.address
                    }));
                    await DictionaryDishModel.addEateries(dishId, eateriesData);
                }
            } catch (err) {
                console.error("Lỗi parse eateries:", err);
            }
        }

        res.status(201).json({ message: "Tạo món ăn thành công", dishId });
    } catch (error) {
        console.error("Create Dish Error:", error);
        res.status(500).json({ message: error.message });
    }
};

const updateDictionaryDish = async (req, res) => {
    try {
        const { id } = req.params;
        const { original_name, english_name, description, history, country, latitude, longitude, eateries } = req.body;

        let updateData = {
            original_name, english_name, description, history, country,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null
        };

        // Nếu có file mới, Multer đã tự lưu vào public/dictionarydish/{id} do ta config route có params.id
        if (req.file) {
            updateData.image_url = req.file.filename;
        }

        // Xóa các trường undefined khỏi updateData
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        // 1. Cập nhật bảng Dictionary_Dishes
        await DictionaryDishModel.updateDish(id, updateData);

        // 2. Cập nhật Eateries (Chiến lược: Xóa hết cũ, thêm lại mới cho đơn giản)
        if (eateries) {
            try {
                const parsedEateries = JSON.parse(eateries);
                await DictionaryDishModel.deleteEateriesByDishId(id);
                
                if (parsedEateries.length > 0) {
                    const eateriesData = parsedEateries.map(e => ({
                        eatery_id: uuidv4(),
                        name: e.name,
                        address: e.address
                    }));
                    await DictionaryDishModel.addEateries(id, eateriesData);
                }
            } catch (err) {
                console.error("Lỗi parse eateries update:", err);
            }
        }

        res.status(200).json({ message: "Cập nhật món ăn thành công" });
    } catch (error) {
        console.error("Update Dish Error:", error);
        res.status(500).json({ message: error.message });
    }
};

const deleteDictionaryDish = async (req, res) => {
    try {
        const { id } = req.params;
        
        // 1. Xóa trong DB (Do có khóa ngoại CASCADE, dữ liệu ở bảng Dish_Eateries sẽ tự bay màu)
        await DictionaryDishModel.deleteDish(id);

        // 2. Xóa folder ảnh vật lý để đỡ tốn dung lượng ổ cứng
        const targetDir = path.join(__dirname, '../../public/dictionarydish', id);
        if (fs.existsSync(targetDir)) {
            fs.rmSync(targetDir, { recursive: true, force: true });
        }

        res.status(200).json({ message: "Xóa món ăn thành công" });
    } catch (error) {
        console.error("Delete Dish Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// --- KẾT THÚC PHẦN THÊM MỚI ---

// --- THÊM MỚI TỪ ĐÂY: CONTROLLER CHO ARTICLE CRUD ---

const getArticles = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const statusFilter = req.query.status || 'all'; // 'all', 'public', 'draft', 'hidden', 'banned'

        const offset = (page - 1) * limit;

        const articles = await ArticleModel.getArticlesByAdmin(limit, offset, search, statusFilter);
        const total = await ArticleModel.countArticlesByAdmin(search, statusFilter);

        res.status(200).json({
            data: articles,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAdminArticleDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const article = await ArticleModel.findById(id); // Dùng lại hàm public đã có
        if (!article) {
            return res.status(404).json({ message: "Không tìm thấy bài viết" });
        }
        res.status(200).json({ data: article });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateArticleStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['public', 'draft', 'hidden', 'banned'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Trạng thái không hợp lệ" });
        }

        await ArticleModel.updateStatus(id, status);
        res.status(200).json({ message: `Đã cập nhật trạng thái bài viết thành: ${status}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteArticle = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Xóa trong DB
        await ArticleModel.deleteById(id);

        // 2. Xóa folder ảnh vật lý để giải phóng ổ cứng (public/articles/{id})
        const targetDir = path.join(__dirname, '../../public/articles', id);
        if (fs.existsSync(targetDir)) {
            fs.rmSync(targetDir, { recursive: true, force: true });
        }

        res.status(200).json({ message: "Xóa bài viết thành công" });
    } catch (error) {
        // Bắt lỗi khóa ngoại nếu bài viết đang có tương tác (Bình luận, Lưu, Like) chưa xóa
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ 
                message: "Không thể xóa bài viết này vì đang có dữ liệu tương tác (Bình luận, Lưu, ...). Vui lòng ẩn thay vì xóa." 
            });
        }
        console.error("Lỗi xóa bài viết:", error);
        res.status(500).json({ message: error.message });
    }
};

// --- KẾT THÚC PHẦN THÊM MỚI ---

module.exports = {
    getDashboardStats,
    getUsers,
    toggleUserStatus,
    createUser,
    getRecipes,
    hideRecipe,
    getPendingIngredients,
    processIngredient,
    getAllIngredients,
    createIngredient,
    updateIngredient,
    deleteIngredient,
    getReports,
    processReport, 
    updateUser,
    getUserDetail,
    createAdminRecipe,
    getRecipeDetail,
    updateRecipe,
    getDictionaryDishes,
    createDictionaryDish,
    updateDictionaryDish,
    deleteDictionaryDish,
    getArticles,
    getAdminArticleDetail,
    updateArticleStatus,
    deleteArticle
};