import { useState, useEffect } from 'react';
import tagApi from '../api/tagApi';

export default function useTags() {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchTags = async () => {
            setLoading(true);
            try {
                const res = await tagApi.getAllTags();
                // Giả sử API trả về { success: true, data: [...] }
                if (res.data && res.data.success) {
                    setTags(res.data.data);
                } else if (Array.isArray(res.data)) {
                    // Fallback nếu API trả về mảng trực tiếp
                    setTags(res.data);
                }
            } catch (error) {
                console.error("Lỗi tải tags:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTags();
    }, []);

    return { tags, loading };
}