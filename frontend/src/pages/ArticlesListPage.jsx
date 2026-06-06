import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { motion } from 'framer-motion';

import ArticleCard from '../component/common/ArticleCard';
import { ArticleFilter } from '../component/common/ArticleFilter';
import Pagination from '../component/common/Pagination';

// [MỚI] Import Hooks
import { useArticlesListQuery } from '../hooks/queries/useArticlesQueries';
import { useFilters } from '../hooks/ui/common/useFilters';

export default function ArticlesListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  
  // 1. Dùng UI Hook để gom toàn bộ State Filter (Kể cả Sort)
  const { filters, debouncedFilters, replaceFilters, updateFilter } = useFilters({
    searchTerm: "",
    tags: [],
    sort: "newest" // <--- SORT nằm ở đây
  });

  // 2. Truyền Debounced Data vào React Query
  const { data, isLoading } = useArticlesListQuery({
    page,
    limit: 10,
    search: debouncedFilters.searchTerm,  // Backend articleApi của bạn dùng field `search`
    tags: debouncedFilters.tags,
    sortKey: debouncedFilters.sort === 'newest' ? 'created_at' : (debouncedFilters.sort === 'featured' ? 'like_count' : 'read_time'),
    sortOrder: debouncedFilters.sort === 'read_time_asc' ? 'ASC' : 'DESC'
  });

  const articles = data?.data || [];
  const paginationMeta = data?.pagination || { page: 1, totalPages: 1, totalItems: 0 };

  // Nhận thay đổi từ component <ArticleFilter />
  const handleFilterChange = (newFilters) => {
    replaceFilters(newFilters);
    setPage(1); 
  };

  return (
    <div className="min-h-screen bg-[#fff9f0]">
      <main className="w-full max-w-[1200px] mx-auto px-4 py-8">
        <button onClick={() => navigate('/homepage')} className="flex items-center gap-2 text-[#ff6b35] mb-6 font-medium">
          <ArrowLeft className="w-5 h-5" /> <span>Về trang chủ</span>
        </button>
        
        <h1 className="text-3xl font-bold mb-8">Bài viết học thuật</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* CỘT TRÁI (TÌM KIẾM & LỌC & SẮP XẾP) */}
          <div className="lg:col-span-1 space-y-4">
             <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm tiêu đề bài viết..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-100 shadow-sm focus:ring-2 focus:ring-[#ff6b35] outline-none"
                  value={filters.searchTerm}
                  onChange={(e) => updateFilter('searchTerm', e.target.value)} // Update Text ngay lập tức
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
             </div>

             <div className="sticky top-24">
                 {/* Component ArticleFilter sẽ gọi handleFilterChange khi user bấm Sort hoặc đổi Tag */}
                 <ArticleFilter onFilterChange={handleFilterChange} />
             </div>
          </div>

          {/* CỘT PHẢI (DANH SÁCH BÀI VIẾT) */}
          <div className="lg:col-span-2 space-y-4 relative min-h-[400px]">
            {isLoading && (
              <div className="absolute inset-0 z-10 bg-white/60 flex justify-center pt-20 backdrop-blur-[1px]">
                  <div className="w-8 h-8 border-4 border-[#ff6b35] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            <div className={`transition-opacity ${isLoading ? 'opacity-40' : 'opacity-100'}`}>
                {articles.length > 0 ? (
                  articles.map((a) => (
                    <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
                        <ArticleCard {...a} onClick={() => navigate(`/article/${a.id}`)} />
                    </motion.div>
                  ))
                ) : (
                  !isLoading && (
                    <div className="bg-white p-12 text-center rounded-[20px] border border-dashed border-gray-200">
                      <p className="text-gray-500">Chưa có bài viết nào phù hợp.</p>
                    </div>
                  )
                )}

                {/* Phân trang */}
                <Pagination pagination={{ currentPage: paginationMeta.page, totalPages: paginationMeta.totalPages, totalItems: paginationMeta.totalItems }} onPageChange={setPage} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}