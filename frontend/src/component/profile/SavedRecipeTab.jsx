import React, { useState } from "react";
import { Clock, Heart, Star, ArrowUp, ArrowDown, FileText, UtensilsCrossed } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { RecipeCard } from "../common/RecipeCard"; // Import đúng đường dẫn RecipeCard
import { useSavedRecipes } from "../../hooks/useSavedRecipes";
import { useSavedArticles } from "../../hooks/useSavedArticles";
import { useNavigate } from "react-router-dom";
import ArticleCard from "../common/ArticleCard"; // Import ArticleCard
import Pagination from "../common/Pagination";
const API_BASE_URL = "http://localhost:5000";

export function SavedRecipeTab() {
  const [activeTab, setActiveTab] = useState('recipe');
  const { recipes, loading, sortConfig, handleSortChange } = useSavedRecipes();
  const navigate = useNavigate();
  const recipeHook = useSavedRecipes();
  const articleHook = useSavedArticles();

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

  const renderRecipes = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {recipeHook.recipes.map((recipe) => (
        <RecipeCard
          key={recipe.recipe_id}
          recipe={{
            id: recipe.recipe_id,
            image: `${API_BASE_URL}/public/recipes/${recipe.recipe_id}/${recipe.cover_image}`,
            title: recipe.title,
            userName: recipe.author_name,
            userAvatar: `${API_BASE_URL}/public/user/${recipe.user_id}/${recipe.author_avatar}`,
            likes: recipe.like_count,
            rating: recipe.rating_avg_score,
            cookTime: `${recipe.cook_time || 60} phút`,
            servings: recipe.servings,
            isSaved: true,
            commentCount: recipe.comment_count || 0
          }}
          onClick={() => navigate(`/recipe/${recipe.recipe_id}`)}
        />
      ))}
    </div>
  );

  console.log('Saved Articles:', articleHook.articles);

// Một phần trong SavedRecipeTab.jsx
// Một phần trong SavedRecipeTab.jsx
const renderArticles = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <AnimatePresence mode="popLayout"> {/* Thêm AnimatePresence để xử lý khi xóa */}
      {articleHook.articles.map((article) => (
        <motion.div
          key={article.id}
          layout // Tự động sắp xếp lại vị trí khi có phần tử mất đi
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
        >
          <ArticleCard
            {...article}
            onClick={() => article.status === 'public' && navigate(`/article/${article.id}`)}
          />
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

  return (
    <div>
      {/* Tab Switcher */}
      <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-8 w-fit">
        <button
          onClick={() => setActiveTab('recipe')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'recipe' ? "bg-white text-[#ff6b35] shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" /> Công thức
        </button>
        <button
          onClick={() => setActiveTab('article')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'article' ? "bg-white text-[#ff6b35] shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <FileText className="w-4 h-4" /> Bài học thuật
        </button>
      </div>

      {/* Nội dung danh sách */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'recipe' ? (
             recipeHook.recipes.length > 0 ? renderRecipes() : <EmptyState message="Chưa lưu công thức nào" />
          ) : (
             articleHook.articles.length > 0 ? renderArticles() : <EmptyState message="Chưa lưu bài viết nào" />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Phân trang (Chỉ hiện cho Article vì logic của bạn yêu cầu phân trang ở Article) */}
      {activeTab === 'article' && articleHook.pagination && (
        <Pagination 
          pagination={articleHook.pagination} 
          onPageChange={(page) => articleHook.setCurrentPage(page)} 
        />
      )}
    </div>
  );
}

// Component phụ hiển thị trạng thái trống
const EmptyState = ({ message }) => (
  <div className="text-center py-20">
    <div className="inline-flex bg-gray-50 p-6 rounded-full mb-4">
      <FileText className="w-12 h-12 text-gray-300" />
    </div>
    <h3 className="text-lg text-gray-500">{message}</h3>
  </div>
);

  // return (
  //   <div>
  //     {/* Thanh Sort */}
  //     <div className="flex flex-wrap gap-3 mb-6 items-center">
  //       <span className="text-sm font-medium text-gray-500 mr-2">Sắp xếp theo:</span>
  //       <SortButton label="Thời gian" icon={Clock} sortKey="time" />
  //       <SortButton label="Yêu thích" icon={Heart} sortKey="like" />
  //       <SortButton label="Đánh giá" icon={Star} sortKey="rating" />
  //     </div>

  //     {/* Danh sách bài viết */}
  //     {recipes.length === 0 ? (
  //       <div className="text-center py-20">
  //         <div className="inline-flex bg-gray-100 p-6 rounded-full mb-4">
  //           <FileText className="w-12 h-12 text-gray-400" />
  //         </div>
  //         <h3 className="text-xl text-gray-800 mb-2">Chưa lưu công thức nào</h3>
  //         <p className="text-gray-500">Hãy khám phá và lưu lại những món ngon nhé!</p>
  //       </div>
  //     ) : (
  //       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  //         <AnimatePresence>
  //           {recipes.map((recipe) => (
  //             <motion.div
  //               key={recipe.recipe_id}
  //               layout // Giúp danh sách tự sắp xếp lại mượt mà khi có phần tử bị xóa
  //               initial={{ opacity: 0, scale: 0.9 }}
  //               animate={{ opacity: 1, scale: 1 }}
  //               exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
  //             >
  //               <RecipeCard
  //                 recipe={{
  //                   id: recipe.recipe_id,
  //                   image: `${API_BASE_URL}/public/recipes/${recipe.recipe_id}/${recipe.cover_image}`,
  //                   title: recipe.title,
  //                   userName: recipe.author_name,
  //                   userAvatar: `${API_BASE_URL}/public/user/${recipe.user_id}/${recipe.author_avatar}`,
  //                   likes: recipe.like_count,
  //                   rating: recipe.rating_avg_score,
  //                   cookTime: `${recipe.cook_time} phút`,
  //                   servings: recipe.servings,
  //                   ingredients: recipe.ingredients,
  //                   isLiked: recipe.is_liked,
  //                   isSaved: true,
  //                   description: recipe.description,
  //                   commentCount: recipe.comment_count || 0
  //                 }}
  //                 onClick={() => navigate(`/recipe/${recipe.recipe_id}`)}
  //               />
  //             </motion.div>
  //           ))}
  //         </AnimatePresence>
  //       </div>
  //     )}
  //   </div>
  // );
// }