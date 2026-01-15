const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controllers');
const { verifyAdminMiddleware } = require('../utils/auth.utils'); // Import middleware đã sửa

// Áp dụng middleware verifyAdmin cho tất cả các route bên dưới
// Nghĩa là: Phải đăng nhập VÀ có role='admin' mới gọi được các API này
router.use(verifyAdminMiddleware);

// 1. Dashboard ok
router.get('/stats', adminController.getDashboardStats);

// 2. User Management 
//ok
router.get('/users', adminController.getUsers);
//fix
router.post('/users', adminController.createUser); // Tạo admin/pro
//ok
router.put('/users/:id/status', adminController.toggleUserStatus); // Block/Unblock

// 3. Recipe Management
//ok => xem xet fix
router.get('/recipes', adminController.getRecipes);
router.put('/recipes/:id/hide', adminController.hideRecipe);

// 4. Ingredient Management (Pending)
router.get('/ingredients/pending', adminController.getPendingIngredients);
//Data truntcated =>> ok
router.put('/ingredients/:id/process', adminController.processIngredient); // Body: { action: 'approve', calo_per_100g: 50 }

// 5. Report Management
router.get('/reports', adminController.getReports);
router.post('/reports/process', adminController.processReport);

module.exports = router;