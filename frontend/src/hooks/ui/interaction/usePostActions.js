// frontend/src/hooks/ui/interaction/usePostActions.js
import { useAuthGuard } from './useAuthGuard';
import { useToggleLikeMutation, useToggleSaveMutation, useReportPostMutation } from '../../mutations/useInteractionMutations';
import { useGlobalModal } from '../../../context/ModalContext';

export const usePostActions = ({ id, type, isLiked, likesCount, isSaved }) => {
    const { requireAuth } = useAuthGuard();
    const { showModal, showReportModal } = useGlobalModal();
    
    // Gọi Mutations
    const toggleLikeMutation = useToggleLikeMutation();
    const toggleSaveMutation = useToggleSaveMutation();
    const reportMutation = useReportPostMutation();

    // Hành động Like
    const handleLike = requireAuth(() => {
        toggleLikeMutation.mutate({ 
            postId: id, 
            postType: type,
            currentIsLiked: isLiked,
            currentLikesCount: likesCount
        });
    });

    // Hành động Save (Bookmark)
    const handleSave = requireAuth(() => {
        toggleSaveMutation.mutate({ 
            postId: id, 
            postType: type,
            currentIsSaved: isSaved
        }, {
            onSuccess: () => {
                showModal({ title: "Thành công", message: isSaved ? "Đã bỏ lưu bài viết" : "Đã lưu bài viết vào hồ sơ", type: "success" });
            }
        });
    });

    // Hành động Share (Thuần UI, không gọi server)
    const handleShare = (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        
        const routeName = type === 'article' ? 'article' : 'recipe';
        const url = `${window.location.origin}/${routeName}/${id}`;
        
        navigator.clipboard.writeText(url);
        
        showModal({
            title: "Đã sao chép liên kết",
            message: "Liên kết đã được sao chép vào bộ nhớ tạm!",
            type: "success"
        });
    };

    // Hành động Báo cáo
    const handleReport = requireAuth((e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        
        showReportModal(async (reason) => {
            await reportMutation.mutateAsync({ postId: String(id), reason, postType: type });
        });
    });

    return {
        handleLike,
        handleSave,
        handleShare,
        handleReport,
        isActionLoading: toggleLikeMutation.isPending || toggleSaveMutation.isPending
    };
};