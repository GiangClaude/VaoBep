import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MessageCircle, Heart, Share2, MoreHorizontal, Bookmark, Flag, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

import ImageWithFallBack from '../component/figma/ImageWithFallBack';
import { Footer } from '../component/common/Footer';
import CommentSection from '../component/comment/CommentSection';
import AiSummaryBanner from "../component/common/AiSummaryBanner";

// [MỚI] IMPORT CÁC HOOK QUERIES VÀ UI
import { useArticleDetailQuery } from '../hooks/queries/useArticlesQueries';
import { useInteractionStateQuery } from '../hooks/queries/useInteractionQueries';
import { usePostActions } from '../hooks/ui/interaction/usePostActions';
import { useAuth } from '../AuthContext';

export default function ArticleDetailPage() {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  // 1. Fetch dữ liệu tĩnh của bài viết
  const { data: article, isLoading, error } = useArticleDetailQuery(articleId);

  // 2. Fetch trạng thái tương tác của user (Chỉ gọi khi user đã đăng nhập)
  const { data: interactionState } = useInteractionStateQuery(articleId, 'article', !!currentUser);

  // 3. Khởi tạo Hook tương tác cho các nút bấm (Sử dụng dữ liệu từ Cache làm gốc)
  const { handleLike, handleSave, handleShare, handleReport } = usePostActions({
    id: articleId,
    type: 'article',
    isLiked: interactionState?.liked || false,
    likesCount: article?.likeCount || 0,
    isSaved: interactionState?.saved || false
  });

  if (isLoading) return <div className="min-h-screen bg-[#fff9f0] flex items-center justify-center text-[#7d5a3f]">Đang tải...</div>;
  if (error || !article) return (
    <div className="min-h-screen bg-[#fff9f0] flex flex-col items-center justify-center pt-20">
        <h2 className="text-2xl font-bold text-red-500 mb-4">{error?.message || "Không tìm thấy bài viết"}</h2>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white rounded-full">Quay lại</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fff9f0]">
      <main className="container mx-auto px-4 py-8">
        {/* THANH ĐIỀU HƯỚNG & MENU CHỨC NĂNG */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#ff6b35] hover:text-[#f7931e] transition-colors font-medium">
            <ArrowLeft className="w-5 h-5" /> <span>Quay lại</span>
          </button>
          
          <div className="flex items-center gap-2 relative">
            <button onClick={handleShare} className="p-2.5 bg-white rounded-full shadow-sm text-gray-600 hover:text-[#ff6b35] transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="p-2.5 bg-white rounded-full shadow-sm text-gray-600 hover:text-[#ff6b35] transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20">
                    <button onClick={(e) => { setShowMenu(false); handleSave(e); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 transition-colors">
                      <Bookmark className={`w-4 h-4 ${interactionState?.saved ? 'fill-[#ff6b35] text-[#ff6b35]' : ''}`} />
                      {interactionState?.saved ? 'Đã lưu bài viết' : 'Lưu bài viết'}
                    </button>
                    <button onClick={(e) => { setShowMenu(false); handleReport(e); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <Flag className="w-4 h-4" /> Báo cáo
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[24px] shadow-sm overflow-hidden border border-orange-100/50">
              
              {/* ẢNH BÌA & TIÊU ĐỀ */}
              <div className="relative h-[300px] md:h-[450px]">
                <ImageWithFallBack src={article.image} alt={article.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute left-8 bottom-8 right-8 text-white">
                  <h1 className="text-3xl md:text-4xl font-bold leading-tight drop-shadow-md">{article.title}</h1>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 pr-4 border-r border-white/30">
                      <img src={article.authorAvatar} alt={article.authorName} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                      <span className="font-semibold">{article.authorName}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span>{article.date}</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {article.readTime}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* NỘI DUNG CHÍNH */}
              <div className="p-8 md:p-10">
                {/* Thanh Tương Tác */}
                <div className="flex items-center gap-6 mb-8 py-4 px-6 bg-[#fff9f0] rounded-2xl border border-[#ffc857]/20">
                  <button onClick={handleLike} className={`flex items-center gap-2 font-bold transition-colors ${interactionState?.liked ? 'text-[#ff6b35]' : 'text-gray-600 hover:text-[#ff6b35]'}`}>
                    <Heart className={`w-6 h-6 ${interactionState?.liked ? 'fill-current' : ''}`} />
                    <span>{article.likeCount} Thích</span>
                  </button>
                  <div className="h-4 w-[1px] bg-orange-200" />
                  <div className="flex items-center gap-2 text-gray-600 font-medium">
                    <MessageCircle className="w-6 h-6" />
                    <span>{article.commentCount} Bình luận</span>
                  </div>
                </div>

                <div className="prose prose-lg max-w-none text-[#3b3b3b] leading-relaxed mb-10">
                  {article.content ? (
                    <div dangerouslySetInnerHTML={{ __html: article.content }} className="article-content-html" />
                  ) : (
                    <p className="whitespace-pre-line">{article.excerpt}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap pt-6 border-t border-gray-100">
                  {article.tags?.map((t) => (
                    <span key={t.id} className="text-sm bg-gray-50 text-gray-600 px-4 py-1.5 rounded-full">
                      #{t.name}
                    </span>
                  ))}
                </div>

                {/* COMPONENT COMMENT ĐỘC LẬP */}
                <CommentSection postId={articleId} postType="article" />
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: LIÊN KẾT & AI */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-orange-100/50 sticky top-24">
              <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center justify-between">
                <span>Công thức liên quan</span>
                <span className="w-8 h-1 bg-[#ff6b35] rounded-full" />
              </h3>

              <div className="space-y-4">
                {article.recipes?.length > 0 ? (
                  article.recipes.map((recipe) => (
                    <div key={recipe.id} onClick={() => navigate(`/recipe/${recipe.id}`)} className="group flex items-center gap-4 p-3 rounded-xl hover:bg-orange-50 transition-all cursor-pointer">
                      <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg">
                        <ImageWithFallBack src={recipe.image} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 line-clamp-2 leading-snug group-hover:text-[#ff6b35] mb-1">{recipe.title}</h4>
                        <div className="flex items-center text-xs text-gray-500 gap-1"><span className="line-clamp-1">Bởi {recipe.authorName}</span><ChevronRight className="w-3 h-3 text-[#ff6b35]" /></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm italic">Không có công thức liên kết</div>
                )}
              </div>

              <AiSummaryBanner 
                  title="✨ Nhờ AI tóm tắt nội dung bài viết này"
                  contextText={`Bài viết: ${article.title}. Nội dung: ${article.content || article.excerpt}`} 
              />
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}