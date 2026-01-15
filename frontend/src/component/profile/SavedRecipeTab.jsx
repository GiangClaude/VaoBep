import React from "react";
import { Clock, Heart, Star, ArrowUp, ArrowDown, FileText } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { RecipeCard } from "../common/RecipeCard"; // Import đúng đường dẫn RecipeCard
import { useSavedRecipes } from "../../hooks/useSavedRecipes";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000";

export function SavedRecipeTab() {
  const { recipes, loading, sortConfig, handleSortChange } = useSavedRecipes();
  const navigate = useNavigate();

  // Component hiển thị nút Sort
  const SortButton = ({ label, icon: Icon, sortKey }) => {
    const isActive = sortConfig.key === sortKey;
    
    return (
      <button
        onClick={() => handleSortChange(sortKey)}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-full transition-all border
          ${isActive 
            ? "bg-[#ff6b35] text-white border-[#ff6b35] shadow-md" 
            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}
        `}
      >
        <Icon className="w-4 h-4" />
        <span>{label}</span>
        
        {/* Chỉ hiện icon mũi tên khi đang active */}
        {isActive && (
          <div className="flex flex-col ml-1">
            {sortConfig.order === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
          </div>
        )}
      </button>
    );
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Đang tải danh sách đã lưu...</div>;
  }

  return (
    <div>
      {/* Thanh Sort */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <span className="text-sm font-medium text-gray-500 mr-2">Sắp xếp theo:</span>
        <SortButton label="Thời gian" icon={Clock} sortKey="time" />
        <SortButton label="Yêu thích" icon={Heart} sortKey="like" />
        <SortButton label="Đánh giá" icon={Star} sortKey="rating" />
      </div>

      {/* Danh sách bài viết */}
      {recipes.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex bg-gray-100 p-6 rounded-full mb-4">
            <FileText className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl text-gray-800 mb-2">Chưa lưu công thức nào</h3>
          <p className="text-gray-500">Hãy khám phá và lưu lại những món ngon nhé!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {recipes.map((recipe) => (
              <motion.div
                key={recipe.recipe_id}
                layout // Giúp danh sách tự sắp xếp lại mượt mà khi có phần tử bị xóa
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              >
                <RecipeCard
                  id={recipe.recipe_id}
                  image={`${API_BASE_URL}/public/recipes/${recipe.recipe_id}/${recipe.cover_image}`}
                  title={recipe.title}
                  userName={recipe.author_name}
                  userAvatar={`${API_BASE_URL}/public/user/${recipe.user_id}/${recipe.author_avatar}`} // Avatar cần xử lý url đầy đủ nếu chưa có
                  likes={recipe.like_count}
                  rating={recipe.rating_avg_score}
                  cookTime={`${recipe.cook_time} phút`}
                  servings={recipe.servings}
                    ingredients={recipe.ingredients}

                  // Các thông tin phụ nếu backend trả về, hoặc để mặc định
                  isLiked = {recipe.is_liked}
                  isSaved={true}
                  description={recipe.description}
                  commentCount={recipe.comment_count || 0}
                  onClick={() => navigate(`/recipe/${recipe.recipe_id}`)}
                  
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}