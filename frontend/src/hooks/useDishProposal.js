import { useState, useMemo } from 'react';
import dictionaryDishApi from '../api/dictionaryDishApi';
import recipeApi from '../api/recipeApi';
import { getRecipeImageUrl } from '../utils/imageHelper';

export default function useDishProposal(dishId, initialRecipes = [], onVoteSuccess) {
    const [recipes, setRecipes] = useState(initialRecipes); // Danh sách recipes đã liên kết
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    
    // Phân trang cho danh sách đã liên kết (Phân trang phía Client)
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Cập nhật lại danh sách khi initialRecipes từ useDishDetail thay đổi
    useMemo(() => {
        setRecipes(initialRecipes);
    }, [initialRecipes]);

    // 1. Logic tìm kiếm công thức mới để đề xuất
    const handleSearchRecipes = async (keyword) => {
        setSearchTerm(keyword);
        if (keyword.length < 2) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const resp = await recipeApi.searchSimple(keyword);
            const data = resp.data?.data || [];
            setSearchResults(data);
        } catch (err) {
            console.error("Lỗi tìm kiếm công thức:", err);
        } finally {
            setIsSearching(false);
        }
    };

    // 2. Logic Vote hoặc Đề xuất
    const handleVote = async (recipeId) => {
        try {
            const resp = await dictionaryDishApi.voteRecipe(dishId, recipeId);
            if (resp.data.success) {
                // Sau khi vote thành công, gọi callback để load lại dữ liệu từ trang Detail
                if (onVoteSuccess) onVoteSuccess();
                setSearchTerm('');
                setSearchResults([]);
                // setModalConfig({
                //     isOpen: true,
                //     title: 'Thành công!',
                //     message: 'Cảm ơn bạn đã đóng góp đề cử cho món ăn này.',
                //     type: 'success',
                //     actions: [{ label: 'Đóng', onClick: closeModal, style: 'primary' }]
                // });
                return { success: true, message: resp.data.message };
            }
        } catch (err) {
            const status = err.response?.status;
            const message = err.response?.data?.message || "Đã có lỗi xảy ra.";
            if (status === 401) {
                setModalConfig({
                    isOpen: true,
                    title: 'Yêu cầu đăng nhập',
                    message: 'Bạn cần đăng nhập để có thể thực hiện bình chọn công thức.',
                    type: 'warning',
                    actions: [
                        { label: 'Để sau', onClick: closeModal },
                        { label: 'Đăng nhập ngay', onClick: () => window.location.href = '/login', style: 'primary' }
                    ]
                });
            } else {
                setModalConfig({
                    isOpen: true,
                    title: 'Thông báo',
                    message: message,
                    type: 'error',
                    actions: [{ label: 'Tôi đã hiểu', onClick: closeModal, style: 'danger' }]
                });
            }

            return { 
                success: false, 
                message: err.response?.data?.message || "Không thể thực hiện bình chọn" 
            };
        }
    };

    // 3. Xử lý dữ liệu hiển thị phân trang
    const paginatedRecipes = useMemo(() => {
        const sorted = [...recipes].sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
        const start = (currentPage - 1) * itemsPerPage;
        return sorted.slice(start, start + itemsPerPage);
    }, [recipes, currentPage]);

    const paginationInfo = {
        currentPage,
        totalPages: Math.ceil(recipes.length / itemsPerPage),
        totalItems: recipes.length
    };

    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        actions: []
    });

    const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

    useMemo(() => {
        setRecipes(initialRecipes);
    }, [initialRecipes]);

    return {
        searchTerm,
        searchResults,
        isSearching,
        paginatedRecipes,
        paginationInfo,
        setCurrentPage,
        handleSearchRecipes,
        handleVote,
        modalConfig,
        closeModal
    };
}