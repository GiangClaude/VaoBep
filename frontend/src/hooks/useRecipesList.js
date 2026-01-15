import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api';

// Định nghĩa Base URL cho ảnh — trỏ tới backend nơi static files được serve
const API_BASE_URL = 'http://localhost:3000';

export default function useRecipesList({ initialRecipes = [] } = {}) {
  const [recipes, setRecipes] = useState(initialRecipes);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    totalItems: 0,
    totalPages: 1
  });

  const [filters, setFilters] = useState({
    searchTerm: '',
    tags: [],
    cookingTime: '',
    difficulty: '',
    minRating: 0
  });

  // Hàm tạo URL ảnh an toàn
  const getImageUrl = (folder, id, filename, defaultImg) => {
    if (!filename) return defaultImg;
    if (filename.startsWith('http')) return filename;
    return `${API_BASE_URL}/${folder}/${id}/${filename}`;
  };

  const normalizeRecipe = (data) => {
    // console.log('Raw recipe data from API:', data);
    return data.map(item => {
      let parsedComments = [];
      if (item.comment_data) {
        parsedComments = item.comment_data.split('|||').map(str => {
          const parts = str.split(':::');
          return { 
             user: parts[0] || "Ẩn danh", 
             text: parts[1] || "" 
          };
        });
      }

      return {
        ...item,
        id: item.recipe_id || item.id,
        title: item.title,
        image: getImageUrl('public/recipes', item.recipe_id, item.cover_image, '/recipe_default.png'),
        cookTime: item.cook_time ? `${item.cook_time} phút` : null,
        calories: item.total_calo ? `${item.total_calo} kcal` : null,
        servings: item.servings || null,
        rating: item.rating_avg_score ? parseFloat(item.rating_avg_score).toFixed(1) : null,
        likes: item.like_count || 0,
        userName: item.author_name || "Ẩn danh",
        userAvatar: getImageUrl('public/user', item.user_id, item.author_avatar, '/avatar_default.png'),
        createdAt: item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN') : '',
        commentCount: parsedComments.length || item.comment_count || 0,
        comments: parsedComments,
        ingredients: item.ingredient_names ? item.ingredient_names.split(',') : [],
        steps: 0,
        liked: item.is_liked !== undefined && item.is_liked !== null ? Boolean(item.is_liked) : undefined,
        
        saved: item.is_saved !== undefined && item.is_saved !== null ? Boolean(item.is_saved) : undefined, // Backend trả về is_saved
      }
    });
  };

  // --- SỬA LỖI Ở ĐÂY ---
  // Hàm fetchRecipes nhận tham số filter mới nhất
  const fetchRecipes = useCallback(async (pageIdx = 1, currentFilters) => {
    setLoading(true);
    try {
      // Ưu tiên dùng currentFilters (truyền vào), nếu không có thì dùng state filters (fallback)
      const activeFilters = currentFilters || filters;
      const token = localStorage.getItem('token');
      const params = {
        page: pageIdx,
        limit: pagination.limit,
        // [FIX]: Dùng activeFilters cho TẤT CẢ các trường thay vì filters
        keyword: activeFilters.searchTerm,
        tags: activeFilters.tags.length > 0 ? activeFilters.tags.join(',') : undefined,
        minRating: activeFilters.minRating > 0 ? activeFilters.minRating : undefined,
        cookingTime: activeFilters.cookingTime || undefined, 
        difficulty: activeFilters.difficulty || undefined
      };

      // console.log('Calling API with params:', params); 

      const resp = await apiClient.get('/recipes', { 
        params,
        headers: token ? { Authorization: `Bearer ${token}` } : {} 
      });
      
      const responseData = resp.data?.data || [];
      const paginationData = resp.data?.pagination || {};

      const normalizedData = normalizeRecipe(responseData);

      setRecipes(normalizedData);
      setPagination(prev => ({
        ...prev,
        page: pageIdx,
        totalItems: paginationData.totalItems || 0,
        totalPages: paginationData.totalPages || 1
      }));
      
      setError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]); // Bỏ 'filters' khỏi dependency để tránh vòng lặp vô hạn

  // Initial load
  useEffect(() => {
    fetchRecipes(1, filters);
  }, []); 

  const onFilterChange = (newFilters) => {
    // 1. Tính toán bộ filter mới ngay lập tức
    const updatedFilters = { ...filters, ...newFilters };
    
    // 2. Cập nhật State (để UI đổi màu nút bấm)
    setFilters(updatedFilters);

    // 3. Gọi API ngay với bộ filter MỚI (không chờ state cập nhật)
    fetchRecipes(1, updatedFilters);
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      // Khi chuyển trang thì dùng filters hiện tại trong state là ổn
      fetchRecipes(page, filters);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const onRecipeClick = (id, navigate) => {
    const recipe = recipes.find(r => String(r.id) === String(id));
    if (navigate) navigate(`/recipe/${id}`, { state: { recipe } });
  };

  return {
    recipes,
    loading,
    error,
    pagination,
    goToPage,
    onFilterChange,
    onRecipeClick,
    filters
  };
}