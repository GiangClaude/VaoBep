// VỊ TRÍ TẠO FILE MỚI: frontend/src/hooks/usePostAi.js

import { useState } from 'react';
import axios from 'axios'; // Hoặc dùng instance axios của bạn nếu có (ví dụ: api/index.js)

const API_BASE_URL = 'http://localhost:5000/api/recipe-ai';

export default function usePostAi() {
    const [summary, setSummary] = useState(null);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [errorSummary, setErrorSummary] = useState(null);

    // Hàm gọi API tóm tắt
    const fetchSummary = async (contextText) => {
        if (!contextText) return;
        
        setLoadingSummary(true);
        setErrorSummary(null);
        
        try {
            // Lấy token nếu có để pass qua Middleware (nếu route có yêu cầu)
            const token = localStorage.getItem('token'); 
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const response = await axios.post(`${API_BASE_URL}/analyze`, {
                // Backend đang dùng key recipeContext, ta truyền text tổng quát vào đây
                recipeContext: contextText 
            }, { headers });

            if (response.data.success) {
                setSummary(response.data.data);
            } else {
                setErrorSummary('Không thể tạo tóm tắt lúc này.');
            }
        } catch (error) {
            console.error("Lỗi AI Summary:", error);
            setErrorSummary(error.response?.data?.message || 'Lỗi kết nối đến AI.');
        } finally {
            setLoadingSummary(false);
        }
    };

    return {
        summary,
        loadingSummary,
        errorSummary,
        fetchSummary
    };
}