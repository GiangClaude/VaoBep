// frontend/src/hooks/ui/common/usePagination.js
import { useState } from 'react';

export const usePagination = (initialPage = 1, defaultLimit = 12) => {
    const [page, setPage] = useState(initialPage);
    const [limit, setLimit] = useState(defaultLimit);

    const goToPage = (newPage) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return { page, limit, setLimit, goToPage };
};