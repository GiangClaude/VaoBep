import { useState, useEffect } from 'react';
import adminApi from '../../api/adminApi';

const useAdminIngredients = () => {
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchPending = async () => {
        try {
            setLoading(true);
            const response = await adminApi.getPendingIngredients();
            setIngredients(response.data.data || []);
        } catch (err) {
            console.error("Fetch Ingredients Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const processIngredient = async (id, action, caloValue = 0) => {
        try {
            await adminApi.processIngredient(id, { action, calo_per_100g: caloValue });
            // Xóa item đã xử lý khỏi danh sách
            setIngredients(prev => prev.filter(ing => ing.ingredient_id !== id));
            return true;
        } catch (err) {
            console.error("Process Ingredient Error:", err);
            throw err;
        }
    };

    return { ingredients, loading, processIngredient, refresh: fetchPending };
};

export default useAdminIngredients;