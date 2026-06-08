import { useState, useEffect } from 'react';

export const useSearchUI = (keyword, initialConfig = {}) => {
    const [activeTab, setActiveTab] = useState(initialConfig?.initialTab || 'all');
    const [currentPage, setCurrentPage] = useState(1);
    const [userSort, setUserSort] = useState("newest");
    const [recipeFilter, setRecipeFilter] = useState(
        initialConfig?.initialTags ? { tags: [initialConfig.initialTags] } : {}
    );
    const [articleFilter, setArticleFilter] = useState({ sort: "newest", tags: [] });

    // Luôn reset về trang 1 khi người dùng gõ từ khóa mới
    useEffect(() => {
        setCurrentPage(1);
    }, [keyword]);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setCurrentPage(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFilterChange = (type, newFilter) => {
        if (type === 'article') setArticleFilter(newFilter);
        else setRecipeFilter(newFilter);
        setCurrentPage(1);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return {
        activeTab,
        currentPage,
        userSort, setUserSort,
        recipeFilter,
        articleFilter,
        handleTabChange,
        handleFilterChange,
        handlePageChange
    };
};