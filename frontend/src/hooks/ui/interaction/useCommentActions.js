// frontend/src/hooks/ui/interaction/useCommentActions.js
import { useAuthGuard } from './useAuthGuard';
import { usePostCommentMutation, useDeleteCommentMutation, useEditCommentMutation } from '../../mutations/useInteractionMutations';
import { useGlobalModal } from '../../../context/ModalContext';

export const useCommentActions = () => {
    const { requireAuth } = useAuthGuard();
    const { showModal } = useGlobalModal();
    
    const postMutation = usePostCommentMutation();
    const deleteMutation = useDeleteCommentMutation();
    const editMutation = useEditCommentMutation();

    const handlePost = requireAuth(async (postId, postType, content, parentId = null) => {
        try {
            await postMutation.mutateAsync({ postId, postType, content, parentId });
            return true;
        } catch (error) {
            showModal({ title: "Lỗi", message: "Không thể gửi bình luận", type: "error" });
            return false;
        }
    });

    const handleDelete = requireAuth(async (commentId) => {
        try {
            await deleteMutation.mutateAsync(commentId);
            return true;
        } catch (error) {
            showModal({ title: "Lỗi", message: "Không thể xóa bình luận", type: "error" });
            return false;
        }
    });

    const handleEdit = requireAuth(async (commentId, content) => {
        try {
            await editMutation.mutateAsync({ commentId, content });
            return true;
        } catch (error) {
            showModal({ title: "Lỗi", message: "Không thể sửa bình luận", type: "error" });
            return false;
        }
    });

    return { handlePost, handleDelete, handleEdit };
};