import { useState } from "react";
import { 
  Clock, Users, Heart, Star, ArrowRight, ChefHat, 
  Flame, MessageCircle, Share2, Bookmark 
} from "lucide-react"; 
import { motion } from "motion/react";
import ImageWithFallBack from "../figma/ImageWithFallBack";
import useInteraction from "../../hooks/useInteraction"; 
import {getAvatarUrl, getRecipeImageUrl} from "../../utils/imageHelper"

export function RecipeCard({
  id,
  image,
  title,
  userId,
  userName,
  userAvatar,
  cookTime,
  servings,
  likes,
  rating,
  // [THÊM MỚI] Nhận trạng thái ban đầu từ cha
  isLiked, 
  isSaved,
  description = "Công thức ngon miệng, dễ làm và được rất nhiều người yêu thích. Hãy thử ngay hôm nay!",
  ingredients = ["Chưa có nguyên liệu"],
  steps = 5,
  calories = 350,
  createdAt = "Chưa có dữ liệu",
  commentCount = 0,
  onClick
}) {

  const [isHovered, setIsHovered] = useState(false);
  
  console.log(id, userId);

  // 1. Khởi tạo hook interaction với dữ liệu ban đầu đầy đủ
  const { 
    state: interactionState, 
    handleToggleLike, 
    handleToggleSave, 
    handleShare, 
    InteractionModal 
  } = useInteraction({
    id,
    type: 'recipe',
    // [QUAN TRỌNG] Truyền trạng thái liked/saved vào đây
    initialData: { 
        likes, 
        rating, 
        commentCount, 
        liked: isLiked, 
        saved: isSaved
    }
  });

  console.log("RecipeCard Interaction State:", interactionState);
  
  return (
    <>
      <motion.div
        initial={false}
        animate={{
          width: isHovered ? "640px" : "320px",
          y: isHovered ? -8 : 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="cursor-pointer flex-shrink-0 relative"
        style={{ 
          minWidth: isHovered ? "640px" : "320px", 
          zIndex: isHovered ? 50 : 1,
          position: 'relative'
        }}
        onClick={() => onClick && onClick()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="bg-white rounded-[25px] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-[330px] relative">
          <div className="flex h-full">
            {/* Left Side - Original Card */}
            <div className="w-80 flex-shrink-0">
              {/* Image Container */}
              <div className="relative h-48 overflow-hidden">
                <div
                  className="absolute inset-0 transform transition-transform duration-500"
                  style={{
                    transform: isHovered ? "scale(1.1)" : "scale(1)"
                  }}
                >
                  <ImageWithFallBack
                    src={getRecipeImageUrl(id, image)}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* --- ACTION BUTTONS GROUP (Top Right) --- */}
                <div className="absolute top-3 right-3 flex gap-2">
                  <button 
                    onClick={handleShare}
                    className="bg-white/90 backdrop-blur-sm p-1.5 rounded-full hover:bg-white hover:scale-110 transition-all shadow-md"
                    title="Chia sẻ"
                  >
                     <Share2 className="w-4 h-4 text-[#7d5a3f]" />
                  </button>

                  <button 
                    onClick={handleToggleLike}
                    className="bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-full flex items-center gap-1 shadow-md hover:scale-105 transition-transform"
                  >
                    <Heart 
                      className={`w-4 h-4 transition-colors ${interactionState.liked ? "text-[#ff6b35] fill-[#ff6b35]" : "text-[#ff6b35]"}`} 
                    />
                    <span className="text-sm font-medium text-[#7d5a3f]">
                      {interactionState.likeCount}
                    </span>
                  </button>

                  <div className="bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-full flex items-center gap-1 shadow-md">
                    <Star className="w-4 h-4 text-[#ffc857]" />
                    <span className="text-sm font-medium text-[#7d5a3f]">{rating}</span>
                  </div>
                </div>

                {/* --- SAVE BUTTON (Top Left) --- */}
                <button 
                   onClick={handleToggleSave}
                   className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm p-1.5 rounded-full hover:bg-white hover:scale-110 transition-all shadow-md z-10"
                   title="Lưu công thức"
                >
                    <Bookmark className={`w-4 h-4 ${interactionState.saved ? "text-[#ff6b35] fill-[#ff6b35]" : "text-[#7d5a3f]"}`} />
                </button>

                {/* User Badge */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full shadow-md">
                  <ImageWithFallBack
                    src={getAvatarUrl(userId, userAvatar)}
                    alt={userName}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-sm text-[#7d5a3f] font-medium">{userName}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex-grow flex flex-col justify-start">
                <h3 className="text-lg font-semibold mb-1 line-clamp-2 min-h-[1.5rem] text-[#2d2d2d] leading-snug">{title}</h3>
                
                <div className="flex items-center gap-3 text-sm text-[#7d5a3f]">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-[#ff6b35]" />
                    <span>{cookTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-[#ff6b35]" />
                    <span>{servings} người</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Expanded Content */}
            <motion.div
              initial={false}
              animate={{
                width: isHovered ? "320px" : "0px",
                opacity: isHovered ? 1 : 0
              }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden border-l border-[#ffc857]/30"
            >
              <div className="p-4 h-full flex flex-col w-80">
                <div className="mb-2">
                  <p className="text-sm text-[#7d5a3f] line-clamp-2 leading-relaxed">
                    {description}
                  </p>
                </div>

                <div className="mb-2">
                  <h4 className="text-sm mb-2 text-[#ff6b35] flex items-center gap-1 font-semibold">
                    <ChefHat className="w-4 h-4" />
                    Nguyên liệu chính:
                  </h4>
                  <ul className="text-sm text-[#7d5a3f] space-y-1">
                    {ingredients.slice(0, 3).map((ingredient, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ffc857]"></span>
                        {ingredient}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div className="bg-[#fff9f0] p-3 rounded-xl">
                    <div className="text-xs text-[#7d5a3f] mb-1">Số bước</div>
                    <div className="text-base font-semibold text-[#ff6b35]">{steps} bước</div>
                  </div>
                  <div className="bg-[#fff9f0] p-3 rounded-xl">
                    <div className="text-xs text-[#7d5a3f] mb-1 flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      Calories
                    </div>
                    <div className="text-base font-semibold text-[#ff6b35]">{calories}</div>
                  </div>
                </div>

                <div className="flex-grow min-h-0">
                  <h4 className="text-xs mb-2 text-[#ff6b35] flex items-center gap-1 font-semibold">
                    <MessageCircle className="w-4 h-4" />
                    ({interactionState.commentCount}) Bình luận 
                  </h4>
                </div>

                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    onClick && onClick(); 
                  }} 
                  className="w-full bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white py-2.5 rounded-full flex items-center justify-center gap-2 hover:shadow-lg transition-all mt-auto font-medium"
                >
                  <span>Xem chi tiết</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={false}
            animate={{
              rotate: isHovered ? 6 : 3,
              scale: isHovered ? 1 : 0.98
            }}
            className="absolute inset-0 bg-gradient-to-br from-[#ffc857] to-[#ff6b35] rounded-[25px] mt-2 mb-2 -z-10"
            style={{ transform: "translate(6px, 6px)" }}
          />
        </div>
      </motion.div>
      
      <InteractionModal />
    </>
  );
}