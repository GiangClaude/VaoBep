import { Edit, UserPlus, UserMinus, Flag, Award, Heart, Users, FileText } from "lucide-react";
import { motion } from "motion/react";
import { getAvatarUrl } from '../../utils/imageHelper';
export function ProfileHeader({
  user,
  isOwnProfile,
  isFollowing,
  onEditProfile,
  onFollowToggle,
  onReport
}) {
  const getRoleBadge = (role) => {
    const badges = {
      user: { text: "Người Dùng", color: "bg-gray-500" },
      vip: { text: "VIP", color: "bg-gradient-to-r from-yellow-500 to-orange-500" },
      pro: { text: "Chuyên Gia", color: "bg-gradient-to-r from-purple-600 to-pink-600" }
    };
    return badges[role] || badges.user;
  };

  const badge = getRoleBadge(user.role);

  return (
    <div className="relative bg-gradient-to-br from-[#ff6b35] via-[#f7931e] to-[#ffc857] rounded-[30px] overflow-hidden shadow-2xl p-8 mb-8">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10">
        {/* Top Section: Avatar + Info + Buttons */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center mb-8">
          {/* Avatar */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative"
          >
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl">
              <img
                src={getAvatarUrl(user.id, user.avatar)}
                alt={user.fullName}
                // SỬA Ở ĐÂY:
                // w-full h-full: Để ảnh giãn ra bằng kích thước cha (32x32)
                // object-cover: Để ảnh tự động crop ở giữa, không bị méo hình
                className="w-full h-full object-cover" 
              />
            </div>
            {/* Role Badge on Avatar */}
            <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 ${badge.color} text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1 whitespace-nowrap`}>
              <Award className="w-3.5 h-3.5" />
              {badge.text}
            </div>
          </motion.div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-white text-3xl mb-2">
              {user.fullName}
            </h1>
            <p className="text-white/90 text-base max-w-2xl">
              {user.bio || "Chưa có tiểu sử"}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {isOwnProfile ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onEditProfile}
                className="bg-white text-[#ff6b35] px-6 py-3 rounded-full flex items-center gap-2 hover:bg-yellow-50 transition-all shadow-lg font-semibold"
              >
                <Edit className="w-4 h-4" />
                Chỉnh sửa hồ sơ
              </motion.button>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onFollowToggle}
                  className={`${
                    isFollowing
                      ? "bg-white/20 backdrop-blur-sm text-white border-2 border-white"
                      : "bg-white text-[#ff6b35]"
                  } px-6 py-3 rounded-full flex items-center gap-2 transition-all shadow-lg font-semibold`}
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="w-4 h-4" />
                      Đang theo dõi
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Theo dõi
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onReport}
                  className="bg-white/20 backdrop-blur-sm text-white px-4 py-3 rounded-full hover:bg-white/30 transition-all shadow-lg"
                >
                  <Flag className="w-4 h-4" />
                </motion.button>
              </>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-4">
          {/* Recipes */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white/20 backdrop-blur-md rounded-2xl p-5 text-center border border-white/30"
          >
            <div className="flex justify-center mb-2">
              <div className="bg-white/30 p-2.5 rounded-xl">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-white text-3xl mb-1">{user.stats.recipes}</div>
            <div className="text-white/80 text-sm">Công thức đã đăng</div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white/20 backdrop-blur-md rounded-2xl p-5 text-center border border-white/30"
          >
            <div className="flex justify-center mb-2">
              <div className="bg-white/30 p-2.5 rounded-xl">
                {isOwnProfile ? (
                    <Heart className="w-6 h-6 text-white" />
                ) : (
                    // Dùng UserPlus hoặc UserCheck để biểu thị "Đang theo dõi"
                    <UserPlus className="w-6 h-6 text-white" />
                )}
              </div>
            </div>
            {/* Hiển thị số liệu tương ứng: saved cho mình, following cho người khác */}
            <div className="text-white text-3xl mb-1">
                {isOwnProfile ? user.stats.saved : (user.stats.following || 0)}
            </div>
            <div className="text-white/80 text-sm">
                {isOwnProfile ? "Bài đã lưu" : "Đang theo dõi"}
            </div>
          </motion.div>

          {/* Followers */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white/20 backdrop-blur-md rounded-2xl p-5 text-center border border-white/30"
          >
            <div className="flex justify-center mb-2">
              <div className="bg-white/30 p-2.5 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-white text-3xl mb-1">{user.stats.followers}</div>
            <div className="text-white/80 text-sm">Người theo dõi</div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Decorative Line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"></div>
    </div>
  );
}