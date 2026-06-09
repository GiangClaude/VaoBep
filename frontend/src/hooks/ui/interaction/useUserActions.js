// frontend/src/hooks/ui/interaction/useUserActions.js
import { useAuthGuard } from './useAuthGuard';
import { useFollowUserMutation } from '../../mutations/useInteractionMutations';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../../../config/queryKeys';

export const useUserActions = ({ userId, currentIsFollowing, currentFollowers }) => {
    const { requireAuth } = useAuthGuard();
    const queryClient = useQueryClient();
    const followMutation = useFollowUserMutation();

    const handleFollow = requireAuth((e) => {
        if (e && e.stopPropagation) e.stopPropagation();

        // 1. Optimistic Updates cho User (Để sáng nút ngay lập tức)
        const newIsFollowing = !currentIsFollowing;
        const newFollowers = newIsFollowing ? currentFollowers + 1 : Math.max(0, currentFollowers - 1);
        
        // Quét cập nhật cache Search và Profile
        const updates = { isFollowing: newIsFollowing, followers_count: newFollowers, 'stats.followers': newFollowers };
        
        queryClient.setQueriesData({ queryKey: [QUERY_KEYS.SEARCH_USERS] }, (old) => {
            if (!old?.data) return old;
            return { ...old, data: old.data.map(u => String(u.user_id) === String(userId) ? { ...u, ...updates } : u) };
        });

        // 2. Gọi API ngầm
        followMutation.mutate(userId);
    });

    return { handleFollow };
};