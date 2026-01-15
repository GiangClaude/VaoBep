import { useState, useEffect } from "react";
import recipeApi from "../api/recipeApi";
import { getRecipeImageUrl } from "../utils/imageHelper";
const API_BASE_URL = "http://localhost:5000";
const DEFAULT_IMG_URL = "/public/recipes/default.png"
export const useFeaturedRecipes = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const response = await recipeApi.getFeatureRecipes();

        // 1. Lấy đúng mảng dữ liệu từ cấu trúc controller trả về
        // Controller trả về: { message: "...", data: recipes, count: ... }
        // Axios bọc kết quả trong: response.data
        // => Dữ liệu thực sự nằm ở: response.data.data
        const dataFromServer = response.data?.data || [];
        
        // 2. Mapping lại tên trường từ SQL (snake_case) sang Frontend (camelCase)
        const formattedSlides = dataFromServer.map((recipe) => {

          let imageUrl = `${API_BASE_URL}${DEFAULT_IMG_URL}`;

          if (recipe.cover_image) {
            imageUrl = `${API_BASE_URL}/public/recipes/${recipe.recipe_id}/${recipe.cover_image}`;
          }

          return {
            id: recipe.recipe_id, // SQL thường trả về id (không phải _id)
          // Lưu ý: Kiểm tra lại tên cột trong DB của bạn cho image và title            
            image: getRecipeImageUrl(recipe.recipe_id, recipe.cover_image),
            title: recipe.title || recipe.recipe_name || "Món ngon", 
          
            // Map các trường khớp với SQL query của bạn
            cookTime: recipe.cook_time ? `${recipe.cook_time} phút` : "30 phút", // Giả định DB dùng cook_time
            servings: recipe.servings || 2,
          
            // CẬP NHẬT QUAN TRỌNG: Dùng đúng tên trường từ SQL
            likes: recipe.like_count || 0,         // SQL: like_count
            rating: Number(recipe.rating_avg_score || 0).toFixed(2),  // SQL: rating_avg_score
          }

        });

        setSlides(formattedSlides);
      } catch (err) {
        console.error("Lỗi khi tải recipes:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  return { slides, loading, error };
};