// VỊ TRÍ: frontend/src/hooks/mutations/useInteractionMutations.js

import { useMutation, useQueryClient } from '@tanstack/react-query';
import interactionApi from '../../api/interactionApi';
import { QUERY_KEYS } from '../../config/queryKeys';

// 1. Mutation cho LIKE (Có Optimistic Update)
export const useToggleLikeMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, postType }) => interactionApi.toggleLike(postId, postType),
        
        // Kích hoạt NGAY LẬP TỨC khi user bấm nút (Chưa đợi API)
        onMutate: async ({ postId, postType }) => {
            // Hủy các query đang fetch để không bị đè dữ liệu
            await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.INTERACTION_STATE, postType, postId] });

            // Lưu lại state cũ để Rollback nếu lỗi
            const previousState = queryClient.getQueryData([QUERY_KEYS.INTERACTION_STATE, postType, postId]);

            // Cập nhật Cache ảo ngay lập tức cho UI
            queryClient.setQueryData([QUERY_KEYS.INTERACTION_STATE, postType, postId], (old) => {
                if (!old) return { liked: true, saved: false, rated: 0 };
                return { ...old, liked: !old.liked };
            });

            // Trả về state cũ để dùng ở onError
            return { previousState };
        },
        
        // Nếu API lỗi, khôi phục lại state cũ
        onError: (err, newTodo, context) => {
            queryClient.setQueryData(
                [QUERY_KEYS.INTERACTION_STATE, newTodo.postType, newTodo.postId], 
                context.previousState
            );
        },
        
        // Dù lỗi hay thành công, fetch lại data chuẩn từ Server cho chắc chắn
        onSettled: (data, error, variables) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INTERACTION_STATE, variables.postType, variables.postId] });
        },
    });
};

// 2. Mutation cho SAVE (Bookmark) (Có Optimistic Update)
export const useToggleSaveMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, postType }) => interactionApi.toggleSave(postId, postType),
        onMutate: async ({ postId, postType }) => {
            await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.INTERACTION_STATE, postType, postId] });
            const previousState = queryClient.getQueryData([QUERY_KEYS.INTERACTION_STATE, postType, postId]);
            
            queryClient.setQueryData([QUERY_KEYS.INTERACTION_STATE, postType, postId], (old) => {
                if (!old) return { liked: false, saved: true, rated: 0 };
                return { ...old, saved: !old.saved };
            });
            return { previousState };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData([QUERY_KEYS.INTERACTION_STATE, variables.postType, variables.postId], context.previousState);
        },
        onSettled: (data, error, variables) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INTERACTION_STATE, variables.postType, variables.postId] });
            // Cập nhật lại danh sách bài đã lưu ở trang Profile
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SAVED_RECIPES] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SAVED_ARTICLES] });
        },
    });
};

// 3. Mutation cho Bình luận
export const usePostCommentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ postId, content, postType, parentId }) => 
            interactionApi.postComment(postId, content, postType, parentId),
        onSuccess: (data, variables) => {
            // Khi gửi comment thành công, tự động báo React Query fetch lại danh sách comment
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPE_COMMENTS, variables.postType, variables.postId] });
        }
    });
};

// 4. Mutation cho Follow User
export const useFollowUserMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (followingId) => interactionApi.followUser(followingId),
        onSuccess: (data, followingId) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_PROFILE, followingId] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SEARCH_USERS] });
        }
    });
};

export const useReportPostMutation = () => {
    return useMutation({
        mutationFn: ({ postId, reason, postType }) => 
            interactionApi.reportPost(postId, reason, postType)
    });
};