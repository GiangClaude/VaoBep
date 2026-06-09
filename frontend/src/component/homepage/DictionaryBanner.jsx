// VỊ TRÍ: component/homepage/DictionaryBanner.jsx

import { BookOpenCheck, Search, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

export default function DictionaryBanner() {
  const navigate = useNavigate();
  const handleClick = () => {
      navigate('/dish-map');
  }
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative bg-gradient-to-br from-[#ff5e00] via-[#ff751f] to-yellow-400 rounded-[40px] overflow-hidden shadow-[0_20px_40px_-15px_rgba(255,117,31,0.4)] p-8 my-12 cursor-pointer group"
    >
      {/* Animated Background Patterns */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Floating Icons */}
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute top-8 right-12 bg-white/30 backdrop-blur-md p-3.5 rounded-2xl border border-white/40 shadow-lg"
      >
        <Search className="w-8 h-8 text-white" />
      </motion.div>

      <motion.div
        animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
        className="absolute bottom-10 right-32 bg-white/30 backdrop-blur-md p-2.5 rounded-xl border border-white/40 shadow-lg"
      >
        <Sparkles className="w-6 h-6 text-yellow-200" />
      </motion.div>

      <div className="relative z-10 flex items-center justify-between">
        {/* Left Content */}
        <div className="flex-1 px-4">
          <div className="flex items-center gap-4 mb-5">
            <div className="bg-white/30 backdrop-blur-md p-4 rounded-[20px] border border-white/50 shadow-inner">
              <BookOpenCheck className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-white text-4xl mb-1.5 font-extrabold drop-shadow-md">
                Từ Điển Ẩm Thực
              </h2>
              <p className="text-orange-100 font-bold tracking-wider uppercase text-[11px] bg-black/10 inline-block px-3 py-1 rounded-full">
                1000+ Món Ngon Khắp Nơi
              </p>
            </div>
          </div>

          <p className="text-white/95 text-lg mb-8 max-w-xl font-medium leading-relaxed drop-shadow-sm">
            Bách khoa toàn thư ẩm thực! Hãy cùng khám phá tinh hoa ẩm thực thế giới nào!🥘🌍
          </p>

          {/* Features */}
          <div className="flex flex-wrap gap-3 mb-8">
            {[
              "Khám phá ẩm thực",
              "Liên kết công thức", 
              "Lịch sử món ăn",
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-black/10 backdrop-blur-sm px-4 py-2.5 rounded-full text-white font-bold text-sm flex items-center gap-2 border border-white/20 shadow-sm hover:bg-black/20 transition-colors"
              >
                <div className="w-2 h-2 bg-yellow-300 rounded-full shadow-[0_0_8px_rgba(253,224,71,0.8)]"></div>
                {feature}
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <button onClick={handleClick} className="bg-white text-[#ff751f] px-8 py-3.5 rounded-full flex items-center gap-3 font-extrabold text-[15px] hover:bg-yellow-300 hover:text-orange-900 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95 group-hover:gap-5">
            Mở sách ngay thôi
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Right Illustration */}
        <div className="hidden lg:block relative pr-8">
          <motion.div
            animate={{ 
              rotate: [0, 3, 0, -3, 0],
              y: [0, -8, 0, 8, 0]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            {/* Book Stack Illustration */}
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-36 h-48 bg-white/20 rounded-3xl rotate-12 blur-md"></div>
              <div className="absolute -top-3 -right-3 w-36 h-48 bg-yellow-300/30 rounded-3xl -rotate-6 blur-md"></div>
              
              <div className="relative bg-white/25 backdrop-blur-xl p-8 rounded-[32px] border-4 border-white/40 shadow-2xl w-48 h-60 flex flex-col justify-center">
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-3 bg-white/60 rounded-full shadow-inner"
                      style={{ width: `${100 - i * 15}%` }}
                    ></div>
                  ))}
                </div>
                
                {/* Magnifying Glass */}
                <div className="absolute -bottom-6 -right-6 bg-yellow-400 p-4 rounded-full shadow-[0_10px_20px_rgba(250,204,21,0.5)] border-4 border-white">
                  <Search className="w-8 h-8 text-[#ff751f]" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}