import React, { useState } from "react";
import { Clock, Heart, Star, ArrowUp, ArrowDown, FileText, UtensilsCrossed } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { RecipeCard } from "../common/RecipeCard"; 
import ArticleCard from "../common/ArticleCard"; 
import Pagination from "../common/Pagination";

// Hooks React Query
import { useSavedRecipesQuery } from "../../hooks/queries/useRecipesQueries";
import { useSavedArticlesQuery } from "../../hooks/queries/useArticlesQueries";

export function SavedRecipeTab() {
  const [activeTab, setActiveTab] = useState('recipe');
  const navigate = useNavigate();

  // --- LOGIC SORT (3 Trạng thái) ---
  const [sortConfig, setSortConfig] = useState({ key: null, order: null });

  const handleSortChange = (key) => {
    setSortConfig(prev => {
        if (prev.key !== key) return { key, order: 'desc' }; // Bấm lần 1: Giảm dần
        if (prev.order === 'desc') return { key, order: 'asc' }; // Bấm lần 2: Tăng dần
        return { key: null, order: null }; // Bấm lần 3: Tắt sort
    });
  };

  // Component Nút Sort
  const SortButton = ({ label, icon: Icon, sortKey }) => {
    const isActive = sortConfig.key === sortKey;
    return (
      <button
        onClick={() => handleSortChange(sortKey)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all border text-sm font-medium ${
          isActive ? "bg-[#ff6b35] text-white border-[#ff6b35] shadow-md" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
        }`}
      >
        <Icon className="w-4 h-4" /> <span>{label}</span>
        {isActive && (
          <div className="flex flex-col ml-1">
            {sortConfig.order === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
          </div>
        )}
      </button>
    );
  };

  // --- FETCH DATA ---
  // Truyền sortConfig vào query để API xử lý (Backend của bạn đã hỗ trợ sẵn)
  const { data: recipes = [], isLoading: loadingRecipes } = useSavedRecipesQuery(sortConfig);

  const [articlePage, setArticlePage] = useState(1);
  const { data: articlesData, isLoading: loadingArticles } = useSavedArticlesQuery(articlePage);
  
  const articles = articlesData?.data || [];
  const articlePagination = articlesData?.pagination;

  const EmptyState = ({ message, icon: Icon }) => (
    <div className="text-center py-20">
      <div className="inline-flex bg-gray-50 p-6 rounded-full mb-4">
        <Icon className="w-12 h-12 text-gray-300" />
      </div>
      <h3 className="text-lg text-gray-500">{message}</h3>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        {/* Tab Switcher */}
        <div className="flex bg-gray-100 p-1.5 rounded-2xl w-fit">
          <button onClick={() => setActiveTab('recipe')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'recipe' ? "bg-white text-[#ff6b35] shadow-sm" : "text-gray-500"}`}>
            <UtensilsCrossed className="w-4 h-4" /> Công thức
          </button>
          <button onClick={() => setActiveTab('article')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'article' ? "bg-white text-[#ff6b35] shadow-sm" : "text-gray-500"}`}>
            <FileText className="w-4 h-4" /> Bài học thuật
          </button>
        </div>

        {/* Thanh Sort (Chỉ hiện ở Tab Recipe) */}
        {activeTab === 'recipe' && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-gray-500 mr-1">Sắp xếp:</span>
            <SortButton label="Thời gian" icon={Clock} sortKey="time" />
            <SortButton label="Yêu thích" icon={Heart} sortKey="like" />
            <SortButton label="Đánh giá" icon={Star} sortKey="rating" />
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          
          {/* TAB CÔNG THỨC */}
          {activeTab === 'recipe' && (
            loadingRecipes ? <p className="text-center py-10 text-gray-500 animate-pulse">Đang tải...</p> : 
            recipes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                  {recipes.map((recipe) => (
                    <motion.div key={recipe.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                      {/* RecipeCard tự xử lý Unsave thông qua Query Cache */}
                      <RecipeCard recipe={recipe} onClick={() => navigate(`/recipe/${recipe.id}`)} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : <EmptyState message="Chưa lưu công thức nào" icon={UtensilsCrossed} />
          )}

          {/* TAB BÀI VIẾT */}
          {activeTab === 'article' && (
             loadingArticles ? <p className="text-center py-10 text-gray-500 animate-pulse">Đang tải...</p> : 
             articles.length > 0 ? (
               <>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <AnimatePresence mode="popLayout">
                     {articles.map((article) => (
                       <motion.div key={article.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                         <ArticleCard {...article} onClick={() => article.status === 'public' && navigate(`/article/${article.id}`)} />
                       </motion.div>
                     ))}
                   </AnimatePresence>
                 </div>
                 {articlePagination && <Pagination pagination={{ currentPage: articlePagination.page, totalPages: articlePagination.totalPages, totalItems: articlePagination.totalItems }} onPageChange={setArticlePage} />}
               </>
             ) : <EmptyState message="Chưa lưu bài viết nào" icon={FileText} />
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}