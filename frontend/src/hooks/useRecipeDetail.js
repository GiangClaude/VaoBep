import { useState, useEffect, useCallback } from 'react';
import recipeApi from '../api/recipeApi';
import interactionApi from '../api/interactionApi';

const API_BASE_URL = 'http://localhost:5000';

export default function useRecipeDetail({ id, initialRecipe = null }) {
  const [recipeState, setRecipeState] = useState(initialRecipe);
  const [loading, setLoading] = useState(true);

  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [userRating, setUserRating] = useState(0);
  
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  // [THÊM] State để báo hiệu cần đăng nhập
  const [requireLogin, setRequireLogin] = useState(false);

  // Helper check lỗi 401
  const handleError = (error) => {
    console.error("Lỗi tương tác:", error);
    if (error.response && error.response.status === 401) {
        setRequireLogin(true); // Bật cờ yêu cầu đăng nhập
        return true; // Đã xử lý lỗi
    }
    return false; // Lỗi khác
  };

  const normalizeData = (data) => {
    // ... (Giữ nguyên logic normalizeData cũ của bạn)
    if (!data) return null;
    const getImageUrl = (folder, itemId, filename) => {
        if (!filename) return folder === 'user' ? '/avatar_default.png' : '/recipe_default.png';
        if (filename.startsWith('http')) return filename;
        return `${API_BASE_URL}/public/${folder === 'user' ? 'user' : 'recipes'}/${itemId}/${filename}`;
    };
    let steps = [];
    if (data.instructions) {
        try {
            // 1. Thử parse JSON (cho dữ liệu Mới)
            const parsedSteps = JSON.parse(data.instructions);
            
            // Kiểm tra nếu parse ra đúng là mảng
            if (Array.isArray(parsedSteps)) {
                steps = parsedSteps.map((stepItem, index) => ({
                    step: index + 1,
                    // Xử lý trường hợp stepItem là object {description: "..."} hoặc string "..."
                    description: typeof stepItem === 'object' ? stepItem.description : stepItem,
                    image: stepItem.image || null
                }));
            } else {
                // Nếu parse được nhưng không phải mảng, ném lỗi để xuống catch
                throw new Error("Instructions is not an array");
            }
        } catch (e) {
            // 2. Fallback: Xử lý dạng text cũ (split xuống dòng)
            // Dành cho các bài viết cũ chưa update sang JSON
            steps = data.instructions.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0)
                .map((line, index) => ({
                    step: index + 1,
                    description: line,
                    image: null
                }));
        }
    }
    let ingredients = [];
    if (Array.isArray(data.ingredients)) {
        ingredients = data.ingredients.map(ing => ({name: ing.ingredient_name, amount: `${ing.quantity} ${ing.unit_name}`}));
    }
    return {
        ...data,
        id: data.recipe_id,
        title: data.title,
        description: data.description,
        image: getImageUrl('recipe', data.recipe_id, data.cover_image),
        userAvatar: getImageUrl('user', data.user_id, data.author_avatar),
        userName: data.author_name || "Ẩn danh",
        cookTime: data.cook_time ? `${data.cook_time} phút` : 'Wait',
        servings: data.servings,
        calories: data.total_calo, 
        rating: data.rating_avg_score ? parseFloat(data.rating_avg_score).toFixed(1) : 0,
        likes: data.like_count || 0,
        createdAt: data.created_at ? new Date(data.created_at).toLocaleDateString('vi-VN') : '',
        detailedSteps: steps,
        detailedIngredients: ingredients,
        detailedDescription: data.description
    };
  };

  const fetchAllData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
        const [recipeResp, interactionResp, commentsResp] = await Promise.allSettled([
            recipeApi.getRecipeById(id),
            interactionApi.getInteractionState(id, 'recipe'),
            interactionApi.getComments(id, 'recipe')
        ]);

        if (recipeResp.status === 'fulfilled') {
            const rawData = recipeResp.value.data?.data || recipeResp.value.data;
            setRecipeState(normalizeData(rawData));
        }
        if (interactionResp.status === 'fulfilled' && interactionResp.value.data.success) {
            const state = interactionResp.value.data.data;
            setIsLiked(state.liked);
            setIsSaved(state.saved);
            setUserRating(state.rated);
        }
        if (commentsResp.status === 'fulfilled' && commentsResp.value.data.success) {
            setComments(commentsResp.value.data.data.comments || []);
        }
    } catch (err) {
        console.error('Error fetching details:', err);
    } finally {
        setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // --- CẬP NHẬT CÁC HÀM XỬ LÝ ĐỂ BẮT 401 ---
  
  const handleLike = async () => {
    const previousState = isLiked;
    setIsLiked(!isLiked); // Optimistic Update
    setRecipeState(prev => ({ ...prev, likes: prev.likes + (previousState ? -1 : 1) }));

    try {
        await interactionApi.toggleLike(id, 'recipe');
    } catch (error) {
        setIsLiked(previousState); // Revert
        setRecipeState(prev => ({ ...prev, likes: prev.likes + (previousState ? 1 : -1) }));
        handleError(error); // Kiểm tra 401
    }
  };

  const handleSave = async () => {
    const previousState = isSaved;
    setIsSaved(!isSaved);
    try {
        await interactionApi.toggleSave(id, 'recipe');
    } catch (error) {
        setIsSaved(previousState);
        handleError(error);
    }
  };

  const handleRating = async (score) => {
    setUserRating(score);
    try {
        const res = await interactionApi.ratePost(id, score, 'recipe');
        if (res.data.success) {
            setRecipeState(prev => ({
                ...prev,
                rating: parseFloat(res.data.data.avgScore).toFixed(1)
            }));
        }
    } catch (error) {
        handleError(error);
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentInput.trim()) return;
    setLoadingComments(true);
    try {
        await interactionApi.postComment(id, commentInput, 'recipe');
        const res = await interactionApi.getComments(id, 'recipe');
        if (res.data.success) {
            setComments(res.data.data.comments);
            setCommentInput('');
        }
    } catch (error) {
        if (!handleError(error)) {
             alert("Không thể gửi bình luận. Vui lòng thử lại.");
        }
    } finally {
        setLoadingComments(false);
    }
  };

  return {
    recipeState,
    loading,
    isLiked,
    isSaved,
    userRating,
    comments,
    commentInput,
    setCommentInput,
    handleLike,
    handleSave,
    handleRating,
    handleCommentSubmit,
    loadingComments,
    requireLogin,      // Trả về state này
    setRequireLogin    // Trả về hàm set để đóng modal
  };
}