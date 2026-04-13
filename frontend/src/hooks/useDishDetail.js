import { useState, useEffect, useCallback} from 'react';
import dictionaryDishApi from '../api/dictionaryDishApi';

const useDishDetail = (id) => {
    const [dish, setDish] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDetail = useCallback(async () => {
        if (!id) return;
        try {
            // Chỉ hiện loading ở lần đầu, các lần refresh sau sẽ cập nhật ngầm để tránh giật trang
            if (!dish) setLoading(true); 
            
            const response = await dictionaryDishApi.getDishDetail(id);
            setDish(response.data.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(true); // Đảm bảo trạng thái loading kết thúc
            setLoading(false);
        }
    }, [id, dish]);

    useEffect(() => {
        fetchDetail();
    }, [id]); 

    return { dish, loading, error,  refreshData: fetchDetail};
};

export default useDishDetail;