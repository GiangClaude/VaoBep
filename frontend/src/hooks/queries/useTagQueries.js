// Đường dẫn mới: hooks/query/useTagQuery.js
import { useState, useEffect } from 'react';
// Lưu ý cập nhật lại đường dẫn import api cho đúng với cấu trúc thư mục mới của bà nhé
import tagApi from '../../api/tagApi'; 

/**
 * Hook Query: useTagQuery
 * Chức năng: Chuyên chịu trách nhiệm gọi API để fetch danh sách tags từ server.
 * Trả về: data (tags), trạng thái loading và error để UI xử lý.
 */
export function useTagQueries() {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTags = async () => {
            setLoading(true);
            try {
                const res = await tagApi.getAllTags();
                if (res.success) {
                    setTags(res.data);
                } else if (Array.isArray(res.data)) {
                    setTags(res.data);
                }
            } catch (error) {
                setError(error.message || "Lỗi khi tải danh sách tags");
            } finally {
                setLoading(false);
            }
        };

        fetchTags();
    }, []);

    return { tags, loading, error };
}