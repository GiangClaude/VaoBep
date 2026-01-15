const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controllers');
const { verifyAdminMiddleware } = require('../utils/auth.utils'); // Import middleware đã sửa
const uploadLocal = require('../config/multer.config');

// Áp dụng middleware verifyAdmin cho tất cả các route bên dưới
// Nghĩa là: Phải đăng nhập VÀ có role='admin' mới gọi được các API này
router.use(verifyAdminMiddleware);

// 1. Dashboard ok
router.get('/stats', adminController.getDashboardStats);

// 2. User Management 
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser); // Tạo admin/pro
router.get('/users/:id', adminController.getUserDetail); // [MỚI] Xem chi tiết
router.put('/users/:id', adminController.updateUser);
router.put('/users/:id/status', adminController.toggleUserStatus); // Block/Unblock

// 3. Recipe Management
router.get('/recipes', adminController.getRecipes);
router.post('/recipes', uploadLocal.single('cover_image'), adminController.createAdminRecipe);
// [MỚI] Get Detail
router.get('/recipes/:id', adminController.getRecipeDetail);
// [MỚI] Update (Trust/Status)
router.put('/recipes/:id', adminController.updateRecipe);
router.put('/recipes/:id/hide', adminController.hideRecipe);

// 4. Ingredient Management (Pending)
router.get('/ingredients/pending', adminController.getPendingIngredients);
router.put('/ingredients/:id/process', adminController.processIngredient); // Body: { action: 'approve', calo_per_100g: 50 }

// 5. Report Management
router.get('/reports', adminController.getReports);
router.post('/reports/process', adminController.processReport);

module.exports = router;