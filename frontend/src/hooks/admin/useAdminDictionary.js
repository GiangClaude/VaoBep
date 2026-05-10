import { useState } from 'react';
import adminApi from '../../api/adminApi'; // Chỉnh lại đường dẫn import tùy cấu trúc của bạn

export const useAdminDictionary = () => {
    const [dishes, setDishes] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    // 1. Fetch danh sách từ điển
    const fetchDishes = async (page = 1, limit = 10, search = '', sortKey = 'created_at', sortOrder = 'DESC') => {
        setIsLoading(true);
        setErrorMsg(null);
        try {
            const res = await adminApi.getDictionaryDishes(page, limit, search, sortKey, sortOrder);
            setDishes(res.data.data);
            setPagination(res.data.pagination);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || "Lỗi khi tải danh sách món ăn");
        } finally {
            setIsLoading(false);
        }
    };

    // 2. Thêm mới
    const handleCreateDish = async (formData) => {
        try {
            await adminApi.createDictionaryDish(formData);
            await fetchDishes(1, pagination.limit); // Load lại trang 1
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || "Lỗi khi thêm món ăn" };
        }
    };

    // 3. Cập nhật
    const handleUpdateDish = async (id, formData) => {
        try {
            await adminApi.updateDictionaryDish(id, formData);
            await fetchDishes(pagination.page, pagination.limit); // Load lại trang hiện tại
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || "Lỗi khi cập nhật món ăn" };
        }
    };

    // 4. Xóa
    const handleDeleteDish = async (id) => {
        try {
            await adminApi.deleteDictionaryDish(id);
            let targetPage = pagination.page;
            if (dishes.length === 1 && targetPage > 1) {
                targetPage -= 1;
            }
            await fetchDishes(targetPage, pagination.limit);
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || "Lỗi khi xóa món ăn" };
        }
    };

    return {
        dishes,
        pagination,
        isLoading,
        errorMsg,
        fetchDishes,
        handleCreateDish,
        handleUpdateDish,
        handleDeleteDish
    };
};