const InventoryModel = require('../models/inventory.model');

/**
 * Lấy túi đồ của chính mình (Lấy tất cả)
 * Yêu cầu: Phải đi qua middleware auth (protect)
 */
const getMyInventory = async (req, res) => {

    try {
        const userId = req.user.user_id; // Lấy từ middleware protect
        console.log(`User ${userId} đang lấy túi đồ cá nhân`);

        // Không truyền tham số thứ 2 -> lấy tất cả các loại item
        const inventory = await InventoryModel.getUserInventory(userId);

        return res.status(200).json({
            success: true,
            data: inventory
        });
    } catch (error) {
        console.error('Lỗi khi lấy túi đồ cá nhân:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy thông tin túi đồ'
        });
    }
};

/**
 * Lấy túi đồ của người khác (Public)
 * Mặc định chỉ lấy 'badge', nhưng có thể mở rộng bằng query (vd: ?type=ticket)
 */
const getPublicInventory = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Mặc định lấy 'badge' nếu client không truyền query ?type=...
        const itemType = req.query.type || 'badge';

        const inventory = await InventoryModel.getUserInventory(userId, itemType);

        return res.status(200).json({
            success: true,
            data: inventory
        });
    } catch (error) {
        console.error('Lỗi khi lấy túi đồ người dùng khác:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy thông tin vật phẩm'
        });
    }
};

module.exports = {
    getMyInventory,
    getPublicInventory
};