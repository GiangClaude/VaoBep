import { useState, useEffect } from "react";
import recipeApi from "../api/recipeApi";
import { normalizeRecipeList } from "../utils/normalizeRecipe";

// Cấu hình URL (Nên đưa vào file config chung nếu dự án lớn)
const API_BASE_URL = "http://localhost:5000"; 
// Lưu ý: Controller bạn lưu ảnh dạng "/recipes/id/filename", nên ta cần check để ghép URL cho đúng

export const useRecentlyRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const response = await recipeApi.getRecentlyRecipes();
        
        // Backend trả về: { message: "...", data: [...] }
        const dataFromServer = response.data?.data || [];

        // Sử dụng hàm normalizeRecipeList để chuẩn hóa toàn bộ danh sách recipe
        setRecipes(normalizeRecipeList(dataFromServer));
      } catch (err) {
        console.error("Lỗi khi tải Recently recipes:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  return { recipes, loading, error };
};