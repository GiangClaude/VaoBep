import { useState, useEffect } from 'react';
import adminApi from '../../api/adminApi';

const useAdminDashboard = () => {
    const [stats, setStats] = useState({ users: 0, recipes: 0, articles: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await adminApi.getStats();
                // API trả về: { users, recipes, articles, message }
                setStats(response.data); 
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