import { useState, useEffect } from 'react';
import dictionaryDishApi from '../api/dictionaryDishApi';

const useDishMap = () => {
    const [summaryData, setSummaryData] = useState([]);
    const [allDishes, setAllDishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMapData = async () => {
            try {
                setLoading(true);
                const [summaryRes, allRes] = await Promise.all([
                    dictionaryDishApi.getMapSummary(),
                    dictionaryDishApi.getMapAllDishes()
                ]);
                
                setSummaryData(summaryRes.data.data);
                setAllDishes(allRes.data.data);
            } catch (err) {
                setError(err.message);
                console.error("Error fetching map data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMapData();
    }, []);

    return { summaryData, allDishes, loading, error };
};

export default useDishMap;