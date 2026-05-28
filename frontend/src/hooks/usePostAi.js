import { useState } from 'react';
import aiApi from '../api/aiApi';

export default function usePostAi() {
    const [summary, setSummary] = useState(null);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [errorSummary, setErrorSummary] = useState(null);

    const fetchSummary = async (contextText) => {
        if (!contextText) return;
        
        setLoadingSummary(true);
        setErrorSummary(null);
        
        try {
            const response = await aiApi.summarize({ contextText });
            if (response.data && response.data.success) {
                setSummary(response.data.data);
            } else {
                setErrorSummary('Không thể tạo tóm tắt lúc này.');
            }
        } catch (error) {
            console.error("Lỗi AI Summary:", error);
            setErrorSummary(error.response?.data?.message || 'Lỗi kết nối đến Trợ lý AI.');
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