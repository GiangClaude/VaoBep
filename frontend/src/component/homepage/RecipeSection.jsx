import { useRef } from "react";
import { ChevronLeft, ChevronRight, UtensilsCrossed, Plus } from "lucide-react";
// Giữ nguyên đường dẫn import của bạn
import { RecipeCard } from "../common/RecipeCard";
import { ViewMoreCard } from "./ViewMoreCard"; // Đảm bảo đường dẫn này đúng trong dự án của bạn

export function RecipeSection({ title, recipes, onRecipeClick ,onViewMoreClick}) {
  const scrollContainerRef = useRef(null);

  console.log("RecipeSection: ", recipes);
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  // --- Giữ nguyên phần Logic Empty State (khi không có công thức) ---
  if (!recipes || recipes.length === 0) {
    return (
      <section className="mb-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-3xl relative inline-block font-bold text-gray-800">
            {title}
            <div className="absolute -bottom-2 left-0 w-20 h-1.5 bg-gradient-to-r from-[#ff6b35] to-[#f7931e] rounded-full" />
          </h2>
        </div>

        {/* Empty State Body */}
        <div className="flex flex-col items-center justify-center py-16 px-4 min-h-[300px] bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <div className="p-4 bg-white rounded-full shadow-sm mb-4">
            <UtensilsCrossed className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-lg font-semibold text-gray-600 mb-1">
            Chưa có công thức nào ở mục này
          </p>
          <p className="text-sm text-gray-400 max-w-xs text-center mb-8">
            Hãy trở thành người đầu tiên chia sẻ công thức nấu ăn tuyệt vời của bạn!
          </p>
          <button
            onClick={() => console.log("Chuyển hướng đến trang tạo công thức")}
            className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white font-semibold rounded-full shadow-md transform transition-all duration-200 ease-in-out hover:shadow-lg hover:brightness-110 hover:-translate-y-0.5 active:scale-95 active:shadow-sm"
          >
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
            Tạo công thức
          </button>
        </div>
      </section>
    );
  }

  // --- Phần render chính ---
  return (
    <section className="mb-12">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl relative inline-block">
            {title}
            <div className="absolute -bottom-2 left-0 w-20 h-1.5 bg-gradient-to-r from-[#ff6b35] to-[#f7931e] rounded-full" />
          </h2>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => scroll("left")}
            className="bg-white hover:bg-gradient-to-r hover:from-[#ff6b35] hover:to-[#f7931e] text-[#ff6b35] hover:text-white p-2.5 rounded-full shadow-md hover:shadow-lg transition-all border-2 border-[#ffc857]"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="bg-white hover:bg-gradient-to-r hover:from-[#ff6b35] hover:to-[#f7931e] text-[#ff6b35] hover:text-white p-2.5 rounded-full shadow-md hover:shadow-lg transition-all border-2 border-[#ffc857]"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scrollable Recipe Grid */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none"
          }}
        >
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              // Truyền toàn bộ properties của recipe vào
              {...recipe} 
              // Quan trọng: Truyền hàm xử lý click
              onClick={() => onRecipeClick && onRecipeClick(recipe.id)}
            />
          ))}
          
          {/* View More Card at the end */}
          {onViewMoreClick && (
              <div 
                onClick={onViewMoreClick} 
                className="cursor-pointer flex-shrink-0"
                title="Xem thêm"
              >
                <ViewMoreCard />
              </div>
          )}
        </div>
      </div>
    </section>
  );
}