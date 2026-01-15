import { BookOpenCheck, Search, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

export default function DictionaryBanner() {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative bg-gradient-to-br from-[#4a1a8f] via-[#7c3aed] to-[#a855f7] rounded-[30px] overflow-hidden shadow-2xl p-8 my-12 cursor-pointer group"
    >
      {/* Animated Background Patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Floating Icons */}
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute top-8 right-12 bg-white/20 backdrop-blur-sm p-3 rounded-2xl"
      >
        <Search className="w-8 h-8 text-white" />
      </motion.div>

      <motion.div
        animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
        className="absolute bottom-8 right-24 bg-white/20 backdrop-blur-sm p-2 rounded-xl"
      >
        <Sparkles className="w-6 h-6 text-yellow-300" />
      </motion.div>

      <div className="relative z-10 flex items-center justify-between">
        {/* Left Content */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
              <BookOpenCheck className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-white text-3xl mb-1">
                Từ Điển Món Ăn
              </h2>
              <p className="text-purple-100 text-sm">
                1000+ món ăn từ khắp thế giới
              </p>
            </div>
          </div>

          <p className="text-white/90 text-lg mb-6 max-w-xl">
            Khám phá nguồn gốc, lịch sử và cách chế biến của hàng ngàn món ăn. 
            Từ món Việt truyền thống đến ẩm thực quốc tế.
          </p>

          {/* Features */}
          <div className="flex flex-wrap gap-3 mb-6">
            {[
              "Tìm kiếm nhanh",
              "Phân loại chi tiết", 
              "Lịch sử món ăn",
              "Video hướng dẫn"
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full"></div>
                {feature}
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <button className="bg-white text-purple-700 px-8 py-3 rounded-full flex items-center gap-2 hover:bg-yellow-300 hover:text-purple-900 transition-all shadow-lg hover:shadow-xl group-hover:gap-4">
            <span className="font-semibold">Khám phá ngay</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Right Illustration */}
        <div className="hidden lg:block relative">
          <motion.div
            animate={{ 
              rotate: [0, 5, 0, -5, 0],
              y: [0, -10, 0, 10, 0]
            }}
            transition={{ duration: 6, repeat: Infinity }}
            className="relative"
          >
            {/* Book Stack Illustration */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-32 h-40 bg-yellow-300/30 rounded-2xl rotate-12 blur-sm"></div>
              <div className="absolute -top-2 -right-2 w-32 h-40 bg-pink-300/30 rounded-2xl -rotate-6 blur-sm"></div>
              
              <div className="relative bg-white/20 backdrop-blur-md p-8 rounded-3xl border-4 border-white/30">
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-2 bg-white/40 rounded-full"
                      style={{ width: `${100 - i * 10}%` }}
                    ></div>
                  ))}
                </div>
                
                {/* Magnifying Glass */}
                <div className="absolute -bottom-4 -right-4 bg-yellow-300 p-4 rounded-full shadow-xl">
                  <Search className="w-8 h-8 text-purple-700" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-300 to-transparent opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-300 to-transparent opacity-50"></div>
    </motion.div>
  );
}
