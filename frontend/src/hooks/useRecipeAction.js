// src/hooks/useCreateRecipe.js
import { useState } from 'react';
import recipeApi from '../api/recipeApi';

export function useCreateRecipe() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createNewRecipe = async (data) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();

      // 1. Thêm các trường Text cơ bản
      formData.append('title', data.title);
      formData.append('description', data.description || '');
      formData.append('servings', data.servings);
      formData.append('cook_time', data.cookTime);
      formData.append('total_calo', data.totalCalo || 0);
      formData.append('status', data.status); // 'public' hoặc 'draft'

      // 2. Thêm file Ảnh Bìa (Quan trọng)
      // Lưu ý: data.coverImage ở form hiện tại đang là blob URL (string).
      // Bạn cần lấy FILE object thực sự từ input thẻ <input type="file" />.
      // -> Tui sẽ hướng dẫn sửa Form ở bước sau để lấy được File này.
      if (data.coverImageFile) {
        formData.append('cover_image', data.coverImageFile);
      }

      if (data.tags && data.tags.length > 0) {
          // Chỉ lấy mảng ID để gửi lên server
          const tagIds = data.tags.map(t => t.tag_id); 
          formData.append('tags', JSON.stringify(tagIds));
      }

      // 3. Xử lý Nguyên liệu (Mảng Object -> JSON String)
      // Backend sẽ parse lại chuỗi này
      formData.append('ingredients', JSON.stringify(data.ingredients));

      // 4. Xử lý Các bước (Steps)
      // Vì Database hiện tại chỉ có cột `instructions` (TEXT), 
      formData.append('steps', JSON.stringify(data.steps));
      

      // 5. Gọi API
      const response = await recipeApi.createRecipe(formData);
      
      setLoading(false);
      return response.data; // Trả về kết quả thành công

    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || "Lỗi khi tạo công thức";
      setError(errorMessage);
      throw err; // Ném lỗi để bên UI hiển thị thông báo
    }
  };

  // --- HÀM MỚI ---
  const updateExistingRecipe = async (recipeId, data) => {
        setLoading(true);
        try {
            // Logic chuyển đổi data sang FormData tương tự hàm create
            const formData = new FormData();
            console.log("Updating recipe with data:", data);
            
            // Append các trường text
            formData.append('title', data.title);
            formData.append('description', data.description || '');
            formData.append('servings', data.servings);
            formData.append('cook_time', data.cookTime);
            formData.append('total_calo', data.totalCalo || 0);
            formData.append('status', data.status);
            // ... append các trường khác (servings, cookTime, v.v.)
            
            // Xử lý Ingredients & Steps (chuyển sang JSON string)
            formData.append('ingredients', JSON.stringify(data.ingredients));
            formData.append('steps', data.steps.map(s => s.description).join('\n\n')); // Hoặc gửi mảng steps tùy backend

            // Xử lý Ảnh: Chỉ gửi nếu người dùng có chọn file mới
            if (data.coverImageFile) {
                formData.append('cover_image', data.coverImageFile);
            }

            if (data.tags && data.tags.length > 0) {
            const tagIds = data.tags.map(t => t.tag_id);
            formData.append('tags', JSON.stringify(tagIds));
        }

            // Gọi API
            const response = await recipeApi.updateRecipe(recipeId, formData);
            return response;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
  };

  const getRecipe = async (recipeId) => {
    setLoading(true);
    try {
      const response = await recipeApi.getRecipeById(recipeId);
      const dbData = response.data.data; // Dữ liệu thô từ DB

      let parsedSteps = [];
      if (dbData.instructions) {
          try {
              // Thử parse JSON
              const jsonSteps = JSON.parse(dbData.instructions);
              if (Array.isArray(jsonSteps)) {
                  parsedSteps = jsonSteps;
              }
          } catch (e) {
              // Nếu lỗi parse (do là dữ liệu cũ dạng text), ta split dòng
              parsedSteps = dbData.instructions.split('\n\n').map((desc, index) => ({
                  id: `old-step-${index}`,
                  description: desc.replace(/^Bước \d+: /, ''), // Xóa prefix "Bước X:" nếu có
                  image: ""
              }));
          }
      }
      
      // LOGIC MAPPING: Chuyển từ DB format -> Form format
      const formattedData = {
          recipe_id: dbData.recipe_id, // Giữ lại ID để biết đang sửa cái nào
          title: dbData.title || "",
          description: dbData.description || "",
          // Xử lý ảnh: Frontend cần URL đầy đủ để hiển thị
          cover_image: dbData.cover_image, // Tên file
          // Xử lý số
          servings: dbData.servings || 1,
          cookTime: dbData.cook_time || 60,
          totalCalo: dbData.total_calo || "",
          status: dbData.status || "draft",

          tags: (dbData.tags && Array.isArray(dbData.tags)) ? dbData.tags.map(t => ({
              tag_id: t.tag_id,
              name: t.name
          })) : [],

          ingredients: (dbData.ingredients && Array.isArray(dbData.ingredients)) ? dbData.ingredients.map(ing => ({
              id: ing.ingredient_id || ing.id || `db-${Math.random()}`,
              name: ing.ingredient_name || ing.name || "", 
              
              unit: ing.unit_name || ing.unit || "",       
              
              amount: ing.quantity || ing.amount || "",      
              isNew: false
          })) : [],

          instructions: dbData.instructions || "" 
      };
      
      return formattedData; // Trả về dữ liệu sạch đẹp
    } catch (error) {
      console.error("Lỗi lấy chi tiết:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };


  const removeRecipe = async (recipeId) => {
    setLoading(true);
    try {
      const response = await recipeApi.deleteRecipe(recipeId);
      return response.data; // Trả về kết quả để UI biết mà thông báo
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      throw error; // Ném lỗi ra để UI catch
    } finally {
      setLoading(false);
    }
  };

  return { createNewRecipe, 
    updateExistingRecipe, 
    getRecipe, 
    removeRecipe,
    loading, error 
  };
}