import { useState, useEffect } from 'react';
import articleApi from '../api/articleApi';
import { normalizeArticleList } from '../utils/normalizeArticle';

export default function usePublicArticles(page = 1, limit = 10) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchArticles = async (p = page, l = limit) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: p, limit: l };
      const response = await articleApi.getPublicArticles(params);
      // Backend returns { success, message, data, pagination }
      const respData = response.data;
      setArticles(normalizeArticleList(respData.data || []));
      setPagination(respData.pagination || null);
      setLoading(false);
      return normalizeArticleList(respData.data || []);
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || err.message || 'Lỗi khi lấy danh sách bài viết';
      setError(msg);
      throw err;
    }
  };

  useEffect(() => {
    fetchArticles(page, limit).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  return { articles, loading, error, pagination, fetchArticles };
}
