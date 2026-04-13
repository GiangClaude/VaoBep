import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import  Header  from "../component/common/Header";
import { Footer } from "../component/common/Footer";
import { ProfileHeader } from "../component/profile/ProfileHeader";
import { ProfileTabs } from "../component/profile/ProfileTabs";
import { MyRecipesTab } from "../component/profile/MyRecipeTab";
import { MyArticlesTab } from "../component/profile/MyArticlesTab";
import { ProfileInfoTab } from "../component/profile/ProfileInfoTab";
import { PointsTab } from "../component/profile/PointsTab";
import { SettingsTab } from "../component/profile/SettingsTab";
import { ProfileSidebar } from "../component/profile/ProfileSidebar";
import { CreateRecipeModal } from "../component/recipe/CreateRecipeModal";
import Modal from "../component/common/modal";
import { ChangePasswordModal } from "../component/profile/ChangePasswordModal";
import { SavedRecipeTab } from "../component/profile/SavedRecipeTab";


import { useAuth } from "../AuthContext";
import {useOwnerRecipes} from "../hooks/useOwnerRecipes";
import { useCreateRecipe } from "../hooks/useRecipeAction";
import { useUpdateProfile } from "../hooks/useProfile";
import { usePoints } from "../hooks/usePoints";
import { useChangePassword } from "../hooks/useChangePassword"; 


const mockSidebarStats = {
  totalLikes: 15420,
  totalViews: 48900,
  totalComments: 1234,
  totalFollowers: 2340
};

const mockBadges = [
  { id: "1", name: "Đầu bếp xuất sắc", icon: "🏆", color: "#FFD700" },
  { id: "2", name: "Người chia sẻ", icon: "❤️", color: "#FF6B35" },
  { id: "3", name: "Chuyên gia", icon: "⭐", color: "#FFC857" },
  { id: "4", name: "VIP Member", icon: "👑", color: "#9333EA" }
];

