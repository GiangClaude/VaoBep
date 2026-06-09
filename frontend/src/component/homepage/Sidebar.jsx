// VỊ TRÍ: component/homepage/Sidebar.jsx

import { useState, useEffect } from "react";
import { Trophy, TrendingUp, Lightbulb, Clock, Users, Heart, Star, Flame, Droplets, ChefHat, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import ImageWithFallback from "../figma/ImageWithFallBack";
import { useNavigate } from "react-router-dom";
import { useFeaturedRecipesQuery } from "../../hooks/queries/useRecipesQueries";

import tipsData from "../../data/tips.json";
import { getRandomItems } from "../../utils/helpers"; 

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
  const [quickTips, setQuickTips] = useState([]);

  useEffect(() => {
    const randomTips = getRandomItems(tipsData, 3);
    setQuickTips(randomTips);
  }, []);

  return (
    <div className="top-24 space-y-6">
      
      {/* Widget 1: ĐANG HOT */}
      <div className="bg-white rounded-[32px] shadow-[0_8px_24px_-10px_rgba(255,117,31,0.15)] border-2 border-orange-50 p-6 relative overflow-hidden">
        {/* Decor Pattern góc phải */}
        <div className="absolute -top-6 -right-6 w-20 h-20 bg-orange-100 rounded-full opacity-50 blur-xl"></div>
        
        <div className="flex items-center gap-2.5 mb-6 relative z-10">
          <div className="p-2 bg-gradient-to-br from-[#ff751f] to-yellow-400 rounded-xl shadow-md rotate-3">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-[18px] font-extrabold text-gray-800">Nổi bật gần đây</h3>
        </div>

        <div className="space-y-5 relative z-10">
          {loading ? (
              <p className="text-center text-[#ff751f] font-bold text-sm py-4 animate-pulse">Đang hóng hớt món mới...</p>
            ) : (
              trendingRecipes.slice(0, 3).map((recipe, index) => (
              <motion.div
                key={recipe.id}
                whileHover={{ x: 6, scale: 1.02 }}
                onClick={() => navigate(`/recipe/${recipe.id}`)}
                className="flex gap-4 cursor-pointer group bg-orange-50/30 p-2.5 rounded-2xl hover:bg-orange-50 transition-colors"
              >
                {/* Số thứ tự (Huy hiệu nổi bật) */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-black text-white shadow-md
                  ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-200 ring-2 ring-yellow-200' : 
                    index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' : 
                                  'bg-gradient-to-br from-orange-300 to-orange-500'}`}>
                  {index + 1}
                </div>

                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-sm border border-white">
                  <ImageWithFallback
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500"
                  />
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h4 className="text-sm font-extrabold text-gray-800 line-clamp-2 mb-1.5 group-hover:text-[#ff751f] transition-colors leading-tight">
                    {recipe.title}
                  </h4>
                  <div className="flex items-center gap-3 text-[11px] font-bold text-gray-500">
                    <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-full shadow-sm">
                      <Heart className="w-3 h-3 text-[#ff751f] fill-[#ff751f]" />
                      <span>{recipe.likes} thích </span>
                    </div>
                    <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-full shadow-sm">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
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
          className="w-full mt-5 text-[#ff751f] font-bold text-sm py-2.5 border-2 border-dashed border-[#ff751f] hover:bg-[#ff751f] hover:text-white rounded-full transition-all duration-300 shadow-sm active:scale-95"
        >
          Xem tất cả
        </button>
      </div>

      {/* Widget 2: MẸO NẤU ĂN */}
      <div className="bg-gradient-to-br from-orange-50 via-white to-yellow-50 rounded-[32px] shadow-[0_8px_24px_-10px_rgba(255,117,31,0.15)] border-2 border-yellow-100 p-6">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="bg-gradient-to-br from-[#ff751f] to-yellow-400 p-2.5 rounded-[14px] shadow-md -rotate-3">
            <Lightbulb className="w-5 h-5 text-white animate-pulse" />
          </div>
          <h3 className="text-[18px] font-extrabold text-gray-800 flex items-center gap-1">
            Bí Kíp Bỏ Túi <Sparkles className="w-4 h-4 text-yellow-500" />
          </h3>
        </div>

        <div className="space-y-4">
          {quickTips.map((tip) => {
            const IconComponent = iconMap[tip.iconName] || Lightbulb;
            
            return (
              <motion.div
                whileHover={{ y: -3 }}
                key={tip.id}
                className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md border border-orange-50 transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-3.5">
                  <div className="bg-orange-50 group-hover:bg-[#ff751f] p-2.5 rounded-xl flex-shrink-0 transition-colors duration-300">
                    <IconComponent className="w-5 h-5 text-[#ff751f] group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-gray-800 mb-1 leading-snug group-hover:text-[#ff751f] transition-colors">{tip.title}</h4>
                    <p className="text-xs font-medium text-gray-500 leading-relaxed">{tip.tip}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Widget 3: CHALLENGE BANNER */}
      <motion.div
        whileHover={{ scale: 1.03, rotate: 1 }}
        whileTap={{ scale: 0.98 }}
        className="relative bg-gradient-to-br from-[#ff751f] via-orange-500 to-yellow-400 rounded-[32px] p-6 cursor-pointer overflow-hidden shadow-xl shadow-orange-500/20"
      >
        {/* Lớp phủ sáng (flare) */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white rounded-full blur-2xl animate-pulse" />
        </div>
        
        <div className="relative z-10 text-center flex flex-col items-center">
          <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl mb-3 shadow-inner border border-white/30">
            <Trophy className="w-8 h-8 text-white drop-shadow-md" />
          </div>
          <h4 className="text-white text-[18px] font-black tracking-wide mb-1 drop-shadow-md uppercase">Vua Đầu Bếp</h4>
          <p className="text-orange-50 text-xs font-bold mb-4">Tranh tài xếp hạng tuần này!</p>
          <button 
            onClick={() => navigate('/leaderboard')}
            className="bg-white text-[#ff751f] font-black px-6 py-2 rounded-full text-sm hover:bg-yellow-100 hover:shadow-lg transition-all duration-300 w-full"
          >
            Go Go Go 🚀
          </button>
        </div>
      </motion.div>
    </div>
  );
}