import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  MessageCircle, 
  Heart, 
  Share2, 
  MoreHorizontal, 
  Bookmark, 
  Flag,
  ChevronRight
} from 'lucide-react';
import useArticleDetail from '../hooks/useArticleDetail';
import useInteraction from '../hooks/useInteraction';
import ImageWithFallBack from '../component/figma/ImageWithFallBack';
import { Footer } from '../component/common/Footer';
import Toast from '../component/common/Toast';
import CommentSection from '../component/comment/CommentSection';

export default function ArticleDetailPage() {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const { article, loading, error } = useArticleDetail(articleId);
  const [showMenu, setShowMenu] = useState(false);

  // const {
  //   state,
  //   toast,
  //   closeToast,
  //   handleToggleLike,
  //   handleToggleSave,
  //   handleShare,
  //   handleReport,
  //   InteractionModal,
  //   ReportModal
  // } = useInteraction({
  //   id: articleId,
  //   type: 'article',
  //   initialData: {
  //     liked: article?.is_liked,
  //     saved: article?.is_saved,
  //     likes: article?.likeCount || 0,
  //     commentCount: article?.totalComments || 0
  //   }
  // });
  const interactionHook = useInteraction({
    id: articleId,
    type: 'article',
    initialData: {
      liked: article?.is_liked,
      saved: article?.is_saved,
      likes: article?.likeCount || 0,
      commentCount: article?.totalComments || 0
    }
  });

  const { InteractionModal, ReportModal } = interactionHook;


  if (loading && !article) return <div className="min-h-screen bg-[#fff9f0] flex items-center justify-center text-[#7d5a3f]">Đang tải...</div>;
  if (error) return (
    <div className="min-h-screen bg-[#fff9f0] flex flex-col items-center justify-center pt-20">
        <h2 className="text-2xl font-bold text-red-500 mb-4">{error}</h2>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white rounded-full">Quay lại</button>
    </div>
  );
  if (!article) return <div className="min-h-screen bg-[#fff9f0] text-center pt-20">Không tìm thấy bài viết</div>;

  return (
    <div className="min-h-screen bg-[#fff9f0]">
      <main className="container mx-auto px-4 py-8">
        {/* Nút quay lại & Action Bar phía trên */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#ff6b35] hover:text-[#f7931e] transition-colors font-medium">
            <ArrowLeft className="w-5 h-5" /> <span>Quay lại</span>
          </button>
          
          <div className="flex items-center gap-2 relative">
            <button onClick={interactionHook.handleShare} className="p-2.5 bg-white rounded-full shadow-sm text-gray-600 hover:text-[#ff6b35] transition-colors"><Share2 className="w-5 h-5" /></button>
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="p-2.5 bg-white rounded-full shadow-sm text-gray-600 hover:text-[#ff6b35] transition-colors"><MoreHorizontal className="w-5 h-5" /></button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20">
                    <button onClick={(e) => { setShowMenu(false); interactionHook.handleToggleSave(e); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 transition-colors">
                      <Bookmark className={`w-4 h-4 ${interactionHook.state.saved ? 'fill-[#ff6b35] text-[#ff6b35]' : ''}`} />
                      {interactionHook.state.saved ? 'Đã lưu bài viết' : 'Lưu bài viết'}
                    </button>
                    <button onClick={(e) => { setShowMenu(false); interactionHook.handleReport(e); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <Flag className="w-4 h-4" /> Báo cáo bài viết
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Layout Grid chính */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* CỘT TRÁI: Nội dung chi tiết bài viết (8/12) */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[24px] shadow-sm overflow-hidden border border-orange-100/50">
              <div className="relative h-[300px] md:h-[450px]">
                <ImageWithFallBack src={article.image} alt={article.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute left-8 bottom-8 right-8 text-white">
                  <h1 className="text-3xl md:text-4xl font-bold leading-tight drop-shadow-md">{article.title}</h1>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 pr-4 border-r border-white/30">
                      <img src={article.author.avatar} alt={article.author.name} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                      <span className="font-semibold">{article.author.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span>{article.date}</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {article.readTime}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 md:p-10">
                {/* Interaction Row */}
                <div className="flex items-center gap-6 mb-8 py-4 px-6 bg-[#fff9f0] rounded-2xl border border-[#ffc857]/20">
                  <button onClick={interactionHook.handleToggleLike} className={`flex items-center gap-2 font-bold transition-colors ${interactionHook.state.liked ? 'text-[#ff6b35]' : 'text-gray-600 hover:text-[#ff6b35]'}`}>
                    <Heart className={`w-6 h-6 ${interactionHook.state.liked ? 'fill-current' : ''}`} />
                    <span>{interactionHook.state.likeCount} Thích</span>
                  </button>
                  <div className="h-4 w-[1px] bg-orange-200" />
                  <div className="flex items-center gap-2 text-gray-600 font-medium">
                    <MessageCircle className="w-6 h-6" />
                    <span>{interactionHook.state.commentCount} Bình luận</span>
                  </div>
                </div>

                <div className="prose prose-lg max-w-none text-[#3b3b3b] leading-relaxed mb-10">
                  {article.content ? (
                    <div dangerouslySetInnerHTML={{ __html: article.content }} className="article-content-html" />
                  ) : (
                    <p className="whitespace-pre-line">{article.excerpt}</p>
                  )}
                </div>

                {/* Tags */}
                <div className="flex items-center gap-2 flex-wrap pt-6 border-t border-gray-100">
                  {article.tags && article.tags.map((t) => (
                    <span key={t.id} className="text-sm bg-gray-50 text-gray-600 px-4 py-1.5 rounded-full hover:bg-orange-50 hover:text-[#ff6b35] transition-colors cursor-default">
                      #{t.name}
                    </span>
                  ))}
                </div>

                {/* Comments Section */}
                {/* <div className="mt-12">
                  <h3 className="text-xl font-bold text-gray-800 mb-8 flex items-center gap-2">
                    <MessageCircle className="w-6 h-6 text-[#ff6b35]" /> Thảo luận
                  </h3>
                  <div className="space-y-6">
                    {article.comments && article.comments.length > 0 ? (
                      article.comments.map((c, i) => (
                        <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                          <img src={c.avatar || '/avatar_default.png'} alt="user" className="w-12 h-12 rounded-full object-cover shadow-sm" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-gray-800">{c.full_name || 'Người dùng'}</span>
                              <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <p className="text-gray-700 text-[15px]">{c.content}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-10 text-gray-400 italic bg-gray-50 rounded-2xl">Hãy là người đầu tiên để lại bình luận!</p>
                    )}
                  </div>
                </div> */}
                <CommentSection postId={articleId} postType="article" interactionHook={interactionHook} />
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: Sidebar (4/12) */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-orange-100/50 sticky top-24">
              <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center justify-between">
                <span>Công thức liên quan</span>
                <span className="w-8 h-1 bg-[#ff6b35] rounded-full" />
              </h3>

              <div className="space-y-4">
                {article.recipes && article.recipes.length > 0 ? (
                  article.recipes.map((recipe) => (
                    <div 
                      key={recipe.id} 
                      onClick={() => navigate(`/recipe/${recipe.id}`)}
                      className="group flex items-center gap-4 p-3 rounded-xl hover:bg-orange-50 transition-all cursor-pointer border border-transparent hover:border-orange-100"
                    >
                      <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg">
                        <ImageWithFallBack 
                          src={recipe.image} 
                          alt={recipe.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 line-clamp-2 leading-snug group-hover:text-[#ff6b35] transition-colors mb-1">
                          {recipe.title}
                        </h4>
                        <div className="flex items-center text-xs text-gray-500 gap-1">
                          <span className="line-clamp-1">Bởi {recipe.authorName || 'Đầu bếp'}</span>
                          <ChevronRight className="w-3 h-3 text-[#ff6b35]" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm italic">
                    Không có công thức liên kết
                  </div>
                )}
              </div>

              {/* Box quảng cáo hoặc thông tin thêm (Tùy chọn) */}
              <div className="mt-8 p-5 bg-gradient-to-br from-[#ff6b35] to-[#f7931e] rounded-2xl text-white">
                <h4 className="font-bold mb-2">Yêu thích bài viết này?</h4>
                <p className="text-sm opacity-90 mb-4">Lưu lại ngay để không bỏ lỡ những kiến thức ẩm thực bổ ích nhé!</p>
                <button 
                  onClick={interactionHook.handleToggleSave}
                  className="w-full py-2.5 bg-white text-[#ff6b35] rounded-full font-bold text-sm hover:shadow-lg transition-shadow"
                >
                  {interactionHook.state.saved ? 'Đã lưu trong bộ sưu tập' : 'Lưu vào sổ tay'}
                </button>
              </div>
            </div>
          </aside>

        </div>
      </main>
      
      <Footer />
      <InteractionModal />
      <ReportModal />
      <Toast message={interactionHook.toast.message} isVisible={interactionHook.toast.show} onClose={interactionHook.closeToast} />
    </div>
  );
}