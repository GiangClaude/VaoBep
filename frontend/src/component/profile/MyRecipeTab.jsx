import { Edit, Trash2, Eye, EyeOff, Star, Plus, Heart, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; 

import ImageWithFallback from "../figma/ImageWithFallBack"; 
import { CreateRecipeModal } from "../recipe/CreateRecipeModal";

// CHỈ IMPORT DUY NHẤT UI HOOK NÀY VÀO
import { useMyRecipesUI } from "../../hooks/ui/profile/useMyRecipesTabUI";

export function MyRecipesTab({ isPublicView = false, publicRecipes = [] }) {
  const navigate = useNavigate();

  // BÓC TÁCH TOÀN BỘ DATA VÀ ACTIONS TỪ HOOK (View không tự xử lý logic nào cả)
  const {
    filter, setFilter,
    isCreateModalOpen, setIsCreateModalOpen,
    editingRecipe,
    isLoadingRecipes,
    displayRecipes,
    handleCreateNew,
    handleEditRecipe,
    handleConfirmDelete,
    handleToggleVisibility
  } = useMyRecipesUI({ isPublicView, publicRecipes });

  // UI Helper: Hàm này chỉ biến đổi chuỗi thành màu sắc, nên để ở View là hợp lý
  const getStatusBadge = (status) => {
    const badges = {
      public: { text: "Công khai", color: "bg-green-500" },
      draft: { text: "Nháp", color: "bg-gray-500" },
      hidden: { text: "Đang ẩn", color: "bg-black" },
      banned: { text: "Bị ban", color: "bg-red-500" }
    };
    return badges[status] || { text: "Khác", color: "bg-gray-400" };
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        
        {/* Bộ lọc trạng thái */}
        <div className="flex gap-2">
          {!isPublicView && ["all", "public", "draft", "hidden"].map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${filter === filterType ? "bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white" : "bg-white text-gray-700 hover:bg-gray-100"}`}
                >
                  {filterType === "all" ? "Tất cả" : filterType === "public" ? "Công khai" : filterType === "draft" ? "Nháp" : "Đang ẩn"}
                </button>
          ))}
        </div>

        <div className="flex items-center gap-4 ml-auto">
          {!isPublicView && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleCreateNew} className="bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white px-5 py-2 rounded-full flex items-center gap-2 shadow-md font-semibold text-sm">
              <Plus className="w-4 h-4" /> Tạo món
            </motion.button>
          )}
        </div>
      </div>

      {isLoadingRecipes ? (
         <div className="py-20 text-center text-gray-500 animate-pulse">Đang tải công thức của bạn...</div>
      ) : displayRecipes.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex bg-gradient-to-br from-[#ff6b35]/10 to-[#ffc857]/10 p-8 rounded-full mb-4">
            <FileText className="w-16 h-16 text-[#ff6b35]" />
          </div>
          <h3 className="text-2xl text-gray-800 mb-2">Chưa có công thức nào</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayRecipes.map((recipe) => {
            const badge = getStatusBadge(recipe.status);
            return (
              <motion.div layout key={recipe.id} whileHover={{ y: -4 }} onClick={() => navigate(`/recipe/${recipe.id}`)} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group relative cursor-pointer flex flex-col h-full border border-gray-100">
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback src={recipe.image || recipe.cover_image} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className={`absolute top-3 left-3 ${badge.color} text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm`}>{badge.text}</div>
                  
                  {/* Action Buttons */}
                  {!isPublicView && (
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); handleEditRecipe(recipe.id); }} className="bg-white/90 p-2 rounded-lg hover:bg-blue-500 hover:text-white transition-all shadow-md"><Edit className="w-4 h-4" /></button>
                        {(recipe.status === 'public' || recipe.status === 'hidden') && (
                            <button onClick={(e) => { e.stopPropagation(); handleToggleVisibility(recipe); }} className="bg-white/90 p-2 rounded-lg hover:bg-yellow-500 hover:text-white transition-all shadow-md">
                                {recipe.status === "hidden" ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); handleConfirmDelete(recipe.id); }} className="bg-white/90 p-2 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-md"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-[#ff6b35] transition-colors">{recipe.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 mt-auto">
                    <div className="flex items-center gap-1"><Heart className="w-4 h-4 text-[#ff6b35]" /><span>{recipe.likes}</span></div>
                    <div className="flex items-center gap-1"><Star className="w-4 h-4 text-[#ffc857] fill-[#ffc857]" /><span>{recipe.rating}</span></div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Gọi Modal Create/Edit */}
      {isCreateModalOpen && (
        <CreateRecipeModal 
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          initialData={editingRecipe}
        />
      )}
    </div>
  );
}