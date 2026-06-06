import { useState, useMemo } from "react";
import { Edit, Trash2, Eye, EyeOff, Star, Plus, Heart, FileText, ArrowUp, ArrowDown, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; 

import ImageWithFallback from "../figma/ImageWithFallBack"; 
import { CreateRecipeModal } from "../recipe/CreateRecipeModal";
import { useGlobalModal } from "../../context/ModalContext"; 
import recipeApi from "../../api/recipeApi";

// [MỚI] Hooks chuẩn
import { useOwnerRecipesQuery } from "../../hooks/queries/useRecipesQueries";
import { useDeleteRecipeMutation, useChangeRecipeStatusMutation, useCreateRecipeMutation, useUpdateRecipeMutation } from "../../hooks/mutations/useContentMutations";

export function MyRecipesTab({ isPublicView = false, publicRecipes = [] }) {
  const navigate = useNavigate();
  const { showModal } = useGlobalModal();

  const [filter, setFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: null, order: null });

  // Lấy Data từ React Query
  const { data: ownerRecipes = [], isLoading: isLoadingRecipes } = useOwnerRecipesQuery();
  
  // Khởi tạo Mutations
  const deleteMutation = useDeleteRecipeMutation();
  const statusMutation = useChangeRecipeStatusMutation();
  const createMutation = useCreateRecipeMutation();
  const updateMutation = useUpdateRecipeMutation();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);

  // // --- LOGIC SORT (Giống SavedTab) ---
  // const handleSortChange = (key) => {
  //   setSortConfig(prev => {
  //       if (prev.key !== key) return { key, order: 'desc' };
  //       if (prev.order === 'desc') return { key, order: 'asc' };
  //       return { key: null, order: null };
  //   });
  // };

  // const SortButton = ({ label, icon: Icon, sortKey }) => {
  //   const isActive = sortConfig.key === sortKey;
  //   return (
  //     <button onClick={() => handleSortChange(sortKey)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${isActive ? "bg-[#ff6b35] text-white border-[#ff6b35]" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
  //       <Icon className="w-3.5 h-3.5" /> {label}
  //       {isActive && (sortConfig.order === 'asc' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />)}
  //     </button>
  //   );
  // };

  // --- LỌC & SẮP XẾP MƯỢT MÀ TẠI CLIENT ---
  const displayRecipes = useMemo(() => {
    let result = isPublicView ? publicRecipes : ownerRecipes;

    // 1. Lọc theo trạng thái
    if (isPublicView) {
        result = result.filter(r => r.status === 'public');
    } else if (filter !== "all") {
        result = result.filter(r => r.status === filter);
    }

    // // 2. Sắp xếp bằng JS
    // if (sortConfig.key) {
    //     result = [...result].sort((a, b) => {
    //         let valA, valB;
    //         if (sortConfig.key === 'like') { valA = a.likes; valB = b.likes; }
    //         else if (sortConfig.key === 'rating') { valA = a.rating; valB = b.rating; }
    //         else { valA = new Date(a.createdAt).getTime(); valB = new Date(b.createdAt).getTime(); }

    //         if (valA < valB) return sortConfig.order === 'asc' ? -1 : 1;
    //         if (valA > valB) return sortConfig.order === 'asc' ? 1 : -1;
    //         return 0;
    //     });
    // }

    return result;
  }, [isPublicView, publicRecipes, ownerRecipes, filter]);

  // --- ACTIONS ---
  const handleCreateNew = () => {
    setEditingRecipe(null); 
    setIsCreateModalOpen(true);
  };

  const handleEditRecipe = async (id) => {
    try {
        // Lấy chi tiết form từ API (vì form cần nhiều info hơn Card)
        const response = await recipeApi.getRecipeById(id);
        setEditingRecipe(response.data.data || response.data); 
        setIsCreateModalOpen(true);
    } catch (error) {
        showModal({ title: "Lỗi", message: "Không thể tải dữ liệu công thức!", type: "error" });
    }
  };

  const handleConfirmDelete = (recipeId) => {
    showModal({
        title: "Xác nhận xóa", message: "Bạn có chắc chắn muốn xóa công thức này?", type: "warning",
        actions: [
            { label: "Hủy bỏ", style: "secondary" },
            { label: "Xóa", style: "danger", onClick: () => deleteMutation.mutate(recipeId) }
        ]
    });
  };

  const handleToggleVisibility = (recipe) => {
      const newStatus = recipe.status === 'hidden' ? 'public' : 'hidden';
      statusMutation.mutate({ recipeId: recipe.id, status: newStatus });
  };

  const handleSubmitRecipe = async (data) => {
    try {
      if (editingRecipe) await updateMutation.mutateAsync({ recipeId: editingRecipe.recipe_id, formData: data });
      else await createMutation.mutateAsync(data);
      
      setIsCreateModalOpen(false);
      showModal({ title: "Thành công", message: "Đã lưu công thức!", type: "success" });
    } catch (error) {
      showModal({ title: "Lỗi", message: error.response?.data?.message || "Lưu thất bại", type: "error" });
    }
  };

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

        {/* Nút Tạo & Bộ Sort */}
        <div className="flex items-center gap-4 ml-auto">
           {/* <div className="flex gap-2 bg-gray-50 p-1.5 rounded-full">
              <SortButton label="Mới nhất" icon={Clock} sortKey="time" />
              <SortButton label="Yêu thích" icon={Heart} sortKey="like" />
              <SortButton label="Đánh giá" icon={Star} sortKey="rating" />
           </div> */}

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

      {isCreateModalOpen && (
        <CreateRecipeModal 
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleSubmitRecipe}
          initialData={editingRecipe}
        />
      )}
    </div>
  );
}