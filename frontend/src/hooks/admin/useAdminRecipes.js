import { useState, useCallback } from 'react';
import adminApi from '../../api/adminApi';

const useAdminRecipes = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

    const fetchRecipes = useCallback(async (page = 1, limit = 10, search = '') => {
        try {
            setLoading(true);
            const response = await adminApi.getRecipes({ page, limit, search });
            const { data, pagination: pagingData } = response.data;
            setRecipes(data || []);
            setPagination(pagingData);
        } catch (err) {
            console.error("Fetch Recipes Error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const hideRecipe = async (recipeId) => {
        try {
            await adminApi.hideRecipe(recipeId);
            // Cập nhật state local: Chuyển status sang 'hidden'
            setRecipes(prev => prev.map(r => 
                r.recipe_id === recipeId ? { ...r, status: 'hidden' } : r
            ));
            return true;
        } catch (err) {
            console.error("Hide Recipe Error:", err);
            throw err;
        }
    };

    return { recipes, loading, pagination, fetchRecipes, hideRecipe };
};

export default useAdminRecipes;