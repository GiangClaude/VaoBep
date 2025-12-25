const InteractionModel = require('../models/interaction.model');

// Helper: Kiểm tra input postType
const isValidPostType = (type) => ['recipe', 'article', 'dish'].includes(type);

// 1. Like / Unlike
const toggleLike = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { postId, postType } = req.body; // { postId: "...", postType: "recipe" }

        if (!isValidPostType(postType)) return res.status(400).json({ message: "postType không hợp lệ" });

        const result = await InteractionModel.toggleLike({ userId, postId, postType });
        
        res.status(200).json({
            success: true,
            message: result.isLiked ? "Đã like" : "Đã bỏ like",
            data: { isLiked: result.isLiked }
        });
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server: " + err.message });
    }
};

// 2. Save / Unsave
const toggleSave = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { postId, postType } = req.body;

        if (!isValidPostType(postType)) return res.status(400).json({ message: "postType không hợp lệ" });

        const result = await InteractionModel.toggleSave({ userId, postId, postType });

        res.status(200).json({
            success: true,
            message: result.isSaved ? "Đã lưu vào bộ sưu tập" : "Đã bỏ lưu",
            data: { isSaved: result.isSaved }
        });
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server: " + err.message });
    }
};

// 3. Comment
const postComment = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { postId, postType, content } = req.body;

        if (!isValidPostType(postType)) return res.status(400).json({ message: "postType không hợp lệ" });
        if (!content || content.trim() === "") return res.status(400).json({ message: "Nội dung bình luận không được để trống" });

        await InteractionModel.createComment({ userId, postId, postType, content });

        res.status(201).json({ success: true, message: "Bình luận thành công" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server: " + err.message });
    }
};

const getComments = async (req, res) => {
    try {
        const { postId, postType } = req.query; // GET /api/interaction/comments?postId=...&postType=...
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        if (!isValidPostType(postType)) return res.status(400).json({ message: "postType không hợp lệ" });

        const data = await InteractionModel.getComments(postId, postType, page, limit);
        res.status(200).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server: " + err.message });
    }
};

// 4. Rating
const ratePost = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { postId, postType, score } = req.body;

        if (!isValidPostType(postType)) return res.status(400).json({ message: "postType không hợp lệ" });
        if (!score || score < 1 || score > 5) return res.status(400).json({ message: "Điểm đánh giá phải từ 1 đến 5" });

        const result = await InteractionModel.ratePost({ userId, postId, postType, score });

        res.status(200).json({
            success: true,
            message: "Đánh giá thành công",
            data: result // Trả về điểm TB mới để update giao diện
        });
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server: " + err.message });
    }
};

// 5. Follow User
const followUser = async (req, res) => {
    try {
        const followerId = req.user.user_id; // Người đang đăng nhập
        const { followingId } = req.body;    // Người muốn follow

        if (!followingId) return res.status(400).json({ message: "Thiếu ID người cần follow" });

        const result = await InteractionModel.toggleFollow(followerId, followingId);

        res.status(200).json({
            success: true,
            message: result.isFollowing ? "Đã theo dõi" : "Đã hủy theo dõi",
            data: { isFollowing: result.isFollowing }
        });
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server: " + err.message });
    }
};

// 6. Lấy trạng thái tương tác (để hiển thị nút xanh/đỏ khi vào trang chi tiết)
const getInteractionState = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { postId, postType } = req.query;
        
        const state = await InteractionModel.getUserInteractionState(userId, postId, postType);
        res.status(200).json({ success: true, data: state });
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server: " + err.message });
    }
}

module.exports = {
    toggleLike,
    toggleSave,
    postComment,
    getComments,
    ratePost,
    followUser,
    getInteractionState
};