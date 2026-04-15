// backend/controllers/reward.controllers.js
const RewardModel = require('../models/reward.model');
const { RewardFactory } = require('../utils/reward.strategy');
const db = require('../config/db');
const pool = db.pool;

class RewardController {
    /**
     * Lấy danh sách hộp quà của người dùng hiện tại
     */
    static async getMyRewards(req, res) {
        try {
            const userId = req.user.user_id;
            const boxes = await RewardModel.getUserRewardBoxes(userId);
            res.status(200).json({ success: true, data: boxes });
        } catch (error) {
            console.error("Error fetching rewards:", error);
            res.status(500).json({ success: false, message: "Lỗi máy chủ khi lấy danh sách phần thưởng." });
        }
    }

    /**
     * Xử lý mở hộp quà (Claim Reward)
     */
    static async claimReward(req, res) {
        const { userRewardId } = req.body;
        const userId = req.user.user_id;
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // 1. Kiểm tra tính hợp lệ của hộp quà
            const userReward = await RewardModel.getUserRewardById(userRewardId);
            
            if (!userReward || userReward.user_id !== userId) {
                throw new Error("Phần thưởng không tồn tại hoặc không thuộc về bạn.");
            }
            if (userReward.status === 'claimed') {
                throw new Error("Phần thưởng này đã được nhận rồi.");
            }

            // 2. Lấy danh sách vật phẩm trong hộp
            const items = await RewardModel.getBoxItems(userReward.box_id);
            console.log("Items in box:", items);
            if (items.length === 0) {
                throw new Error("Hộp quà này trống rỗng (Lỗi cấu hình).");
            }

            // 3. Thực thi nhận thưởng dựa trên Strategy
            const receivedItems = [];
            for (const item of items) {
                // Xử lý logic Gacha (Nếu là hộp gacha thì tính tỉ lệ rớt)
                if (userReward.box_type === 'gacha' && Math.random() > item.probability) {
                    continue; // Không trúng món này
                }

                const strategy = RewardFactory.getStrategy(item.type);
                // value ở đây có thể là số điểm hoặc item_id
                await strategy.apply(userId, item.value, connection);
                
                receivedItems.push({
                    type: item.type,
                    value: item.value
                    // Lưu ý: Để hiện tên item đẹp hơn ở FE, sau này có thể JOIN thêm bảng items ở đây
                });
            }

            // 4. Cập nhật trạng thái hộp quà thành 'claimed'
            const updated = await RewardModel.updateClaimStatus(userRewardId, connection);
            if (!updated) {
                throw new Error("Không thể cập nhật trạng thái nhận thưởng.");
            }

            await connection.commit();

            res.status(200).json({
                success: true,
                message: "Mở quà thành công!",
                data: receivedItems
            });

        } catch (error) {
            await connection.rollback();
            console.error("Claim Reward Error:", error.message);
            res.status(400).json({ success: false, message: error.message });
        } finally {
            connection.release();
        }
    }
}

module.exports = RewardController;