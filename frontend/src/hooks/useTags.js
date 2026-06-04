import { useState, useEffect } from 'react';
import tagApi from '../api/tagApi';

export default function useTags() {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchTags = async () => {
            setLoading(true);
            try {
                const res = await tagApi.getAllTags();
                // Giả sử API trả về { success: true, data: [...] }
                if (res.success) {
                    setTags(res.data);
                } else if (Array.isArray(res.data)) {
                    // Fallback nếu API trả về mảng trực tiếp
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

    return { tags, loading };
}