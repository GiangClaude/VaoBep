// hooks/useSavedArticles.js
import { useState, useEffect, useCallback } from 'react';
import articleApi from '../api/articleApi';
import { normalizeArticleList } from '../utils/normalizeArticle';

export const useSavedArticles = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchSavedArticles = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await articleApi.getSavedArticles({ page, limit: 6 });
            if (response && response.data) {
                const normalized = normalizeArticleList(response.data.data || []);
                setArticles(normalized);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error("Lỗi tải bài viết đã lưu:", error);
            setArticles([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSavedArticles(currentPage);
    }, [fetchSavedArticles, currentPage]);

    // [QUAN TRỌNG] Logic cập nhật danh sách lập tức khi bỏ lưu
    useEffect(() => {
        const handleSync = (e) => {
            const { targetId, updates, type } = e.detail;
            
            // Nếu là article và bị bỏ lưu (saved === false)
            if (type === 'article' && updates && updates.saved === false) {
                setArticles(prev => {
                    const newList = prev.filter(a => a.id !== targetId);
                    
                    // Nếu sau khi xóa mà trang hiện tại trống không, hãy lùi lại 1 trang (nếu có thể)
                    if (newList.length === 0 && currentPage > 1) {
                        setCurrentPage(prevPage => prevPage - 1);
                    }
                    return newList;
                });
            }
        };

        window.addEventListener('interaction-sync-event', handleSync);
        return () => window.removeEventListener('interaction-sync-event', handleSync);
    }, [currentPage]);

    return {
        articles,
        loading,
        pagination,
        currentPage,
        setCurrentPage,
        refetch: () => fetchSavedArticles(currentPage)
    };
};