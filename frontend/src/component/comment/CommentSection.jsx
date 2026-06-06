import React from 'react';
import CommentInput from './CommentInput';
import CommentItem from './CommentItem';
import { getAvatarUrl } from '../../utils/imageHelper';

// [MỚI] Sử dụng hook Query & Action riêng biệt
import { useCommentsQuery } from '../../hooks/queries/useInteractionQueries';
import { useCommentActions } from '../../hooks/ui/interaction/useCommentActions';

export default function CommentSection({ postId, postType }) {
    // Tự động fetch comments bằng React Query
    const { data, isLoading } = useCommentsQuery(postId, postType, 1);
    const { handlePost } = useCommentActions();

    const comments = data?.comments || [];
    const totalCount = data?.total || 0;

    const onRootSubmit = async (content) => {
        return await handlePost(postId, postType, content);
    };

    return (
        <div className="mt-12 pt-8 border-t border-[#7d5a3f]/10">
            <h3 className="text-xl font-bold text-[#7d5a3f] mb-6 flex items-center gap-2">
                Bình luận ({totalCount})
            </h3>

            <div className="mb-8">
                <CommentInput onSubmit={onRootSubmit} />
            </div>

            {isLoading ? (
                <div className="text-center text-sm text-gray-500 py-4">Đang tải bình luận...</div>
            ) : (
                <div className="space-y-4">
                    {comments.map(comment => (
                        <CommentItem 
                            key={comment.comment_id} 
                            comment={{
                                ...comment,
                                avatar: getAvatarUrl(comment.user_id, comment.avatar)
                            }} 
                            depth={0}
                            postId={postId}
                            postType={postType}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}