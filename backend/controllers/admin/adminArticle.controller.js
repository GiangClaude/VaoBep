// VỊ TRÍ: backend/controllers/admin/adminArticle.controller.js
const adminArticleService = require('../../services/admin/adminArticle.service');
const asyncHandler = require('../../utils/asyncHandler');

// Controller giờ đây rất mỏng (Thin Controller), chỉ nhận Request và gọi Service
const getArticles = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const statusFilter = req.query.status || 'all';
    const sortKey = req.query.sortKey || 'created_at';
    const sortOrder = req.query.sortOrder || 'DESC';

    const result = await adminArticleService.getArticles(page, limit, search, statusFilter, sortKey, sortOrder);

    res.status(200).json({ 
        data: result.articles, 
        pagination: { page, limit, total: result.total, totalPages: result.totalPages } 
    });
});

const getAdminArticleDetail = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const article = await adminArticleService.getArticleDetail(id);
    
    res.status(200).json({ data: article });
});

const updateArticleStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    const newStatus = await adminArticleService.updateArticleStatus(id, status);
    
    res.status(200).json({ message: `Đã cập nhật trạng thái bài viết thành: ${newStatus}` });
});

const deleteArticle = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    await adminArticleService.deleteArticle(id);
    
    res.status(200).json({ message: 'Xóa bài viết thành công' });
});

module.exports = { 
    getArticles, 
    getAdminArticleDetail, 
    updateArticleStatus, 
    deleteArticle 
};