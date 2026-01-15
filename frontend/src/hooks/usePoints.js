// src/hooks/usePoints.js (FILE MỚI)
import { useState, useCallback } from 'react';
import userApi from '../api/userApi';

export const usePoints = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        totalPages: 1
    });

    // Hàm lấy lịch sử điểm
    const fetchHistory = useCallback(async (page = 1, month = 'all') => {
        setLoading(true);
        setError(null);
        try {
            const response = await userApi.getPointHistory({ page, month });
            
            // [SỬA LẠI ĐOẠN NÀY]
            // response là Axios object, response.data là dữ liệu Server trả về
            const serverData = response.data; 

            if (serverData.success) {
                // Dữ liệu thật nằm trong serverData.data.transactions
                setHistory(serverData.data.transactions);
                
                setPagination({
                    total: serverData.data.total,
                    page: serverData.data.page,
                    totalPages: serverData.data.totalPages
                });
            }
        } catch (err) {
            console.error("Lỗi lấy lịch sử điểm:", err);
            setError(err.response?.data?.message || "Không thể tải lịch sử điểm");
        } finally {
            setLoading(false);
        }
    }, []);

    // Hàm điểm danh
    const checkIn = async () => {
        try {
            const response = await userApi.dailyCheckIn();
            return { success: true, message: response.message };
        } catch (err) {
            return { 
                success: false, 
                message: err.response?.data?.message || "Điểm danh thất bại" 
            };
        }
    };

    // Hàm tặng điểm
    const sendGift = async (data) => {
        try {
            const response = await userApi.giftPoints(data);
            return { success: true, message: response.message };
        } catch (err) {
            return {
                success: false,
                message: err.response?.data?.message || "Tặng điểm thất bại"
            };
        }
    };

    return {
        history,
        loading,
        error,
        pagination,
        fetchHistory,
        checkIn,
        sendGift
    };
};