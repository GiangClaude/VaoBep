import { useState, useMemo } from 'react';
import { useVoteRecipeMutation } from '../../mutations/useDictionaryMutations';
import { useGlobalModal } from '../../../context/ModalContext';
import recipeApi from '../../../api/recipeApi';

export const useDishProposalUI = (dishId, initialRecipes = []) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    
    const { showModal } = useGlobalModal();
    const voteMutation = useVoteRecipeMutation();

    const handleSearchRecipes = async (keyword) => {
        setSearchTerm(keyword);
        if (keyword.length < 2) return setSearchResults([]);
        setIsSearching(true);
        try {
            const resp = await recipeApi.searchSimple(keyword);
            setSearchResults(resp.data || []);
        } catch (err) {
            console.error("Lỗi tìm kiếm:", err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleVote = async (recipeId) => {
        try {
            await voteMutation.mutateAsync({ dishId, recipeId });
            setSearchTerm('');
            setSearchResults([]);
            return { success: true, message: "Đã ghi nhận bình chọn!" };
        } catch (err) {
            if (err.statusCode === 401) {
                showModal({
                    title: 'Yêu cầu đăng nhập',
                    message: 'Bạn cần đăng nhập để bình chọn.',
                    type: 'warning',
                    actions: [{ label: 'Đăng nhập', onClick: () => window.location.href = '/login', style: 'primary' }]
                });
            }
            return { success: false, message: err.response?.data?.message || "Lỗi bình chọn" };
        }
    };

    const paginatedRecipes = useMemo(() => {
        const sorted = [...initialRecipes].sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
        const start = (currentPage - 1) * 5;
        return sorted.slice(start, start + 5);
    }, [initialRecipes, currentPage]);

    return {
        searchTerm, searchResults, isSearching, paginatedRecipes,
        paginationInfo: { currentPage, totalPages: Math.ceil(initialRecipes.length / 5), totalItems: initialRecipes.length },
        setCurrentPage, handleSearchRecipes, handleVote
    };
};