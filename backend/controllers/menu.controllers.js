const MenuModel = require('../models/menu.model');

const aiService = require('../services/ai.service');


const createMenu = async (req, res) => {
    try {
        const userId = req.user.user_id; // Lấy từ middleware protect
        const menuData = req.body;

        if (!menuData.name) {
            return res.status(400).json({ message: "Tên thực đơn không được để trống" });
        }
        if (userId == null) {
            return res.status(401).json({ message: "Unauthorized: User ID is missing" });
        }

        const newMenu = await MenuModel.create(userId, menuData);

        res.status(201).json({
            success: true,
            message: "Tạo thực đơn thành công!",
            data: newMenu
        });
    } catch (err) {
        console.error("Lỗi createMenu Controller:", err);
        res.status(500).json({ success: false, message: "Lỗi server: " + err.message });
    }
};

const getUserMenus = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const menus = await MenuModel.getUserMenus(userId);

        res.status(200).json({
            success: true,
            message: "Lấy danh sách thực đơn thành công",
            data: menus
        });
    } catch (err) {
        console.error("Lỗi getUserMenus Controller:", err);
        res.status(500).json({ success: false, message: "Lỗi server: " + err.message });
    }
};

const getMenuById = async (req, res) => {
    try {
        const { menuId } = req.params;
        const menu = await MenuModel.findById(menuId);

        if (!menu) {
            return res.status(404).json({ success: false, message: "Không tìm thấy thực đơn" });
        }

        // Tùy chọn: Xử lý quyền riêng tư. Nếu menu KHÔNG public, và người xem KHÔNG phải là tác giả -> Chặn.
        // Ở đây lấy userId tạm từ token nếu có (cần xử lý token không bắt buộc ở Route)
        // Hiện tại tạm thời cho phép trả về data, Frontend sẽ ẩn nút Clone nếu cần.

        res.status(200).json({
            success: true,
            data: menu
        });
    } catch (err) {
        console.error("Lỗi getMenuById Controller:", err);
        res.status(500).json({ success: false, message: "Lỗi server: " + err.message });
    }
};

const updateMenu = async (req, res) => {
    try {
        const { menuId } = req.params;
        const userId = req.user.user_id;
        const menuData = req.body;

        // 1. Kiểm tra xem user có phải chủ menu không
        const existingMenu = await MenuModel.findById(menuId);
        if (!existingMenu) {
            return res.status(404).json({ success: false, message: "Không tìm thấy thực đơn" });
        }
        if (existingMenu.user_id !== userId) {
            return res.status(403).json({ success: false, message: "Bạn không có quyền sửa thực đơn này" });
        }

        // 2. Thực hiện update
        await MenuModel.update(menuId, userId, menuData);

        res.status(200).json({
            success: true,
            message: "Cập nhật thực đơn thành công!"
        });
    } catch (err) {
        console.error("Lỗi updateMenu Controller:", err);
        res.status(500).json({ success: false, message: "Lỗi server: " + err.message });
    }
};

const deleteMenu = async (req, res) => {
    try {
        const { menuId } = req.params;
        const userId = req.user.user_id;

        const isDeleted = await MenuModel.delete(menuId, userId);

        if (isDeleted) {
            res.status(200).json({ success: true, message: "Đã xóa thực đơn!" });
        } else {
            res.status(400).json({ success: false, message: "Xóa thất bại. Có thể menu không tồn tại hoặc bạn không có quyền." });
        }
    } catch (err) {
        console.error("Lỗi deleteMenu Controller:", err);
        res.status(500).json({ success: false, message: "Lỗi server: " + err.message });
    }
};

const getShoppingList = async (req, res) => {
    try {
        const { menuId } = req.params;
        const list = await MenuModel.generateShoppingList(menuId);

        res.status(200).json({
            success: true,
            data: list
        });
    } catch (err) {
        console.error("Lỗi getShoppingList Controller:", err);
        res.status(500).json({ success: false, message: "Lỗi server: " + err.message });
    }
};

