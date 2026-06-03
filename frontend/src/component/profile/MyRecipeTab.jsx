import { useState } from "react";
import { Edit, Trash2, Eye, EyeOff, Star, Plus, Heart, FileText, MessageCircle } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom"; 
import ImageWithFallback from "../figma/ImageWithFallBack"; 
import { CreateRecipeModal } from "../recipe/CreateRecipeModal"; // [THÊM MỚI]
import { useOwnerRecipes } from "../../hooks/useOwnerRecipes"; // [THÊM MỚI]
import { useCreateRecipe } from "../../hooks/useRecipeAction"; // [THÊM MỚI]
import { useAuth } from "../../AuthContext"; // [THÊM MỚI]
import { useGlobalModal } from "../../context/ModalContext"; // [THÊM MỚI]

export function MyRecipesTab({ isPublicView = false, publicRecipes = [] }) {
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useAuth();
  const { showModal } = useGlobalModal();

  // 1. TỰ QUẢN LÝ DATA FETCHING & ACTIONS (Lấy từ ProfilePage sang)
  // Nếu là public view (xem trang người khác), dùng data truyền vào. Nếu xem trang mình, tự fetch.
  const { recipes: ownerRecipes, handleToggleVisibility, refetch } = useOwnerRecipes();
  const { createNewRecipe, updateExistingRecipe, getRecipe, removeRecipe, loading: isActionLoading } = useCreateRecipe();

  const displayRecipes = isPublicView ? publicRecipes : ownerRecipes;

  // 2. STATE QUẢN LÝ MODAL NỘI BỘ
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);


  // --- LOGIC XỬ LÝ ---
  const handleCreateNew = () => {
    setEditingRecipe(null); 
    setIsCreateModalOpen(true);
  };

  const handleEditRecipe = async (id) => {
    try {
        const cleanData = await getRecipe(id);
        setEditingRecipe(cleanData);
        setIsCreateModalOpen(true);
    } catch (error) {
        showModal({ title: "Lỗi", message: "Không thể tải dữ liệu công thức!", type: "error" });
    }
  };

  const handleConfirmDelete = (recipeId) => {
    showModal({
        title: "Xác nhận xóa",
        message: "Bạn có chắc chắn muốn xóa công thức này? Hành động này không thể hoàn tác.",
        type: "warning",
        actions: [
            { label: "Hủy bỏ", style: "secondary" },
            { label: "Xóa", style: "danger", onClick: async () => {
                  try {
                      await removeRecipe(recipeId);
                      refetch(); // Cập nhật lại list
                      // Cập nhật global stats
                      setCurrentUser(prev => ({ ...prev, stats: { ...prev.stats, recipes: Math.max(0, (prev.stats.recipes || 0) - 1) } }));
                  } catch (err) {
                      alert("Xóa thất bại!");
                  }
              }
            }
        ]
    });
  };

  const handleSubmitRecipe = async (data) => {
    try {
      if (editingRecipe) {
        await updateExistingRecipe(editingRecipe.recipe_id, data);
      } else {
        await createNewRecipe(data);
        setCurrentUser(prev => ({ ...prev, stats: { ...prev.stats, recipes: (prev.stats.recipes || 0) + 1 } }));
      }
      setIsCreateModalOpen(false);
      refetch();
    } catch (error) {
      alert(`❌ Có lỗi xảy ra: ${error.message}`);
    }
  };

  const handleContactAdmin = () => {
    showModal({
        title: "Thông báo hệ thống", type: "info",
        message: "Tính năng khiếu nại/quảng bá đang được phát triển. Vui lòng quay lại sau!",
    });
  };

  // --- LỌC HIỂN THỊ ---
  const filteredRecipes = displayRecipes.filter(recipe => {
    if (isPublicView && recipe.status !== 'public') return false;
    if (filter === "all") return true;
    return recipe.status === filter;
  });

  const getStatusBadge = (status) => {
    const badges = {
      public: { text: "Công khai", color: "bg-green-500" },
      draft: { text: "Nháp", color: "bg-gray-500" },
      hidden: { text: "Đang ẩn", color: "bg-black" },
      banned: {text: "Bị ban", color: "bg-red-500"}
    };
    return badges[status] || { text: "Khác", color: "bg-gray-400" };
  };

  return (
    <div className="relative">
      {/* Filter Tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {!isPublicView && ["all", "public", "draft", "hidden"].map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-4 py-2 rounded-full transition-all ${filter === filterType ? "bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white" : "bg-white text-gray-700 hover:bg-gray-100"}`}
                >
                  {filterType === "all" && "Tất cả"}
                  {filterType === "public" && "Công khai"}
                  {filterType === "draft" && "Nháp"}
                  {filterType === "hidden" && "Đang ẩn"}
                </button>
             ))}
        </div>

        {!isPublicView && (
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleCreateNew} className="bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white px-6 py-2.5 rounded-full flex items-center gap-2 shadow-lg font-semibold">
            <Plus className="w-5 h-5" /> Đăng công thức mới
          </motion.button>
        )}
      </div>

      {/* Recipe Grid */}
      {filteredRecipes.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex bg-gradient-to-br from-[#ff6b35]/10 to-[#ffc857]/10 p-8 rounded-full mb-4">
            <FileText className="w-16 h-16 text-[#ff6b35]" />
          </div>
          <h3 className="text-2xl text-gray-800 mb-2">Chưa có công thức nào</h3>
          {!isPublicView && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleCreateNew} className="bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white px-8 py-3 rounded-full shadow-lg font-semibold mt-4">
                Đăng công thức đầu tiên
            </motion.button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => {
            const badge = getStatusBadge(recipe.status);
            return (
              <motion.div key={recipe.id} whileHover={{ y: -4 }} onClick={() => navigate(`/recipe/${recipe.id}`, { state: { recipe } })} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all group relative cursor-pointer flex flex-col h-full">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback src={recipe.image || recipe.cover_image} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className={`absolute top-3 left-3 ${badge.color} text-white px-3 py-1 rounded-full text-xs font-semibold`}>{badge.text}</div>
                  
                  {/* Action Buttons */}
                  {!isPublicView && (
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); handleEditRecipe(recipe.id); }} className="bg-white/90 p-2 rounded-lg hover:bg-blue-500 hover:text-white transition-all"><Edit className="w-4 h-4" /></button>
                        {(recipe.status === 'public' || recipe.status === 'hidden') && (
                            <button onClick={(e) => { e.stopPropagation(); handleToggleVisibility(recipe.id); }} className="bg-white/90 p-2 rounded-lg hover:bg-yellow-500 hover:text-white transition-all">
                                {recipe.status === "hidden" ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); handleConfirmDelete(recipe.id); }} className="bg-white/90 p-2 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
                {/* Content */}
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-lg mb-3 line-clamp-2 group-hover:text-[#ff6b35] transition-colors">{recipe.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1"><Heart className="w-4 h-4 text-[#ff6b35]" /><span>{recipe.likes}</span></div>
                    <div className="flex items-center gap-1"><Star className="w-4 h-4 text-[#ffc857] fill-[#ffc857]" /><span>{recipe.rating}</span></div>
                  </div>
                  {!isPublicView && (
                    <button onClick={(e) => { e.stopPropagation(); handleContactAdmin(); }} className="mt-auto w-full bg-orange-50 text-[#ff6b35] py-2 rounded-lg hover:bg-orange-100 transition-all flex justify-center gap-2">
                        <Star className="w-4 h-4" /> Quảng bá
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal Form Tạo/Sửa */}
      {isCreateModalOpen && (
        <CreateRecipeModal 
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleSubmitRecipe}
          initialData={editingRecipe}
        />
      )}
      
      {/* Loading Overlay */}
      {isActionLoading && (
         <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center text-white font-bold">
            Đang xử lý...
         </div>
      )}
    </div>
  );
}