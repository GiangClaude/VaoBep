import { useState } from "react";
import { Clock, Users, Heart, Star, Share2, ChefHat, MessageCircle, Bookmark, AlertCircle, Tag } from "lucide-react";
import { motion } from "motion/react"; 
import ImageWithFallBack from "../figma/ImageWithFallBack";
import { getAvatarUrl, getRecipeImageUrl } from "../../utils/imageHelper";
import { TagList } from "./tag/TagList";
import { usePostActions } from "../../hooks/ui/interaction/usePostActions";

export function RecipeCard({ recipe = {}, onClick, expandDirection = "right" }) {
  const {
    id, image, title, userName, userAvatar, cookTime, servings, likes, rating,
    isLiked, isSaved, description, ingredientNames, stepsCount, detailedSteps,
    calories, commentCount, 
    tags 
  } = recipe;

  const [isHovered, setIsHovered] = useState(false);

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
        animate={{ width: "640px", y: -8 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="cursor-pointer flex-shrink-0 relative mb-6 group"
        style={{ minWidth: "640px", zIndex: 50, position: 'relative' }}
        onClick={onClick}
      >
        {/* Khung ngoài cùng: Thêm overflow-hidden để tự động cắt viền bo tròn của ảnh mà không bị hở */}
        <div className="bg-white rounded-[32px] overflow-hidden shadow-[0_8px_24px_-10px_rgba(255,117,31,0.2)] hover:shadow-[0_12px_32px_-10px_rgba(255,117,31,0.4)] border-2 border-transparent hover:border-orange-100 transition-all duration-300 h-[340px] relative"
             onMouseEnter={() => setIsHovered(true)}
             onMouseLeave={() => setIsHovered(false)}
        >
          <div className="flex h-full">
            {/* --- CỘT BÊN TRÁI --- */}
            <div className="w-80 flex-shrink-0 flex flex-col bg-white relative">
              
              {/* Đã xóa class `m-1` và `rounded...` ở đây để ảnh khít hoàn toàn vào các viền */}
              <div className="relative h-52 w-full overflow-hidden">
                {/* Image */}
                <div className="absolute inset-0 transform transition-transform duration-700 ease-out" style={{ transform: isHovered ? "scale(1.08) rotate(-1deg)" : "scale(1)" }}>
                  {/* Đã xóa class bo góc ở ảnh, để cho thẻ cha ngoài cùng tự cắt */}
                  <ImageWithFallBack src={getRecipeImageUrl(id, image)} alt={title} className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80" />
                
                {/* NHÓM NÚT ACTION (Góc phải) - Thêm `items-end` để các nút căn phải và không bị kéo giãn width */}
                <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
                  
                  {/* Nút Like (Dạng Con nhộng / Pill) - Đã fix height cố định */}
                  <button onClick={(e) => { e.stopPropagation(); handleLike(); }} className="h-9 px-3.5 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center gap-1.5 shadow-sm hover:shadow-orange-300/50 hover:-translate-y-1 hover:bg-orange-50 transition-all duration-300">
                    <Heart className={`w-4 h-4 transition-colors ${isLiked ? "text-[#ff751f] fill-[#ff751f]" : "text-gray-500"}`} />
                    <span className={`text-sm font-bold ${isLiked ? "text-[#ff751f]" : "text-gray-600"}`}>{likes}</span>
                  </button>

                  {/* Nút Share (Dạng Tròn) - Fix cố định w-9 h-9 */}
                  <button onClick={(e) => { e.stopPropagation(); handleShare(); }} className="w-9 h-9 flex items-center justify-center bg-white/95 backdrop-blur-md rounded-full hover:-translate-y-1 hover:bg-orange-50 hover:text-[#ff751f] text-gray-500 transition-all duration-300 shadow-sm group-hover:opacity-100 opacity-0 transform translate-x-4 group-hover:translate-x-0" title="Chia sẻ">
                     <Share2 className="w-4 h-4" />
                  </button>

                  {/* Nút Report (Dạng Tròn) - Fix cố định w-9 h-9 */}
                  <button onClick={(e) => { e.stopPropagation(); handleReport(); }} className="w-9 h-9 flex items-center justify-center bg-white/95 backdrop-blur-md rounded-full hover:-translate-y-1 hover:bg-red-50 hover:text-red-500 text-gray-500 transition-all duration-300 shadow-sm group-hover:opacity-100 opacity-0 transform translate-x-4 group-hover:translate-x-0 delay-75" title="Báo cáo bài viết">
                    <AlertCircle className="w-4 h-4" />
                  </button>
                </div>

                {/* NÚT SAVE (Góc trái) - Fix cố định w-9 h-9 */}
                <button onClick={(e) => { e.stopPropagation(); handleSave(); }} className="absolute top-3 left-3 w-9 h-9 flex items-center justify-center bg-white/95 backdrop-blur-md rounded-full hover:-translate-y-1 hover:bg-orange-50 hover:shadow-orange-300/50 transition-all duration-300 shadow-sm z-10" title="Lưu công thức">
                    <Bookmark className={`w-4 h-4 ${isSaved ? "text-[#ff751f] fill-[#ff751f]" : "text-gray-500"}`} />
                </button>

                {/* USER INFO */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-white/95 backdrop-blur-md pl-1 pr-3 py-1 rounded-full shadow-md border border-orange-50/50 hover:scale-105 transition-transform duration-300">
                  <ImageWithFallBack src={getAvatarUrl(recipe.userId, userAvatar)} alt={userName} className="w-7 h-7 rounded-full object-cover border-2 border-white shadow-sm" />
                  <span className="text-xs text-gray-700 font-bold truncate max-w-[120px]">{userName}</span>
                </div>
              </div>

              {/* THÔNG TIN BÊN DƯỚI ẢNH */}
              <div className="p-4 pt-3 flex-grow flex flex-col justify-between">
                <h3 className="text-[17px] font-extrabold mb-2 line-clamp-2 text-gray-800 leading-snug group-hover:text-[#ff751f] transition-colors">{title}</h3>
                
                <div className="mb-3">
                  <TagList tags={tags} maxDisplay={2} />
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-gray-600 mt-auto">
                  <div className="flex items-center gap-1.5 bg-orange-50 px-2.5 py-1.5 rounded-xl border border-orange-100/50">
                    <Clock className="w-3.5 h-3.5 text-[#ff751f]" /><span>{cookTime} phút</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-orange-50 px-2.5 py-1.5 rounded-xl border border-orange-100/50">
                    <Users className="w-3.5 h-3.5 text-[#ff751f]" /><span>{servings} người</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-yellow-50 px-2.5 py-1.5 rounded-xl border border-yellow-100/50">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /><span>{Math.round(rating*100)/100}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* --- CỘT BÊN PHẢI (Chi tiết mở rộng) --- */}
            <motion.div
              initial={false}
              animate={{ width: "320px", opacity: 1}}
              transition={{ duration: 0.3 }}
              className={`overflow-hidden border-l-2 border-dashed border-orange-100 bg-gradient-to-br from-white to-orange-50/30 flex-shrink-0 ${expandDirection === 'left' ? 'order-first border-r-2 border-l-0' : ''}`}
            >
              <div className="p-5 h-full flex flex-col w-80">
                <div className="mb-4">
                  <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed font-medium italic">"{description}"</p>
                </div>
                
                <div className="mb-4 bg-white p-3 rounded-2xl shadow-sm border border-orange-50">
                  <h4 className="text-sm mb-2 text-[#ff751f] flex items-center gap-1.5 font-bold uppercase tracking-wide">
                    <ChefHat className="w-4 h-4" /> Nguyên liệu chính
                  </h4>
                  <ul className="text-sm text-gray-600 font-medium space-y-2">
                    {ingredientNames && ingredientNames.length > 0
                      ? ingredientNames.slice(0, 3).map((ingredient, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.6)]"></span>
                            <span className="truncate">{ingredient}</span>
                          </li>
                        ))
                      : <li className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-gray-300"></span>Đang cập nhật...
                        </li>}
                  </ul>
                </div>
                
                <div className="flex-grow min-h-0 mt-auto flex items-end">
                  <div className="w-full bg-orange-100/50 rounded-xl p-2.5 flex items-center justify-center gap-2 hover:bg-[#ff751f] hover:text-white transition-colors group/btn text-[#ff751f] cursor-pointer">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wide">Xem {commentCount} Bình luận</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
  );
}