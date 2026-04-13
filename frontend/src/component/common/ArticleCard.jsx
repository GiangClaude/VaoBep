import React, { useState } from 'react';
import { Clock, Heart, MessageCircle, Share2, MoreHorizontal, Edit3, Trash2, Bookmark, Flag } from 'lucide-react';
import { motion } from 'framer-motion'; 
import ImageWithFallback from '../figma/ImageWithFallBack';
import useInteraction from '../../hooks/useInteraction';
import Toast from '../common/Toast'; 
import CommentSection from '../comment/CommentSection'; 
import { Lock } from 'lucide-react'; // Import thêm icon Lock
import { useAuth } from '../../AuthContext';

// Hàm render badge trạng thái bài viết
const renderStatusBadge = (status) => {
  switch (status) {
    case 'public':
      return <span className="bg-green-50 text-green-600 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-green-100">Công khai</span>;
    case 'draft':
      return <span className="bg-yellow-50 text-yellow-600 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-yellow-100">Bản nháp</span>;
    case 'hidden':
      return <span className="bg-gray-100 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-gray-200">Đã ẩn</span>;
    case 'banned':
      return <span className="bg-red-50 text-red-600 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-red-100">Bị khóa</span>;
    default:
      return null;
  }
};

export default function ArticleCard({ 
  id, 
  author, 
  authorAvatar, 
  date, 
  readTime, 
  title, 
  excerpt, 
  category, 
  image, 
  commentCount = 0, 
  status,          
  isOwnerView,     
  onEdit,          
  onDelete,        
  onClick,
  tags = [],
  is_liked = false,
  is_saved = false,
  likeCount = 0
}) {
  console.log('Render ArticleCard với props:', { id, 
  author, 
  authorAvatar, 
  date, 
  readTime, 
  title, 
  excerpt, 
  category, 
  image, 
  commentCount, 
  status,          
  isOwnerView,     
  onEdit,          
  onDelete,        
  onClick,
  tags,
  is_liked,
  is_saved,
  likeCount});

  const { currentUser } = useAuth();

  const [showMenu, setShowMenu] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const [showComments, setShowComments] = useState(false); // State quản lý hiển thị bình luận

  const displayAuthorName = typeof author === 'object' ? author.name : author;
  const displayAvatar = typeof author === 'object' ? author.avatar : authorAvatar;

  const interactionHook = useInteraction({
      id: id,
      type: 'article',
      initialData: {
        liked: is_liked,
        saved: is_saved,
        likes: likeCount,
        commentCount: commentCount
      }
  });

  // console.log(currentUser);
  //Xem xét biến cái này thành utils gọi nhiều cho cả recipe, article
  const isOwner = currentUser?.id === (author?.id || author);
  const isLocked = !isOwner && (status === 'draft' || status === 'banned' || status === 'hidden');
  
  const { InteractionModal, ReportModal } = interactionHook;

  // Hàm xử lý việc ẩn/hiện phần bình luận khi nhấn nút
  const toggleComments = (e) => {
    e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài Card
    setShowComments(!showComments);
  };

if (isLocked) {
  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-2xl border border-dashed border-gray-300 p-8 items-center justify-center text-center relative group">
      <Lock className="w-8 h-8 text-gray-300 mb-3" />
      <h3 className="text-gray-500 font-bold text-sm">Nội dung đã bị ẩn</h3>
      
      {/* Nút bỏ lưu cho bài viết bị khóa */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          interactionHook.handleToggleSave(e); // Gọi hàm bỏ lưu bình thường
        }}
        className="mt-4 text-xs text-red-500 font-medium hover:underline flex items-center gap-1"
      >
        <Trash2 className="w-3 h-3" /> Gỡ khỏi mục đã lưu
      </button>
      
      <Toast 
        message={interactionHook.toast.message} 
        isVisible={interactionHook.toast.show} 
        onClose={interactionHook.closeToast} 
      />
    </div>
  );
}

  
  return (
    <motion.article 
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:shadow-lg transition-all duration-300"
    >
      {/* 1. Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <img src={displayAvatar} alt={displayAuthorName} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
          <div>
            <div className="flex items-center gap-2">
              <div className="font-semibold text-gray-900 text-sm">{displayAuthorName}</div>
              {isOwnerView && renderStatusBadge(status)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
              <span>{date}</span>
              <span>•</span>
              <Clock className="w-3 h-3" />
              <span>{readTime}</span>
            </div>
          </div>
        </div>
        
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
              <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
                {isOwnerView ? (
                  <>
                    {status !== 'banned' && (
                        <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onEdit?.(id); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <Edit3 className="w-4 h-4" /> Chỉnh sửa
                        </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete?.(id); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" /> Xóa
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setShowMenu(false); interactionHook.handleToggleSave(e); }}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${interactionHook.state.saved ? 'text-[#ff6b35]' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      <Bookmark className={`w-4 h-4 ${interactionHook.state.saved ? 'fill-current' : ''}`} />
                      {interactionHook.state.saved ? 'Đã lưu bài' : 'Lưu bài viết'}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setShowMenu(false); interactionHook.handleReport(e); }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Flag className="w-4 h-4" /> Báo cáo
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 2. Body */}
      <div className="mb-3 flex-1">
        {(tags && tags.length > 0) && (
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {(showAllTags ? tags : tags.slice(0, 3)).map(t => (
              <span key={t.id} className="text-[11px] font-medium bg-[#ff6b35]/10 text-[#ff6b35] px-2.5 py-1 rounded-full border border-[#ff6b35]/20">
                {t.name}
              </span>
            ))}
            {tags.length > 3 && (
               <button 
                onClick={(e) => { e.stopPropagation(); setShowAllTags(!showAllTags); }} 
                className="text-[11px] font-medium text-gray-500 hover:text-[#ff6b35] px-2.5 py-1 rounded-full bg-gray-50 transition-colors"
              >
                {showAllTags ? 'Thu gọn' : `+${tags.length - 3} xem thêm`}
              </button>
            )}
          </div>
        )}
        <h3 className="text-lg font-bold text-gray-800 mb-1.5 leading-snug hover:text-[#ff6b35] transition-colors">{title}</h3>
        <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">{excerpt}</p>
      </div>

      {/* 3. Image */}
      {image && (
        <div className="mb-4 rounded-xl overflow-hidden relative bg-gray-50 h-48">
          <ImageWithFallback src={image} alt={title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
        </div>
      )}

      {/* 4. Footer: Interactive Buttons */}
      <div className="mt-auto flex items-center gap-6 pt-3 border-t border-gray-50 text-sm font-medium text-gray-500">
        <button 
          onClick={(e) => { e.stopPropagation(); interactionHook.handleToggleLike(e); }}
          className={`flex items-center gap-2 transition-colors group ${interactionHook.state.liked ? 'text-red-500' : 'hover:text-[#ff6b35]'}`}
        >
          <Heart className={`w-5 h-5 ${interactionHook.state.liked ? 'fill-current' : 'group-hover:fill-orange-50'}`} /> 
          <span>{likeCount > 0 ? likeCount : ''} Thích</span>
        </button>

        {/* Nút bật/tắt bình luận */}
        <button 
          onClick={toggleComments}
          className="flex items-center gap-2 hover:text-[#ff6b35] transition-colors group"
        >
          <MessageCircle className="w-5 h-5 group-hover:fill-orange-50" /> 
          <span>{commentCount > 0 ? commentCount : ''} Bình luận</span>          
        </button>

        <button 
          onClick={(e) => { e.stopPropagation(); interactionHook.handleShare(e); }}
          className="flex items-center gap-2 hover:text-[#ff6b35] transition-colors ml-auto group"
        >
          <Share2 className="w-5 h-5" /> 
          <span className="hidden sm:inline">Chia sẻ</span>
        </button>
      </div>

      {/* 5. Comment Section (Chỉ hiển thị khi showComments là true) */}
      {showComments && (
        <div 
          className="mt-4 pt-2 border-t border-gray-100 cursor-default" 
          onClick={(e) => e.stopPropagation()} // Ngăn click vào khu vực comment làm trigger thẻ Card
        >
          <CommentSection 
            postId={id} 
            postType="article" 
            interactionHook={interactionHook} 
          />
        </div>
      )}

      {/* Modals & Toasts */}
      <InteractionModal />
      <ReportModal />
      <Toast 
        message={interactionHook.toast.message} 
        isVisible={interactionHook.toast.show} 
        onClose={interactionHook.closeToast} 
      />
    </motion.article>
  );
}