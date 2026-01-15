const { v4: uuidv4 } = require('uuid');
const UserModel = require('../models/user.model');
const RecipeModel = require('../models/recipe.model');
const IngredientModel = require('../models/ingredient.model');
const ReportModel = require('../models/report.model');
const ArticleModel = require('../models/article.model'); // Đảm bảo file này đã tạo ở bước trước
const path = require('path');
const fs = require('fs');
const emailUtils = require('../utils/email.utils');
const authUtils = require('../utils/auth.utils');

// --- A. DASHBOARD ---
const getDashboardStats = async (req, res) => {
    try {
        // Lấy số liệu tổng quan (Có thể tối ưu bằng cách viết 1 query count tổng trong Model nếu cần)
        const totalUsers = await UserModel.countUsers('');
        const totalRecipes = await RecipeModel.countAllRecipes('');
        // Giả sử ArticleModel cũng có hàm count
        const totalArticles = await ArticleModel.countAllArticles(''); 
        
        res.status(200).json({
            users: totalUsers,
            recipes: totalRecipes,
            articles: totalArticles,
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
        const offset = (page - 1) * limit;

        const users = await UserModel.getAllUsers(limit, offset, search);
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
        const offset = (page - 1) * limit;

        const recipes = await RecipeModel.getAllRecipesForAdmin(limit, offset, search);
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
        // Chuyển sang status 'hidden'
        await RecipeModel.updateStatus(id, 'hidden');
        res.status(200).json({ message: "Recipe hidden successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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

module.exports = {
    getDashboardStats,
    getUsers,
    toggleUserStatus,
    createUser,
    getRecipes,
    hideRecipe,
    getPendingIngredients,
    processIngredient,
    getReports,
    processReport
};