import { useState, useEffect } from "react";
import interactionApi from "../api/interactionApi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const INTERACTION_EVENT = 'interaction-sync-event';

export default function useInteraction({ 
    id, 
    type = 'recipe', 
    initialData = { likes: 0, rating: 0, commentCount: 0, liked: false, saved: false } 
}) {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [toast, setToast] = useState({ show: false, message: "" });

    const [state, setState] = useState({
        liked: Boolean(initialData.liked),
        saved: Boolean(initialData.saved),
        likeCount: initialData.likes || 0,
        rating: initialData.rating || 0,
        commentCount: initialData.commentCount || 0,
        userRating: 0 
    });

    useEffect(() => {
        setState(prev => {
            const isLikedChanged = initialData.liked !== undefined && initialData.liked !== prev.liked;
            const isSavedChanged = initialData.saved !== undefined && initialData.saved !== prev.saved;
            const isLikeCountChanged = initialData.likes !== undefined && initialData.likes !== prev.likeCount;
            
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

    // --- SỬA Ở ĐÂY: Export modalConfig ra ngoài thay vì render Modal trong hook ---
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: "",
        message: "",
        type: "info",
        actions: []
    });

    const [loading, setLoading] = useState(false);

    const broadcastUpdate = (updates) => {
        const event = new CustomEvent(INTERACTION_EVENT, {
            detail: {
                targetId: id,
                targetType: type,
                updates: updates
            }
        });
        window.dispatchEvent(event);
    };

    useEffect(() => {
        let mounted = true;
        const shouldFetch = initialData.liked === undefined || initialData.saved === undefined;
        
        const hasInitialState = (initialData.liked !== undefined && initialData.saved !== undefined);
        if (id && currentUser && shouldFetch) { 
            interactionApi.getInteractionState(id, type)
                .then(res => {
                    if (mounted && res.data && res.data.success) {
                        const apiData = res.data.data; 
                        setState(prev => ({
                            ...prev,
                            liked: !!apiData.liked,
                            saved: !!apiData.saved,
                            userRating: apiData.rated || 0
                        }));
                    }
                })
                .catch(err => console.error("Lỗi lấy state tương tác:", err));
        }
        return () => { mounted = false; };
    }, [id, type, currentUser, initialData.liked, initialData.saved]);

    useEffect(() => {
        let mounted = true;
        const handleSync = (e) => {
            const { targetId, targetType, updates } = e.detail;
            if (targetId === id && targetType === type) {
                setState(prev => ({
                    ...prev,
                    ...updates
                }));
            }
        };

        window.addEventListener(INTERACTION_EVENT, handleSync);
        return () => {
            window.removeEventListener(INTERACTION_EVENT, handleSync);
        };
    }, [id, type]);

    const checkAuth = () => {
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

    const handleToggleLike = async (e) => {
        e && e.stopPropagation();
        if (!checkAuth()) return;
        if (loading) return;

        const newLikedState = !state.liked;
        const newLikeCount = newLikedState ? state.likeCount + 1 : state.likeCount - 1;
        const oldState = { ...state };

        broadcastUpdate({
            liked: newLikedState,
            likeCount: newLikeCount
        });
        
        setLoading(true);
        try {
            await interactionApi.toggleLike(id, type);
        } catch (error) {
            console.error("Lỗi like:", error);
            broadcastUpdate({
                liked: oldState.liked,
                likeCount: oldState.likeCount
            });
        } finally {
            setLoading(false);
        }
    };

    const handleToggleSave = async (e) => {
        e && e.stopPropagation();

        if (!id) {
            console.error("LỖI: ID bị undefined, không thể gọi API!");
            return;
        }
        if (!checkAuth()) return;
        
        const newSavedState = !state.saved;
        const oldState = { ...state };

        broadcastUpdate({ saved: newSavedState });

        try {
            const res = await interactionApi.toggleSave(id, type);
            setToast({ show: true, message: res.data.message });
        } catch (error) {
            console.error("Lỗi save:", error);
            broadcastUpdate({ saved: oldState.saved });
        }
    };

    const handlePostComment = async (content, parentId = null) => {
        if (!checkAuth()) return null;
        try {
            const res = await interactionApi.postComment(id, content, type, parentId);
            if (res.data.success) {
                broadcastUpdate({ commentCount: state.commentCount + 1 });
                return res.data.newComment;
            }
        } catch (error) {
            console.error("Lỗi gửi bình luận:", error);
            setToast({ show: true, message: error.response?.data?.message || "Không thể gửi bình luận" });
            return null;
        }
    };

    const handleDeleteComment = async (commentId, replyCount = 0) => {
        if (!checkAuth()) return false;
        try {
            const res = await interactionApi.deleteComment(commentId);
            if (res.data.success) {
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

    const handleEditComment = async (commentId, content) => {
        if (!checkAuth()) return null;
        try {
            const res = await interactionApi.updateComment(commentId, content);
            if (res.data.success) {
                setToast({ show: true, message: "Đã cập nhật bình luận" });
                return res.data.data;
            }
        } catch (error) {
            console.error("Lỗi sửa bình luận:", error);
            setToast({ show: true, message: "Không thể sửa bình luận" });
            return null;
        }
    };

    const handleShare = (e) => {
        e && e.stopPropagation();
        
        // 1. Phân biệt route dựa trên type (giả sử route bài viết của bạn là /article)
        const routeName = type === 'article' ? 'article' : 'recipe';
        const url = `${window.location.origin}/${routeName}/${id}`;
        
        navigator.clipboard.writeText(url);
        
        // 2. Thay đổi chữ hiển thị cho phù hợp
        const typeText = type === 'article' ? 'bài viết' : 'công thức';
        
        setModalConfig({
            isOpen: true,
            title: "Đã sao chép liên kết",
            message: `Link ${typeText} đã được lưu vào bộ nhớ tạm!`,
            type: "success",
            actions: [] 
        });
    };
    // --- SỬA Ở ĐÂY: Trả về trạng thái của Report thay vì Component ---
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
        } catch (err) {
            handleCancelReport();
            setModalConfig({ isOpen: true, title: 'Báo cáo thất bại', message: err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.', type: 'error', actions: [] });
        }
    };

    const closeToast = () => setToast({ ...toast, show: false });
    const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

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
        
        // Trả về data cho Modal
        modalConfig,
        closeModal,
        
        // Trả về data cho Report
        handleReport: openReportModal,
        reportModal,
        handleCancelReport,
        handleSubmitReport
    };
}