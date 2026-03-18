import React, { useState, useMemo } from "react";
import { Filter, Clock, Check, TrendingUp, Calendar, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Import các công cụ dùng chung
import { TAG_TYPE_LABELS, TAG_CATEGORY_ORDER, groupTagsByType } from "../../utils/tagUtils";
import FilterAccordion from "./FilterAccordion";
import useTags from "../../hooks/useTags";

export function ArticleFilter({ onFilterChange }) {
    const [filters, setFilters] = useState({
        searchTerm: "",
        tags: [],
        sort: "newest"
    });

    const { tags: serverTags = [], loading: loadingTags } = useTags();
    const [openSections, setOpenSections] = useState({ cuisine: true, meal_time: true });

    // 1. Logic xử lý dữ liệu
    const groupedTags = useMemo(() => groupTagsByType(serverTags), [serverTags]);

    const sortOptions = [
        { id: "newest", label: "Mới nhất", icon: Calendar },
        { id: "featured", label: "Nổi bật nhất", icon: TrendingUp },
        { id: "read_time_asc", label: "Đọc nhanh nhất", icon: Clock },
        { id: "read_time_desc", label: "Chuyên sâu nhất", icon: Clock },
    ];

    // 2. Handlers
    const handleUpdate = (updates) => {
        const newFilters = { ...filters, ...updates };
        setFilters(newFilters);
        onFilterChange?.(newFilters);
    };

    const toggleTag = (tagId) => {
        const newTags = filters.tags.includes(tagId)
            ? filters.tags.filter(id => id !== tagId)
            : [...filters.tags, tagId];
        handleUpdate({ tags: newTags });
    };

    return (
        <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-6">
                <Filter className="w-5 h-5 text-[#ff6b35]" />
                <h3 className="text-lg font-bold text-gray-800">Bộ lọc & Sắp xếp</h3>
            </div>

            {/* PHẦN SẮP XẾP (SORT) */}
            <div className="mb-6">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Sắp xếp theo</h4>
                <div className="space-y-2">
                    {sortOptions.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => handleUpdate({ sort: opt.id })}
                            className={`flex items-center justify-between w-full p-3 rounded-xl border text-sm transition-all ${
                                filters.sort === opt.id 
                                ? "border-[#ff6b35] bg-[#fff9f0] text-[#ff6b35] font-bold shadow-sm" 
                                : "border-gray-50 text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <opt.icon className="w-4 h-4" /> {opt.label}
                            </div>
                            {filters.sort === opt.id && <Check className="w-4 h-4" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* PHẦN DANH MỤC TAGS (DÙNG ACCORDION) */}
            <div className="space-y-1">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Chủ đề bài viết</h4>
                
                {TAG_CATEGORY_ORDER.map(type => {
                    const groupData = groupedTags[type];
                    if (!groupData) return null;

                    const isOpen = openSections[type];
                    const activeTagsInGroup = groupData.filter(t => filters.tags.includes(t.tag_id));
                    
                    // Logic yêu cầu: Nếu đóng chỉ hiện tag đã chọn, nếu mở hiện tất cả
                    const tagsToDisplay = isOpen ? groupData : activeTagsInGroup;

                    return (
                        <FilterAccordion
                            key={type}
                            label={TAG_TYPE_LABELS[type]}
                            isOpen={isOpen}
                            activeCount={activeTagsInGroup.length}
                            onToggle={() => setOpenSections(prev => ({ ...prev, [type]: !prev[type] }))}
                        >
                            {tagsToDisplay.map(tag => {
                                const isActive = filters.tags.includes(tag.tag_id);
                                return (
                                    <motion.button
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        key={tag.tag_id}
                                        onClick={(e) => { e.stopPropagation(); toggleTag(tag.tag_id); }}
                                        className={`px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all border ${
                                            isActive 
                                            ? "bg-[#fff0e6] text-[#ff6b35] border-[#ff6b35] shadow-sm" 
                                            : "bg-white text-gray-500 border-gray-100 hover:border-gray-300"
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
            </div>
        </div>
    );
}