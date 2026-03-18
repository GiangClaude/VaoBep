import { useState, useEffect } from 'react';
import articleApi from '../api/articleApi';
import { normalizeArticleList } from '../utils/normalizeArticle';
export default function useOwnerArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOwnerArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await articleApi.getOwnerArticles();
      const respData = response.data;
      setArticles(normalizeArticleList(respData.data || []));
      setLoading(false);
      console.log("Debug fetchOwnerArticles response:", respData);
      console.log("Debug fetchOwnerArticles normalized articles:",articles);
      return respData;
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || err.message || 'Lỗi khi lấy bài viết của chuyên gia';
      setError(msg);
      throw err;
    }
  };

  useEffect(() => {
    fetchOwnerArticles().catch(() => {});
  }, []);

  return { articles, loading, error, fetchOwnerArticles };
}
