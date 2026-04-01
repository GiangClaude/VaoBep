const { data } = require('autoprefixer');
const InteractionModel = require('../models/interaction.model');
const RecipeModel = require('../models/recipe.model');
const { validateReportInput } = require('../utils/validation');
const {validateInteractionInput, validateCommentInput} = require('../utils/validation');
// Helper: Kiểm tra input postType
const isValidPostType = (type) => ['recipe', 'article', 'dish'].includes(type);

// 1. Like / Unlike
const toggleLike = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { postId, postType } = req.body; // { postId: "...", postType: "recipe" }

        const validation = validateInteractionInput({ postId, postType });
        if (!validation.valid) {
            return res.status(400).json({ success: false, message: validation.message });
        }

        const result = await InteractionModel.toggleLike({ userId, postId, postType });
        const typeName = (postType === 'recipe') ? 'công thức' : 
                         (postType === 'article') ? 'bài viết' : 'món ăn';
                        
        res.status(200).json({
            success: true,
            message: result.isLiked ? `Đã thích ${typeName}` : `Đã bỏ thích ${typeName}`,
            data: { isLiked: result.isLiked }
        });
    } catch (err) {
        const status = (err.message.includes('không tồn tại') || err.message.includes('không công khai')) ? 400 : 500;
        res.status(status).json({ success: false, message: err.message });
    }
};

// 2. Save / Unsave
const toggleSave = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { postId, postType } = req.body;

        const validation = validateInteractionInput({ postId, postType });
        if (!validation.valid) {
            return res.status(400).json({ success: false, message: validation.message });
        }

        const result = await InteractionModel.toggleSave({ userId, postId, postType });

        const typeName = (postType === 'recipe') ? 'công thức' : 
                         (postType === 'article') ? 'bài viết' : 'món ăn';

        res.status(200).json({
            success: true,
            message: result.isSaved ? `Đã lưu ${typeName}` : `Đã bỏ lưu ${typeName}`,
            data: { isSaved: result.isSaved }
        });
    } catch (err) {
        const status = (err.message.includes('không tồn tại') || err.message.includes('không công khai')) ? 400 : 500;
        res.status(status).json({ success: false, message: err.message });
    }
};

// 3. Comment
const postComment = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { postId, postType, content, parentId } = req.body;

        if (!isValidPostType(postType)) return res.status(400).json({ message: "postType không hợp lệ" });
        if (!content || content.trim() === "") return res.status(400).json({ message: "Nội dung bình luận không được để trống" });

        const validation = validateCommentInput({ postId, postType, content, parentId });
        if (!validation.valid) {
            return res.status(400).json({ success: false, message: validation.message });
        }

        const newComment = await InteractionModel.createComment({ userId, postId, postType, content, parentId });
        console.log("New comment created:", newComment);

        res.status(201).json({ 
            success: true, 
            message: parentId ? "Phản hồi thành công" : "Bình luận thành công" ,
            newComment
        });
    } catch (err) {
        const status = (err.message.includes('không tồn tại') || err.message.includes('không công khai')) ? 400 : 500;
        res.status(status).json({ success: false, message: err.message });
    }
};

