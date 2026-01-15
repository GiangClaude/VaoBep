import { useState, useMemo } from "react";
import { Search, Filter, Clock, Star, ChefHat, X, ChevronDown, ChevronUp, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import useTags from "../../hooks/useTags"; 


// 1. Định nghĩa tên hiển thị cho các loại tag
const TAG_CATEGORY_TITLES = {
  cuisine: "Quốc gia & Vùng miền",
  meal_time: "Bữa ăn",
  ingredient: "Nguyên liệu chính",
  method: "Cách chế biến",
  diet: "Chế độ ăn & Sức khỏe",
  taste: "Hương vị",
  occasion: "Dịp & Thời gian",
  beverage: "Đồ uống",
  appliance: "Dụng cụ bếp",
  dish_type: "Loại món",
  other: "Khác"
};

// Thứ tự ưu tiên hiển thị
const CATEGORY_ORDER = [
  'cuisine', 'ingredient', 'meal_time', 'method', 'diet', 'taste', 'occasion', 'beverage', 'appliance', 'dish_type', 'other'
];

export function RecipeFilter({ onFilterChange }) {
  // --- STATE ---
  const [filters, setFilters] = useState({
    searchTerm: "",
    tags: [], // mảng tag_id
    cookingTime: "",
    minRating: 0
  });

  const [isMainPanelOpen, setIsMainPanelOpen] = useState(true); // Đóng/mở panel chính
  
  // Quản lý trạng thái đóng mở của từng nhóm con (mặc định mở Cuisine và Ingredient)
  const [openSections, setOpenSections] = useState({
    cuisine: true,
    ingredient: true,
    cookingTime: false,
    rating: false
  });

  const { tags: serverTags = [], loading: loadingTags } = useTags();

  // --- DATA PROCESSING ---

  // Gom nhóm Tags theo tag_type
  const groupedTags = useMemo(() => {
    if (!serverTags.length) return {};
    return serverTags.reduce((acc, tag) => {
      const type = tag.tag_type || 'other';
      if (!acc[type]) acc[type] = [];
      acc[type].push(tag);
      return acc;
    }, {});
  }, [serverTags]);

  // Data tĩnh cho Time và Rating
  const cookingTimes = [
    { id: "quick", label: "Nhanh (<30p)", value: "0-30" },
    { id: "medium", label: "Vừa (30-60p)", value: "30-60" },
    { id: "long", label: "Lâu (>60p)", value: "60+" }
  ];

  const ratingOptions = [5, 4, 3];

  // --- HANDLERS ---

  const updateFilters = (newFilters) => {
    setFilters(newFilters);
    if (onFilterChange) onFilterChange(newFilters);
  };

  const handleTagToggle = (tagId) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter(id => id !== tagId)
      : [...currentTags, tagId];
    updateFilters({ ...filters, tags: newTags });
  };

  const handleCookingTimeChange = (value) => {
    updateFilters({ ...filters, cookingTime: filters.cookingTime === value ? "" : value });
  };

  const handleRatingChange = (value) => {
    updateFilters({ ...filters, minRating: filters.minRating === value ? 0 : value });
  };

  const clearAllFilters = () => {
    updateFilters({ searchTerm: "", tags: [], cookingTime: "", minRating: 0 });
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Kiểm tra xem có filter nào đang active không
  const hasActiveFilters = filters.tags.length > 0 || filters.cookingTime !== "" || filters.minRating > 0;

  // --- SUB COMPONENT: FILTER SECTION (Tái sử dụng) ---
  // Component này hiển thị header (có arrow), content, và summary khi đóng
  const FilterSection = ({ title, sectionKey, icon: Icon, activeCount, children }) => {
    const isOpen = openSections[sectionKey];
    
    return (
      <div className="border-b border-gray-100 last:border-0 py-3">
        <button 
          onClick={() => toggleSection(sectionKey)}
          className="flex items-center justify-between w-full group"
        >
          <div className="flex items-center gap-2 text-gray-700 font-semibold group-hover:text-[#ff6b35] transition-colors">
            {Icon && <Icon className="w-4 h-4" />}
            <span className="text-sm">{title}</span>
            {/* Hiển thị số lượng đang chọn nếu section ĐÓNG */}
            {!isOpen && activeCount > 0 && (
              <span className="bg-[#ff6b35] text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">
                {activeCount}
              </span>
            )}
          </div>
          <div className="text-gray-400 group-hover:text-[#ff6b35]">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-3 pb-1">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mini Summary: Khi đóng section, hiển thị list nhỏ các item đang chọn để user xóa nhanh */}
        {!isOpen && activeCount > 0 && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 flex flex-wrap gap-1">
              {/* Đây là nơi render các chip nhỏ khi section bị đóng. 
                  Sẽ được truyền từ children prop hoặc xử lý riêng ở parent, 
                  nhưng để đơn giản ta hiển thị ở Parent thì hay hơn. 
                  -> Ta sẽ bỏ qua render ở đây, chỉ hiển thị số lượng count ở title thôi.
              */}
           </motion.div>
        )}
      </div>
    );
  };

  // --- RENDER HELPERS ---
  
  // Render danh sách các tag đang active (Dùng cho Main Panel khi đóng, hoặc Summary)
  const ActiveFiltersSummary = () => (
    <div className="flex flex-wrap gap-2 mt-3">
      {/* 1. Active Tags */}
      {filters.tags.map(tagId => {
        const tag = serverTags.find(t => t.tag_id === tagId);
        if (!tag) return null;
        return (
          <span key={tagId} className="bg-[#fff9f0] text-[#ff6b35] border border-[#ff6b35]/20 text-xs px-2 py-1 rounded-md flex items-center gap-1">
            {tag.name}
            <button onClick={(e) => { e.stopPropagation(); handleTagToggle(tagId); }} className="hover:text-red-500">
               <X className="w-3 h-3" />
            </button>
          </span>
        );
      })}

      {/* 2. Active Time */}
      {filters.cookingTime && (
        <span className="bg-[#fff9f0] text-[#ff6b35] border border-[#ff6b35]/20 text-xs px-2 py-1 rounded-md flex items-center gap-1">
            <Clock className="w-3 h-3"/>
            {cookingTimes.find(t => t.value === filters.cookingTime)?.label}
            <button onClick={(e) => { e.stopPropagation(); handleCookingTimeChange(filters.cookingTime); }} className="hover:text-red-500">
               <X className="w-3 h-3" />
            </button>
        </span>
      )}

      {/* 3. Active Rating */}
      {filters.minRating > 0 && (
         <span className="bg-[#fff9f0] text-[#ff6b35] border border-[#ff6b35]/20 text-xs px-2 py-1 rounded-md flex items-center gap-1">
            <Star className="w-3 h-3 fill-current"/> {filters.minRating}+
            <button onClick={(e) => { e.stopPropagation(); handleRatingChange(filters.minRating); }} className="hover:text-red-500">
               <X className="w-3 h-3" />
            </button>
        </span>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-5 transition-all">
      {/* HEADER: Title + Toggle Main + Clear All */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-[#ff6b35]" />
          <h3 className="text-lg font-bold text-gray-800">Bộ Lọc</h3>
        </div>
        
        <div className="flex items-center gap-3">
            {hasActiveFilters && isMainPanelOpen && (
                <button onClick={clearAllFilters} className="text-xs font-medium text-gray-400 hover:text-[#ff6b35] transition-colors">
                    Xóa tất cả
                </button>
            )}
            <button 
                onClick={() => setIsMainPanelOpen(!isMainPanelOpen)}
                className="p-1.5 hover:bg-gray-50 rounded-full text-gray-400 hover:text-[#ff6b35] transition-colors"
            >
                {isMainPanelOpen ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}
            </button>
        </div>
      </div>

      {/* --- TRƯỜNG HỢP 1: PANEL ĐÓNG (Chỉ hiện active filters) --- */}
      {!isMainPanelOpen && hasActiveFilters && (
        <ActiveFiltersSummary />
      )}

      {/* --- TRƯỜNG HỢP 2: PANEL MỞ (Hiện full chức năng) --- */}
      <AnimatePresence>
        {isMainPanelOpen && (
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
            >
                {/* Search Input */}
                <div className="mt-4 mb-4 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm tag, nguyên liệu..."
                        value={filters.searchTerm}
                        onChange={(e) => updateFilters({...filters, searchTerm: e.target.value})}
                        className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#ff6b35] transition-all"
                    />
                </div>

                <div className="space-y-1">
                    {/* 1. CATEGORY TAGS (Loop qua các nhóm) */}
                    {loadingTags ? (
                        <div className="py-4 text-center text-xs text-gray-400">Đang tải danh mục...</div>
                    ) : (
                        CATEGORY_ORDER.map((typeKey) => {
                            const groupData = groupedTags[typeKey];
                            if (!groupData || groupData.length === 0) return null;

                            // Đếm số tag đang active trong nhóm này
                            const activeCount = groupData.filter(t => filters.tags.includes(t.tag_id)).length;

                            return (
                                <FilterSection 
                                    key={typeKey}
                                    title={TAG_CATEGORY_TITLES[typeKey] || "Khác"}
                                    sectionKey={typeKey}
                                    activeCount={activeCount}
                                    icon={typeKey === 'cuisine' ? ChefHat : undefined} // Ví dụ thêm icon
                                >
                                    {/* Nội dung bên trong section khi mở */}
                                    <div className="flex flex-wrap gap-2">
                                        {groupData.map(tag => {
                                            const isActive = filters.tags.includes(tag.tag_id);
                                            return (
                                                <button
                                                    key={tag.tag_id}
                                                    onClick={() => handleTagToggle(tag.tag_id)}
                                                    className={`
                                                        px-3 py-1.5 rounded-lg text-xs font-medium transition-all border
                                                        ${isActive 
                                                            ? "bg-[#fff0e6] text-[#ff6b35] border-[#ff6b35]" 
                                                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"}
                                                    `}
                                                >
                                                    {tag.name}
                                                </button>
                                            )
                                        })}
                                    </div>
                                    
                                    {/* Mini Summary khi section MỞ nhưng muốn nhìn rõ cái nào chọn */}
                                    {/* (Optional: Tui thấy thiết kế trên đã highlight rõ rồi nên k cần thêm text) */}
                                </FilterSection>
                            );
                        })
                    )}

                    {/* 2. COOKING TIME (Thủ công) */}
                    <FilterSection 
                        title="Thời gian nấu" 
                        sectionKey="cookingTime"
                        icon={Clock}
                        activeCount={filters.cookingTime ? 1 : 0}
                    >
                        <div className="space-y-2">
                             {cookingTimes.map((time) => (
                                <label key={time.id} className="flex items-center justify-between cursor-pointer group p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                    <span className="text-sm text-gray-600 group-hover:text-[#ff6b35]">{time.label}</span>
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${filters.cookingTime === time.value ? "border-[#ff6b35] bg-[#ff6b35]" : "border-gray-300"}`}>
                                        {filters.cookingTime === time.value && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <input
                                        type="radio"
                                        className="hidden"
                                        name="cookingTime"
                                        checked={filters.cookingTime === time.value}
                                        onChange={() => handleCookingTimeChange(time.value)}
                                        onClick={() => { if (filters.cookingTime === time.value) handleCookingTimeChange(time.value); }}
                                    />
                                </label>
                             ))}
                        </div>
                    </FilterSection>

                    {/* 3. RATING (Thủ công) */}
                    <FilterSection 
                        title="Đánh giá" 
                        sectionKey="rating"
                        icon={Star}
                        activeCount={filters.minRating > 0 ? 1 : 0}
                    >
                        <div className="space-y-2">
                             {ratingOptions.map((rating) => (
                                <label key={rating} className="flex items-center justify-between cursor-pointer group p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                    <div className="flex items-center gap-1">
                                         {Array.from({ length: 5 }).map((_, i) => (
                                            <Star 
                                                key={i} 
                                                className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} 
                                            />
                                         ))}
                                         <span className="text-xs text-gray-500 ml-2">Trở lên</span>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${filters.minRating === rating ? "border-[#ff6b35] bg-[#ff6b35]" : "border-gray-300"}`}>
                                        {filters.minRating === rating && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <input
                                        type="radio"
                                        className="hidden"
                                        name="rating"
                                        checked={filters.minRating === rating}
                                        onChange={() => handleRatingChange(rating)}
                                        onClick={() => { if (filters.minRating === rating) handleRatingChange(rating); }}
                                    />
                                </label>
                             ))}
                        </div>
                    </FilterSection>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}