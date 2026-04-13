import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowLeft , Search} from 'lucide-react';
import ArticleCard from '../component/common/ArticleCard';
import ArticlePostCard from '../component/common/ArticlePostCard';
import usePublicArticles from '../hooks/usePublicArticles';
import Header from '../component/common/Header';
import { Footer } from '../component/common/Footer';
import { motion } from 'motion/react';
import Pagination from '../component/common/Pagination';
import {ArticleFilter} from '../component/common/ArticleFilter';
export default function ArticlesListPage() {
  // window.scrollTo(0, 0);
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    searchTerm: "",
    tags: [],
    sort: "newest"
  });
  const limit = 10;

  const { articles, loading, pagination, fetchArticles } = usePublicArticles(page, limit, filters);
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset về trang 1 khi người dùng đổi bộ lọc
  };
  console.log("Articles List: ", articles);
  // useEffect(() => {
  //   fetchArticles(page, limit).catch(() => {});
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [page]);

  const goToArticle = (id) => navigate(`/article/${id}`);



  return (
    <div className="min-h-screen bg-[#fff9f0]">
      <main className="w-full max-w-[1200px] mx-auto px-4 py-8">
        <button onClick={() => navigate('/homepage')} className="flex items-center gap-2 text-[#ff6b35] hover:text-[#f7931e] transition-colors mb-6 font-medium">
          <ArrowLeft className="w-5 h-5" /> <span>Về trang chủ</span>
        </button>
        
        <h1 className="text-3xl font-bold mb-8">Bài viết học thuật</h1>

            
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
          <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm tiêu đề bài viết..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-100 shadow-sm focus:ring-2 focus:ring-[#ff6b35] outline-none"
                    value={filters.searchTerm}
                    onChange={(e) => handleFilterChange({...filters, searchTerm: e.target.value})}
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>

              <div className="lg:col-span-1">
                <div className="sticky top-24">
                    <ArticleFilter onFilterChange={handleFilterChange} />
                </div>
              </div>

          </div>
          <div className="lg:col-span-2 space-y-4">


            {loading && <div className="text-center text-[#7d5a3f]">Đang tải...</div>}
            {articles && articles.length > 0 ? (
              articles.map((a, idx) => (
                <motion.div key={a.id || idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
                  {/* Use Facebook-style post for first item on page */}
                    <ArticleCard
                      {...a}
                      
                      tags = {a.rawTags || a.tags || [] }
                    //   category={a.category}
                      commentCount={a.totalComments}
                      onClick={() => goToArticle(a.id)}
                    
                    />
                </motion.div>
              ))
            ) : (
              !loading && <div className="text-center text-[#7d5a3f]">Chưa có bài viết nào phù hợp.</div>
            )}

            <Pagination pagination={pagination} onPageChange={setPage} />
          </div>
        </div>
      </main>
    </div>
  );
}
