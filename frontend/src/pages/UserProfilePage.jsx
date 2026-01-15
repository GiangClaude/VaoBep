import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

// Components
import Header from "../component/common/Header";
import { Footer } from "../component/common/Footer";
import { ProfileHeader } from "../component/profile/ProfileHeader";
import { MyRecipesTab } from "../component/profile/MyRecipeTab";
import { GiftPointsModal } from "../component/profile/GiftPointsModal";

// Hooks & Context
import { useUserProfile } from "../hooks/useUserProfile";
import { useAuth } from "../AuthContext";
import { usePoints } from "../hooks/usePoints";

export default function UserProfilePage() {
  const { id } = useParams(); // Lấy ID từ URL
  const { currentUser } = useAuth(); // Lấy thông tin người đang đăng nhập (để biết số dư ví khi tặng)
  
  const { user, recipes, loading, error, handleFollow } = useUserProfile(id);
  const { sendGift } = usePoints(); // Hook xử lý tặng điểm

  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);

  // Xử lý Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff9f0]">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff6b35]" />
      </div>
    );
  }

  // Xử lý Lỗi (User không tồn tại)
  if (error || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fff9f0] gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Không tìm thấy người dùng</h2>
        <p className="text-gray-600">{error || "Tài khoản này có thể đã bị khóa hoặc không tồn tại."}</p>
        <a href="/" className="px-6 py-2 bg-[#ff6b35] text-white rounded-full hover:bg-[#e65a2a] transition-colors">
          Về trang chủ
        </a>
      </div>
    );
  }

  const handleGiftSubmit = async (data) => {
    // data: { recipientId, amount, message }
    const result = await sendGift(data);
    return result; // Trả về kết quả cho Modal xử lý (đóng/báo lỗi)
  };

  return (
    <div className="min-h-screen bg-[#fff9f0]">
      <main className="container mx-auto px-4 py-8">
        {/* Profile Header (Public Mode) */}
        {/* Tái sử dụng ProfileHeader, truyền các prop để hiện nút Follow/Gift */}
        <ProfileHeader
          user={user}
          isOwnProfile={false} // Quan trọng: Đánh dấu đây là profile người khác
          isFollowing={user.isFollowing}
          onFollowToggle={handleFollow}
          onGift={() => setIsGiftModalOpen(true)}
        />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content: Danh sách công thức */}
          <div className="lg:col-span-12">
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">
                    Công thức của {user.fullName}
                </h3>
                
                {/* Tái sử dụng MyRecipesTab nhưng ẩn các nút sửa/xóa */}
                <MyRecipesTab
                    recipes={recipes}
                    isPublicView={true} // Cần sửa nhẹ MyRecipesTab để ẩn nút Edit/Delete/Hide nếu prop này true
                    onPromote={() => {}} // Không làm gì
                    onToggleVisibility={() => {}} // Không làm gì
                />
            </div>
          </div>
        </div>
      </main>

      {/* Modal Tặng điểm */}
      <GiftPointsModal
        isOpen={isGiftModalOpen}
        onClose={() => setIsGiftModalOpen(false)}
        recipient={user}
        onSend={handleGiftSubmit}
        maxPoints={currentUser?.points || 0} // Lấy số dư của người đang đăng nhập
      />
    </div>
  );
}