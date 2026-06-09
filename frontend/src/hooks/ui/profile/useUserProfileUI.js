import { useState } from 'react';
import { useGlobalModal } from '../../../context/ModalContext';
import { useGiftPointsMutation } from '../../mutations/useProfileMutations';
import { useFollowUserMutation } from '../../mutations/useInteractionMutations';

export const useUserProfileUI = (userId, currentUser) => {
    const { showModal, hideModal } = useGlobalModal();
    
    // State Modal Tặng điểm
    const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
    
    // Mutations
    const giftMutation = useGiftPointsMutation();
    const followMutation = useFollowUserMutation();

    // Logic: Xử lý Follow (Kiểm tra đăng nhập trước)
    const handleFollowClick = () => {
        if (!currentUser) {
            showModal({
                title: "Yêu cầu đăng nhập",
                message: "Bạn cần đăng nhập để theo dõi người dùng này.",
                type: "warning",
                actions: [
                    { label: "Hủy", onClick: hideModal, style: "secondary" },
                    { label: "Đăng nhập ngay", onClick: () => window.location.href = '/login', style: "primary" }
                ]
            });
            return;
        }
        // Gọi API ngầm. Việc optimistic update đã được setup bên trong useFollowUserMutation.
        followMutation.mutate(userId);
    };

    // Logic: Xử lý Submit form tặng điểm
    const handleGiftSubmit = async (data) => {
        try {
            const result = await giftMutation.mutateAsync(data);
            return { success: true, message: result.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message };
        }
    };

    return {
        isGiftModalOpen,
        setIsGiftModalOpen,
        handleFollowClick,
        handleGiftSubmit
    };
};