const mockChallenge = {
  name: "Nấu 10 món trong tháng",
  progress: 7,
  total: 10,
  reward: 500
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("my-recipes");
  const [isOwnProfile] = useState(true); 
  const [editingRecipe, setEditingRecipe] = useState(null);
  const { currentUser, setCurrentUser, refreshProfile } = useAuth();
  const { recipes: ownerRecipes, loading: ownerLoading, handleToggleVisibility, refetch} = useOwnerRecipes();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { createNewRecipe, updateExistingRecipe, getRecipe, removeRecipe, loading: creating } = useCreateRecipe();
  const { updateProfile, loading: isUpdatingProfile } = useUpdateProfile();

  const { 
      history: pointsHistory, 
      fetchHistory, 
      checkIn: checkInPoint, 
      loading: pointsLoading 
  } = usePoints();

  const [isChangePassModalOpen, setIsChangePassModalOpen] = useState(false);

  const { 
        passwords, 
        setPasswords, 
        errors, 
        loading: isChangingPass, 
        handleChangePassword,
        resetFields
  } = useChangePassword();

    // Hàm mở modal khi bấm nút trong Settings
  const openChangePasswordModal = () => {
        resetFields();
        setIsChangePassModalOpen(true);
  };

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info", // success, error, warning, info
    actions: []
  });

  const navigate = useNavigate();
    // Hàm đóng modal tiện lợi
  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    if (activeTab === "points") {
      fetchHistory();
    }
  }, [activeTab]);


  const handleEditProfile = () => {
    setActiveTab("info");
    const infoSection = document.getElementById("profile-info-section");
    if (infoSection) infoSection.scrollIntoView({ behavior: "smooth" });
  };

  const handleSaveProfile = async (data) => {
      console.log("Saving profile data:", data);
      
      // 1. Đóng gói FormData (Logic view thuần túy)
      const formData = new FormData();
      if (data.fullName) formData.append('fullName', data.fullName);
      if (data.bio) formData.append('bio', data.bio);
      if (data.avatarFile) formData.append('avatar', data.avatarFile);

      // 2. Gọi Hook (Logic nghiệp vụ đã ẩn trong hook)
      const result = await updateProfile(formData);

      // 3. Phản hồi UI
      if (result.success) {
        setModalConfig({
            isOpen: true,
            type: 'success',
            title: 'Cập nhật thành công!',
            message: result.message,
            actions: [
                { 
                    label: 'OK', 
                    onClick: closeModal, 
                    style: 'primary' 
                }
            ]
        });
      } else {
        // Cấu hình Modal Thất Bại
        setModalConfig({
            isOpen: true,
            type: 'error',
            title: 'Cập nhật thất bại',
            message: result.message,
            actions: [
                { 
                    label: 'Đóng', 
                    onClick: closeModal, 
                    style: 'danger' 
                }
            ]
        });
      }
    }

  const handleEditRecipe = async (id) => {
    try {
        const recipeId = id;
        
        // 1. Gọi logic lấy dữ liệu (Hook lo hết phần mapping)
        const cleanData = await getRecipe(recipeId);
        console.log("Editing recipe data:", cleanData);
        // 2. Lưu vào state và mở Modal
        setEditingRecipe(cleanData);
        setIsCreateModalOpen(true);
        
    } catch (error) {
        alert("Không thể tải dữ liệu công thức!");
    }
  };

  const handleDeleteRecipe = async (id) => {
      try {
        // 2. Gọi API xóa
        await removeRecipe(id);
                
        // 4. Load lại danh sách ngay lập tức
        refetch(); 

        setCurrentUser((prevUser) => ({
          ...prevUser,
          stats: {
            ...prevUser.stats,
            recipes: Math.max(0, (prevUser.stats.recipes || 0) - 1), // Trừ đi 1, đảm bảo không âm
          },
        }));

      } catch (error) {
        alert("❌ Xóa thất bại: " + (error.response?.data?.message || error.message));
      }
  };


  const handlePromoteRecipe = (id) => {
    console.log("Promote recipe:", id);
  };

  const handleCreateNew = () => {
    setEditingRecipe(null); 
    setIsCreateModalOpen(true);

  };

  const handleSubmitRecipe = async (data) => {
    try {
      if (editingRecipe) {
        // A. Logic Update
        await updateExistingRecipe(editingRecipe.recipe_id, data);
      } else {
        // B. Logic Create
        await createNewRecipe(data);

        setCurrentUser((prevUser) => ({
          ...prevUser,
          stats: {
            ...prevUser.stats,
            recipes: (prevUser.stats.recipes || 0) + 1, // Cộng thêm 1
          },
        }));
      }
      setIsCreateModalOpen(false);
      
      refetch();

    } catch (error) {
      console.error("❌ LỖI CHI TIẾT:", error);
      
      // Nếu lỗi có stack trace, in ra luôn
      if (error.stack) console.error("📍 Vị trí lỗi:", error.stack);
      alert(`❌ Có lỗi xảy ra: ${error.message}`);
    }
  
    //setIsCreateModalOpen(false); 
  };



  const handleCheckIn = async () => {
    // 1. Gọi API điểm danh
    const result = await checkInPoint();
    
    if (result.success) {
      // 2. Nếu thành công: Gọi modal thông báo
      setModalConfig({
        isOpen: true,
        type: 'success',
        title: 'Điểm danh thành công!',
        message: result.message, // "Bạn nhận được +10 điểm"
        actions: [{ label: 'Tuyệt vời', onClick: closeModal, style: 'primary' }]
      });

      // 3. QUAN TRỌNG: Reload lại thông tin user để cập nhật số điểm và disable nút ngay lập tức
      await refreshProfile(); 
    } else {
      // 4. Nếu lỗi (ví dụ đã điểm danh rồi)
      setModalConfig({
        isOpen: true,
        type: 'warning',
        title: 'Thông báo',
        message: result.message,
        actions: [{ label: 'Đóng', onClick: closeModal, style: 'secondary' }]
      });
    }
  };

  const handleViewPointsHistory = () => {
    setActiveTab("points");
  };

  const handleGiftPoints = () => {
    console.log("Gift points modal");
  };

  const handleSubmitChangePass = async () => {
        const result = await handleChangePassword();
        
      if (result.success) {
            setIsChangePassModalOpen(false);
            setModalConfig({
                isOpen: true,
                type: 'success',
                title: 'Thành công!',
                message: 'Mật khẩu của bạn đã được cập nhật mới.',
                actions: [{ label: 'OK', onClick: closeModal, style: 'primary' }]
            });
        }
        // Nếu thất bại do validation hoặc API, lỗi đã nằm trong object `errors` của hook
  };

  const handleUpgradeVIP = () => {
    console.log("Upgrade VIP modal");
  };

  const handleDeleteAccount = () => {
    if (window.confirm("⚠️ CẢNH BÁO: Hành động này không thể hoàn tác!\n\nBạn có chắc muốn xóa tài khoản?")) {
      console.log("Delete account");
    }
  };

  if (!currentUser) return <div className="text-center p-10">Đang tải thông tin...</div>;

  return (
    <div className="min-h-screen bg-[#fff9f0]">

      {isUpdatingProfile && (
         <div className="fixed inset-0 bg-black/20 z-[70] flex items-center justify-center cursor-wait">
            {/* Có thể thêm Spinner nếu muốn */}
         </div>
      )}

      <main className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <ProfileHeader
          user={currentUser}
          isOwnProfile={isOwnProfile}
          onEditProfile={handleEditProfile}
        />

        {/* Profile Tabs */}
       <div className="top-0 z-40 bg-[#fff9f0]/95 backdrop-blur-sm py-2 transition-all">
            <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {activeTab === "my-recipes" && (
              <MyRecipesTab
                recipes={ownerRecipes}
                onEdit={handleEditRecipe}
                onDelete={handleDeleteRecipe}
                onToggleVisibility={handleToggleVisibility}
                onPromote={handlePromoteRecipe}
                onCreateNew={handleCreateNew}
              />
            )}

            {activeTab === "my-articles" && (
              <MyArticlesTab />
            )}

            {activeTab === "saved" && (
              <SavedRecipeTab />
            )}

            {activeTab === "info" && (
              <ProfileInfoTab
                user={currentUser}
                onSave={handleSaveProfile}
                onCheckIn={handleCheckIn}
                onViewPointsHistory={handleViewPointsHistory}
              />
            )}

            {activeTab === "points" && (
              <PointsTab
                // Truyền dữ liệu thật từ currentUser (Backend đã trả về isCheckedIn)
                currentPoints={currentUser.points || 0} 
                role={currentUser.role}
                
                // Dữ liệu lịch sử từ Hook usePoints
                history={pointsHistory}
                loading={pointsLoading}
                
                // Trạng thái điểm danh (được lấy từ backend ở Bước 1)
                isCheckedIn={currentUser.isCheckedIn} 
                onCheckIn={handleCheckIn} // Truyền hàm xử lý điểm danh vào

                onGiftPoints={handleGiftPoints}
                onPromoteRecipe={handlePromoteRecipe}
              />
            )}

            {activeTab === "settings" && (
              <SettingsTab
                role={currentUser.role}
                onChangePassword={openChangePasswordModal}
                onUpgradeVIP={handleUpgradeVIP}
                onDeleteAccount={handleDeleteAccount}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <ProfileSidebar
              stats={mockSidebarStats}
              badges={mockBadges}
              currentChallenge={mockChallenge}
            />
          </div>

        </div>
      </main>

      <ChangePasswordModal 
        isOpen={isChangePassModalOpen}
        onClose={() => setIsChangePassModalOpen(false)}
        onSubmit={handleSubmitChangePass} // Gọi logic xử lý từ hook
        loading={isChangingPass}
                // Truyền các state từ hook xuống UI
        formData={passwords}
        setFormData={setPasswords}
        errors={errors}
       />

      <Modal 
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        actions={modalConfig.actions}
      />

      {/* 5. RENDER MODAL Ở CUỐI CÙNG (Để nó đè lên các phần tử khác) */}
      {isCreateModalOpen && (
        <CreateRecipeModal 
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleSubmitRecipe}
          initialData={editingRecipe}
        />
      )}
      
      {/* Hiển thị loading overlay nếu đang gửi dữ liệu */}
      {creating && (
         <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center text-white">
            Đang đăng công thức...
         </div>
      )}
    </div>
  );
}