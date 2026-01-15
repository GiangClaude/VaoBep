import { useState, useEffect, useCallback } from "react"; // 1. Import useCallback
import recipeApi from "../api/recipeApi";

// Cấu hình URL Backend
const API_BASE_URL = "http://localhost:5000"; 

export const useOwnerRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Bọc logic fetch trong useCallback để có thể gọi lại (refetch)
  const fetchRecipes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await recipeApi.getOwnerRecipe();
      
      const dataFromServer = response.data?.data || [];

      // --- LOGIC MAPPING DỮ LIỆU ---
      const formattedRecipes = dataFromServer.map((recipe) => {
          
      let imageUrl = "https://via.placeholder.com/400x300";
        
        if (recipe.cover_image) {
            // Trường hợp 1: Ảnh là link online (http...)
            if (recipe.cover_image.startsWith("http")) {
                imageUrl = recipe.cover_image;
            } 
            // Trường hợp 2: Ảnh lưu ở backend
            else {
                // Trong DB bạn lưu: "/recipes/abc-xyz/anh.jpg"
                // Ta cần ghép thành: "http://localhost:5000/recipes/abc-xyz/anh.jpg"
                
                imageUrl = `${API_BASE_URL}/public/recipes/${recipe.recipe_id}/${recipe.cover_image}`;
            }
        }

        // B. Xử lý Avatar tác giả
        let avatarUrl = "/assets/avatar_default.png";
        if (recipe.author_avatar) {
             if (recipe.author_avatar.startsWith("http")) {
                avatarUrl = recipe.author_avatar;
             } else {
                const cleanPath = recipe.author_avatar.startsWith('/') 
                    ? recipe.author_avatar 
                    : `/${recipe.author_avatar}`;
                avatarUrl = `${API_BASE_URL}${cleanPath}`;
             }
        }

        // C. Xử lý Ingredients (chuỗi -> mảng)
        let ingredientsArray = [];
        if (recipe.ingredient_names) {
            ingredientsArray = recipe.ingredient_names.split(',');
        } else {
            ingredientsArray = ["Đang cập nhật nguyên liệu..."];
        }

        // D. Xử lý Comments
        let commentsArray = [];
        if (recipe.comment_data) {
            const rawComments = recipe.comment_data.split('|||');
            commentsArray = rawComments.map(str => {
                const parts = str.split(':::'); 
                return {
                    user: parts[0] || "Ẩn danh", 
                    text: parts[1] || ""        
                };
            });
        }

        return {
          id: recipe.recipe_id, 
          title: recipe.title || "Món ăn chưa đặt tên",
          image: imageUrl, // Đã xử lý full URL
          description: recipe.description || "Chưa có mô tả.",
          status: recipe.status,
          userName: recipe.author_name || "Thành viên Bếp",
          userAvatar: avatarUrl, 
          likes: recipe.like_count || 0,
          rating: Number(recipe.rating_avg_score || 0).toFixed(1),
          cookTime: recipe.cook_time ? `${recipe.cook_time} phút` : "30 phút",
          servings: recipe.servings ? `${recipe.servings} người` : "2 người",
          calories: recipe.total_calo || 0,
          steps: 5, 
          createdAt: new Date(recipe.created_at).toLocaleDateString('vi-VN'),
          comments: commentsArray,
          ingredients: ingredientsArray 
        };
      });

      setRecipes(formattedRecipes);
    } catch (err) {
      console.error("Lỗi khi tải recipe cá nhân:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []); // Dependency rỗng để hàm không bị tạo lại liên tục

  // 3. Gọi hàm fetch lần đầu tiên khi component mount
  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);


  const handleToggleVisibility = async (recipeId) => {
    try {
        // 1. Tìm công thức trong list hiện tại để biết status cũ
        const currentRecipe = recipes.find(r => r.id === recipeId);
        if (!currentRecipe) return;

        // 2. Tính toán status mới
        // Nếu đang hidden -> chuyển thành public
        // Nếu đang public/draft -> chuyển thành hidden
        const newStatus = currentRecipe.status === 'hidden' ? 'public' : 'hidden';

        // 3. Gọi API
        await recipeApi.changeStatus(recipeId, newStatus);

        // 4. Cập nhật State Local ngay lập tức (để UI đổi màu thẻ Badge mà không cần reload trang)
        setRecipes(prevRecipes => 
            prevRecipes.map(recipe => 
                recipe.id === recipeId 
                    ? { ...recipe, status: newStatus } 
                    : recipe
            )
        );
        
        return { success: true, newStatus };

    } catch (err) {
        console.error("Lỗi khi đổi trạng thái:", err);
        alert("Không thể thay đổi trạng thái lúc này."); // Hoặc dùng Modal error của bạn
        return { success: false };
    }
  };

  // 4. Trả về thêm hàm refetch (chính là fetchRecipes)
  return { recipes, loading, error, handleToggleVisibility, refetch: fetchRecipes };
};