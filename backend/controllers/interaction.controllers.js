const InteractionService = require('../services/interaction.service');
const asyncHandler = require('../utils/asyncHandler');

const toggleLike = asyncHandler(async (req, res) => {
    const userId = req.user.user_id;
    const { postId, postType } = req.body; 

    const result = await InteractionService.toggleLike(userId, postId, postType);
                    
    res.status(200).json({
        success: true,
        message: result.message,
        data: { isLiked: result.isLiked }
    });
});

const toggleSave = asyncHandler(async (req, res) => {
    const userId = req.user.user_id;
    const { postId, postType } = req.body;

    const result = await InteractionService.toggleSave(userId, postId, postType);

    res.status(200).json({
        success: true,
        message: result.message,
        data: { isSaved: result.isSaved }
    });
});

const postComment = asyncHandler(async (req, res) => {
    const userId = req.user.user_id;
    const { postId, postType, content, parentId } = req.body;

    const result = await InteractionService.postComment(userId, postId, postType, content, parentId);

    res.status(201).json({ 
        success: true, 
        message: result.message,
        newComment: result.newComment
    });
});

const editComment = asyncHandler(async (req, res) => {
    const userId = req.user.user_id;
    const { commentId } = req.params; 
    const { content } = req.body;

    await InteractionService.editComment(userId, commentId, content);

    res.status(200).json({ success: true, message: "Cập nhật bình luận thành công" });
});

const deleteComment = asyncHandler(async (req, res) => {
    const userId = req.user.user_id;
    const { commentId } = req.params; 

    await InteractionService.deleteComment(userId, commentId);
    
    res.status(200).json({ success: true, message: "Xóa bình luận thành công" });
});

const getComments = asyncHandler(async (req, res) => {
    const { postId, postType } = req.query; 
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const data = await InteractionService.getComments(postId, postType, page, limit);
    res.status(200).json({ success: true, data });
});

const getReplies = asyncHandler(async (req, res) => {
    const { parentId } = req.params;
    const replies = await InteractionService.getReplies(parentId);
    res.status(200).json({ success: true, data: replies });
});

const ratePost = asyncHandler(async (req, res) => {
    const userId = req.user.user_id;
    const { postId, postType, score } = req.body;

    const result = await InteractionService.ratePost(userId, postId, postType, score);
    res.status(200).json({ success: true, message: 'Đánh giá thành công', data: result });
});

const followUser = asyncHandler(async (req, res) => {
    const followerId = req.user.user_id;
    const { followingId } = req.body;
    
    const result = await InteractionService.followUser(followerId, followingId);
    res.status(200).json({ 
        success: true, 
        message: result.message, 
        data: { isFollowing: result.isFollowing } 
    });
});

const getInteractionState = asyncHandler(async (req, res) => {
    const userId = req.user.user_id;
    const { postId, postType } = req.query;

    const state = await InteractionService.getInteractionState(userId, postId, postType);
    res.status(200).json({ success: true, data: state });
});

const reportPost = asyncHandler(async (req, res) => {
    const userId = req.user.user_id;
    const { postId, postType, reason } = req.body;

    const result = await InteractionService.reportPost(userId, postId, postType, reason);
    res.status(201).json({ success: true, message: 'Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét.', data: result });
});

module.exports = {
    toggleLike, toggleSave, postComment, editComment, deleteComment, 
    getComments, getReplies, ratePost, followUser, getInteractionState, reportPost
};