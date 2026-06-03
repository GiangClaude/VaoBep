// utils/normalizeRecipe.js
import { getAvatarUrl, getRecipeImageUrl } from "./imageHelper";

/**
 * Hàm hỗ trợ parse chuỗi instructions thành mảng các bước nấu ăn
 * @param {string} instructionData - Chuỗi JSON hoặc text thô chứa các bước
 * @returns {Array} Mảng các object step
 */
function parseInstructions(instructionData) {
  let steps = [];
  if (!instructionData) return [];

  try {
    const parsedSteps = JSON.parse(instructionData);
    if (Array.isArray(parsedSteps)) {
      steps = parsedSteps.map((stepItem, index) => ({
        step: index + 1,
        description: typeof stepItem === 'object' ? stepItem.description : stepItem,
        image: stepItem.image || null
      }));
    }
  } catch (e) {
    steps = instructionData.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map((line, index) => ({
        step: index + 1,
        description: line,
        image: null
      }));
  }
  return steps;
}

/**
 * Chuẩn hóa dữ liệu recipe từ backend để phù hợp với giao diện frontend
 * @param {Object} r - Dữ liệu recipe thô từ API
 * @returns {Object} Dữ liệu đã được chuẩn hóa
 */
export function normalizeRecipe(r) {
  const parsedSteps = parseInstructions(r.instructions);

  return {
    id: r.recipe_id || r.id,
    title: r.title || "",
    description: r.description || "",
    stepsCount: r.steps || parsedSteps.length || 0, 
    cookTime: r.cook_time ? `${r.cook_time} phút` : "",
    servings: r.servings ? `${r.servings} người` : "",
    calories: r.total_calo !== undefined && r.total_calo !== null ? Number(r.total_calo) : 0,
    image: getRecipeImageUrl(r.recipe_id, r.cover_image),
    createdAt: r.created_at ? new Date(r.created_at).toLocaleDateString('vi-VN') : "",
    status: r.status || "public",
    likes: r.like_count !== undefined && r.like_count !== null ? Number(r.like_count) : 0,
    rating: r.rating_avg_score !== undefined && r.rating_avg_score !== null ? Number(r.rating_avg_score).toFixed(1) : "0.0",
    commentCount: r.comment_count !== undefined && r.comment_count !== null ? Number(r.comment_count) : 0,
    userName: r.author_name || "Thành viên Bếp",
    userAvatar: getAvatarUrl(r.user_id,r.author_avatar),
    userId: r.user_id,
    isLiked: !!r.is_liked,
    isSaved: !!r.is_saved,
    isTrusted: Boolean(r.is_trusted),
    
    // --- PHẦN SỬA ĐỔI CHÍNH Ở ĐÂY ---
    // Chuyển đổi mảng ingredients từ backend thành detailedIngredients cho UI
    detailedIngredients: Array.isArray(r.ingredients) 
      ? r.ingredients.map(ing => ({
          name: ing.ingredient_name,
          amount: `${ing.quantity} ${ing.unit_name}`
        }))
      : [],
    // -------------------------------

    ingredientNames: r.ingredient_names
      ? r.ingredient_names.split(',').map(s => s.trim())
      : [],
    rawInstructions: r.instructions || "", 
    detailedSteps: parsedSteps, 
    detailedDescription: r.description || "", // Đảm bảo trùng tên với RecipeDetailPage
    reportCount: r.report_count !== undefined ? Number(r.report_count) : 0,
    ratingCount: r.rating_count !== undefined ? Number(r.rating_count) : 0,
    ratingSumScore: r.rating_sum_score !== undefined ? Number(r.rating_sum_score) : 0,
    updateAt: r.update_at || ""
  };
}
export function normalizeRecipeList(arr) {
  return Array.isArray(arr) ? arr.map(normalizeRecipe) : [];
}