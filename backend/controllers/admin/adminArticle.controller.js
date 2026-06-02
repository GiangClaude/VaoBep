const ArticleModel = require('../../models/article.model');
const path = require('path');
const fs = require('fs').promises; 
const { addVectorSyncJob } = require('../../services/vectorQueue.service');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/AppError');

const getArticles = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const statusFilter = req.query.status || 'all';
    const sortKey = req.query.sortKey || 'created_at';
    const sortOrder = req.query.sortOrder || 'DESC';
    const offset = (page - 1) * limit;

    const articles = await ArticleModel.getArticlesByAdmin(limit, offset, search, statusFilter, sortKey, sortOrder);
    const total = await ArticleModel.countArticlesByAdmin(search, statusFilter);

    res.status(200).json({ data: articles, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

const getAdminArticleDetail = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const article = await ArticleModel.findById(id);
    if (!article) throw new AppError('Không tìm thấy bài viết', 404);
    res.status(200).json({ data: article });
});

const updateArticleStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['public', 'draft', 'hidden', 'banned'];
    if (!validStatuses.includes(status)) throw new AppError('Trạng thái không hợp lệ', 400);
    await ArticleModel.updateStatus(id, status);
    if (status === 'public' || status === 'hidden') addVectorSyncJob(id, 'article', 'upsert');
    else addVectorSyncJob(id, 'article', 'delete');
    res.status(200).json({ message: `Đã cập nhật trạng thái bài viết thành: ${status}` });
});

const deleteArticle = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        await ArticleModel.deleteById(id);
        const targetDir = path.join(__dirname, '../../public/articles', id);
        if (fs.existsSync(targetDir)) 
            await fs.rm(targetDir, { recursive: true, force: true }).catch(() => {});
        addVectorSyncJob(id, 'article', 'delete');
        res.status(200).json({ message: 'Xóa bài viết thành công' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') throw new AppError('Không thể xóa bài viết này vì đang có dữ liệu tương tác (Bình luận, Lưu, ...). Vui lòng ẩn thay vì xóa.', 400);
        console.error('Lỗi xóa bài viết:', error);
        throw error;
    }
});

module.exports = { getArticles, getAdminArticleDetail, updateArticleStatus, deleteArticle };
