// frontend/src/hooks/ui/common/useFilters.js
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Hook quản lý bộ lọc chung cho các danh sách (Recipes, Articles...)
 * Tự động đồng bộ URL Search Params vào State ban đầu dựa trên cấu trúc của initialFilters.
 */
export const useFilters = (initialFilters = {}) => {
    const [searchParams] = useSearchParams();

    /**
     * Hàm lấy giá trị khởi tạo cho bộ lọc.
     * Ưu tiên lấy từ URL nếu có, nếu không thì dùng initialFilters.
     * Tự động ép kiểu (Array, Number, String) dựa theo kiểu dữ liệu của initialFilters.
     */
    const getInitialState = () => {
        const state = { ...initialFilters };
        
        searchParams.forEach((value, key) => {
            // Chỉ lấy những param có khai báo trong initialFilters
            if (key in state) {
                if (Array.isArray(state[key])) {
                    // Nếu định dạng gốc là mảng (vd: tags: []), tách chuỗi từ URL thành mảng
                    state[key] = value ? value.split(',') : [];
                } else if (typeof state[key] === 'number') {
                    // Nếu định dạng gốc là số (vd: minRating: 0), ép kiểu về số
                    state[key] = Number(value);
                } else {
                    // Mặc định là chuỗi
                    state[key] = value;
                }
            }
        });
        
        return state;
    };

    const [filters, setFilters] = useState(getInitialState);
    const [debouncedFilters, setDebouncedFilters] = useState(getInitialState);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedFilters(filters);
        }, 500); // Đợi 0.5s sau khi user ngừng thao tác mới update

        return () => clearTimeout(timer);
    }, [filters]);

    /**
     * Cập nhật một trường cụ thể trong bộ lọc
     */
    const updateFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    /**
     * Ghi đè toàn bộ bộ lọc
     */
    const replaceFilters = (newFiltersObj) => {
        setFilters(newFiltersObj);
    };

    return { filters, debouncedFilters, updateFilter, replaceFilters };
};