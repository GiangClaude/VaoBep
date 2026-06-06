import { useState } from "react";
import { Clock, Users, Heart, Star, ArrowRight, ChefHat, Flame, MessageCircle, Share2, Bookmark, AlertCircle } from "lucide-react"; 
import { motion } from "motion/react"; // Thư viện animation bạn đang dùng
import ImageWithFallBack from "../figma/ImageWithFallBack";
import { getAvatarUrl, getRecipeImageUrl } from "../../utils/imageHelper";

// [MỚI] Dùng Colocation UI Hook
import { usePostActions } from "../../hooks/ui/interaction/usePostActions";

export function RecipeCard({ recipe = {}, onClick, expandDirection = "right" }) {
  const {
    id, image, title, userName, userAvatar, cookTime, servings, likes, rating,
    isLiked, isSaved, description, ingredientNames, stepsCount, detailedSteps,
    calories, commentCount
  } = recipe;

  const [isHovered, setIsHovered] = useState(false);

  // [MỚI] Khai báo Hook UI (Gọi phát lấy hàm dùng luôn, không cần state lằng nhằng)
  const { handleLike, handleSave, handleShare, handleReport } = usePostActions({
    id,
    type: 'recipe',
    isLiked: isLiked,
    likesCount: likes,
    isSaved: isSaved
  });

  const displaySteps = stepsCount || (detailedSteps ? detailedSteps.length : 0);
  
  return (
      <motion.div
        initial={false}
        animate={{ width: "640px", y:-8 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="cursor-pointer flex-shrink-0 relative mb-4"
        style={{ minWidth: "640px", zIndex: 50, position: 'relative' }}
        onClick={onClick}
      >
        <div className="bg-white rounded-[25px] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-[330px] relative"
             onMouseEnter={() => setIsHovered(true)}
             onMouseLeave={() => setIsHovered(false)}
        >
          <div className="flex h-full">
            {/* --- Cột bên Trái --- */}
            <div className="w-80 flex-shrink-0">
              <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 transform transition-transform duration-500" style={{ transform: isHovered ? "scale(1.1)" : "scale(1)" }}>
                  <ImageWithFallBack src={getRecipeImageUrl(id, image)} alt={title} className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* NHÓM NÚT ACTION (GỌI TRỰC TIẾP HÀM TỪ HOOK) */}
                <div className="absolute top-3 right-3 flex gap-2">
                  <button onClick={handleShare} className="bg-white/90 backdrop-blur-sm p-1.5 rounded-full hover:bg-white hover:scale-110 transition-all shadow-md" title="Chia sẻ">
                     <Share2 className="w-4 h-4 text-[#7d5a3f]" />
                  </button>

                  <button onClick={handleLike} className="bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-full flex items-center gap-1 shadow-md hover:scale-105 transition-transform">
                    {/* isLiked được React Query kiểm soát, bấm là đổi tức thì! */}
                    <Heart className={`w-4 h-4 transition-colors ${isLiked ? "text-[#ff6b35] fill-[#ff6b35]" : "text-[#ff6b35]"}`} />
                    <span className="text-sm font-medium text-[#7d5a3f]">{likes}</span>
                  </button>

                  <button onClick={handleReport} className="bg-white/90 backdrop-blur-sm p-1.5 rounded-full hover:bg-white hover:scale-110 transition-all shadow-md" title="Báo cáo bài viết">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  </button>
                </div>

                {/* NÚT SAVE */}
                <button onClick={handleSave} className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm p-1.5 rounded-full hover:bg-white hover:scale-110 transition-all shadow-md z-10" title="Lưu công thức">
                    <Bookmark className={`w-4 h-4 ${isSaved ? "text-[#ff6b35] fill-[#ff6b35]" : "text-[#7d5a3f]"}`} />
                </button>

                <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full shadow-md">
                  <ImageWithFallBack src={getAvatarUrl(recipe.userId, userAvatar)} alt={userName} className="w-6 h-6 rounded-full object-cover" />
                  <span className="text-sm text-[#7d5a3f] font-medium">{userName}</span>
                </div>
              </div>

              <div className="p-4 flex-grow flex flex-col justify-start">
                <h3 className="text-lg font-semibold mb-1 line-clamp-2 min-h-[1.5rem] text-[#2d2d2d] leading-snug">{title}</h3>
                <div className="flex items-center gap-3 text-sm text-[#7d5a3f]">
                  <div className="flex items-center gap-1"><Clock className="w-4 h-4 text-[#ff6b35]" /><span>{cookTime}</span></div>
                  <div className="flex items-center gap-1"><Users className="w-4 h-4 text-[#ff6b35]" /><span>{servings}</span></div>
                  <div className="flex items-center gap-1"><Star className="w-4 h-4 text-[#ff6b35]" /><span>{Math.round(rating*100)/100}</span></div>
                </div>
              </div>
            </div>

            {/* --- Cột bên Phải --- (Giữ nguyên như cũ) */}
            <motion.div
              initial={false}
              animate={{ width: "320px", opacity: 1}}
              transition={{ duration: 0.3 }}
              className={`overflow-hidden border-l border-[#ffc857]/30 bg-white flex-shrink-0 ${expandDirection === 'left' ? 'order-first border-r border-l-0' : ''}`}
            >
              <div className="p-4 h-full flex flex-col w-80">
                <div className="mb-2">
                  <p className="text-sm text-[#7d5a3f] line-clamp-2 leading-relaxed">{description}</p>
                </div>
                <div className="mb-2">
                  <h4 className="text-sm mb-2 text-[#ff6b35] flex items-center gap-1 font-semibold"><ChefHat className="w-4 h-4" /> Nguyên liệu:</h4>
                  <ul className="text-sm text-[#7d5a3f] space-y-1">
                    {ingredientNames && ingredientNames.length > 0
                      ? ingredientNames.slice(0, 3).map((ingredient, index) => (
                          <li key={index} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#ffc857]"></span>{ingredient}</li>
                        ))
                      : <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#ffc857]"></span>Đang cập nhật...</li>}
                  </ul>
                </div>
                <div className="flex-grow min-h-0 mt-4">
                  <h4 className="text-xs mb-2 text-[#ff6b35] flex items-center gap-1 font-semibold"><MessageCircle className="w-4 h-4" /> ({commentCount}) Bình luận</h4>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
  );
}