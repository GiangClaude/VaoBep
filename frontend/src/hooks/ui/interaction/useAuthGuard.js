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
        return (e, ...args) => {
            if (e && e.stopPropagation) e.stopPropagation();
            
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
                return;
            }
            callback(e, ...args);
        };
    };

    return { requireAuth, isAuthenticated: !!currentUser };
};