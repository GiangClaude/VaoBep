import React, { useState } from 'react';
import { Clock, Heart, MessageCircle, Share2, MoreHorizontal, Edit3, Trash2, Bookmark, Flag, Lock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion'; 
import ImageWithFallback from '../figma/ImageWithFallBack';
import { useAuth } from '../../AuthContext';
import { usePostActions } from '../../hooks/ui/interaction/usePostActions';
import CommentSection from '../comment/CommentSection'; 
import { TagList } from './tag/TagList';

export default function ArticleCard({ 
  id, author, authorAvatar, date, readTime, title, excerpt, image, 
  commentCount = 0, status, isOwnerView, onEdit, onDelete, onClick, tags = [],
  isLiked = false, isSaved = false, likeCount = 0 
}) {
  const { currentUser } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false); 

  const { handleLike, handleSave, handleShare, handleReport } = usePostActions({
      id, type: 'article', isLiked: isLiked, likesCount: likeCount, isSaved: isSaved
  });

  const isLocked = !isOwnerView && (status === 'draft' || status === 'banned' || status === 'hidden');

  const toggleComments = (e) => {
    e.stopPropagation(); 
    setShowComments(!showComments);
  };

  if (isLocked) {
    return (
      <div className="flex flex-col h-full bg-orange-50/50 rounded-[32px] border-2 border-dashed border-orange-200 p-8 items-center justify-center text-center relative group">
        <div className="bg-white p-4 rounded-full shadow-sm mb-3">
            <Lock className="w-8 h-8 text-orange-300" />
        </div>
        <h3 className="text-gray-600 font-extrabold text-sm">Nội dung đang gấu ngủ đông (đã ẩn) 🐻</h3>
        <button onClick={handleSave} className="mt-4 px-4 py-2 bg-white rounded-full text-xs text-red-500 font-bold hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2">
          <Trash2 className="w-3.5 h-3.5" /> Gỡ khỏi mục đã lưu
        </button>
      </div>
    );
  }

  return (
    <motion.article 
      whileHover={{ y: -6 }}
      onClick={onClick}
      className="flex flex-col h-full bg-white rounded-[32px] shadow-[0_8px_24px_-10px_rgba(255,117,31,0.15)] border-2 border-transparent hover:border-orange-100 hover:shadow-[0_12px_32px_-10px_rgba(255,117,31,0.3)] p-5 cursor-pointer transition-all duration-300 group"
    >
      {/* Header: Author & Options */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img src={authorAvatar} alt="Author" className="w-11 h-11 rounded-full object-cover border-2 border-orange-100 shadow-sm" />
          <div>
            <div className="font-extrabold text-gray-800 text-sm group-hover:text-[#ff751f] transition-colors">{author?.name || author}</div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 mt-0.5">
              <span className="bg-gray-100 px-2 py-0.5 rounded-full">{date}</span>
              <span className="flex items-center gap-1 bg-orange-50 text-[#ff751f] px-2 py-0.5 rounded-full"><Clock className="w-3 h-3" /> {readTime}</span>
            </div>
          </div>
        </div>
        
        <div className="relative">
          <button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }} className="text-gray-400 hover:text-[#ff751f] p-2 rounded-full bg-gray-50 hover:bg-orange-50 transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border-2 border-orange-100 py-2 z-20 overflow-hidden">
                {isOwnerView ? (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onEdit?.(id); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-orange-50 hover:text-[#ff751f] transition-colors"><Edit3 className="w-4 h-4" /> Chỉnh sửa</button>
                    <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete?.(id); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /> Xóa bài</button>
                  </>
                ) : (
                  <>
                    <button onClick={(e) => { setShowMenu(false); handleSave(e); }} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold transition-colors ${isSaved ? 'text-[#ff751f] bg-orange-50' : 'text-gray-600 hover:bg-orange-50 hover:text-[#ff751f]'}`}>
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} /> {isSaved ? 'Đã lưu vào sổ' : 'Lưu bài viết'}
                    </button>
                    <button onClick={(e) => { setShowMenu(false); handleReport(e); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-red-50 hover:text-red-500 transition-colors"><Flag className="w-4 h-4" /> Báo cáo</button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mb-4 flex-1">
        <h3 className="text-[18px] font-extrabold text-gray-800 mb-2 leading-snug group-hover:text-[#ff751f] transition-colors">{title}</h3>
        <p className="text-sm text-gray-600 line-clamp-3 font-medium leading-relaxed">{excerpt}</p>
        <TagList tags={tags} maxDisplay={3} containerClassName="flex flex-wrap gap-2 mt-3 mb-1" />
      </div>

      {/* Image (If exists) */}
      {image && (
        <div className="mb-5 rounded-[24px] overflow-hidden relative bg-orange-50 h-52 shadow-inner border border-gray-100">
          <ImageWithFallback src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
        </div>
      )}

      {/* Action Footer (Like, Comment, Share Pill Buttons) */}
      <div className="mt-auto flex items-center justify-between pt-4 border-t-2 border-dashed border-gray-100">
        <div className="flex gap-2">
          <button onClick={(e) => { e.stopPropagation(); handleLike(); }} className={`flex items-center gap-2 h-9 px-3.5 rounded-full font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 ${isLiked ? 'bg-orange-100 text-[#ff751f]' : 'bg-gray-50 text-gray-500 hover:bg-orange-50 hover:text-[#ff751f]'}`}>
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} /> <span>{likeCount} Thích</span>
          </button>

          <button onClick={toggleComments} className="flex items-center gap-2 h-9 px-3.5 bg-gray-50 text-gray-500 rounded-full font-bold text-sm hover:bg-yellow-50 hover:text-yellow-600 transition-all duration-300 hover:-translate-y-0.5">
            <MessageCircle className="w-4 h-4" /> <span>{commentCount} Bình Luận</span>
          </button>
        </div>

        <button onClick={(e) => { e.stopPropagation(); handleShare(); }} className="w-9 h-9 flex items-center justify-center bg-gray-50 text-gray-500 rounded-full hover:bg-orange-50 hover:text-[#ff751f] transition-all duration-300 hover:-translate-y-0.5" title="Chia sẻ">
            <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t-2 border-gray-100 cursor-default" onClick={(e) => e.stopPropagation()}>
          <CommentSection postId={id} postType="article" />
        </div>
      )}
    </motion.article>
  );
}