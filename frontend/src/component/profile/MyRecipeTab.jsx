import { useState } from "react";
import { Edit, Trash2, Eye, EyeOff, Star, Plus, Heart } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom"; // [1] Import useNavigate
import ImageWithFallback from "../figma/ImageWithFallBack";
import Modal from "../common/modal"; // [6] Import Modal component

export function MyRecipesTab({
  recipes,
  onEdit,
  onDelete, // Hàm xóa thật sự từ cha truyền xuống
  onToggleVisibility,
  onPromote,
  onCreateNew,
  isPublicView = false
}) {
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  // [2] State quản lý Modal
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    actions: []
  });

  // [3] Hàm reset/đóng modal
  const handleCloseModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const filteredRecipes = recipes.filter(recipe => {
    if (isPublicView && recipe.status !== 'public') {
        return false;
    }

    // 2. Logic lọc theo Tab (All/Public/Draft/Hidden)
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

  const handleCardClick = (recipe) => {
    navigate(`/recipe/${recipe.id}`, { state: { recipe } });
  };

  // [4] Thay thế alert cũ bằng Modal Info
  const handleContactAdmin = (recipeId) => {
    setModalConfig({
        isOpen: true,
        title: "Thông báo hệ thống",
        message: `Tính năng khiếu nại cho công thức #${recipeId} đang được phát triển. Vui lòng quay lại sau!`,
        type: "info",
        actions: [] // Mặc định sẽ hiện nút Đóng
    });
  };

  // [5] Nâng cấp: Modal xác nhận trước khi xóa
  const handleConfirmDelete = (recipeId) => {
    setModalConfig({
        isOpen: true,
        title: "Xác nhận xóa",
        message: "Bạn có chắc chắn muốn xóa công thức này? Hành động này không thể hoàn tác.",
        type: "warning", // Dùng type warning màu cam
        actions: [
            {
                label: "Hủy bỏ",
                onClick: handleCloseModal,
                style: "secondary"
            },
            {
                label: "Xóa",
                onClick: () => {
                    onDelete(recipeId); // Gọi hàm xóa từ props
                    handleCloseModal(); // Đóng modal
                },
                style: "danger" // Style màu đỏ
            }
        ]
    });
  };

  return (
    <div>
      {/* [6] Render Modal ở ngoài cùng */}
      <Modal 
        isOpen={modalConfig.isOpen}
        onClose={handleCloseModal}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        actions={modalConfig.actions}
      />

      {/* Filter Tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {isPublicView ? (
             <div className="text-gray-600 font-medium"></div>
          ) : (
             ["all", "public", "draft", "hidden"].map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-4 py-2 rounded-full transition-all ${
                    filter === filterType
                      ? "bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {filterType === "all" && "Tất cả"}
                  {filterType === "public" && "Công khai"}
                  {filterType === "draft" && "Nháp"}
                  {filterType === "hidden" && "Đang ẩn"}
                </button>
             ))
          )}
        </div>

        {!isPublicView && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCreateNew}
            className="bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white px-6 py-2.5 rounded-full flex items-center gap-2 shadow-lg font-semibold"
          >
            <Plus className="w-5 h-5" />
            Đăng công thức mới
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
          <p className="text-gray-600 mb-6">Bắt đầu chia sẻ công thức nấu ăn của bạn!</p>
          {!isPublicView && (
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCreateNew}
                className="bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white px-8 py-3 rounded-full shadow-lg font-semibold"
            >
                Đăng công thức đầu tiên
            </motion.button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => {
            const badge = getStatusBadge(recipe.status);

            return (
              <motion.div
                key={recipe.id}
                whileHover={{ y: -4 }}
                onClick={() => handleCardClick(recipe)}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all group relative cursor-pointer flex flex-col h-full"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />

                  <div className={`absolute top-3 left-3 ${badge.color} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
                    {badge.text}
                  </div>

                  {recipe.isTrusted && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-white" />
                      Đáng tin
                    </div>
                  )}

                  {/* Action Buttons */}
                  {!isPublicView && (
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); onEdit(recipe.id); }}
                        className="bg-white/90 backdrop-blur-sm p-2 rounded-lg hover:bg-blue-500 hover:text-white transition-all"
                        title="Chỉnh sửa"
                        >
                        <Edit className="w-4 h-4" />
                        </motion.button>

                        {(recipe.status === 'public' || recipe.status === 'hidden') && (
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => { e.stopPropagation(); onToggleVisibility(recipe.id); }}
                                className="bg-white/90 backdrop-blur-sm p-2 rounded-lg hover:bg-yellow-500 hover:text-white transition-all"
                                title={recipe.status === "hidden" ? "Hiện công thức" : "Ẩn công thức"}
                            >
                                {recipe.status === "hidden" ? (
                                <Eye className="w-4 h-4" />
                                ) : (
                                <EyeOff className="w-4 h-4" />
                                )}
                            </motion.button>
                        )}

                        <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            handleConfirmDelete(recipe.id); 
                        }}
                        className="bg-white/90 backdrop-blur-sm p-2 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                        title="Xóa"
                        >
                        <Trash2 className="w-4 h-4" />
                        </motion.button>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-lg mb-3 line-clamp-2 group-hover:text-[#ff6b35] transition-colors">
                    {recipe.title}
                  </h3>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4 text-[#ff6b35]" />
                      <span>{recipe.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-[#ffc857] fill-[#ffc857]" />
                      <span>{recipe.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4 text-gray-500" />
                      <span>{recipe.comments ? recipe.comments.length : 0}</span>
                    </div>
                  </div>

                  {/* Promote Button */}
                  {!isPublicView && (
                    <button
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            handleContactAdmin(recipe.id);
                        }}
                        className="mt-auto w-full bg-gradient-to-r from-[#ff6b35]/10 to-[#ffc857]/10 text-[#ff6b35] py-2 rounded-lg hover:from-[#ff6b35] hover:to-[#f7931e] hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                        <Star className="w-4 h-4" />
                        Quảng bá
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FileText({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function MessageCircle({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}