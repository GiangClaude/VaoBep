const InteractionModel = require('../models/interaction.model');
const RecipeModel = require('../models/recipe.model');
const DictionaryDishService = require('../services/dictionaryDish.service'); // Đã sửa đường dẫn chuẩn
const { validateReportInput, validateInteractionInput, validateCommentInput } = require('../utils/validation');
const AppError = require('../utils/AppError');

class InteractionService {
    // Helper giữ nguyên từ file cũ
    _isValidPostType(type) {
        return ['recipe', 'article', 'dish'].includes(type);
    }

    async toggleLike(userId, postId, postType) {
        const validation = validateInteractionInput({ postId, postType });
        if (!validation.valid) throw new AppError(validation.message, 400);

        const result = await InteractionModel.toggleLike({ userId, postId, postType });
        const typeName = (postType === 'recipe') ? 'công thức' : 
                         (postType === 'article') ? 'bài viết' : 
                         (postType === 'dish') ? 'món ăn' : 'null';
        
        console.log('Toggle like result:', postId, result, postType, typeName);
        
        if (postType === 'dish') {
            await DictionaryDishService.recalculatePoint(postId);
        }

        return {
            message: result.isLiked ? `Đã thích ${typeName}` : `Đã bỏ thích ${typeName}`,
            isLiked: result.isLiked
        };
    }

    async toggleSave(userId, postId, postType) {
        const validation = validateInteractionInput({ postId, postType });
        if (!validation.valid) throw new AppError(validation.message, 400);

        const result = await InteractionModel.toggleSave({ userId, postId, postType });
        const typeName = (postType === 'recipe') ? 'công thức' : 
                         (postType === 'article') ? 'bài viết' : 'món ăn';

        return {
            message: result.isSaved ? `Đã lưu ${typeName}` : `Đã bỏ lưu ${typeName}`,
            isSaved: result.isSaved
        };
    }

    async postComment(userId, postId, postType, content, parentId) {
        if (!this._isValidPostType(postType)) throw new AppError("postType không hợp lệ", 400);
        if (!content || content.trim() === "") throw new AppError("Nội dung bình luận không được để trống", 400);

        const validation = validateCommentInput({ postId, postType, content, parentId });
        if (!validation.valid) throw new AppError(validation.message, 400);

        const newComment = await InteractionModel.createComment({ userId, postId, postType, content, parentId });
        
        if (postType === 'dish') {
            await DictionaryDishService.recalculatePoint(postId);
        }

        return {
            message: parentId ? "Phản hồi thành công" : "Bình luận thành công",
            newComment
        };
    }

    async editComment(userId, commentId, content) {
        const comment = await InteractionModel.getCommentById(commentId);
        if (!comment) throw new AppError("Bình luận không tồn tại", 404);
        if (comment.user_id !== userId) throw new AppError("Bạn không có quyền chỉnh sửa bình luận này", 403);
        
        if (!content || content.trim() === "") throw new AppError("Nội dung không được để trống", 400);

        const success = await InteractionModel.updateComment(commentId, userId, content);
        if (!success) throw new AppError("Không tìm thấy bình luận hoặc bạn không có quyền chỉnh sửa.", 403);

        return true;
    }

    async deleteComment(userId, commentId) {
        const comment = await InteractionModel.getCommentById(commentId);
        if (!comment) throw new AppError("Bình luận không tồn tại", 404);
        if (comment.user_id !== userId) throw new AppError("Bạn không có quyền xóa bình luận này", 403);

        const success = await InteractionModel.deleteComment(commentId, userId);
        const postType = comment.post_type;
        
        if (postType === 'dish') {
            await DictionaryDishService.recalculatePoint(comment.post_id);
        }
        
        if (!success) throw new AppError("Không tìm thấy bình luận hoặc bạn không có quyền xóa.", 403);

        return true;
    }

    async getComments(postId, postType, page, limit) {
        if (!this._isValidPostType(postType)) throw new AppError('postType không hợp lệ', 400);
        return await InteractionModel.getComments(postId, postType, page, limit);
    }

    async getReplies(parentId) {
        if (!parentId) throw new AppError('Thiếu ID bình luận cha', 400);
        return await InteractionModel.getReplies(parentId);
    }

    async ratePost(userId, postId, postType, score) {
        if (!this._isValidPostType(postType)) throw new AppError('postType không hợp lệ', 400);
        if (!score || score < 1 || score > 5) throw new AppError('Điểm đánh giá phải từ 1 đến 5', 400);

        return await InteractionModel.ratePost({ userId, postId, postType, score });
    }

    async followUser(followerId, followingId) {
        if (!followingId) throw new AppError('Thiếu ID người cần follow', 400);
        const result = await InteractionModel.toggleFollow(followerId, followingId);
        
        return {
            message: result.isFollowing ? 'Đã theo dõi' : 'Đã hủy theo dõi',
            isFollowing: result.isFollowing
        };
    }

    async getInteractionState(userId, postId, postType) {
        const validation = validateInteractionInput({ postId, postType });
        if (!validation.valid) throw new AppError(validation.message, 400);

        return await InteractionModel.getUserInteractionState(userId, postId, postType);
    }

    async reportPost(userId, postId, postType, reason) {
        let authorId = '';
        if (postType === 'recipe') {
            const recipe = await RecipeModel.findById(postId);
            authorId = recipe?.user_id;
        }
        if (authorId === userId) throw new AppError('Bạn không thể báo cáo bài viết của chính mình.', 400);

        const validation = validateReportInput({ postId, postType, reason });
        if (!validation.valid) throw new AppError(validation.message, 400);

        return await InteractionModel.reportPost({ userId, postId, postType, reason });
    }
}

module.exports = new InteractionService();