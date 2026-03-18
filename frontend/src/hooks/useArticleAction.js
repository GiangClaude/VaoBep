import { useState, useCallback } from 'react';
import articleApi from '../api/articleApi';
import recipeApi from '../api/recipeApi';
import { getRecipeImageUrl, getAvatarUrl } from '../utils/imageHelper';
// Hàm tính thời gian đọc dựa trên độ dài nội dung HTML
// const calculateReadTime = (htmlContent) => {
//   if (!htmlContent) return 1;
//   // Xóa các thẻ HTML để lấy text thuần
//   const plainText = htmlContent.replace(/<[^>]*>?/gm, '');
//   // Tách text thành mảng các từ (bỏ qua khoảng trắng thừa)
//   const wordCount = plainText.split(/\s+/).filter(word => word.length > 0).length;
//   // Trung bình 1 người đọc 200 từ/phút
//   const readTimeMinutes = Math.ceil(wordCount / 20);
//   console.log("Debug calculateReadTime:", { wordCount, htmlContent, readTimeMinutes });

//   return readTimeMinutes > 0 ? readTimeMinutes : 1; // Ít nhất là 1 phút
// };

export default function useArticleAction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

   const calculateReadTime = (html) => {
    const text = html.replace(/<[^>]*>?/gm, '');
    const words = text.split(/\s+/).filter(w => w.length > 0).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  const createNewArticle = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('title', data.title || '');
      formData.append('description', data.description || '');
      formData.append('content', data.content || '');
      formData.append('status', data.status || 'draft');

      const readTime = calculateReadTime(data.content);
      formData.append('read_time', readTime);

      if (data.coverImageFile) {
        formData.append('cover_image', data.coverImageFile);
      }

      if (data.tags && Array.isArray(data.tags)) {
        const tagIds = data.tags.map(t => t.tag_id || t);
        formData.append('tags', JSON.stringify(tagIds));
      }

      // Attach linked recipes if provided (array of ids)
      if (data.recipeIds && Array.isArray(data.recipeIds)) {
        formData.append('recipeIds', JSON.stringify(data.recipeIds));
      }

      const response = await articleApi.createArticle(formData);
      setLoading(false);
      return response.data;
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || err.message || 'Lỗi khi tạo bài viết';
      setError(msg);
      throw err;
    }
  };

  const updateExistingArticle = async (articleId, data) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      if (data.title !== undefined) formData.append('title', data.title);
      if (data.description !== undefined) formData.append('description', data.description);
      if (data.content !== undefined) {
          formData.append('content', data.content);
          // Cập nhật lại thời gian đọc nếu content thay đổi
          const readTime = calculateReadTime(data.content);
          formData.append('read_time', readTime);
      }
      if (data.status !== undefined) formData.append('status', data.status);

      if (data.coverImageFile) {
        formData.append('cover_image', data.coverImageFile);
      }

      if (data.tags !== undefined) {
        const tagIds = Array.isArray(data.tags) ? data.tags.map(t => t.tag_id || t) : data.tags;
        formData.append('tags', JSON.stringify(tagIds));
      }

      // Attach linked recipes on update if provided
      if (data.recipeIds !== undefined) {
        const recipeIdsArray = Array.isArray(data.recipeIds) ? data.recipeIds : JSON.parse(data.recipeIds || '[]');
        formData.append('recipeIds', JSON.stringify(recipeIdsArray));
      }

      const response = await articleApi.updateArticle(articleId, formData);
      setLoading(false);
      return response.data;
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || err.message || 'Lỗi khi cập nhật bài viết';
      setError(msg);
      throw err;
    }
  };

  const saveArticle = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.excerpt); // Map ngược về DB field
      formData.append('content', data.content);
      formData.append('status', data.status);
      formData.append('read_time', calculateReadTime(data.content));
      if (data.coverFile) {
        formData.append('cover_image', data.coverFile);
      }

      // Xử lý Tags (chỉ gửi ID)
      const tagIds = data.tags.map(t => t.id);
      formData.append('tags', JSON.stringify(tagIds));

      // Xử lý Recipes (chỉ gửi ID)
      const recipeIds = data.recipes.map(r => r.id);
      formData.append('recipeIds', JSON.stringify(recipeIds));

      let response;
      console.log("Debug saveArticle formData entries:", Array.from(formData.entries()));
      if (data.id) {
        response = await articleApi.updateArticle(data.id, formData);
      } else {
        response = await articleApi.createArticle(formData);
      }

      return response.data;
    } finally {
      setLoading(false);
    }
  };

   const searchRecipes = useCallback(async (keyword) => {
      try {
        const resp = await recipeApi.searchSimple(keyword);
        const rawData = resp?.data?.data || resp?.data || resp ||[];
        const arr = Array.isArray(rawData) ? rawData :[];
        
        // NORMALIZE DỮ LIỆU TẠI ĐÂY
        return arr.map(r => ({
          id: r.recipe_id,
          title: r.title,
          image: getRecipeImageUrl(r.recipe_id, r.cover_image), // Helper sẽ xử lý ở UI
          authorName: r.author_name,
          authorId: r.user_id, // Đã lấy được nhờ sửa SQL ở Bước 1
        }));
      } catch (err) {
        console.error('Search recipes failed', err);
        return [];
      }
  }, []);

  // Fetch recipe details by ids (used when article only returns ids)
  const fetchRecipesByIds = async (ids = []) => {
    if (!Array.isArray(ids) || ids.length === 0) return [];
    try {
      const promises = ids.map(id => recipeApi.getRecipeById(id));
      const results = await Promise.all(promises);
      const arr = results.map(r => r?.data || r?.data?.data || r).filter(Boolean);
      return arr.map(r => ({
        id: r.recipe_id || r.id,
        recipe_id: r.recipe_id || r.id,
        title: r.title || r.name || '',
        coverImage: getRecipeImageUrl(r.recipe_id || r.id, r.cover_image || r.coverImage),
        authorName: r.author_name || r.authorName || '',
        authorId: r.author_id || r.authorId || r.user_id,
        authorAvatar: getAvatarUrl(r.author_id || r.authorId || r.user_id, r.author_avatar || r.authorAvatar),
        tags: r.tags || r.tag_list || []
      }));
    } catch (err) {
      console.error('fetchRecipesByIds failed', err);
      return [];
    }
  };

  const getArticle = async (articleId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await articleApi.getArticleById(articleId);
      // Normalize linked recipes if present
      const raw = response.data?.data || response.data || {};
      const linked = raw.linked_recipes || raw.linkedRecipes || raw.recipes || [];
      if (Array.isArray(linked) && linked.length > 0) {
        raw.linked_recipes = linked.map(r => ({
          id: r.recipe_id || r.id,
          recipe_id: r.recipe_id || r.id,
          title: r.title || r.name || r.recipe_title || '',
          coverImage: getRecipeImageUrl(r.recipe_id || r.id, r.cover_image || r.coverImage),
          authorName: r.author_name || r.authorName || r.user_name || '',
          authorId: r.author_id || r.authorId || r.user_id,
          authorAvatar: getAvatarUrl(r.author_id || r.authorId || r.user_id, r.author_avatar || r.authorAvatar),
          tags: r.tags || r.tag_list || []
        }));
      } else if (Array.isArray(raw.recipeIds) && raw.recipeIds.length > 0) {
        raw.linked_recipes = await fetchRecipesByIds(raw.recipeIds);
      } else {
        raw.linked_recipes = [];
      }

      setLoading(false);
      return raw;
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || err.message || 'Lỗi khi lấy bài viết';
      setError(msg);
      throw err;
    }
  };

  const removeArticle = async (articleId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await articleApi.deleteArticle(articleId);
      setLoading(false);
      return response.data;
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || err.message || 'Lỗi khi xóa bài viết';
      setError(msg);
      throw err;
    }
  };

  return {
    createNewArticle,
    updateExistingArticle,
    getArticle,
    removeArticle,
    searchRecipes,
    saveArticle,
    loading,
    error
  };
}
