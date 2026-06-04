import { useState, useEffect } from 'react';
import adminApi from '../../api/adminApi';

const useAdminIngredients = () => {
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchPending = async () => {
        try {
            setLoading(true);
            const response = await adminApi.getPendingIngredients();
            setIngredients(response.data || []);
        } catch (err) {
            console.error("Fetch Ingredients Error:", err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const processIngredient = async (id, action, caloValue = 0) => {
        try {
            await adminApi.processIngredient(id, { action, calo_per_100g: caloValue });
            // Xóa item đã xử lý khỏi danh sách
            setIngredients(prev => prev.filter(ing => ing.ingredient_id !== id));
            return true;
        } catch (err) {
            console.error("Process Ingredient Error:", err.message);
            throw err;
        }
    };

    const [allIngredients, setAllIngredients] = useState([]);
    const [allPagination, setAllPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
    const [isLoadingAll, setIsLoadingAll] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    // 1. Fetch danh sách (All)
    const fetchAllIngredients = async (page = 1, limit = 10, search = '', sortKey = 'name', sortOrder = 'ASC') => {
        setIsLoadingAll(true);
        setErrorMsg(null);
        try {
            const res = await adminApi.getAllIngredients(page, limit, search, sortKey, sortOrder);
            setAllIngredients(res.data);
            setAllPagination(res.meta);
        } catch (err) {
            setErrorMsg(err.message || "Lỗi khi tải danh sách nguyên liệu");
        } finally {
            setIsLoadingAll(false);
        }
    };

    // 2. Thêm mới nguyên liệu
    const handleCreateIngredient = async (data) => {
        try {
            await adminApi.createIngredient(data);
            // Gọi lại danh sách để update UI (về trang 1 để thấy đồ mới thêm)
            await fetchAllIngredients(1, allPagination.limit);
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message || "Lỗi khi thêm nguyên liệu" };
        }
    };

    // 3. Sửa nguyên liệu
    const handleUpdateIngredient = async (id, data) => {
        try {
            await adminApi.updateIngredient(id, data);
            // Giữ nguyên trang hiện tại khi reload
            await fetchAllIngredients(allPagination.page, allPagination.limit);
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message || "Lỗi khi cập nhật nguyên liệu" };
        }
    };

    // 4. Xóa nguyên liệu
    const handleDeleteIngredient = async (id) => {
        try {
            await adminApi.deleteIngredient(id);
            // Kiểm tra nếu xóa phần tử cuối cùng của trang thì lùi lại 1 trang
            let targetPage = allPagination.page;
            if (allIngredients.length === 1 && targetPage > 1) {
                targetPage -= 1;
            }
            await fetchAllIngredients(targetPage, allPagination.limit);
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message || "Lỗi khi xóa nguyên liệu" };
        }
    };

    return { ingredients, loading, processIngredient, refresh: fetchPending, allIngredients, allPagination, isLoadingAll, errorMsg, fetchAllIngredients, handleCreateIngredient, handleUpdateIngredient, handleDeleteIngredient };
};

export default useAdminIngredients;