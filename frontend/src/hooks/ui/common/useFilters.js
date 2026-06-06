// frontend/src/hooks/ui/common/useFilters.js
import { useState, useEffect } from 'react';

export const useFilters = (initialFilters = {}) => {
    const [filters, setFilters] = useState(initialFilters);
    // debouncedFilters là bộ lọc thực sự được gửi lên API sau khi user dừng gõ
    const [debouncedFilters, setDebouncedFilters] = useState(initialFilters);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedFilters(filters);
        }, 500); // Đợi 0.5s sau khi user ngừng thao tác mới update

        return () => clearTimeout(timer);
    }, [filters]);

    const updateFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    // Replace toàn bộ filter (Dùng khi nhận từ component ArticleFilter/RecipeFilter)
    const replaceFilters = (newFiltersObj) => {
        setFilters(newFiltersObj);
    };

    return { filters, debouncedFilters, updateFilter, replaceFilters };
};