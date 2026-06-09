// VỊ TRÍ: frontend/src/hooks/queries/useInteractionQueries.js

import { useQuery } from '@tanstack/react-query';
import interactionApi from '../../api/interactionApi';
import { QUERY_KEYS } from '../../config/queryKeys';

// Hook 1: Lấy trạng thái Like, Save, Rating của User hiện tại
export const useInteractionStateQuery = (postId, postType = 'recipe', isAuthenticated = false) => {
    return useQuery({
        queryKey: [QUERY_KEYS.INTERACTION_STATE, postType, postId],
        queryFn: async () => {
            const response = await interactionApi.getInteractionState(postId, postType);
            if (response.success) {
                return response.data; // Trả về { liked: boolean, saved: boolean, rated: number }
            }
            return { liked: false, saved: false, rated: 0 };
        },
        // Chỉ gọi API này khi có postId VÀ user đã đăng nhập
        enabled: !!postId && isAuthenticated,
    });
};

// Hook 2: Lấy danh sách bình luận
export const useCommentsQuery = (postId, postType = 'recipe', page = 1) => {
    return useQuery({
        queryKey: [QUERY_KEYS.RECIPE_COMMENTS, postType, postId, page],
        queryFn: async () => {
            const response = await interactionApi.getComments(postId, postType, page);
            if (response.success) {
                return response.data; // Trả về { comments: [], total: number }
            }
            return { comments: [], total: 0 };
        },
        enabled: !!postId,
    });
};

// Hook 3: Lấy danh sách phản hồi (Lazy load dựa vào isExpanded)
export const useRepliesQuery = (parentId, isExpanded) => {
    return useQuery({
        queryKey: [QUERY_KEYS.RECIPE_COMMENTS, 'replies', parentId],
        queryFn: async () => {
            const response = await interactionApi.getReplies(parentId);
            if (response.success) {
                return response.data; // Mảng các replies
            }
            return [];
        },
        enabled: !!parentId && isExpanded, // Chỉ gọi API khi isExpanded = true
    });
};