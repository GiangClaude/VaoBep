// frontend/src/hooks/mutations/useInteractionMutations.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import interactionApi from '../../api/interactionApi';
import { QUERY_KEYS } from '../../config/queryKeys';

/**
 * SMART UPDATER: Hàm cập nhật thông minh cho React Query Cache
 * Nhận diện cấu trúc dữ liệu (Mảng, Object phân trang, Object chi tiết) để update an toàn.
 */
const smartUpdateCache = (oldData, targetId, updates) => {
    if (!oldData) return oldData;

    // Helper kiểm tra ID
    const isTarget = (item) => String(item.id) === String(targetId) || 
                               String(item.recipe_id) === String(targetId) || 
                               String(item.article_id) === String(targetId)||
                               String(item.dish_id) === String(targetId);

    // TH 1: Cache là Mảng (Ví dụ: Danh sách Recent, Featured)
    if (Array.isArray(oldData)) {
        return oldData.map(item => isTarget(item) ? { ...item, ...updates } : item);
    }

    // TH 2: Cache là Object Phân trang { data: [...], pagination: {...} } (Ví dụ: Recipes List)
    if (oldData.data && Array.isArray(oldData.data)) {
        return {
            ...oldData,
            data: oldData.data.map(item => isTarget(item) ? { ...item, ...updates } : item)
        };
    }

    // TH 3: Cache là Object Đơn (Ví dụ: Recipe Detail)
    if (typeof oldData === 'object' && isTarget(oldData)) {
        return { ...oldData, ...updates };
    }

    return oldData; // Không khớp cấu trúc nào thì trả về nguyên vẹn
};

/**
 * Lấy danh sách các Base Query Keys cần quét dựa vào loại Post
 */
const getRelevantKeys = (postType) => {
    if (postType === 'recipe') {
        return [QUERY_KEYS.RECIPES_LIST, QUERY_KEYS.RECENT_RECIPES, QUERY_KEYS.OWNER_RECIPES, QUERY_KEYS.SAVED_RECIPES, QUERY_KEYS.FEATURED_RECIPES, QUERY_KEYS.RECIPE_DETAIL];
    }
    if (postType === 'dish') {
        return [QUERY_KEYS.DISH_MAP_ALL, QUERY_KEYS.DISH_MAP_SUMMARY, QUERY_KEYS.DISH_DETAIL];
    }
    return [QUERY_KEYS.PUBLIC_ARTICLES, QUERY_KEYS.OWNER_ARTICLES, QUERY_KEYS.SAVED_ARTICLES, QUERY_KEYS.FEATURED_ARTICLES, QUERY_KEYS.ARTICLE_DETAIL];
};

// ----------------------------------------------------
// HOOKS MUTATION CHÍNH
// ----------------------------------------------------

export const useToggleLikeMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, postType }) => interactionApi.toggleLike(postId, postType),
        onSuccess: (data, variables) => {
            // Thêm 2 dòng này để F5 lại dữ liệu chuẩn hóa
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INTERACTION_STATE] });
            
            // Dựa vào postType để F5 đúng Key chi tiết, tránh F5 nhầm hoặc thiếu
            if (variables.postType === 'recipe') {
                queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPE_DETAIL] });
            } else if (variables.postType === 'dish') {
                queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DISH_DETAIL] });
            } else {
                queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ARTICLE_DETAIL] });
            }
        },
        onMutate: async ({ postId, postType, currentIsLiked, currentLikesCount }) => {
            const keysToUpdate = getRelevantKeys(postType);
            
            // Tính toán giá trị mới
            const newIsLiked = !currentIsLiked;
            const newLikesCount = newIsLiked ? currentLikesCount + 1 : Math.max(0, currentLikesCount - 1);
            const updates = { is_liked: newIsLiked, isLiked: newIsLiked, likes: newLikesCount, like_count: newLikesCount, likeCount: newLikesCount };

            // Quét đa bộ nhớ (Multi-cache Sweep)
            keysToUpdate.forEach(baseKey => {
                queryClient.setQueriesData({ queryKey: [baseKey] }, (oldData) => smartUpdateCache(oldData, postId, updates));
            });

            return { newIsLiked }; // Truyền cho onError/onSettled nếu cần
        },
        onError: (err, variables, context) => {
            // Rollback (Có thể fetch lại data từ server thay vì lưu cache cũ cho gọn)
            const keysToUpdate = getRelevantKeys(variables.postType);
            keysToUpdate.forEach(baseKey => {
                queryClient.invalidateQueries({ queryKey: [baseKey] });
            });
        }
    });
};

export const useToggleSaveMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, postType }) => interactionApi.toggleSave(postId, postType),
        onSuccess: () => {
            // Thêm 2 dòng này để F5 lại dữ liệu chuẩn hóa
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INTERACTION_STATE] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPE_DETAIL] });
        },
        onMutate: async ({ postId, postType, currentIsSaved }) => {
            const keysToUpdate = getRelevantKeys(postType);
            const newIsSaved = !currentIsSaved;
            const updates = { is_saved: newIsSaved, isSaved: newIsSaved };

            keysToUpdate.forEach(baseKey => {
                queryClient.setQueriesData({ queryKey: [baseKey] }, (oldData) => smartUpdateCache(oldData, postId, updates));
            });
            return { newIsSaved };
        },
        onError: (err, variables) => {
            getRelevantKeys(variables.postType).forEach(baseKey => {
                queryClient.invalidateQueries({ queryKey: [baseKey] });
            });
        },
        onSettled: () => {
            // Khi save/unsave, phải tải lại trang "Đã Lưu" ở Profile
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SAVED_RECIPES] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SAVED_ARTICLES] });
        }
    });
};

export const usePostCommentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ postId, content, postType, parentId }) => interactionApi.postComment(postId, content, postType, parentId),
        onSuccess: (data, variables) => {
           queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPE_COMMENTS] });
        }
    });
};

export const useDeleteCommentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (commentId) => interactionApi.deleteComment(commentId),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPE_COMMENTS] }); // Invalidate toàn bộ comment tree
        }
    });
};

export const useEditCommentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ commentId, content }) => interactionApi.updateComment(commentId, content),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPE_COMMENTS] });
        }
    });
};

export const useReportPostMutation = () => {
    return useMutation({
        mutationFn: ({ postId, reason, postType }) => interactionApi.reportPost(postId, reason, postType)
    });
};

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