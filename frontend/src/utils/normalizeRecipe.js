// utils/normalizeRecipe.js
import { getAvatarUrl, getRecipeImageUrl } from "./imageHelper";

// --- [THÊM] Hàm helper xử lý instructions ---
function parseInstructions(instructionData) {
  let steps = [];
  if (!instructionData) return [];

  try {
    // 1. Thử parse JSON (cho dữ liệu Mới)
    const parsedSteps = JSON.parse(instructionData);
    
    if (Array.isArray(parsedSteps)) {
      steps = parsedSteps.map((stepItem, index) => ({
        step: index + 1,
        // Xử lý trường hợp stepItem là object hoặc string
        description: typeof stepItem === 'object' ? stepItem.description : stepItem,
        image: stepItem.image || null
      }));
    }
  } catch (e) {
    // 2. Fallback: Xử lý dạng text cũ (split xuống dòng)
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

export function normalizeRecipe(r) {
  // --- [SỬA] Gọi hàm helper ---
  const parsedSteps = parseInstructions(r.instructions);
  // console.log("Data: ", r);
  return {
    id: r.recipe_id || r.id,
    title: r.title || "",
    description: r.description || "",
    
    // Giữ nguyên steps là số lượng bước (nếu logic cũ cần)
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
    userAvatar: getAvatarUrl(r.author_avatar),
    userId: r.user_id,
    isLiked: !!r.is_liked,
    isSaved: !!r.is_saved,
    isTrusted: Boolean(r.is_trusted),
    ingredientNames: r.ingredient_names
      ? r.ingredient_names.split(',').map(s => s.trim())
      : [],
      
    // --- [SỬA] Trả về dữ liệu đã được parse chuẩn ---
    // instructions: vẫn giữ chuỗi thô phòng khi cần edit form
    rawInstructions: r.instructions || "", 
    // detailedSteps: mảng object chuẩn để render UI
    detailedSteps: parsedSteps, 

    reportCount: r.report_count !== undefined ? Number(r.report_count) : 0,
    ratingCount: r.rating_count !== undefined ? Number(r.rating_count) : 0,
    ratingSumScore: r.rating_sum_score !== undefined ? Number(r.rating_sum_score) : 0,
    updateAt: r.update_at || ""
  };
}

export function normalizeRecipeList(arr) {
  return Array.isArray(arr) ? arr.map(normalizeRecipe) : [];
}