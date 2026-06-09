import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from "react-router-dom";
import { Filter, X } from "lucide-react"; // Thêm icon Filter, X
import { motion, AnimatePresence } from "framer-motion";

import { RecipeCard } from "../../component/common/RecipeCard";
import { RecipeFilter } from "../../component/common/RecipeFilter";
import Pagination from "../../component/common/Pagination";
import { EmptyState } from "../../component/search/SearchShared";
import { useSearchRecipesQuery } from "../../hooks/queries/useSearchQueries";
import { useFilters } from "../../hooks/ui/common/useFilters";

export default function SearchRecipeTab() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const keyword = searchParams.get("keyword") || "";
    
    const [page, setPage] = useState(1);
    const [isFilterOpen, setIsFilterOpen] = useState(false); // Trạng thái mở Drawer
    
    const { filters, debouncedFilters, replaceFilters } = useFilters({ tags: [] });

    useEffect(() => { setPage(1); }, [keyword]);

    const { data, isFetching } = useSearchRecipesQuery({
        keyword, page, filters: debouncedFilters, limit: 12, enabled: true
    });

    const recipes = data?.data || [];
    const pagination = data?.pagination || {};

    // Tính số lượng filter đang áp dụng để hiện badge đỏ
    const activeFilterCount = (filters.tags?.length || 0) + (filters.cookingTime ? 1 : 0) + (filters.minRating ? 1 : 0);

    return (
        <div className="animate-in fade-in duration-300">
            {/* Header của Tab: Tiêu đề + Nút Bộ lọc */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Công thức nấu ăn</h2>
                
                <button 
                    onClick={() => setIsFilterOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:border-[#ff6b35] hover:text-[#ff6b35] transition-all shadow-sm"
                >
                    <Filter className="w-5 h-5" /> 
                    Lọc kết quả
                    {activeFilterCount > 0 && (
                        <span className="bg-[#ff6b35] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full ml-1">
                            {activeFilterCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Danh sách kết quả chiếm 100% */}
            {isFetching ? (
                <div className="py-20 text-center animate-pulse text-[#ff6b35] font-bold">Đang tải công thức...</div>
            ) : recipes.length > 0 ? (
                <>
                    {/* Đổi grid-cols-2 thành grid-cols-2 lg:grid-cols-2 (Hoặc 3 nếu card gọn lại) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                        {recipes.map(r => <RecipeCard key={r.id} recipe={r} onClick={() => navigate(`/recipe/${r.id}`)} />)}
                    </div>
                    <Pagination pagination={pagination} onPageChange={setPage} />
                </>
            ) : (
                <EmptyState text="Không tìm thấy công thức nào phù hợp." />
            )}

            {/* DRAWER BỘ LỌC (Trượt từ phải sang) */}
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
                                {/* Component RecipeFilter cũ, gỡ bỏ class bọc bg-white/shadow vì drawer đã tự có nền */}
                                <RecipeFilter 
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