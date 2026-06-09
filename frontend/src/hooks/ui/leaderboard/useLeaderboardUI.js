import { useState, useMemo } from 'react';
import { useTopRecipesQuery, useTopUsersQuery } from '../../queries/useLeaderboardQueries';

export const useLeaderboardUI = () => {
    const [activeTab, setActiveTab] = useState('recipe'); 
    const [selectedPeriod, setSelectedPeriod] = useState('current'); 

    const targetDate = useMemo(() => {
        const date = new Date();
        if (selectedPeriod === 'previous') date.setMonth(date.getMonth() - 1);
        return { month: date.getMonth() + 1, year: date.getFullYear() };
    }, [selectedPeriod]);

    const queryMonth = selectedPeriod === 'current' ? null : targetDate.month;
    const queryYear = selectedPeriod === 'current' ? null : targetDate.year;

    // React Query tự lo việc fetch khi queryMonth/Year đổi
    const recipeQuery = useTopRecipesQuery(queryMonth, queryYear);
    const userQuery = useTopUsersQuery(queryMonth, queryYear);

    const loading = activeTab === 'recipe' ? recipeQuery.isLoading : userQuery.isLoading;
    const error = activeTab === 'recipe' ? recipeQuery.error : userQuery.error;
    const data = activeTab === 'recipe' ? (recipeQuery.data || []) : (userQuery.data || []);

    return {
        activeTab,
        selectedPeriod,
        data,
        loading,
        error: error?.message,
        handleTabChange: setActiveTab,
        handlePeriodChange: setSelectedPeriod
    };
};