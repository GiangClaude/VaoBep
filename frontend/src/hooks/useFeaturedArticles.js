import { useState, useEffect } from 'react';
import articleApi from '../api/articleApi';
import { normalizeArticleList } from '../utils/normalizeArticle';
export default function useFeaturedArticles(limit = 3) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFeatured = async (l = limit) => {
    setLoading(true);
    setError(null);
    try {
      const response = await articleApi.getFeaturedArticles({ limit: l });
      const respData = response.data;
      setArticles(normalizeArticleList(respData.data || []));
      setLoading(false);
      return normalizeArticleList(respData.data || []);
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || err.message || 'Lỗi khi lấy bài viết nổi bật';
      setError(msg);
      throw err;
    }
  };

  useEffect(() => {
    fetchFeatured().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  return { articles, loading, error, fetchFeatured };
}
