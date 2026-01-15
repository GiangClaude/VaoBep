import { useState, useEffect, useCallback } from 'react';
import recipeApi from '../api/recipeApi';

export const useSavedRecipes = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State quản lý sort: { key: 'time' | 'like' | 'rating' | null, order: 'asc' | 'desc' }
    const [sortConfig, setSortConfig] = useState({ key: null, order: null });

    // Hàm fetch dữ liệu
    const fetchSavedRecipes = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                sortKey: sortConfig.key,
                sortOrder: sortConfig.order
            };
            const response = await recipeApi.getSavedRecipes(params);
            
            // [SỬA LỖI TẠI ĐÂY]: Kiểm tra kỹ cấu trúc response
            // Nếu dùng axios chuẩn: response.data là body, body.data là mảng recipes
            if (response && response.data) {
                // Nếu backend trả về { success: true, data: [...] }
                const dataList = response.data.data || []; 
                setRecipes(dataList);
            }
        } catch (error) {
            console.error("Lỗi tải saved recipes:", error);
            setRecipes([]); // Set mảng rỗng nếu lỗi để tránh crash .map
        } finally {
            setLoading(false);
        }
    }, [sortConfig]);

    // Gọi API khi sortConfig thay đổi
    useEffect(() => {
        fetchSavedRecipes();
    }, [fetchSavedRecipes]);

    // [QUAN TRỌNG] Lắng nghe sự kiện interaction-sync-event để xóa tức thì
    useEffect(() => {
        const handleSync = (e) => {
            const { targetId, updates } = e.detail;
            
            // Nếu nhận tín hiệu saved: false -> Xóa khỏi list hiện tại
            if (updates && updates.saved === false) {
                setRecipes(prev => prev.filter(r => r.recipe_id !== targetId));
            }
        };

        window.addEventListener('interaction-sync-event', handleSync);
        return () => window.removeEventListener('interaction-sync-event', handleSync);
    }, []);

    // Hàm xử lý logic bấm nút sort (3 trạng thái: ASC -> DESC -> OFF)
    const handleSortChange = (key) => {
        setSortConfig(prev => {
            if (prev.key !== key) {
                // Lần 1: Bấm vào thuộc tính mới -> Sort tăng dần
                return { key, order: 'asc' };
            }
            if (prev.order === 'asc') {
                // Lần 2: Đang tăng -> Chuyển thành giảm dần
                return { key, order: 'desc' };
            }
            // Lần 3: Đang giảm -> Tắt sort (về mặc định)
            return { key: null, order: null };
        });
    };

    return {
        recipes,
        loading,
        sortConfig,
        handleSortChange,
        refetch: fetchSavedRecipes
    };
};