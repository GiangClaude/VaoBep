// frontend/src/pages/RecipesListPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChefHat, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

import { RecipeCard } from "../component/common/RecipeCard";
import { RecipeFilter } from "../component/common/RecipeFilter";
import Pagination from "../component/common/Pagination"; // Component gốc của bạn

// [MỚI] Import Hooks chuẩn SOLID
import { useRecipesListQuery } from '../hooks/queries/useRecipesQueries';
import { useFilters } from '../hooks/ui/common/useFilters';

export default function RecipesListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  
  // Dùng UI Hook để quản lý Filter + Debounce
  const { filters, debouncedFilters, replaceFilters } = useFilters({
    searchTerm: '', tags: [], cookingTime: '', minRating: 0
  });

  // Gọi React Query (Tự động fetch lại khi page hoặc debouncedFilters đổi)
  const { data, isLoading } = useRecipesListQuery({
    page,
    limit: 12,
    keyword: debouncedFilters.searchTerm,
    tags: debouncedFilters.tags?.join(','),
    minRating: debouncedFilters.minRating || undefined,
    cookingTime: debouncedFilters.cookingTime || undefined
  });

  // console.log(data);
  const recipes = data?.data || [];
  const paginationMeta = data?.pagination || { page: 1, totalPages: 1, totalItems: 0 };

  const handleFilterChange = (newFilters) => {
    replaceFilters(newFilters);
    setPage(1); // Luôn về trang 1 khi đổi bộ lọc
  };

  return (
    <div className="min-h-screen bg-[#fff9f0]">
      <main className="w-full max-w-[1920px] mx-auto px-4 lg:px-6 py-8">
        <div className="mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#ff6b35] hover:text-[#f7931e] mb-4">
            <ArrowLeft className="w-5 h-5" /> <span>Quay lại</span>
          </button>
          <div className="flex items-center gap-3 mb-2">
            <ChefHat className="w-8 h-8 text-[#ff6b35]" />
            <h1 className="text-4xl font-bold">Tất Cả Công Thức</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-3 xl:col-span-2">
            <RecipeFilter filters={filters} onFilterChange={handleFilterChange} />
          </div>

          {/* Grid View */}
          <div className="lg:col-span-9 xl:col-span-10 relative min-h-[500px]">
            {isLoading && (
              <div className="absolute inset-0 z-10 bg-white/60 flex items-start justify-center pt-20 backdrop-blur-[1px]">
                 <div className="w-10 h-10 border-4 border-[#ff6b35] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {!isLoading && recipes.length === 0 ? (
               <div className="bg-white rounded-[25px] shadow-lg p-12 text-center border-2 border-dashed border-gray-200">
                  <h3 className="text-2xl mb-2 text-gray-800">Không tìm thấy công thức nào</h3>
                  <p className="text-[#7d5a3f]">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
               </div>
            ) : (
              <>
                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-1 transition-opacity ${isLoading ? 'opacity-40' : 'opacity-100'}`}>
                  {recipes.map((recipe) => (
                    <div key={recipe.id} className="relative mt-4">
                      {/* Thẻ RecipeCard ĐÃ ĐƯỢC THÔNG MINH HÓA, tự lo Like/Save */}
                      <RecipeCard recipe={recipe} onClick={() => navigate(`/recipe/${recipe.id}`)} />
                    </div>
                  ))}
                </div>
                
                {/* Dùng Pagination UI component của bạn */}
                <div className="mt-8">
                   <Pagination pagination={{ currentPage: paginationMeta.currentPage, totalPages: paginationMeta.totalPages, totalItems: paginationMeta.totalItems }} onPageChange={setPage} />
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}