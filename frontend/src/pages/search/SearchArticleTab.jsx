import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from "react-router-dom";
import { Filter, X } from "lucide-react"; 
import { motion, AnimatePresence } from "framer-motion";

import { ArticleFilter } from "../../component/common/ArticleFilter";
import Pagination from "../../component/common/Pagination";
import { ArticleList, EmptyState } from "../../component/search/SearchShared";
import { useSearchArticlesQuery } from "../../hooks/queries/useSearchQueries";
import { useFilters } from "../../hooks/ui/common/useFilters";

export default function SearchArticleTab() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const keyword = searchParams.get("keyword") || "";
    
    const [page, setPage] = useState(1);
    const [isFilterOpen, setIsFilterOpen] = useState(false); // Trạng thái mở Drawer
    
    // Quản lý trạng thái bộ lọc (Tag, Sort) cho Bài viết
    const { filters, debouncedFilters, replaceFilters } = useFilters({ sort: "newest", tags: [] });

    // Reset về trang 1 khi đổi từ khóa
    useEffect(() => { setPage(1); }, [keyword]);

    const { data, isFetching } = useSearchArticlesQuery({
        keyword, page, filters: debouncedFilters, limit: 10, enabled: true
    });

    const articles = data?.data || [];
    const pagination = data?.pagination || {};

    // Tính số lượng filter đang áp dụng để hiện badge (1 cho sort nếu khác mặc định + số lượng tags)
    const activeFilterCount = (filters.tags?.length || 0) + (filters.sort !== "newest" ? 1 : 0);

    return (
        <div className="animate-in fade-in duration-300">
            {/* Header của Tab: Tiêu đề + Nút Bộ lọc */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Bài viết học thuật</h2>
                
                <button 
                    onClick={() => setIsFilterOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:border-[#ff6b35] hover:text-[#ff6b35] transition-all shadow-sm"
                >
                    <Filter className="w-5 h-5" /> 
                    Lọc bài viết
                    {activeFilterCount > 0 && (
                        <span className="bg-[#ff6b35] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full ml-1">
                            {activeFilterCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Danh sách kết quả chiếm 100% chiều rộng */}
            {isFetching ? (
                <div className="py-20 text-center animate-pulse text-[#ff6b35] font-bold">Đang tải bài viết...</div>
            ) : articles.length > 0 ? (
                <>
                    {/* Bọc thêm thẻ div grid nếu muốn chia 2 cột bài viết trên màn hình to, 
                        hoặc để mặc định 1 cột như cũ tùy ý bạn. Component ArticleList hiện tại đang là 1 cột */}
                    <ArticleList data={articles} onCardClick={(id) => navigate(`/article/${id}`)} />
                    <Pagination pagination={pagination} onPageChange={setPage} />
                </>
            ) : (
                <EmptyState text="Không tìm thấy bài viết nào phù hợp với bộ lọc." />
            )}

            {/* DRAWER BỘ LỌC (Trượt từ phải sang giống Món ăn) */}
            <AnimatePresence>
                {isFilterOpen && (
                    <>
                        {/* Lớp mờ nền đen */}
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsFilterOpen(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        />
                        {/* Nội dung Drawer */}
                        <motion.div 
                            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                            transition={{ type: "tween", duration: 0.3 }}
                            className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-[60] overflow-y-auto flex flex-col"
                        >
                            <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                                <h3 className="text-xl font-bold">Bộ lọc tìm kiếm</h3>
                                <button onClick={() => setIsFilterOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            
                            <div className="p-4 flex-1">
                                {/* Component Filter */}
                                <ArticleFilter 
                                    filters={filters} 
                                    onFilterChange={(f) => { replaceFilters(f); setPage(1); }} 
                                />
                            </div>

                            <div className="p-4 border-t sticky bottom-0 bg-white">
                                <button 
                                    onClick={() => setIsFilterOpen(false)}
                                    className="w-full py-3 bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white font-bold rounded-xl shadow-lg"
                                >
                                    Xem kết quả
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}