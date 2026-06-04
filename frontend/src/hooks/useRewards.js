import { useState, useEffect } from 'react';
import { rewardApi } from '../api/rewardApi';

export const useRewards = () => {
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Lấy danh sách khi mount
    const fetchRewards = async () => {
        setLoading(true);
        try {
            const response = await rewardApi.getMyRewards();
            if (response.success) {
                setRewards(response.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Không thể tải danh sách phần thưởng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRewards();
    }, []);

    // Hàm mở quà
    const openBox = async (userRewardId) => {
        setLoading(true);
        try {
            const response = await rewardApi.claimReward(userRewardId);
            if (response.success) {
                // Refresh lại danh sách sau khi mở
                await fetchRewards();
                return { success: true, items: response.data };
            }
        } catch (err) {
            return { success: false, message: err.message || "Lỗi khi mở quà" };
        } finally {
            setLoading(false);
        }
    };

    return { rewards, loading, error, openBox, refresh: fetchRewards };
};