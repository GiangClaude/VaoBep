// VỊ TRÍ TẠO FILE: frontend/src/hooks/ui/menu/useMenuListUI.js

import { useNavigate } from 'react-router-dom';
import { useCreateMenuMutation } from '../../mutations/useMenuMutations';

export const useMenuListUI = () => {
    const navigate = useNavigate();
    const createMenuMutation = useCreateMenuMutation();

    // Hàm xử lý tạo nhanh 1 thực đơn trống
    const handleCreateBlankMenu = async () => {
        try {
            const result = await createMenuMutation.mutateAsync({ 
                name: "Thực đơn mới chưa đặt tên",
                days: [] // Backend sẽ tự xử lý mảng rỗng
            });
            
            if (result.success && result.data.menu_id) {
                navigate(`/menus/planner/${result.data.menu_id}`);
            } else {
                alert("Lỗi tạo thực đơn: " + (result.message || "Không xác định"));
            }
        } catch (error) {
            alert("Lỗi tạo thực đơn: " + (error.message || "Có lỗi xảy ra"));
        }
    };

    return {
        handleCreateBlankMenu,
        isCreating: createMenuMutation.isPending // Trạng thái loading để khóa nút bấm nếu cần
    };
};