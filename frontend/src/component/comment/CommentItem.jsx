import React, { useState } from 'react';
import { MoreVertical, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns'; 
import { vi } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import CommentInput from './CommentInput';
import Modal from '../common/modal';

// [MỚI]
import { useAuth } from '../../AuthContext';
import { getAvatarUrl } from '../../utils/imageHelper';

import { useCommentActions } from '../../hooks/ui/interaction/useCommentActions';
import { useRepliesQuery } from '../../hooks/queries/useInteractionQueries';
// import useCommentData from '../../hooks/useCommentData';

export default function CommentItem({ comment, depth = 0, postId, postType }) {
    const { currentUser } = useAuth();
    
    const navigate = useNavigate();
    // API actions mới
    const { handlePost, handleDelete, handleEdit } = useCommentActions();

    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    
    // const [replies, setReplies] = useState([]);
    const [showReplies, setShowReplies] = useState(false);
    // const [loadingReplies, setLoadingReplies] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    const isOwner = currentUser?.id === comment.user_id;

    const { data: replies = [], isLoading: loadingReplies } = useRepliesQuery(comment.comment_id, showReplies);


    const toggleReplies = async () => {
       setShowReplies(!showReplies);
    };

    const onReplySubmit = async (content) => {
        const success = await handlePost(postId, postType, content, comment.comment_id);
        if (success) {
            setShowReplyInput(false);
            setShowReplies(true);
            // Refresh lại list comment (Do Mutation Invalidate tự động lo)
            return true;
        }
        return false;
    };

    const confirmDelete = async () => {
        const success = await handleDelete(comment.comment_id);
        if (success) setIsDeleteModalOpen(false);
    };

    const onEditSubmit = async () => {
        const success = await handleEdit(comment.comment_id, editContent);
        if (success) setIsEditing(false);
    };

    const onAvatarClick = async(id) => {
        navigate(`/user/${id}`);
    }

    return (
        <div className={`flex flex-col gap-3 ${depth > 0 ? 'ml-11 mt-3' : 'mb-6'}`}>
            <div className="flex gap-3 group">
                <img src={comment.avatar} className="w-8 h-8 rounded-full object-cover shadow-sm cursor-pointer" alt={comment.full_name} onClick={() => onAvatarClick(comment.user_id)} />
                
                <div className="flex-1 min-w-0">
                    <div className="bg-white border border-[#7d5a3f]/10 rounded-2xl px-4 py-2 inline-block max-w-full shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-[#7d5a3f] text-sm">{comment.full_name}</span>
                            <span className="text-[10px] text-[#7d5a3f]/50">
                                {formatDistanceToNow(new Date(comment.created_at), { locale: vi, addSuffix: true })}
                            </span>
                        </div>

                        {isEditing ? (
                            <div className="mt-2">
                                <textarea 
                                    className="w-full border border-[#7d5a3f]/20 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#7d5a3f]"
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                />
                                <div className="flex gap-2 mt-1">
                                    <button onClick={onEditSubmit} className="text-xs font-bold text-[#7d5a3f]">Lưu</button>
                                    <button onClick={() => setIsEditing(false)} className="text-xs text-gray-500">Hủy</button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-[#7d5a3f] text-sm whitespace-pre-wrap break-words">{comment.content}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-4 mt-1 ml-2 text-xs font-semibold text-[#7d5a3f]/70">
                        {depth < 2 && (
                            <button onClick={() => setShowReplyInput(!showReplyInput)} className="hover:text-[#7d5a3f] flex items-center gap-1">
                                Phản hồi
                            </button>
                        )}
                        
                        {isOwner && (
                            <div className="relative">
                                <button onClick={() => setShowMenu(!showMenu)} className="hover:text-[#7d5a3f]">Sửa/Xóa</button>
                                {showMenu && (
                                    <div className="absolute left-0 mt-1 w-24 bg-white border border-[#7d5a3f]/20 rounded-lg shadow-lg z-10 overflow-hidden">
                                        <button onClick={() => {setIsEditing(true); setShowMenu(false)}} className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-[#fff9f0] w-full text-left">
                                            <Edit2 size={12}/> Sửa
                                        </button>
                                        <button onClick={() => { setIsDeleteModalOpen(true); setShowMenu(false); }} className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-red-50 text-red-600 w-full text-left">
                                            <Trash2 size={12}/> Xóa
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showReplyInput && (
                <div className="ml-11">
                    <CommentInput autoFocus placeholder={`Phản hồi ${comment.full_name}...`} onSubmit={onReplySubmit} />
                </div>
            )}

            {(comment.reply_count > 0 || replies.length > 0) && (
                <div className="ml-11">
                    <button onClick={toggleReplies} className="flex items-center gap-1 text-xs font-bold text-[#7d5a3f] hover:underline">
                        {loadingReplies ? "Đang tải..." : showReplies ? <><ChevronUp size={14}/> Thu gọn</> : <><ChevronDown size={14}/> Xem {comment.reply_count || replies.length} phản hồi</>}
                    </button>
                    
                    <div style={{ display: showReplies ? 'block' : 'none' }}>
                        {replies.map(reply => (
                            <CommentItem 
                                key={reply.comment_id} 
                                comment={{ ...reply, avatar: getAvatarUrl(reply.user_id, reply.avatar) }}
                                depth={depth + 1}
                                postId={postId}
                                postType={postType}
                            />
                        ))}
                    </div>
                </div>
            )}

            <Modal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Xóa bình luận"
                message="Bạn có chắc chắn muốn xóa bình luận này không? Hành động này không thể hoàn tác."
                type="warning"
                actions={[
                    { label: 'Hủy', onClick: () => setIsDeleteModalOpen(false), style: 'secondary' },
                    { label: 'Xóa', onClick: confirmDelete, style: 'danger' }
                ]}
            />
        </div>
    );
}