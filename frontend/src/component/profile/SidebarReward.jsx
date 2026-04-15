import { Gift, Sparkles } from "lucide-react";
import { motion } from "motion/react";

export function SidebarReward({ pendingCount, onClick }) {
  if (pendingCount === 0) return null;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="bg-gradient-to-br from-[#ff6b35] to-[#f7931e] rounded-2xl p-5 text-white shadow-xl cursor-pointer relative overflow-hidden group mb-6"
    >
      {/* Hiệu ứng lấp lánh chạy qua */}
      <motion.div 
        animate={{ x: ['-100%', '200%'] }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
      />

      <div className="relative z-10 flex items-center gap-4">
        <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl">
          <motion.div
            animate={{ rotate: [-10, 10, -10] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
          >
            <Gift className="w-8 h-8 text-white" />
          </motion.div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-white/80">Bạn có quà mới!</span>
            <Sparkles className="w-4 h-4 text-yellow-300" />
          </div>
          <h3 className="text-xl font-bold leading-tight">
            {pendingCount} Phần thưởng đang chờ
          </h3>
        </div>
      </div>

      <div className="mt-4 py-2 bg-white/10 rounded-xl text-center text-sm font-semibold backdrop-blur-sm group-hover:bg-white/20 transition-all">
        Mở quà ngay
      </div>
    </motion.div>
  );
}