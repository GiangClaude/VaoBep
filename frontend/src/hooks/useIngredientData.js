import { useState, useEffect } from 'react';
import ingredientApi from '../api/ingredientApi';
import unitApi from '../api/unitApi';

export const useIngredientData = () => {
  const [dbIngredients, setDbIngredients] = useState([]);
  const [dbUnits, setDbUnits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        // Gọi song song cả 2 API để tối ưu tốc độ
        const [ingredientsRes, unitsRes] = await Promise.all([
          ingredientApi.getAll(),
          unitApi.getAll()
        ]);

        if (ingredientsRes.success) setDbIngredients(ingredientsRes.data);
        if (unitsRes.success) setDbUnits(unitsRes.data);
      } catch (err) {
        console.error("Lỗi:", err.message);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return { 
    dbIngredients, 
    dbUnits, 
    isLoading, 
    error 
  };
};