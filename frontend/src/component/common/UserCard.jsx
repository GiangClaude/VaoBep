import { UserPlus, UserCheck, Users } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom"; // [1] Import useNavigate
import ImageWithFallback from "../figma/ImageWithFallBack";
import {getAvatarUrl} from "../../utils/imageHelper"
export default function UserCard({ id, fullName, avatar, bio, followersCount, isFollowing, onFollow }) {
  const navigate = useNavigate(); // [2] Hook điều hướng

  const handleCardClick = () => {
    if (id) {
        navigate(`/user/${id}`); // [3] Chuyển hướng sang trang profile người khác
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={handleCardClick} // [4] Gắn sự kiện click
      className="bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col items-center text-center h-full cursor-pointer" // [5] Thêm cursor-pointer
    >
      {/* Avatar */}
      <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-br from-[#ff6b35] to-[#ffc857] mb-3">
        <div className="w-full h-full rounded-full overflow-hidden bg-white border-2 border-white">
          <ImageWithFallback
            src={getAvatarUrl(id, avatar)}
            alt={fullName}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Info */}
      <h3 className="font-bold text-gray-800 text-lg line-clamp-1 mb-1">
        {fullName}
      </h3>
      
      {/* Stats */}
      <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
        <Users className="w-4 h-4 text-[#ff6b35]" />
        <span>{followersCount || 0} người theo dõi</span>
      </div>

      <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow min-h-[2.5rem]">
        {bio || "Chưa có giới thiệu..."}
      </p>

      {/* Action Button */}
      <button
        onClick={(e) => {
            e.stopPropagation();
            onFollow && onFollow(id);
        }}
        className={`w-full py-2 px-4 rounded-full font-medium transition-all flex items-center justify-center gap-2 group ${
            isFollowing 
            ? "bg-gray-100 text-gray-600 hover:bg-gray-200" 
            : "bg-[#fff9f0] text-[#ff6b35] hover:bg-[#ff6b35] hover:text-white"
        }`}
      >
        {isFollowing ? (
            <>
                <UserCheck className="w-4 h-4" />
                Đang theo dõi
            </>
        ) : (
            <>
                <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Theo dõi
            </>
        )}
      </button>
    </motion.div>
  );
}