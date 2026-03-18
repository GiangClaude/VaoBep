import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MessageCircle } from 'lucide-react';
import useArticleDetail from '../hooks/useArticleDetail';
import ImageWithFallBack from '../component/figma/ImageWithFallBack';
import { Footer } from '../component/common/Footer';

export default function ArticleDetailPage() {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const { article, loading, error } = useArticleDetail(articleId);
  if (loading && !article) return <div className="min-h-screen bg-[#fff9f0] flex items-center justify-center text-[#7d5a3f]">Đang tải...</div>;
  // Nếu có lỗi (ví dụ 403 do bị ban), hiển thị dòng lỗi đó ra giữa màn hình
  if (error) return (
    <div className="min-h-screen bg-[#fff9f0] flex flex-col items-center justify-center pt-20">
        <h2 className="text-2xl font-bold text-red-500 mb-4">{error}</h2>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white rounded-full">Quay lại</button>
    </div>
  );
  if (!article) return <div className="min-h-screen bg-[#fff9f0] text-center pt-20">Không tìm thấy bài viết</div>;
    window.scrollTo(0, 0); // Scroll lên đầu trang khi có dữ liệu
  return (
    <div className="min-h-screen bg-[#fff9f0]">
      <main className="container mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#ff6b35] hover:text-[#f7931e] transition-colors mb-6 font-medium">
          <ArrowLeft className="w-5 h-5" /> <span>Quay lại</span>
        </button>

        <div className="bg-white rounded-[20px] shadow-lg overflow-hidden mb-8">
          <div className="relative h-[320px] md:h-[420px]">
            <ImageWithFallBack src={article.image} alt={article.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute left-6 bottom-6 text-white">
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">{article.title}</h1>
              <div className="mt-3 flex items-center gap-4 text-sm text-[#fff9f0]">
                <div className="flex items-center gap-2">
                  <img 
                    src={article.author.avatar} 
                    alt={article.author.name}  
                    className="w-8 h-8 rounded-full object-cover border-2 border-white" />
                  <span className="font-semibold">{article.author.name}</span>
                </div>
                <div className="px-3 py-1 bg-[#fff9f0]/20 rounded-full">{article.date}</div>
                <div className="px-3 py-1 bg-[#fff9f0]/20 rounded-full flex items-center gap-2"><Clock className="w-4 h-4" /> {article.readTime}</div>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12">
            <div className="mb-6 flex items-center gap-3">
              {article.rawTags && article.rawTags.map((t, idx) => (
                <span key={idx} className="text-xs bg-[#fff9f0] text-[#7d5a3f] px-3 py-1 rounded-full border border-[#ffc857]/20">{t.name}</span>
              ))}
            </div>

            <div className="prose prose-lg max-w-none text-[#3b3b3b] leading-relaxed">
              {article.content ? (
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
              ) : (
                <p className="whitespace-pre-line text-[#7d5a3f]">{article.excerpt}</p>
              )}
            </div>

            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><MessageCircle className="w-5 h-5 text-[#ff6b35]" /> Bình luận ({article.totalComments})</h3>
              <div className="mt-4 space-y-4">
                {article.comments && article.comments.length > 0 ? (
                  article.comments.map((c, i) => (
                    <div key={i} className="bg-[#fff9f0] p-4 rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <img src={c.avatar ? c.avatar : '/avatar_default.png'} alt={c.full_name || 'Người dùng'} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <div className="font-semibold text-gray-800">{c.full_name || 'Người dùng'}</div>
                          <div className="text-xs text-gray-400">{new Date(c.created_at).toLocaleString('vi-VN')}</div>
                        </div>
                      </div>
                      <p className="text-[#7d5a3f]">{c.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-[#7d5a3f] italic">Chưa có bình luận nào.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
