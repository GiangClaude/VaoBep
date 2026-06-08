import { useState, useEffect } from "react";
import { Trophy, TrendingUp, Lightbulb, Clock, Users, Heart, Star, Flame, Droplets, ChefHat } from "lucide-react";
import { motion } from "motion/react";
import ImageWithFallback from "../figma/ImageWithFallBack";
import { useNavigate } from "react-router-dom";
import { useFeaturedRecipesQuery } from "../../hooks/queries/useRecipesQueries";

// Import file JSON và hàm utils (Bà nhớ canh lại đường dẫn cho chuẩn nha)
import tipsData from "../../data/tips.json";
import { getRandomItems } from "../../utils/helpers"; 

// Object map: Chuyển đổi tên icon dạng chuỗi từ JSON sang Component icon thực tế
const iconMap = {
  flame: Flame,
  clock: Clock,
  lightbulb: Lightbulb,
  droplets: Droplets,
  chefHat: ChefHat,
};

export default function Sidebar() {
  const navigate = useNavigate();
  const { data: trendingRecipes = [], isLoading: loading } = useFeaturedRecipesQuery();
  
  // State lưu 3 tips sẽ được hiển thị
  const [quickTips, setQuickTips] = useState([]);

  useEffect(() => {
    // Chỉ gọi hàm lấy ngẫu nhiên 3 tips 1 lần duy nhất khi component vừa load (mount)
    const randomTips = getRandomItems(tipsData, 3);
    setQuickTips(randomTips);
  }, []);

  return (
    <div className="top-24 space-y-6">
      {/* Challenge Banner (đã được comment lại trong code gốc) */}
      {/* ... */}

      <div className="bg-white rounded-[25px] shadow-lg p-6">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="w-6 h-6 text-[#ff6b35]" />
          <h3 className="text-xl">Đang Hot</h3>
        </div>

        <div className="space-y-4 ">
          {loading ? (
              <p className="text-center text-gray-400 text-sm py-4">Đang tải món ngon...</p>
            ) : (
              trendingRecipes.slice(0, 3).map((recipe, index) => (
              <motion.div
                key={recipe.id}
                whileHover={{ x: 4 }}
                onClick={() => navigate(`/recipe/${recipe.id}`)}
                className="flex gap-3 cursor-pointer group"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#ff6b35] to-[#ffc857] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {index + 1}
                </div>

                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 ">
                  <ImageWithFallback
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm line-clamp-2 mb-1 group-hover:text-[#ff6b35] transition-colors">
                    {recipe.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-[#ff6b35]" />
                      <span>{recipe.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-[#ffc857] fill-[#ffc857]" />
                      <span>{recipe.rating}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
          ))
        )}
        </div>

        <button 
          onClick={() => navigate('/recipes')}
          className="w-full mt-4 text-[#ff6b35] hover:text-[#f7931e] text-sm py-2 border-2 border-[#ffc857] hover:border-[#ff6b35] rounded-full transition-all"
        >
          Xem thêm
        </button>
      </div>

      {/* Quick Tips */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-[25px] shadow-lg p-6 border-2 border-[#ffc857]/30">
        <div className="flex items-center gap-2 mb-5">
          <div className="bg-gradient-to-br from-[#ff6b35] to-[#ffc857] p-2 rounded-xl">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl">Mẹo Nấu Ăn</h3>
        </div>

        <div className="space-y-4">
          {quickTips.map((tip) => {
            // Lấy Component Icon từ object map, nếu không tìm thấy thì dùng Lightbulb làm mặc định
            const IconComponent = iconMap[tip.iconName] || Lightbulb;
            
            return (
              <div
                key={tip.id}
                className="bg-white p-4 rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-gradient-to-br from-[#ff6b35]/10 to-[#ffc857]/10 p-2 rounded-lg flex-shrink-0">
                    <IconComponent className="w-5 h-5 text-[#ff6b35]" />
                  </div>
                  <div>
                    <h4 className="text-sm mb-1">{tip.title}</h4>
                    <p className="text-xs text-gray-600">{tip.tip}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Challenge Small Banner */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="relative bg-gradient-to-r from-purple-600 to-pink-600 rounded-[20px] p-5 cursor-pointer overflow-hidden"
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white rounded-full blur-xl animate-pulse" />
        </div>
        
        <div 
          className="relative z-10 text-center"
        >
          <div className="inline-flex bg-white/30 backdrop-blur-sm p-2 rounded-xl mb-2">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <h4 className="text-white mb-1">Bảng Xếp Hạng</h4>
          <p className="text-white/80 text-xs mb-3">Xem top đầu bếp tuần này</p>
          <button 
          onClick={() => navigate('/leaderboard')}
          className="bg-white text-purple-600 px-4 py-1.5 rounded-full text-sm hover:bg-yellow-300 transition-all">
            Xem ngay
          </button>
        </div>
      </motion.div>
    </div>
  );
}