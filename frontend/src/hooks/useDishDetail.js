import { useState, useEffect } from 'react';
import dictionaryDishApi from '../api/dictionaryDishApi';

const useDishDetail = (id) => {
    const [dish, setDish] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetail = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const response = await dictionaryDishApi.getDishDetail(id);
                setDish(response.data.data);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                console.error("Error fetching dish detail:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id]);

    return { dish, loading, error };
};

export default useDishDetail;