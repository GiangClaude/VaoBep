import { useState } from 'react';
import adminApi from '../../api/adminApi'; // Chỉnh lại đường dẫn import nếu cần

export const useAdminArticles = () => {
    const [articles, setArticles] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0});
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    // Fetch danh sách bài viết
    const fetchArticles = async (page = 1, limit = 10, search = '', status = 'all', sortKey = 'created_at', sortOrder = 'DESC') => {
        setIsLoading(true);
        setErrorMsg(null);
        try {
            const res = await adminApi.getArticles(page, limit, search, status, sortKey, sortOrder);
            if (res.success) {
                setArticles(res.data);
                setPagination(res.meta);
            }

        } catch (err) {
            setErrorMsg(err.message || "Lỗi khi tải danh sách bài viết");
        } finally {
            setIsLoading(false);
        }
    };

    // Lấy chi tiết bài viết (Dùng để preview trước khi duyệt)
    const fetchArticleDetail = async (id) => {
        try {
            const res = await adminApi.getArticleDetail(id);
            return { success: true, data: res.data.data };
        } catch (err) {
            setErrorMsg(err.message || "Lỗi khi tải chi tiết bài viết");
            return { success: false, message: err.message };
        }
    };

    // Duyệt / Ẩn bài viết
    const handleUpdateStatus = async (id, status) => {
        try {
            await adminApi.updateArticleStatus(id, status);
            // Có thể tối ưu bằng cách update local state, nhưng fetch lại cho chắc chắn
            await fetchArticles(pagination.page, pagination.limit); 
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message || "Lỗi khi cập nhật trạng thái" };
        }
    };

    // Xóa bài viết
    const handleDeleteArticle = async (id) => {
        try {
            await adminApi.deleteArticle(id);
            let targetPage = pagination.page;
            if (articles.length === 1 && targetPage > 1) {
                targetPage -= 1;
            }
            await fetchArticles(targetPage, pagination.limit);
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || "Lỗi khi xóa bài viết" };
        }
    };

    return {
        articles,
        pagination,
        isLoading,
        errorMsg,
        fetchArticles,
        fetchArticleDetail,
        handleUpdateStatus,
        handleDeleteArticle
    };
};