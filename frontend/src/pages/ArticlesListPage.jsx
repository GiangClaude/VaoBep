import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import ArticleCard from '../component/common/ArticleCard';
import ArticlePostCard from '../component/common/ArticlePostCard';
import usePublicArticles from '../hooks/usePublicArticles';
import Header from '../component/common/Header';
import { Footer } from '../component/common/Footer';
import { motion } from 'motion/react';

export default function ArticlesListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 10;

  const { articles, loading, pagination, fetchArticles } = usePublicArticles(page, limit);
    console.log("ArticlesListPage - articles: ", articles);
  useEffect(() => {
    fetchArticles(page, limit).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const goToArticle = (id) => navigate(`/article/${id}`);

  const Pagination = () => {
    if (!pagination) return null;
    if (pagination.totalPages <= 1) return null;

    return (
      <div className="flex justify-center items-center gap-2 mt-8">
        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-3 rounded-full">
          <ChevronLeft className="w-5 h-5 text-[#ff6b35]" />
        </button>
        <div className="flex gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(pn => (
            <button key={pn} onClick={() => setPage(pn)} className={`w-10 h-10 rounded-full ${pn === page ? 'bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white' : 'bg-white text-[#7d5a3f]'}`}>
              {pn}
            </button>
          ))}
        </div>
        <button onClick={() => setPage(Math.min(pagination.totalPages, page + 1))} disabled={page === pagination.totalPages} className="p-3 rounded-full">
          <ChevronRight className="w-5 h-5 text-[#ff6b35]" />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fff9f0]">
      <main className="w-full max-w-[1200px] mx-auto px-4 py-8">
        <button onClick={() => navigate('/homepage')} className="flex items-center gap-2 text-[#ff6b35] hover:text-[#f7931e] transition-colors mb-6 font-medium">
          <ArrowLeft className="w-5 h-5" /> <span>Về trang chủ</span>
        </button>

        <h1 className="text-3xl font-bold mb-4">Bài viết học thuật</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {loading && <div className="text-center text-[#7d5a3f]">Đang tải...</div>}
            {articles && articles.length > 0 ? (
              articles.map((a, idx) => (
                <motion.div key={a.id || idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
                  {/* Use Facebook-style post for first item on page */}
                    <ArticleCard
                      id={a.id}
                      author = {a.author}
                      authorAvatar={a.authorAvatar}
                      date={a.date}
                      readTime={a.readTime}
                      title={a.title}
                      excerpt={a.excerpt}
                      image={a.image}
                      tags = {a.rawTags || a.tags || [] }
                    //   category={a.category}
                      commentCount={a.commentCount}
                      onClick={() => goToArticle(a.id)}
                    />
                </motion.div>
              ))
            ) : (
              !loading && <div className="text-center text-[#7d5a3f]">Chưa có bài viết nào.</div>
            )}

            <Pagination />
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="font-bold text-lg mb-3">Thể loại</h3>
              <div className="flex flex-col gap-2 text-[#7d5a3f]">
                <button className="text-left">Tất cả</button>
                <button className="text-left">Ẩm thực</button>
                <button className="text-left">Dinh dưỡng</button>
                <button className="text-left">Mẹo vặt</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
