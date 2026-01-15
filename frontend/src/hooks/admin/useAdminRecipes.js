import { useState, useCallback } from 'react';
import adminApi from '../../api/adminApi';

const useAdminRecipes = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

    const fetchRecipes = useCallback(async (page = 1, limit = 10, search = '', sortKey, sortOrder) => {
        try {
            setLoading(true);
            const response = await adminApi.getRecipes({ page, limit, search, sortKey, sortOrder });
            const { data, pagination: pagingData } = response.data;
            setRecipes(data || []);
            setPagination(pagingData);
        } catch (err) {
            console.error("Fetch Recipes Error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const hideRecipe = async (recipeId, status) => {
        try {
            await adminApi.hideRecipe(recipeId, status);
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

    const getRecipe = async (id) => {
        try {
            const response = await adminApi.getRecipeDetail(id);
            return response.data.data;
        } catch (err) {
            throw err;
        }
    };

    const createRecipe = async (formData) => {
        try {
            await adminApi.createRecipe(formData);
            fetchRecipes(1, pagination.limit); // Refresh list
            return true;
        } catch (err) {
            throw err;
        }
    };

    const updateRecipe = async (id, data) => {
        try {
            await adminApi.updateRecipe(id, data);
            // Update local state
            setRecipes(prev => prev.map(r => 
                r.recipe_id === id ? { ...r, ...data } : r
            ));
            return true;
        } catch (err) {
            throw err;
        }
    };

    return { recipes, loading, pagination, fetchRecipes, hideRecipe, getRecipe,    // Export
        createRecipe, // Export
        updateRecipe };
};

export default useAdminRecipes;