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

    // const handleVote = async (recipeId) => {
    //     try {
    //         await voteMutation.mutateAsync({ dishId, recipeId });
    //         setSearchTerm('');
    //         setSearchResults([]);
    //         return { success: true, message: "Đã ghi nhận bình chọn!" };
    //     } catch (err) {
    //         console.log(err);
    //         if (err.statusCode === 401) {
    //             showModal({
    //                 title: 'Yêu cầu đăng nhập',
    //                 message: 'Bạn cần đăng nhập để bình chọn.',
    //                 type: 'warning',
    //                 actions: [{ label: 'Đăng nhập', onClick: () => window.location.href = '/login', style: 'primary' }]
    //             });
    //             return { success: false, isHandled: true };
    //         }
    //         return { success: false, message: err.message || "Lỗi bình chọn" };
    //     }
    // };

    // Hàm xử lý bình chọn công thức và tự động kích hoạt Modal thông báo kết quả tương ứng
    const handleVote = async (recipeId) => {
        try {
            // Kích hoạt mutation để gọi API vote
            const response = await voteMutation.mutateAsync({ dishId, recipeId });
            setSearchTerm('');
            setSearchResults([]);
            console.log(response);
            
            // TẤT CẢ Ở ĐÂY: Hiện modal thành công trực tiếp trong Hook
            showModal({
                title: 'Thành công',
                message: response?.message || "Cập nhật bình chọn thành công!",
                type: 'success'
            });
        } catch (err) {
            const status = err.response?.status || err.status;
            console.log(err);
            if (status === 401) {
                // Hiện modal yêu cầu đăng nhập nếu chưa authenticate
                showModal({
                    title: 'Yêu cầu đăng nhập',
                    message: 'Bạn cần đăng nhập để bình chọn.',
                    type: 'warning',
                    actions: [
                        { 
                            label: 'Hủy', 
                            style: 'secondary', // style khác primary và danger để ăn CSS viền xám nền trắng
                            onClick: () => {} // Để trống vì Modal sẽ tự chạy onClose() để đóng popup
                        },
                        { 
                            label: 'Đăng nhập', 
                            onClick: () => window.location.href = '/login', 
                            style: 'primary' 
                        }
                    ]
                });
            } else {
                // Hiện modal báo lỗi hệ thống/lỗi nghiệp vụ khác
                showModal({
                    title: 'Thất bại',
                    message: err.response?.data?.message || err.message || "Lỗi bình chọn",
                    type: 'error'
                });
            }
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