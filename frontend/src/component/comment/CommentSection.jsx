import React, { useState, useEffect } from 'react';
import useCommentData from '../../hooks/useCommentData';
import CommentInput from './CommentInput';
import CommentItem from './CommentItem';
import useInteraction from '../../hooks/useInteraction';
import { getAvatarUrl } from '../../utils/imageHelper';
export default function CommentSection({ postId, postType, interactionHook }) {
    const { getRootComments, loading } = useCommentData();
    const { handlePostComment, state } = interactionHook;
    
    const [comments, setComments] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Load comment gốc lần đầu
    useEffect(() => {
        loadComments(1, true);
    }, [postId, postType]);

    const loadComments = async (pageNum, isInitial = false) => {
        const response = await getRootComments(postId, postType, pageNum);
        // console.log("Dữ liệu từ getRootComments:", data);
        if (response.data) {
            const fetchedComments = response.data?.comments || [];

            if (isInitial) setComments(fetchedComments);
            else setComments(prev => [...prev, ...fetchedComments]);
            
            if (fetchedComments.length < 10) setHasMore(false);
        }
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadComments(nextPage);
    };

    const onRootSubmit = async (content) => {
        const result = await handlePostComment(content);
        if (result) {
            setComments(prev => [result, ...prev]);
            return true;
        }
        return false;
    };

    const handleCommentAction = (type, id) => {
        if (type === 'delete') {
            setComments(prev => prev.filter(c => c.comment_id !== id));
        }
    };

    return (
        <div className="mt-12 pt-8 border-t border-[#7d5a3f]/10">
            <h3 className="text-xl font-bold text-[#7d5a3f] mb-6 flex items-center gap-2">
                Bình luận ({state.commentCount})
            </h3>

            <div className="mb-8">
                <CommentInput onSubmit={onRootSubmit} />
            </div>

            <div className="space-y-4">
                {comments?.map(comment => (
                    <CommentItem 
                        key={comment.comment_id} 
                        comment={{
                                ...comment,
                                avatar: getAvatarUrl(comment.user_id, comment.avatar)
                            }
                        } 
                        depth={0}
                        onAction={handleCommentAction}
                        interactionHook={interactionHook}
                    />
                ))}
            </div>

            {hasMore && (
                <button 
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="w-full py-3 mt-4 text-[#7d5a3f] font-bold text-sm bg-white border border-[#7d5a3f]/20 rounded-xl hover:bg-[#fff9f0] transition-colors"
                >
                    {loading ? "Đang tải..." : "Xem thêm bình luận"}
                </button>
            )}
        </div>
    );
}