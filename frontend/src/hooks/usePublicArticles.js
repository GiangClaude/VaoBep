import { useState, useEffect, useCallback, useRef } from 'react';
import articleApi from '../api/articleApi';
import { normalizeArticleList } from '../utils/normalizeArticle';

export default function usePublicArticles(page = 1, limit = 10, filters = {}) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  
  // Dùng Ref để lưu trữ timer của debounce, tránh tạo mới khi render
  const debounceTimer = useRef(null);

  // 1. Hàm fetch chính
  const fetchArticles = useCallback(async (isSearchImmediate = false) => {
    setLoading(true);
    setError(null);
    try {
      const params = { 
        page, 
        limit: 5,
        sort: filters.sort || 'newest',
        tags: (filters.tags && filters.tags.length > 0) ? filters.tags.join(',') : undefined,
        q: filters.searchTerm || undefined
      };

      const response = await articleApi.getPublicArticles(params);
      const respData = response.data;
      console.log("Dữ liệu bài viết nhận được từ API:", respData);
      setArticles(normalizeArticleList(respData.data || []));
      setPagination(respData.pagination || null);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Lỗi khi lấy danh sách bài viết';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, limit, filters.sort, filters.tags, filters.searchTerm]); 
  // Chỉ phụ thuộc vào các giá trị nguyên thủy bên trong filters

  // 2. useEffect để xử lý việc gọi API
  useEffect(() => {
    // Nếu có searchTerm, áp dụng Debounce (chờ 500ms)
    if (filters.searchTerm) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      
      debounceTimer.current = setTimeout(() => {
        fetchArticles();
      }, 500); // Người dùng ngừng gõ 0.5s mới load
    } else {
      // Nếu không có searchTerm (hoặc chỉ đổi Page/Sort/Tags), gọi ngay lập tức
      fetchArticles();
    }

    // Cleanup function: xóa timer khi component unmount hoặc filters thay đổi
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [fetchArticles]); // fetchArticles đã được memoized bởi useCallback ở trên

  return { articles, loading, error, pagination, fetchArticles };
}