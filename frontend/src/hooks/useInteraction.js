import { useState, useEffect } from "react";
import interactionApi from "../api/interactionApi";
import Modal from "../component/common/modal"; 
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

        console.log("DEBUG SAVE - Đang gửi lên server:", { id, type, currentUser });
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
            await interactionApi.toggleSave(id, type);
        } catch (error) {
            console.error("Lỗi save:", error);
            // Revert nếu lỗi
            broadcastUpdate({
                saved: oldState.saved
            });
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

    return {
        state,
        handleToggleLike,
        handleToggleSave,
        handleShare,
        InteractionModal
    };
}