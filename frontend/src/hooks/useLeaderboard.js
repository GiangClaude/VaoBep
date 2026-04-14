import { useState, useEffect, useCallback, useMemo } from 'react';
import { leaderboardApi } from '../api/leaderboardApi';
import { normalizeRankedRecipe, normalizeRankedUser } from '../utils/normalizeLeaderboard';

const useLeaderboard = () => {
    // 'recipe' hoặc 'user'
    const [activeTab, setActiveTab] = useState('recipe'); 
    
    // 'current' (Tháng này) hoặc 'previous' (Tháng trước)
    const [selectedPeriod, setSelectedPeriod] = useState('current'); 
    
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Tính toán tháng/năm dựa trên selectedPeriod
    const targetDate = useMemo(() => {
        const date = new Date();
        if (selectedPeriod === 'previous') {
            date.setMonth(date.getMonth() - 1); // Lùi 1 tháng
        }
        return {
            month: date.getMonth() + 1,
            year: date.getFullYear()
        };
    }, [selectedPeriod]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Nếu là tháng hiện tại, truyền null để API lấy Live data.
            // Nếu là tháng trước, truyền tháng/năm.
            const queryMonth = selectedPeriod === 'current' ? null : targetDate.month;
            const queryYear = selectedPeriod === 'current' ? null : targetDate.year;

            let res;
            if (activeTab === 'recipe') {
                res = await leaderboardApi.getTopRecipes(queryMonth, queryYear);
                if (res.success) {
                    const normalized = res.data.map(item => normalizeRankedRecipe(item, res.isCurrentMonth));
                    setData(normalized);
                }
            } else {
                res = await leaderboardApi.getTopUsers(queryMonth, queryYear);
                if (res.success) {
                    const normalized = res.data.map(item => normalizeRankedUser(item, res.isCurrentMonth));
                    setData(normalized);
                }
            }
        } catch (err) {
            console.error("Lỗi fetch Leaderboard:", err);
            setError(err.response?.data?.message || "Không thể tải bảng xếp hạng");
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [activeTab, selectedPeriod, targetDate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleTabChange = (tab) => {
        if (tab !== activeTab) {
            setActiveTab(tab);
        }
    };

    const handlePeriodChange = (period) => {
        if (period !== selectedPeriod) {
            setSelectedPeriod(period);
        }
    };

    return {
        activeTab,
        selectedPeriod,
        data,
        loading,
        error,
        handleTabChange,
        handlePeriodChange,
        refetch: fetchData
    };
};

export default useLeaderboard;