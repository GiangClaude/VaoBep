const ArticleModel = require('../../models/article.model');
const path = require('path');
const fs = require('fs');
const { addVectorSyncJob } = require('../../services/vectorQueue.service');

const getArticles = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAdminArticleDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const article = await ArticleModel.findById(id);
        if (!article) return res.status(404).json({ message: 'Không tìm thấy bài viết' });
        res.status(200).json({ data: article });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateArticleStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const validStatuses = ['public', 'draft', 'hidden', 'banned'];
        if (!validStatuses.includes(status)) return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
        await ArticleModel.updateStatus(id, status);
        if (status === 'public' || status === 'hidden') {
            addVectorSyncJob(id, 'article', 'upsert');
        } else {
            addVectorSyncJob(id, 'article', 'delete');
        }
        res.status(200).json({ message: `Đã cập nhật trạng thái bài viết thành: ${status}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteArticle = async (req, res) => {
    try {
        const { id } = req.params;
        await ArticleModel.deleteById(id);
        const targetDir = path.join(__dirname, '../../public/articles', id);
        if (fs.existsSync(targetDir)) fs.rmSync(targetDir, { recursive: true, force: true });
        addVectorSyncJob(id, 'article', 'delete');
        res.status(200).json({ message: 'Xóa bài viết thành công' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') return res.status(400).json({ message: 'Không thể xóa bài viết này vì đang có dữ liệu tương tác (Bình luận, Lưu, ...). Vui lòng ẩn thay vì xóa.' });
        console.error('Lỗi xóa bài viết:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getArticles, getAdminArticleDetail, updateArticleStatus, deleteArticle };
