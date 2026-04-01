import { useState, useEffect } from "react";
import interactionApi from "../api/interactionApi";
import Modal from "../component/common/modal"; 
import ReportModalComponent from "../component/common/ReportModal";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
// Tên sự kiện chung cho việc đồng bộ tương tác
const INTERACTION_EVENT = 'interaction-sync-event';

export default function useInteraction({ 
    id, 
    type = 'recipe', 
    initialData = { likes: 0, rating: 0, commentCount: 0, liked: false, saved: false } 
}) {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [toast, setToast] = useState({ show: false, message: "" });

    // State hiển thị trên UI
    const [state, setState] = useState({
        liked: Boolean(initialData.liked),
        saved: Boolean(initialData.saved),// Nhận giá trị saved
        likeCount: initialData.likes || 0,
        rating: initialData.rating || 0,
        commentCount: initialData.commentCount || 0,
        userRating: 0 
    });



    // [FIX LỖI] Đồng bộ State khi Props (initialData) thay đổi từ bên ngoài
    useEffect(() => {
        // Chỉ cập nhật nếu dữ liệu từ cha KHÁC với state hiện tại
        setState(prev => {
            const isLikedChanged = initialData.liked !== undefined && initialData.liked !== prev.liked;
            const isSavedChanged = initialData.saved !== undefined && initialData.saved !== prev.saved;
            const isLikeCountChanged = initialData.likes !== undefined && initialData.likes !== prev.likeCount;
            
            // Nếu không có gì thay đổi so với state hiện tại thì giữ nguyên (tránh re-render)
            if (!isLikedChanged && !isSavedChanged && !isLikeCountChanged) {
                return prev;
            }

            return {
                ...prev,
                liked: isLikedChanged ? Boolean(initialData.liked) : prev.liked,
                saved: isSavedChanged ? Boolean(initialData.saved) : prev.saved,
                likeCount: isLikeCountChanged ? initialData.likes : prev.likeCount,
                rating: initialData.rating !== undefined ? initialData.rating : prev.rating,
                commentCount: initialData.commentCount !== undefined ? initialData.commentCount : prev.commentCount
            };
        });
    }, [
        initialData.liked, 
        initialData.saved, 
        initialData.likes, 
        initialData.rating,
        initialData.commentCount
    ]);



    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: "",
        message: "",
        type: "info",
        actions: []
    });

    const [loading, setLoading] = useState(false);

    // --- 1. Helper: Dispatch sự kiện đồng bộ ---
    // Hàm này giúp bắn tin hiệu cho các component khác biết
    const broadcastUpdate = (updates) => {
        const event = new CustomEvent(INTERACTION_EVENT, {
            detail: {
                targetId: id,      // ID của bài viết bị thay đổi
                targetType: type,  // Loại bài viết (recipe/article)
                updates: updates   // Dữ liệu mới (ví dụ: { saved: true } hoặc { liked: true, likeCount: 10 })
            }
        });
        window.dispatchEvent(event);
    };

    useEffect(() => {
        let mounted = true;
        const shouldFetch = initialData.liked === undefined || initialData.saved === undefined;
        
        // Kiểm tra: Nếu đã có dữ liệu từ cha truyền xuống thì KHÔNG gọi API nữa
        const hasInitialState = (initialData.liked !== undefined && initialData.saved !== undefined);
        // Chỉ gọi API nếu: Có ID, chưa có state ban đầu, và User đã đăng nhập
        if (id && currentUser && shouldFetch) { 
            interactionApi.getInteractionState(id, type)
                .then(res => {
                    if (mounted && res.data && res.data.success) {
                        // [FIX] Dữ liệu thực sự nằm trong res.data.data
                        const apiData = res.data.data; 
                        
                        setState(prev => ({
                            ...prev,
                            liked: !!apiData.liked, // Ép kiểu boolean cho chắc
                            saved: !!apiData.saved,
                            userRating: apiData.rated || 0
                        }));
                    }
                })
                .catch(err => console.error("Lỗi lấy state tương tác:", err));
        }
        return () => { mounted = false; };
    }, [id, type, currentUser, initialData.liked, initialData.saved]);

    // --- 2. Effect: Lắng nghe sự kiện đồng bộ ---
    useEffect(() => {
        let mounted = true;
        const token = localStorage.getItem("token");

        
        const handleSync = (e) => {
            const { targetId, targetType, updates } = e.detail;
            
            // Chỉ cập nhật nếu đúng ID và đúng Type
            if (targetId === id && targetType === type) {
                setState(prev => ({
                    ...prev,
                    ...updates
                }));
            }
        };

        // Đăng ký lắng nghe
        window.addEventListener(INTERACTION_EVENT, handleSync);

        // Hủy đăng ký khi component unmount
        return () => {
            window.removeEventListener(INTERACTION_EVENT, handleSync);
        };
    }, [id, type]);

    // --- 3. Kiểm tra Auth ---
    const checkAuth = () => {
        // Thay vì check localStorage, ta check currentUser từ Context
        if (!currentUser) {
            setModalConfig({
                isOpen: true,
                title: "Yêu cầu đăng nhập",
                message: "Bạn cần đăng nhập để thực hiện thao tác này.",
                type: "warning",
                actions: [
                    {
                        label: "Hủy",
                        onClick: () => setModalConfig(prev => ({ ...prev, isOpen: false })),
                        style: "secondary"
                    },
                    {
                        label: "Đăng nhập ngay",
                        onClick: () => navigate("/login"),
                        style: "primary"
                    }
                ]
            });
            return false;
        }
        return true;
    };


    // --- 5. Xử lý Like (Có đồng bộ) ---
    const handleToggleLike = async (e) => {
        e && e.stopPropagation();
        if (!checkAuth()) return;
        if (loading) return;

        // Tính toán trạng thái mới
        const newLikedState = !state.liked;
        const newLikeCount = newLikedState ? state.likeCount + 1 : state.likeCount - 1;

        // Lưu trạng thái cũ để revert nếu lỗi API
        const oldState = { ...state };

        // 1. Cập nhật UI ngay lập tức (Optimistic) & Bắn sự kiện đồng bộ
        // Thay vì setState cục bộ, ta bắn sự kiện để TẤT CẢ (bao gồm chính nó) đều cập nhật
        broadcastUpdate({
            liked: newLikedState,
            likeCount: newLikeCount
        });
        
        setLoading(true);
        try {
            await interactionApi.toggleLike(id, type);
            // API thành công -> Không cần làm gì thêm vì UI đã update rồi
        } catch (error) {
            console.error("Lỗi like:", error);
            // API lỗi -> Revert lại trạng thái cũ cho tất cả các nơi
            broadcastUpdate({
                liked: oldState.liked,
                likeCount: oldState.likeCount
            });
        } finally {
            setLoading(false);
        }
    };

    // --- 6. Xử lý Save (Có đồng bộ) ---
    const handleToggleSave = async (e) => {
        e && e.stopPropagation();

        if (!id) {
            console.error("LỖI: ID bị undefined, không thể gọi API!");
            return;
        }
        if (!checkAuth()) return;
        
        const newSavedState = !state.saved;
        const oldState = { ...state };

        // 1. Bắn sự kiện đồng bộ Save
        broadcastUpdate({
            saved: newSavedState
        });

        

        try {
            const res = await interactionApi.toggleSave(id, type);
            setToast({ show: true, message: res.data.message });
        } catch (error) {
            console.error("Lỗi save:", error);
            // Revert nếu lỗi
            broadcastUpdate({
                saved: oldState.saved
            });
        }
    };

    // --- 6.1. Xử lý Gửi Bình luận (Có đồng bộ số lượng) ---
    const handlePostComment = async (content, parentId = null) => {
        if (!checkAuth()) return null;
        try {
            const res = await interactionApi.postComment(id, content, type, parentId);
            if (res.data.success) {
                // Đồng bộ tăng commentCount lên 1 cho toàn hệ thống
                broadcastUpdate({
                    commentCount: state.commentCount + 1
                });
                return res.data.newComment; // Trả về để UI biết đường hiển thị comment mới
            }
        } catch (error) {
            console.error("Lỗi gửi bình luận:", error);
            setToast({ show: true, message: error.response?.data?.message || "Không thể gửi bình luận" });
            return null;
        }
    };

    // --- 6.2. Xử lý Xóa Bình luận (Quan trọng: Trừ đúng số lượng Cascade) ---
    const handleDeleteComment = async (commentId, replyCount = 0) => {
        if (!checkAuth()) return false;
        try {
            const res = await interactionApi.deleteComment(commentId);
            if (res.data.success) {
                // Tính toán số lượng cần trừ: bản thân nó + các reply con bị mất do cascade
                const totalToRemove = 1 + Number(replyCount);
                broadcastUpdate({
                    commentCount: Math.max(0, state.commentCount - totalToRemove)
                });
                setToast({ show: true, message: "Đã xóa bình luận" });
                return true;
            }
        } catch (error) {
            console.error("Lỗi xóa bình luận:", error);
            setToast({ show: true, message: "Không thể xóa bình luận" });
            return false;
        }
    };

    // --- 6.3. Xử lý Sửa Bình luận ---
    const handleEditComment = async (commentId, content) => {
        if (!checkAuth()) return null;
        try {
            const res = await interactionApi.updateComment(commentId, content);
            if (res.data.success) {
                setToast({ show: true, message: "Đã cập nhật bình luận" });
                return res.data.data; // Trả về thông tin update_at mới
            }
        } catch (error) {
            console.error("Lỗi sửa bình luận:", error);
            setToast({ show: true, message: "Không thể sửa bình luận" });
            return null;
        }
    };

    // --- 7. Xử lý Share ---
    const handleShare = (e) => {
        e && e.stopPropagation();
        const url = `${window.location.origin}/recipe/${id}`;
        navigator.clipboard.writeText(url);
        
        setModalConfig({
            isOpen: true,
            title: "Đã sao chép liên kết",
            message: "Link công thức đã được lưu vào bộ nhớ tạm!",
            type: "success",
            actions: [] 
        });
    };

    // --- 8. Xử lý Báo cáo (Report) ---
    const [reportModal, setReportModal] = useState({ isOpen: false, loading: false, serverError: '' });

    const openReportModal = (e) => {
        e && e.stopPropagation();
        if (!checkAuth()) return;
        setReportModal({ isOpen: true, loading: false, serverError: '' });
    };

    const handleCancelReport = () => {
        setReportModal({ isOpen: false, loading: false, serverError: '' });
    };

    const handleSubmitReport = async (reason) => {
        if (!reason || reason.trim() === '') {
            setReportModal(prev => ({ ...prev, serverError: 'Vui lòng chọn một lý do báo cáo' }));
            return;
        }
        setReportModal(prev => ({ ...prev, loading: true, serverError: '' }));
        try {
            await interactionApi.reportPost(String(id), reason, type);
            setReportModal({ isOpen: false, loading: false, serverError: '' });
            setModalConfig({ isOpen: true, title: 'Báo cáo thành công', message: 'Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét.', type: 'success', actions: [] });
            // Optionally broadcast update for report_count if needed
        } catch (err) {
            handleCancelReport();
            //setReportModal(prev => ({ ...prev, loading: false, serverError: err?.response?.data?.message || 'Có lỗi xảy ra' }));
            setModalConfig({ isOpen: true, title: 'Báo cáo thất bại', message: err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.', type: 'error', actions: [] });
        }
    };

    const closeToast = () => setToast({ ...toast, show: false });

    const InteractionModal = () => (
        <Modal 
            isOpen={modalConfig.isOpen}
            onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
            title={modalConfig.title}
            message={modalConfig.message}
            type={modalConfig.type}
            actions={modalConfig.actions}
        />
    );

    const ReportModal = () => (
        <ReportModalComponent
            isOpen={reportModal.isOpen}
            onClose={handleCancelReport}
            onSubmit={handleSubmitReport}
            loading={reportModal.loading}
            serverError={reportModal.serverError}
        />
    );

    return {
        state,
        toast,
        closeToast,
        handleToggleLike,
        handleToggleSave,
        handlePostComment,
        handleDeleteComment,
        handleEditComment,
        handleShare,
        handleReport: openReportModal,
        InteractionModal,
        ReportModal
    };
}