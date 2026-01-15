import { Plus, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';

export function ViewMoreCard() {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="cursor-pointer flex-shrink-0 w-80"
      onClick={() => navigate('/recipes')}
    >
      <div className="bg-gradient-to-br from-[#ff6b35] to-[#f7931e] rounded-[25px] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex items-center justify-center relative group">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full blur-2xl animate-pulse" style={{ animationDelay: '150ms' }} />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-8 py-20">
          <motion.div
            animate={{
              rotate: isHovered ? 360 : 0,
              scale: isHovered ? 1.1 : 1
            }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6 border-4 border-white/40"
          >
            <Plus className="w-10 h-10 text-white" strokeWidth={3} />
          </motion.div>

          <h3 className="text-white text-2xl mb-3">
            Xem thêm
          </h3>
          
          <p className="text-white/90 text-sm mb-6">
            Khám phá hàng trăm công thức ngon khác
          </p>

          <div className="flex items-center justify-center gap-2 text-white/80 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Còn nhiều món hay lắm!</span>
          </div>
        </div>

        {/* Decorative circles */}
        <motion.div
          animate={{
            scale: isHovered ? 1.2 : 1,
            rotate: isHovered ? 180 : 0
          }}
          transition={{ duration: 0.8 }}
          className="absolute top-4 right-4 w-16 h-16 border-4 border-white/20 rounded-full"
        />
        
        <motion.div
          animate={{
            scale: isHovered ? 1.2 : 1,
            rotate: isHovered ? -180 : 0
          }}
          transition={{ duration: 0.8 }}
          className="absolute bottom-4 left-4 w-12 h-12 border-4 border-white/20 rounded-full"
        />
      </div>

      {/* Creative decorative element */}
      <motion.div
        initial={false}
        animate={{
          rotate: isHovered ? 6 : 3,
          scale: isHovered ? 1 : 0.98
        }}
        className="absolute inset-0 bg-gradient-to-br from-[#ffc857] to-[#ff6b35] rounded-[25px] -z-10"
        style={{ transform: "translate(6px, 6px)" }}
      />
    </motion.div>
  );
}