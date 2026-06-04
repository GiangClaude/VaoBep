import { useState, useEffect } from 'react';
import articleApi from '../api/articleApi';
import { normalizeArticleList } from '../utils/normalizeArticle';

export default function useArticleDetail(articleId) {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchArticle = async (id = articleId) => {
    if (!id) return null;
    setLoading(true);
    setError(null);
    try {
      const response = await articleApi.getArticleById(id);
      const data = normalizeArticleList([response.data])[0];
      setArticle(data);
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Lỗi khi lấy chi tiết bài viết');
      throw err;
    }
  };

  useEffect(() => {
    if (articleId) fetchArticle(articleId).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId]);

  return { article, loading, error, fetchArticle };
}
