import { Trophy, TrendingUp, Lightbulb, Clock, Users, Heart, Star, Flame } from "lucide-react";
import { motion } from "motion/react";
import ImageWithFallback from "../figma/ImageWithFallBack";
import { useNavigate } from "react-router-dom";
import { useFeaturedRecipes } from "../../hooks/useFeaturedRecipe";

export default function Sidebar() {
  const navigate = useNavigate();
  const { slides: trendingRecipes, loading } = useFeaturedRecipes();

  const quickTips = [
    {
      icon: Flame,
      title: "Cách khử mùi hôi cá",
      tip: "Dùng gừng + rượu trắng khi ướp"
    },
    {
      icon: Clock,
      title: "Tiết kiệm thời gian",
      tip: "Chuẩn bị nguyên liệu trước 1 ngày"
    },
    {
      icon: Lightbulb,
      title: "Món ngon hơn",
      tip: "Ướp gia vị ít nhất 30 phút"
    }
  ];

  return (
    <div className="top-24 space-y-6">
      {/* Challenge Banner */}
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        className="relative bg-gradient-to-br from-[#ff6b35] via-[#f7931e] to-[#ffc857] rounded-[25px] overflow-hidden shadow-xl p-6 cursor-pointer group"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10">
          {/* Trophy Icon */}
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="inline-flex bg-white/30 backdrop-blur-sm p-3 rounded-2xl mb-4"
          >
            <Trophy className="w-8 h-8 text-white" />
          </motion.div>

          <h3 className="text-white text-xl mb-2">
            Thử Thách Tuần Này
          </h3>
          
          <p className="text-white/90 text-sm mb-4">
            Nấu món <span className="font-bold">"Cơm Chiên Dương Châu"</span> và nhận ngay 500 xu!
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <Users className="w-4 h-4 text-white" />
              <span className="text-white text-sm">234 người tham gia</span>
            </div>
          </div>

          {/* CTA */}
          <button className="w-full bg-white text-[#ff6b35] py-2.5 rounded-full hover:bg-yellow-100 transition-all shadow-lg font-semibold">
            Tham gia ngay
          </button>
        </div>

        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-24 h-24 border-4 border-white/30 rounded-full"></div>
        <div className="absolute -bottom-6 -left-6 w-20 h-20 border-4 border-white/30 rounded-full"></div>
      </motion.div>

      {/* Trending Recipes */}
      <div className="bg-white rounded-[25px] shadow-lg p-6">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="w-6 h-6 text-[#ff6b35]" />
          <h3 className="text-xl">Đang Hot</h3>
        </div>

        <div className="space-y-4">
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
                {/* Rank Badge */}
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#ff6b35] to-[#ffc857] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {index + 1}
                </div>

                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                  <ImageWithFallback
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                {/* Info */}
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
          {quickTips.map((tip, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-xl hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="bg-gradient-to-br from-[#ff6b35]/10 to-[#ffc857]/10 p-2 rounded-lg flex-shrink-0">
                  <tip.icon className="w-5 h-5 text-[#ff6b35]" />
                </div>
                <div>
                  <h4 className="text-sm mb-1">{tip.title}</h4>
                  <p className="text-xs text-gray-600">{tip.tip}</p>
                </div>
              </div>
            </div>
          ))}
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
        
        <div className="relative z-10 text-center">
          <div className="inline-flex bg-white/30 backdrop-blur-sm p-2 rounded-xl mb-2">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <h4 className="text-white mb-1">Bảng Xếp Hạng</h4>
          <p className="text-white/80 text-xs mb-3">Xem top đầu bếp tuần này</p>
          <button className="bg-white text-purple-600 px-4 py-1.5 rounded-full text-sm hover:bg-yellow-300 transition-all">
            Xem ngay
          </button>
        </div>
      </motion.div>
    </div>
  );
}
