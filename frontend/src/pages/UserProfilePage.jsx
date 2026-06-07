import React from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

// Components
import { ProfileHeader } from "../component/profile/ProfileHeader";
import { MyRecipesTab } from "../component/profile/MyRecipeTab";
import { GiftPointsModal } from "../component/profile/GiftPointsModal";
import MenuCard from '../component/menu/MenuCard';

import { useAuth } from "../AuthContext";

// QUERIES TỰ ĐỘNG CACHE & FETCH DATA
import { useUserProfileQuery } from "../hooks/queries/useUserQueries";
// UI HOOK
import { useUserProfileUI } from "../hooks/ui/profile/useUserProfileUI";

export default function UserProfilePage() {
  const { id } = useParams(); 
  const { currentUser } = useAuth(); 

  // 1. Data Fetching
  const { data, isLoading, error } = useUserProfileQuery(id);
  
  // 2. Business Logic & UI States
  const { 
      isGiftModalOpen, setIsGiftModalOpen, 
      handleFollowClick, handleGiftSubmit 
  } = useUserProfileUI(id, currentUser);

  // Xử lý Loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff9f0]">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff6b35]" />
      </div>
    );
  }

  // Xử lý Lỗi (User không tồn tại)
  if (error || !data?.user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fff9f0] gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Không tìm thấy người dùng</h2>
        <p className="text-gray-600">{error?.message || "Tài khoản này có thể đã bị khóa hoặc không tồn tại."}</p>
        <a href="/" className="px-6 py-2 bg-[#ff6b35] text-white rounded-full hover:bg-[#e65a2a] transition-colors">
          Về trang chủ
        </a>
      </div>
    );
  }

  const { user, recipes, menus } = data;

  return (
    <div className="min-h-screen bg-[#fff9f0]">
      <main className="container mx-auto px-4 py-8">
        <ProfileHeader
          user={user}
          isOwnProfile={false} 
          isFollowing={user.isFollowing}
          onFollowToggle={handleFollowClick}
          onGift={() => setIsGiftModalOpen(true)}
        />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-12">
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                
                <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">
                    Công thức của {user.fullName}
                </h3>
                <MyRecipesTab isPublicView={true} publicRecipes={recipes} />

                <div className="mt-12">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">
                        Thực đơn của {user.fullName}
                    </h3>
                    {menus.length === 0 ? (
                        <p className="text-gray-500 italic">Người dùng này chưa công khai thực đơn nào.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {menus.map(menu => (
                                <MenuCard key={menu.menu_id} menu={menu} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
          </div>
        </div>
      </main>

      <GiftPointsModal
        isOpen={isGiftModalOpen}
        onClose={() => setIsGiftModalOpen(false)}
        recipient={user}
        onSend={handleGiftSubmit}
        maxPoints={currentUser?.points || 0} 
      />
    </div>
  );
}