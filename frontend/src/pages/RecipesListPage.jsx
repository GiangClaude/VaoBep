// pages/RecipesListPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../component/common/Header";
import { Footer } from "../component/common/Footer";
import { RecipeCard } from "../component/common/RecipeCard";
import { RecipeFilter } from "../component/common/RecipeFilter"; // Đảm bảo đúng đường dẫn bạn gửi
import { motion } from "motion/react";
import { ChefHat, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import useRecipesList from '../hooks/useRecipesList';

export default function RecipesListPage() {
  const navigate = useNavigate();

  const {
    recipes,
    loading,
    pagination, // Lấy object pagination
    goToPage,   // Lấy hàm chuyển trang
    onFilterChange,
    onRecipeClick
  } = useRecipesList();

  const handleRecipeClick = (id) => onRecipeClick(id, navigate);
  // Component Phân trang nhỏ gọn
  const Pagination = () => {
    if (pagination.totalPages <= 1) return null;

    return (
      <div className="flex justify-center items-center gap-2 mt-12">
        {/* Prev Button */}
        <button
          onClick={() => goToPage(pagination.page - 1)}
          disabled={pagination.page === 1}
          className={`p-3 rounded-full transition-all ${
            pagination.page === 1
              ? "text-gray-300 cursor-not-allowed"
              : "text-[#ff6b35] hover:bg-[#fff9f0] hover:shadow-md"
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Page Numbers */}
        <div className="flex gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => {
            // Logic hiển thị thông minh: Hiện trang đầu, trang cuối, và các trang quanh trang hiện tại
            if (
              pageNum === 1 ||
              pageNum === pagination.totalPages ||
              (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
            ) {
              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`w-10 h-10 rounded-full font-medium transition-all duration-300 ${
                    pagination.page === pageNum
                      ? "bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white shadow-lg scale-110"
                      : "bg-white text-[#7d5a3f] hover:text-[#ff6b35] hover:shadow-md border border-transparent hover:border-[#ffc857]"
                  }`}
                >
                  {pageNum}
                </button>
              );
            } else if (
              pageNum === pagination.page - 2 ||
              pageNum === pagination.page + 2
            ) {
              return <span key={pageNum} className="flex items-end text-gray-400 px-1">...</span>;
            }
            return null;
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={() => goToPage(pagination.page + 1)}
          disabled={pagination.page === pagination.totalPages}
          className={`p-3 rounded-full transition-all ${
            pagination.page === pagination.totalPages
              ? "text-gray-300 cursor-not-allowed"
              : "text-[#ff6b35] hover:bg-[#fff9f0] hover:shadow-md"
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fff9f0]">
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb & Title */}
        <div className="mb-8">
         <button
            onClick={() => navigate('/homepage')}
            className="flex items-center gap-2 text-[#ff6b35] hover:text-[#f7931e] transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Về trang chủ</span>
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <ChefHat className="w-8 h-8 text-[#ff6b35]" />
            <h1 className="text-4xl">Tất Cả Công Thức</h1>
          </div>
          <p className="text-[#7d5a3f]">
            Khám phá {pagination.totalItems} công thức nấu ăn tuyệt vời
          </p>
        </div>

        {/* Layout: Filter + Recipes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Filter Sidebar - Left */}
          <div className="lg:col-span-3">
            {/* Đã sửa tên prop handleFilterChange -> onFilterChange */}
            <RecipeFilter onFilterChange={onFilterChange} />
          </div>

          {/* Recipes Grid - Right */}
          <div className="lg:col-span-9">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[#7d5a3f]">
                Hiển thị trang <span className="font-bold text-[#ff6b35]">{pagination.page}</span> / {pagination.totalPages}
              </p>
            </div>

<div className="lg:col-span-9 relative min-h-[500px]">

    {/* Loading Overlay - Hiện đè lên khi đang loading */}
    {loading && (
        <div className="absolute inset-0 z-10 bg-white/60 flex items-start justify-center pt-20 backdrop-blur-[1px]">
             <div className="flex flex-col items-center">
                <div className="w-10 h-10 border-4 border-[#ff6b35] border-t-transparent rounded-full animate-spin"></div>
             </div>
        </div>
    )}

    {/* Nội dung danh sách */}
    {recipes.length === 0 && !loading ? (
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[25px] shadow-lg p-12 text-center border-2 border-dashed border-gray-200"
        >
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-2xl mb-2 text-gray-800">Không tìm thấy công thức nào</h3>
        <p className="text-[#7d5a3f]">
            Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
        </p>
        </motion.div>
    ) : (
        <>
        {/* Grid Recipe */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-3 transition-opacity duration-300 ${loading ? 'opacity-40' : 'opacity-100'}`}>
            {recipes.map((recipe, index) => (
            <motion.div
                key={recipe.recipeId || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative"
            >
                <RecipeCard 
                    // 1. ID & Thông tin cơ bản
                    id={recipe.id}
                    title={recipe.title}
                    description={recipe.description}
                    image={recipe.image} // URL ảnh đã được xử lý trong useRecipesList
                    
                    // 2. Thông tin tác giả
                    // useRecipesList trả về ...item (chứa author_id)
                    userId={recipe.author_id || recipe.user_id} 
                    userName={recipe.userName}
                    userAvatar={recipe.userAvatar}

                    // 3. Số liệu nấu ăn
                    cookTime={recipe.cookTime}
                    servings={recipe.servings}
                    calories={recipe.calories} // Hook trả về key 'calories'

                    ingredients={recipe.ingredients}
                    // 4. Chỉ số tương tác
                    likes={recipe.likes}
                    rating={recipe.rating}
                    commentCount={recipe.commentCount}
                    
                    // 5. Trạng thái (Quan trọng: Map đúng tên biến)
                    isLiked={recipe.liked} // Hook trả về 'liked', Card cần 'isLiked'
                    isSaved={recipe.saved} // Hook trả về 'saved', Card cần 'isSaved'

                    // 6. Sự kiện click
                    onClick={() => handleRecipeClick(recipe.id)}
                />
            </motion.div>
            ))}
        </div>

        {/* Pagination Component */}
        <div className={loading ? 'opacity-40 pointer-events-none' : ''}>
             <Pagination />
        </div>
        </>
    )}
</div>
          </div>
        </div>
      </main>

    </div>
  );
}