// 3.1 Chỉnh sửa bình luận
const editComment = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { commentId } = req.params; // Lấy từ URL /api/interaction/comment/:commentId
        const { content } = req.body;

        const comment = await InteractionModel.getCommentById(commentId);
        if (!comment) {
            return res.status(404).json({ success: false, message: "Bình luận không tồn tại" });
        } else if (comment.user_id !== userId) {
            return res.status(403).json({ success: false, message: "Bạn không có quyền chỉnh sửa bình luận này" });
        }
        // 1. Validate input
        if (!content || content.trim() === "") {
            return res.status(400).json({ success: false, message: "Nội dung không được để trống" });
        }
        // 2. Gọi model update
        const success = await InteractionModel.updateComment(commentId, userId, content);

        if (!success) {
            return res.status(403).json({ 
                success: false, 
                message: "Không tìm thấy bình luận hoặc bạn không có quyền chỉnh sửa." 
            });
        }

        res.status(200).json({ success: true, message: "Cập nhật bình luận thành công" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const deleteComment = async (req, res) => {
    try {
        
        const userId = req.user.user_id;
        const { commentId } = req.params; // Lấy từ URL /api/interaction/comment/:commentId
        const comment = await InteractionModel.getCommentById(commentId);
        if (!comment) {
            return res.status(404).json({ success: false, message: "Bình luận không tồn tại" });
        } else if (comment.user_id !== userId) {
            return res.status(403).json({ success: false, message: "Bạn không có quyền xóa bình luận này" });
        }
        const success = await InteractionModel.deleteComment(commentId, userId);

        if (!success) {
            return res.status(403).json({ 
                success: false, 
                message: "Không tìm thấy bình luận hoặc bạn không có quyền xóa." 
            });
        }
        res.status(200).json({ success: true, message: "Xóa bình luận thành công" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

const getComments = async (req, res) => {
    try {
        const { postId, postType } = req.query; // GET /api/interaction/comments?postId=...&postType=...
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        if (!isValidPostType(postType)) return res.status(400).json({ message: "postType không hợp lệ" });

        const data = await InteractionModel.getComments(postId, postType, page, limit);
        res.status(200).json({ success: true, data });
    } catch (err) {
        const status = (err.message.includes('không tồn tại') || err.message.includes('không công khai')) ? 400 : 500;
        res.status(status).json({ success: false, message: err.message });
    }
};

// Lấy danh sách phản hồi của một comment (Lazy Load)
const getReplies = async (req, res) => {
    try {
        const { parentId } = req.params; // Lấy từ URL: /api/interaction/comments/:parentId/replies
        
        if (!parentId) return res.status(400).json({ message: "Thiếu ID bình luận cha" });

        const replies = await InteractionModel.getReplies(parentId);
        res.status(200).json({ success: true, data: replies });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
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
        const status = (err.message.includes('không tồn tại') || err.message.includes('không công khai')) ? 400 : 500;
        res.status(status).json({ success: false, message: err.message });
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
        const status = (err.message.includes('không tồn tại') || err.message.includes('không công khai')) ? 400 : 500;
        res.status(status).json({ success: false, message: err.message });
    }
};

// 6. Lấy trạng thái tương tác (để hiển thị nút xanh/đỏ khi vào trang chi tiết)
const getInteractionState = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { postId, postType } = req.query;
        const validation = validateInteractionInput({ postId, postType });
        if (!validation.valid) {
            return res.status(400).json({ success: false, message: validation.message });
        }
        const state = await InteractionModel.getUserInteractionState(userId, postId, postType);
        res.status(200).json({ success: true, data: state });
    } catch (err) {
        const status = (err.message.includes('không tồn tại') || err.message.includes('không công khai')) ? 400 : 500;
        res.status(status).json({ success: false, message: err.message });
    }
};

// 7. Báo cáo bài viết (Report)
const reportPost = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { postId, postType, reason } = req.body;

        let authorId = "";

        if (postType === "recipe") {
            const recipe = await RecipeModel.findById(postId);
            authorId = recipe?.user_id;
        }
        // console.log(`Info: ${authorId} - ${postType} - ${postId}`);
        if (authorId === userId) {
            return res.status(400).json({ message: "Bạn không thể báo cáo bài viết của chính mình." });
        }
        // Validate input
        const validation = validateReportInput({ postId, postType, reason });
        if (!validation.valid) {
            return res.status(400).json({ message: validation.message });
        }

        // Gọi model để ghi nhận báo cáo
        const result = await InteractionModel.reportPost({ userId, postId, postType, reason });

        res.status(201).json({
            success: true,
            message: 'Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét.',
            data: result
        });
    } catch (err) {
        const status = (err.message.includes('không tồn tại') || err.message.includes('không công khai')) ? 400 : 500;
        res.status(status).json({ success: false, message: err.message });
    }
};

module.exports = {
    toggleLike,
    toggleSave,
    postComment,
    editComment,
    deleteComment,
    getComments,
    getReplies,
    ratePost,
    followUser,
    getInteractionState,
    reportPost
};