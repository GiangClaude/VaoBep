// frontend/src/component/common/RecipeFilter.jsx
import React, { useState, useMemo } from "react";
import { Search, Filter, Clock, Star, ChefHat, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { TAG_TYPE_LABELS, TAG_CATEGORY_ORDER, groupTagsByType } from "../../utils/tagUtils";
import FilterAccordion from "./FilterAccordion";
import { useTagQueries } from "../../hooks/queries/useTagQueries";

/**
 * Component hiển thị bộ lọc.
 * Nhận state 'filters' từ cha để đồng bộ UI với URL thay vì tự quản lý state nội bộ.
 */
export function RecipeFilter({ filters, onFilterChange }) {
  // 1. STATE & DATA (Đã xóa state filters nội bộ)
  const [openSections, setOpenSections] = useState({
    cuisine: true,
    ingredient: true,
    cookingTime: false,
    rating: false
  });

  const { tags: serverTags = [], loading: loadingTags } = useTagQueries();

  const cookingTimes = [
    { id: "quick", label: "Nhanh (<30p)", value: "0-30" },
    { id: "medium", label: "Vừa (30-60p)", value: "30-60" },
    { id: "long", label: "Lâu (>60p)", value: "60+" }
  ];

  const ratingOptions = [5, 4, 3];

  // 2. LOGIC XỬ LÝ
  const groupedTags = useMemo(() => groupTagsByType(serverTags), [serverTags]);

  /**
   * Đẩy bộ lọc mới lên component cha (RecipesListPage) để xử lý thay vì tự lưu.
   */
  const updateFilters = (newFilters) => {
    if (onFilterChange) onFilterChange(newFilters);
  };

  /**
   * Xử lý bật/tắt tag dựa trên danh sách tag do cha truyền xuống.
   */
  const handleTagToggle = (tagId) => {
    const currentTags = filters?.tags || [];
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter(id => id !== tagId)
      : [...currentTags, tagId];
    updateFilters({ ...filters, tags: newTags });
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Lấy danh sách tag an toàn đề phòng filters chưa load kịp
  const activeTags = filters?.tags || [];

  return (
    <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-5">
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-5 h-5 text-[#ff6b35]" />
        <h3 className="text-lg font-bold text-gray-800">Lọc món ăn</h3>
      </div>

      <div className="space-y-1">
        {/* I. PHẦN TAGS ĐỘNG (TỪ DATABASE) */}
        {TAG_CATEGORY_ORDER.map((typeKey) => {
          const groupData = groupedTags[typeKey];
          if (!groupData || groupData.length === 0) return null;

          const isOpen = openSections[typeKey];
          const activeTagsInGroup = groupData.filter(t => activeTags.includes(t.tag_id));
          
          const tagsToDisplay = isOpen ? groupData : activeTagsInGroup;

          return (
            <FilterAccordion
              key={typeKey}
              label={TAG_TYPE_LABELS[typeKey]}
              isOpen={isOpen}
              activeCount={activeTagsInGroup.length}
              onToggle={() => toggleSection(typeKey)}
            >
              {tagsToDisplay.map(tag => {
                const isActive = activeTags.includes(tag.tag_id);
                return (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    key={tag.tag_id}
                    onClick={(e) => { e.stopPropagation(); handleTagToggle(tag.tag_id); }}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all border ${
                      isActive 
                      ? "bg-[#fff0e6] text-[#ff6b35] border-[#ff6b35] shadow-sm" 
                      : "bg-white text-gray-500 border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    {tag.name}
                    {!isOpen && isActive && <span className="ml-1 opacity-60">×</span>}
                  </motion.button>
                );
              })}
            </FilterAccordion>
          );
        })}

        {/* II. PHẦN THỜI GIAN NẤU (TĨNH) */}
        <FilterAccordion
          label="Thời gian nấu"
          isOpen={openSections.cookingTime}
          activeCount={filters?.cookingTime ? 1 : 0}
          onToggle={() => toggleSection('cookingTime')}
        >
          {(openSections.cookingTime ? cookingTimes : cookingTimes.filter(t => t.value === filters?.cookingTime)).map((time) => (
            <motion.button
              key={time.id}
              onClick={() => updateFilters({ ...filters, cookingTime: filters?.cookingTime === time.value ? "" : time.value })}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all border ${
                filters?.cookingTime === time.value 
                ? "bg-[#fff0e6] text-[#ff6b35] border-[#ff6b35]" 
                : "bg-white text-gray-500 border-gray-100"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3" /> {time.label}
                {!openSections.cookingTime && filters?.cookingTime === time.value && <span className="opacity-60">×</span>}
              </div>
            </motion.button>
          ))}
        </FilterAccordion>

        {/* III. PHẦN ĐÁNH GIÁ (TĨNH) */}
        <FilterAccordion
          label="Đánh giá"
          isOpen={openSections.rating}
          activeCount={filters?.minRating > 0 ? 1 : 0}
          onToggle={() => toggleSection('rating')}
        >
          {(openSections.rating ? ratingOptions : ratingOptions.filter(r => r === filters?.minRating)).map((rating) => (
            <motion.button
              key={rating}
              onClick={() => updateFilters({ ...filters, minRating: filters?.minRating === rating ? 0 : rating })}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all border ${
                filters?.minRating === rating 
                ? "bg-[#fff0e6] text-[#ff6b35] border-[#ff6b35]" 
                : "bg-white text-gray-500 border-gray-100"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <div className="flex items-center">
                  {rating} <Star className="w-3 h-3 fill-current ml-0.5" />
                </div>
                {!openSections.rating && filters?.minRating === rating && <span className="opacity-60">×</span>}
              </div>
            </motion.button>
          ))}
        </FilterAccordion>
      </div>
    </div>
  );
}