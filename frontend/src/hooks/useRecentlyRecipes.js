import { useState, useEffect } from "react";
import recipeApi from "../api/recipeApi";

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

        // --- LOGIC MAPPING DỮ LIỆU (DB -> RecipeCard) ---
        const formattedRecipes = dataFromServer.map((recipe) => {
            
          // 1. Xử lý ảnh
          // Controller lưu: "/recipes/{id}/{filename}"
          // Frontend cần: "http://localhost:5000/recipes/{id}/{filename}"
          let imageUrl = "https://via.placeholder.com/400x300"; // Ảnh mặc định
          
          if (recipe.cover_image) {
             // Kiểm tra nếu ảnh đã là link online (http) thì giữ nguyên
             if (recipe.cover_image.startsWith("http")) {
                 imageUrl = recipe.cover_image;
             } else {
                 // Ghép domain backend vào đường dẫn tương đối
                 // Loại bỏ dấu / ở đầu nếu API_BASE_URL đã có, hoặc xử lý để tránh "//"
                 imageUrl = `${API_BASE_URL}/public/recipes/${recipe.recipe_id}/${recipe.cover_image}`;
             }
          }

          let avatarUrl = "/assets/avatar_default.png";
            if (recipe.author_avatar) {
                avatarUrl = `${API_BASE_URL}/public/user/${recipe.user_id}/${recipe.author_avatar}`;
            }

            let ingredientsArray = [];
          if (recipe.ingredient_names) {
              ingredientsArray = recipe.ingredient_names.split(',');
          } else {
              ingredientsArray = ["Đang cập nhật nguyên liệu..."];
          }

          let commentsArray = [];
            
            if (recipe.comment_data) {
                // 1. Tách chuỗi dài thành mảng các comment: ["User A:::Text A", "User B:::Text B"]
                const rawComments = recipe.comment_data.split('|||');
                
                // 2. Map qua từng chuỗi để tách Tên và Nội dung
                commentsArray = rawComments.map(str => {
                    // Tách bằng separator đã quy định ở SQL
                    const parts = str.split(':::'); 
                    return {
                        user: parts[0] || "Ẩn danh", // Phần trước ::: là tên
                        text: parts[1] || ""         // Phần sau ::: là nội dung
                    };
                });
            } else {
                // Nếu không có comment nào, tạo comment giả để UI đỡ trống (tuỳ chọn)
                // Hoặc để mảng rỗng []
                 commentsArray = []; 
            }


          // 2. Return object khớp hoàn toàn props của RecipeCard
          return {
            id: recipe.recipe_id, // Card dùng key={id}
            
            // Thông tin hiển thị chính
            title: recipe.title || "Món ăn chưa đặt tên",
            image: imageUrl,
            description: recipe.description || "Chưa có mô tả cho món ăn này.",
            
            // Thông tin người dùng (Placeholder vì API chưa join bảng Users)
            userName: recipe.author_name || "Thành viên Bếp",
            userAvatar: avatarUrl, 

            // Số liệu thống kê (Map từ DB snake_case)
            likes: recipe.like_count || 0,
            rating: Number(recipe.rating_avg_score || 0).toFixed(1), // Làm tròn 1 số thập phân
            cookTime: recipe.cook_time ? `${recipe.cook_time} phút` : "30 phút",
            servings: recipe.servings ? `${recipe.servings} người` : "2 người",
            calories: recipe.total_calo || 0,
            
            // Các trường bổ sung cho Card
            steps: 5, // DB chưa trả về số bước, tạm để default
            createdAt: new Date(recipe.created_at).toLocaleDateString('vi-VN'), // Format ngày
            comments: commentsArray, // Chưa join comment
            ingredients: ingredientsArray // Chưa join ingredients
          };
        });

        setRecipes(formattedRecipes);
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