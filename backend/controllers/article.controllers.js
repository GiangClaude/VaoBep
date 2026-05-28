const paginationHelper = require('../utils/paginationHelper');
const { getUserIdFromToken } = require('../utils/auth.utils');
const asyncHandler = require('../utils/asyncHandler');
const ArticleService = require('../services/article.service');

// 1. Tạo bài viết học thuật mới
const createArticle = asyncHandler(async (req, res) => {
    const articleId = req.savedArticleId; 
    const userId = req.user.id; 
    
    const data = await ArticleService.createArticle(userId, articleId, req.body, req.files);
    
    res.status(201).json({ 
        success: true, 
        message: 'Đăng bài học thuật thành công!', 
        data 
    });
});

// 2. Chỉnh sửa bài viết
const updateArticle = asyncHandler(async (req, res) => {
    const { articleId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    await ArticleService.updateArticle(articleId, userId, userRole, req.body, req.files);

    res.status(200).json({ 
        success: true, 
        message: 'Cập nhật bài viết thành công!' 
    });
});

// 3. Xóa bài viết
const deleteArticle = asyncHandler(async (req, res) => {
    const { articleId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    await ArticleService.deleteArticle(articleId, userId, userRole);
    
    res.status(200).json({
        success: true,
        message: "Đã xóa bài viết và dữ liệu hình ảnh thành công!"
    });
});

// 4. Lấy danh sách bài viết công khai
const getPublicArticles = asyncHandler(async (req, res) => {
    const userId = getUserIdFromToken(req);
    
    const { articlesWithDetails, page, limit, totalItems } = await ArticleService.getPublicArticles(req.query, userId);

    res.status(200).json({
        success: true,
        message: "Lấy danh sách bài viết thành công",
        data: articlesWithDetails,
        pagination: paginationHelper.createPagination(page, limit, totalItems)
    });
});

// 4b. Lấy các bài viết nổi bật (featured)
const getFeaturedArticles = asyncHandler(async (req, res) => {
    const userId = getUserIdFromToken(req);
    
    const articlesWithTags = await ArticleService.getFeaturedArticles(req.query.limit, userId);

    res.status(200).json({ success: true, data: articlesWithTags });
});

// 5. Lấy danh sách bài viết của chính chuyên gia
const getOwnerArticles = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    const articlesWithTags = await ArticleService.getOwnerArticles(userId);

    res.status(200).json({ success: true, data: articlesWithTags });
});

// 6. Lấy chi tiết một bài viết
const getArticleById = asyncHandler(async (req, res) => {
    const { articleId } = req.params;
    const userId = getUserIdFromToken(req);
    
    const article = await ArticleService.getArticleById(articleId, userId);

    res.status(200).json({ success: true, data: article });
});

// 7. Lấy bài viết đã lưu
const getSavedArticles = asyncHandler(async (req, res) => {
    const userId = req.user.user_id; 
    
    const { articlesWithDetails, page, limit, totalItems } = await ArticleService.getSavedArticles(userId, req.query);

    res.status(200).json({ 
        success: true, 
        message: 'Lấy danh sách bài viết đã lưu thành công', 
        data: articlesWithDetails, 
        pagination: paginationHelper.createPagination(page, limit, totalItems) 
    });
});

module.exports = {
    createArticle,
    updateArticle,
    deleteArticle,
    getPublicArticles,
    getFeaturedArticles,
    getOwnerArticles,
    getArticleById,
    getSavedArticles
};