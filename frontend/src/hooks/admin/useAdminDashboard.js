import { useState, useEffect } from 'react';
import adminApi from '../../api/adminApi';

const useAdminDashboard = () => {
    // [FIX] Khởi tạo state khớp với cấu trúc Backend mới trả về
    const [stats, setStats] = useState({ 
        summary: { 
            users: 0, 
            recipes: 0, 
            articles: 0, 
            avgRecipePerUser: 0 
        },
        charts: {
            userGrowth: [],
            recipeGrowth: [],
            recipeDistribution: [],
            userRoleDistribution: []
        }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await adminApi.getStats();
                
                // Nếu API trả về data, set vào state
                if (response && response.data) {
                    setStats(response.data); // Lấy cục data bên trong ra
                } else if (response) {
                    // Trường hợp có interceptor đã xử lý trước đó
                    setStats(response);
                }
            } catch (err) {
                console.error("Dashboard Error:", err);
                setError(err.response?.data?.message || "Lỗi tải thống kê");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return { stats, loading, error };
};

export default useAdminDashboard;