// Hàm lấy menu Public
const getPublicMenus = async (req, res) => {
    try {
        const menus = await MenuModel.getPublicMenus();
        res.status(200).json({ success: true, data: menus });
    } catch (err) {
        console.error("Lỗi getPublicMenus Controller:", err);
        res.status(500).json({ success: false, message: "Lỗi server: " + err.message });
    }
};

// Hàm Nhân bản (Clone)
const cloneMenu = async (req, res) => {
    try {
        const { menuId } = req.params;
        const userId = req.user.user_id;

        // 1. Lấy toàn bộ dữ liệu menu gốc
        const existingMenu = await MenuModel.findById(menuId);
        
        if (!existingMenu) {
            return res.status(404).json({ success: false, message: "Không tìm thấy thực đơn gốc" });
        }

        // Kiểm tra quyền: Nếu menu đang Private và người clone KHÔNG PHẢI là chủ nhân -> Chặn
        if (!existingMenu.is_public && existingMenu.user_id !== userId) {
            return res.status(403).json({ success: false, message: "Thực đơn này đang ở chế độ riêng tư" });
        }

        // 2. Chỉnh sửa một số metadata trước khi Insert thành menu mới
        existingMenu.name = existingMenu.name + " (Bản sao)";
        existingMenu.is_public = false; // Menu clone về mặc định là Private
        existingMenu.cloned_from_id = menuId; // Lưu vết bản gốc

        // 3. Tái sử dụng hàm Create (nó sẽ tự sinh UUID mới cho Menu, Days, Meals)
        const clonedMenu = await MenuModel.create(userId, existingMenu);

        res.status(201).json({
            success: true,
            message: "Nhân bản thực đơn thành công!",
            data: clonedMenu
        });

    } catch (err) {
        console.error("Lỗi cloneMenu Controller:", err);
        res.status(500).json({ success: false, message: "Lỗi server: " + err.message });
    }
};

const getPublicMenusByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const menus = await MenuModel.getPublicMenusByUser(userId);
        res.status(200).json({ success: true, data: menus });
    } catch (err) {
        console.error("Lỗi getPublicMenusByUser Controller:", err);
        res.status(500).json({ success: false, message: "Lỗi server: " + err.message });
    }
};

const consultMenuAI = async (req, res) => {
    try {
        const menuState = req.body;

        // TỐI ƯU TOKEN: Rút gọn data, chỉ gửi lên AI những thứ cần thiết (Tên bữa, Tên món, Calo)
        // Không gửi ảnh, ID, description để AI chạy nhanh hơn và tiết kiệm tiền
        const simplifiedMenu = {
            total_days: menuState.days?.length || 0,
            days: menuState.days?.map(d => ({
                day: d.title,
                meals: d.meals?.map(m => ({
                    meal: m.meal_type,
                    recipes: m.recipes?.map(r => ({
                        name: r.title,
                        calo: Math.round((r.total_calo || 0) * (r.servings_multiplier || 1))
                    }))
                }))
            }))
        };

        const aiResponseText = await aiService.analyzeMenuWithAI(simplifiedMenu);

        res.status(200).json({ success: true, data: aiResponseText });
    } catch (err) {
        console.error("Lỗi AI Consult Controller:", err);
        res.status(500).json({ success: false, message: "Lỗi kết nối AI: " + err.message });
    }
};

const generateMenuAI = async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ success: false, message: "Thiếu prompt yêu cầu." });

        const daysData = await aiService.generateMenuWithRAG(prompt);

        res.status(200).json({ success: true, data: daysData });
    } catch (err) {
        console.error("Lỗi generateMenuAI Controller:", err);
        res.status(500).json({ success: false, message: "Lỗi AI sinh thực đơn: " + err.message });
    }
};
// Nhớ thêm generateMenuAI vào module.exports

// Nhớ thêm vào module.exports nhé

module.exports = {
    createMenu,
    getUserMenus,
    getMenuById,
    updateMenu,
    deleteMenu,
    getShoppingList,
    getPublicMenus,
    cloneMenu,
    getPublicMenusByUser,
    consultMenuAI,
    generateMenuAI
};