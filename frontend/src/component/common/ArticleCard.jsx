import React, { useState } from 'react';
import { Clock, Heart, MessageCircle, Share2, MoreHorizontal, Edit3, Trash2, Bookmark, Flag, Lock } from 'lucide-react';
import { motion } from 'framer-motion'; 
import ImageWithFallback from '../figma/ImageWithFallBack';
import { useAuth } from '../../AuthContext';
import { usePostActions } from '../../hooks/ui/interaction/usePostActions';
import CommentSection from '../comment/CommentSection'; // <-- THÊM LẠI IMPORT
import { TagList } from './tag/TagList';
export default function ArticleCard({ 
  id, author, authorAvatar, date, readTime, title, excerpt, image, 
  commentCount = 0, status, isOwnerView, onEdit, onDelete, onClick, tags = [],
  isLiked = false, isSaved = false, likeCount = 0 // <--- SỬA 3 BIẾN NÀY
}) {
  const { currentUser } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false); 

  // 2. Cập nhật lại vào Hook
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
      <div className="flex flex-col h-full bg-gray-50 rounded-2xl border border-dashed border-gray-300 p-8 items-center justify-center text-center relative group">
        <Lock className="w-8 h-8 text-gray-300 mb-3" />
        <h3 className="text-gray-500 font-bold text-sm">Nội dung đã bị ẩn</h3>
        <button onClick={handleSave} className="mt-4 text-xs text-red-500 font-medium hover:underline flex items-center gap-1">
          <Trash2 className="w-3 h-3" /> Gỡ khỏi mục đã lưu
        </button>
      </div>
    );
  }

  return (
    <motion.article 
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <img src={authorAvatar} alt="Author" className="w-10 h-10 rounded-full object-cover border border-gray-100" />
          <div>
            <div className="font-semibold text-gray-900 text-sm">{author?.name || author}</div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
              <span>{date}</span><span>•</span><Clock className="w-3 h-3" /><span>{readTime}</span>
            </div>
          </div>
        </div>
        
        <div className="relative">
          <button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50">
            <MoreHorizontal className="w-5 h-5" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
              <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
                {isOwnerView ? (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onEdit?.(id); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><Edit3 className="w-4 h-4" /> Sửa</button>
                    <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete?.(id); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /> Xóa</button>
                  </>
                ) : (
                  <>
                    <button onClick={(e) => { setShowMenu(false); handleSave(e); }} className={`w-full flex items-center gap-3 px-4 py-2 text-sm ${isSaved ? 'text-[#ff6b35]' : 'text-gray-700 hover:bg-gray-50'}`}>
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} /> {isSaved ? 'Đã lưu' : 'Lưu bài'}
                    </button>
                    <button onClick={(e) => { setShowMenu(false); handleReport(e); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><Flag className="w-4 h-4" /> Báo cáo</button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mb-3 flex-1">
        <h3 className="text-lg font-bold text-gray-800 mb-1.5 leading-snug hover:text-[#ff6b35]">{title}</h3>
        <p className="text-sm text-gray-600 line-clamp-3">{excerpt}</p>
          <TagList 
            tags={tags} 
            maxDisplay={3} 
            containerClassName="flex flex-wrap gap-2 mt-3 mb-1" 
        />
      </div>

      {image && (
        <div className="mb-4 rounded-xl overflow-hidden relative bg-gray-50 h-48">
          <ImageWithFallback src={image} alt={title} className="w-full h-full object-cover hover:scale-105 transition-transform" />
        </div>
      )}

      <div className="mt-auto flex items-center gap-6 pt-3 border-t border-gray-50 text-sm font-medium text-gray-500">
        <button onClick={handleLike} className={`flex items-center gap-2 group ${isLiked ? 'text-red-500' : 'hover:text-[#ff6b35]'}`}>
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} /> <span>{likeCount}</span>
        </button>

        {/* <-- SỬA NÚT BẤM BÌNH LUẬN GỌI HÀM toggleComments --> */}
        <button onClick={toggleComments} className="flex items-center gap-2 hover:text-[#ff6b35]">
          <MessageCircle className="w-5 h-5" /> <span>{commentCount}</span>
        </button>

        <button onClick={handleShare} className="flex items-center gap-2 hover:text-[#ff6b35] ml-auto"><Share2 className="w-5 h-5" /></button>
      </div>

      {/* <-- KHÔI PHỤC VÀ GỌI COMMENT SECTION --> */}
      {/* LƯU Ý: Đã bỏ chữ interactionHook đi vì CommentSection mới sẽ tự lập */}
      {showComments && (
        <div className="mt-4 pt-2 border-t border-gray-100 cursor-default" onClick={(e) => e.stopPropagation()}>
          <CommentSection postId={id} postType="article" />
        </div>
      )}
    </motion.article>
  );
}