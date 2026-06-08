// frontend/src/hooks/ui/interaction/useAuthGuard.js
import { useAuth } from '../../../AuthContext';
import { useGlobalModal } from '../../../context/ModalContext';
import { useNavigate } from 'react-router-dom';

export const useAuthGuard = () => {
    const { currentUser } = useAuth();
    const { showModal, hideModal } = useGlobalModal();
    const navigate = useNavigate();

    /**
     * Bọc một hàm callback. Nếu chưa đăng nhập -> Chặn lại và hiện Modal.
     */
    const requireAuth = (callback) => {
        // [SỬA]: Thêm async để hỗ trợ các hàm API bất đồng bộ
        return async (...args) => {
            // [SỬA]: Lấy tham số đầu tiên và kiểm tra xem nó có thực sự là một Event hay không
            const firstArg = args[0];
            if (firstArg && typeof firstArg.stopPropagation === 'function') {
                firstArg.stopPropagation();
            }
            
            if (!currentUser) {
                showModal({
                    title: "Yêu cầu đăng nhập",
                    message: "Bạn cần đăng nhập để thực hiện thao tác này.",
                    type: "warning",
                    actions: [
                        { label: "Hủy", onClick: hideModal, style: "secondary" },
                        { label: "Đăng nhập ngay", onClick: () => { hideModal(); navigate("/login"); }, style: "primary" }
                    ]
                });
                return false; // [SỬA]: Xóa bớt dấu chấm phẩy thừa
            }
            
            // [SỬA QUAN TRỌNG]: Bắt buộc phải return và await để trả về kết quả true/false
            return await callback(...args);
        };
    };

    return { requireAuth, isAuthenticated: !!currentUser };
};