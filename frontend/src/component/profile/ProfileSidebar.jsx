import { Trophy, Award, Target, TrendingUp } from "lucide-react";
import { motion } from "motion/react";

export function ProfileSidebar({ stats, badges, currentChallenge }) {
  return (
    <div className="space-y-6">
      {/* Stats Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl mb-5 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#ff6b35]" />
          Thống Kê
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl">
            <span className="text-sm text-gray-700">Tổng lượt thích</span>
            <span className="text-xl text-[#ff6b35]">{stats.totalLikes.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
            <span className="text-sm text-gray-700">Tổng lượt xem</span>
            <span className="text-xl text-[#f7931e]">{stats.totalViews.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl">
            <span className="text-sm text-gray-700">Tổng bình luận</span>
            <span className="text-xl text-[#ffc857]">{stats.totalComments.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
            <span className="text-sm text-gray-700">Người theo dõi</span>
            <span className="text-xl text-purple-600">{stats.totalFollowers.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Badges Card */}
      {badges.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl mb-5 flex items-center gap-2">
            <Award className="w-5 h-5 text-[#ff6b35]" />
            Huy Chương
          </h3>

          <div className="grid grid-cols-3 gap-3">
            {badges.map((badge) => (
              <motion.div
                key={badge.id}
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex flex-col items-center justify-center p-3 cursor-pointer group"
                title={badge.name}
              >
                <div
                  className={`text-4xl mb-2 group-hover:scale-110 transition-transform`}
                  style={{ filter: `drop-shadow(0 0 8px ${badge.color})` }}
                >
                  {badge.icon}
                </div>
                <p className="text-xs text-center text-gray-700 line-clamp-2">{badge.name}</p>
              </motion.div>
            ))}
          </div>

          {badges.length === 0 && (
            <div className="text-center py-8">
              <Award className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Chưa có huy chương</p>
            </div>
          )}
        </div>
      )}

      {/* Current Challenge Card */}
      {currentChallenge && (
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-gradient-to-br from-[#ff6b35] to-[#f7931e] rounded-2xl p-6 text-white shadow-xl cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg">Thử Thách Hiện Tại</h3>
            </div>
          </div>

          <h4 className="text-xl mb-4">{currentChallenge.name}</h4>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/80">Tiến độ</span>
              <span className="font-semibold">
                {currentChallenge.progress}/{currentChallenge.total}
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(currentChallenge.progress / currentChallenge.total) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-white h-full rounded-full"
              />
            </div>
          </div>

          {/* Reward */}
          <div className="flex items-center justify-between bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <span className="text-sm text-white/80">Phần thưởng</span>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              <span className="font-semibold">{currentChallenge.reward} điểm</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* VIP Promo Card */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white cursor-pointer overflow-hidden relative"
      >
        {/* Decorative Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full blur-xl animate-pulse" />
        </div>

        <div className="relative z-10">
          <div className="inline-flex bg-white/30 backdrop-blur-sm p-2.5 rounded-xl mb-3">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="text-xl mb-2">Nâng cấp VIP</h3>
          <p className="text-white/90 text-sm mb-4">
            Mở khóa tính năng độc quyền và nhận ưu đãi đặc biệt
          </p>
          <button className="w-full bg-white text-purple-600 py-2.5 rounded-xl hover:bg-yellow-300 hover:text-purple-700 transition-all font-semibold">
            Tìm hiểu thêm
          </button>
        </div>
      </motion.div>
    </div>
  );
}