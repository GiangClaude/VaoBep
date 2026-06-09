// VỊ TRÍ TẠO FILE: frontend/src/hooks/ui/menu/useMenuPlannerUI.js

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUpdateMenuMutation, useCloneMenuMutation } from '../../mutations/useMenuMutations';
import { useGlobalModal } from '../../../context/ModalContext';
import { MENU_ACTIONS } from '../../../context/MenuContext';

export const useMenuPlannerUI = (menuId, menuState, dispatch, currentUser, isOwner) => {
    const navigate = useNavigate();
    const { showModal } = useGlobalModal();

    // 1. TẤT CẢ STATES CỦA CÁC MODAL
    const [searchModalTarget, setSearchModalTarget] = useState(null); // Lưu thông tin {dayId, mealId} khi mở modal tìm món
    const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [isAiGenModalOpen, setIsAiGenModalOpen] = useState(false);

    // 2. STATE KÉO THẢ (DRAG & DROP)
    const [draggedItem, setDraggedItem] = useState(null);

    // 3. KẾT NỐI MUTATIONS (Gọi API)
    const updateMenuMutation = useUpdateMenuMutation();
    const cloneMenuMutation = useCloneMenuMutation();

    // 4. CÁC HÀM XỬ LÝ SỰ KIỆN CHÍNH
    
    // Hàm lưu thực đơn hiện tại vào Database
    const handleSave = async () => {
        try {
            await updateMenuMutation.mutateAsync({ menuId, menuData: menuState });
            showModal({
                type: 'success',
                title: 'Thành công',
                message: 'Thực đơn đã được lưu an toàn!',
                actions: [{ label: 'Tuyệt vời', style: 'primary' }]
            });
        } catch (error) {
            showModal({
                type: 'error',
                title: 'Lỗi',
                message: 'Lưu thất bại: ' + (error.message || 'Có lỗi xảy ra')
            });
        }
    };

    // Hàm nhân bản thực đơn của người khác về làm của mình
    const handleClone = async () => {
        if (!currentUser) {
            showModal({
                type: 'warning',
                title: 'Yêu cầu đăng nhập',
                message: 'Bạn cần đăng nhập để nhân bản và lưu thực đơn này!',
                actions: [
                    { label: 'Hủy', style: 'secondary' },
                    { label: 'Đăng nhập', style: 'primary', onClick: () => navigate('/login') }
                ]
            });
            return;
        }
        try {
            const result = await cloneMenuMutation.mutateAsync(menuId);
            if (result.success) {
                showModal({
                    type: 'success',
                    title: 'Nhân bản thành công',
                    message: 'Thực đơn đã được lưu vào danh sách của bạn. Bạn có thể thoải mái chỉnh sửa!',
                    actions: [{ label: 'Tới thực đơn của tôi', style: 'primary', onClick: () => navigate(`/menus/planner/${result.data.menu_id}`) }]
                });
            } else {
                 showModal({ type: 'error', title: 'Lỗi', message: result.message });
            }
        } catch (error) {
            showModal({ type: 'error', title: 'Lỗi hệ thống', message: error.message || "Có lỗi xảy ra" });
        }
    };

    // 5. CÁC HÀM XỬ LÝ KÉO THẢ (DRAG & DROP)
    
    // Khi bắt đầu nhấc 1 món ăn lên
    const handleDragStart = (e, dayId, mealId, recipeId) => {
        if (!isOwner) return; // Không phải chủ thì không cho kéo
        setDraggedItem({ dayId, mealId, recipeId });
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => e.target.classList.add('opacity-50'), 0); // Làm mờ item đang kéo
    };

    // Khi buông chuột ra nhưng trượt khỏi vùng nhận
    const handleDragEnd = (e) => {
        if (!isOwner) return;
        e.target.classList.remove('opacity-50');
        setDraggedItem(null);
    };

    // Khi kéo lướt qua một vùng được phép thả
    const handleDragOver = (e) => {
        if (!isOwner) return;
        e.preventDefault(); // Phải có cái này HTML mới cho phép thả
        e.dataTransfer.dropEffect = 'move';
    };

    // Khi chính thức thả món ăn xuống một bữa ăn mới
    const handleDrop = (e, targetDayId, targetMealId) => {
        if (!isOwner) return;
        e.preventDefault();
        if (!draggedItem) return;

        // Nếu thả lại đúng vị trí cũ thì bỏ qua không làm gì
        if (draggedItem.dayId === targetDayId && draggedItem.mealId === targetMealId) return;

        // Báo cho Context biết để đổi vị trí món ăn
        dispatch({
            type: MENU_ACTIONS.MOVE_RECIPE,
            payload: {
                fromDayId: draggedItem.dayId,
                fromMealId: draggedItem.mealId,
                toDayId: targetDayId,
                toMealId: targetMealId,
                recipeId: draggedItem.recipeId
            }
        });
    };

    return {
        // Trả ra các biến đóng/mở Modal
        searchModalTarget, setSearchModalTarget,
        isShoppingListOpen, setIsShoppingListOpen,
        isAiModalOpen, setIsAiModalOpen,
        isAiGenModalOpen, setIsAiGenModalOpen,
        
        // Trả ra trạng thái loading để UI vô hiệu hóa nút bấm
        isSaving: updateMenuMutation.isPending,
        isCloning: cloneMenuMutation.isPending,

        // Trả ra các hàm xử lý
        handleSave,
        handleClone,
        handleDragStart,
        handleDragEnd,
        handleDragOver,
        handleDrop
    };
};