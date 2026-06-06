import { useState, useEffect } from "react";
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
import { useGlobalModal } from "../context/ModalContext";

// Hooks
import { useUpdateProfile } from "../hooks/useProfile";
import { usePoints } from "../hooks/usePoints";
import { useRewards } from "../hooks/useRewards"; 
// [MỚI] Import hook UI mới tạo
import { useProfileUI } from "../hooks/ui/profile/useProfileUI"; 

const mockSidebarStats = { totalLikes: 15420, totalViews: 48900, totalComments: 1234, totalFollowers: 2340 };
const mockBadges = [{ id: "1", name: "Đầu bếp xuất sắc", icon: "🏆", color: "#FFD700" }];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("my-recipes");
  const { currentUser, refreshProfile } = useAuth();
  const { showModal } = useGlobalModal();
  
  const { updateProfile, loading: isUpdatingProfile } = useUpdateProfile();
  const { rewards, openBox } = useRewards();
  
  // Tách riêng fetchHistory ra vì checkIn giờ đã được useProfileUI lo
  const { history: pointsHistory, fetchHistory, loading: pointsLoading } = usePoints();

  // [MỚI] Sử dụng useProfileUI để quản lý Đổi mật khẩu và Điểm danh
  const { 
      passwords, setPasswords, errors, resetFields, isChangingPass, 
      handleChangePassword, handleCheckIn: checkInMutation 
  } = useProfileUI();

  const [selectedBox, setSelectedBox] = useState(null);
  const [receivedItems, setReceivedItems] = useState([]);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [isChangePassModalOpen, setIsChangePassModalOpen] = useState(false);

  useEffect(() => {
    if (activeTab === "points") fetchHistory();
  }, [activeTab, fetchHistory]);

  // Hàm xử lý lưu thông tin profile
  const handleSaveProfile = async (data) => {
      const formData = new FormData();
      if (data.fullName) formData.append('fullName', data.fullName);
      if (data.bio) formData.append('bio', data.bio);
      if (data.avatarFile) formData.append('avatar', data.avatarFile);

      const result = await updateProfile(formData);
      showModal({
          type: result.success ? 'success' : 'error',
          title: result.success ? 'Thành công!' : 'Thất bại',
          message: result.message,
          actions: [{ label: 'Đóng', style: result.success ? 'primary' : 'danger' }]
      });
  };

  // Hàm gọi API điểm danh và hiển thị thông báo
  const handleCheckIn = async () => {
    try {
      // Gọi mutation từ useProfileUI
      const result = await checkInMutation(); 
      showModal({
        type: 'success',
        title: 'Thành công!',
        message: result.message || 'Điểm danh thành công!',
        actions: [{ label: 'Đóng', style: 'primary' }]
      });
      await refreshProfile(); 
    } catch (error) {
      showModal({
        type: 'warning',
        title: 'Thông báo',
        message: error.message || 'Hôm nay bạn đã điểm danh rồi.',
        actions: [{ label: 'Đóng', style: 'primary' }]
      });
    }
  };

  // Hàm xử lý đổi mật khẩu và đóng modal khi thành công
  const handleSubmitChangePass = async () => {
      const result = await handleChangePassword();
      if (result.success) {
          setIsChangePassModalOpen(false);
          showModal({ 
              type: 'success', 
              title: 'Thành công!', 
              message: 'Mật khẩu đã được cập nhật.', 
              actions: [{ label: 'OK', style: 'primary' }]
          });
      }
  };

  // Hàm mở hộp quà phần thưởng
  const handleOpenReward = async (reward) => {
    setSelectedBox(reward); 
    setIsRewardModalOpen(true); 
    setIsOpening(true);
    
    const result = await openBox(reward.user_reward_id);
    if (result.success) {
      setReceivedItems(result.items); 
      setIsOpening(false); 
      await refreshProfile();
    } else {
      alert(result.message); 
      setIsRewardModalOpen(false);
    }
  };

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
            {activeTab === "info" && <ProfileInfoTab user={currentUser} onSave={handleSaveProfile} onViewPointsHistory={() => setActiveTab("points")} />}
            {activeTab === "points" && <PointsTab currentPoints={currentUser.points} role={currentUser.role} history={pointsHistory} loading={pointsLoading} isCheckedIn={currentUser.isCheckedIn} onCheckIn={handleCheckIn} />}
            {activeTab === "settings" && <SettingsTab role={currentUser.role} onChangePassword={() => { resetFields(); setIsChangePassModalOpen(true); }} />}
          </div>

          <div className="lg:col-span-4">
            <ProfileSidebar stats={mockSidebarStats} badges={mockBadges} pendingRewards={rewards} onOpenReward={handleOpenReward} />
          </div>
        </div>
      </main>

      <ClaimRewardModal isOpen={isRewardModalOpen} isOpening={isOpening} boxName={selectedBox?.box_name} items={receivedItems} onClose={() => setIsRewardModalOpen(false)} />
      <ChangePasswordModal isOpen={isChangePassModalOpen} onClose={() => setIsChangePassModalOpen(false)} onSubmit={handleSubmitChangePass} loading={isChangingPass} formData={passwords} setFormData={setPasswords} errors={errors} />
    </div>
  );
}