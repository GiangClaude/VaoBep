import { useState } from "react";
import { ProfileHeader } from "../component/profile/ProfileHeader";
import { ProfileTabs } from "../component/profile/ProfileTabs";
import { MyRecipesTab } from "../component/profile/MyRecipeTab";
import { MyArticlesTab } from "../component/profile/MyArticlesTab";
import { ProfileInfoTab } from "../component/profile/ProfileInfoTab";
import { PointsTab } from "../component/profile/PointsTab";
import { SettingsTab } from "../component/profile/SettingsTab";
import { ProfileSidebar } from "../component/profile/ProfileSidebar";
import { ChangePasswordModal } from "../component/profile/ChangePasswordModal";
import { SavedRecipeTab } from "../component/profile/SavedRecipeTab";
import { ClaimRewardModal } from "../component/profile/rewards/ClaimRewardModal"; 

import { useAuth } from "../AuthContext";

// QUERIES TỰ ĐỘNG CACHE & FETCH DATA
import { usePointsHistoryQuery } from "../hooks/queries/useUserQueries";
import { useMyRewardsQuery } from "../hooks/queries/useMiscQueries";

// UI HOOK (Chứa toàn bộ Business Logic & State Form)
import { useProfileUI } from "../hooks/ui/profile/useProfileUI"; 

const mockSidebarStats = { totalLikes: 15420, totalViews: 48900, totalComments: 1234, totalFollowers: 2340 };
const mockBadges = [{ id: "1", name: "Đầu bếp xuất sắc", icon: "🏆", color: "#FFD700" }];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("my-recipes");
  const { currentUser } = useAuth();

  // 1. Data Fetching (React Query)
  const { data: pointsData, isLoading: pointsLoading } = usePointsHistoryQuery(1, 'all');
  const pointsHistory = pointsData?.history || [];
  
  const { data: rewards = [] } = useMyRewardsQuery();

  // 2. Business Logic & UI States
  const { 
    handleSaveProfile, isUpdatingProfile,
    passwords, setPasswords, errors, resetFields, isChangingPass, handleChangePassword, 
    isChangePassModalOpen, setIsChangePassModalOpen,
    handleCheckIn,
    selectedBox, receivedItems, isRewardModalOpen, setIsRewardModalOpen, isOpening, handleOpenReward
  } = useProfileUI();

  if (!currentUser) return <div className="text-center p-10">Đang tải thông tin...</div>;

  return (
    <div className="min-h-screen bg-[#fff9f0]">
      {isUpdatingProfile && <div className="fixed inset-0 bg-black/20 z-[70] cursor-wait"></div>}

      <main className="container mx-auto px-4 py-8">
        <ProfileHeader user={currentUser} isOwnProfile={true} onEditProfile={() => setActiveTab("info")} />

        <div className="top-0 z-40 bg-[#fff9f0]/95 backdrop-blur-sm py-2">
            <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            {activeTab === "my-recipes" && <MyRecipesTab isPublicView={false} />}
            {activeTab === "my-articles" && <MyArticlesTab />}
            {activeTab === "saved" && <SavedRecipeTab />}
            
            {activeTab === "info" && (
                <ProfileInfoTab 
                    user={currentUser} 
                    onSave={handleSaveProfile} 
                    onViewPointsHistory={() => setActiveTab("points")} 
                    onCheckIn={handleCheckIn}
                />
            )}
            
            {activeTab === "points" && (
                <PointsTab 
                    currentPoints={currentUser.points} 
                    role={currentUser.role} 
                    history={pointsHistory} 
                    loading={pointsLoading} 
                    isCheckedIn={currentUser.isCheckedIn} 
                    onCheckIn={handleCheckIn} 
                />
            )}
            
            {activeTab === "settings" && (
                <SettingsTab 
                    role={currentUser.role} 
                    onChangePassword={() => { resetFields(); setIsChangePassModalOpen(true); }} 
                />
            )}
          </div>

          <div className="lg:col-span-4">
            <ProfileSidebar 
                stats={mockSidebarStats} 
                badges={mockBadges} 
                pendingRewards={rewards} 
                onOpenReward={handleOpenReward} 
            />
          </div>
        </div>
      </main>

      <ClaimRewardModal isOpen={isRewardModalOpen} isOpening={isOpening} boxName={selectedBox?.box_name} items={receivedItems} onClose={() => setIsRewardModalOpen(false)} />
      <ChangePasswordModal isOpen={isChangePassModalOpen} onClose={() => setIsChangePassModalOpen(false)} onSubmit={handleChangePassword} loading={isChangingPass} formData={passwords} setFormData={setPasswords} errors={errors} />
    </div>
  );
}