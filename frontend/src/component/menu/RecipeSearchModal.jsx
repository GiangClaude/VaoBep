import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Search } from 'lucide-react';
import Pagination from '../common/Pagination'; 
import { getRecipeImageUrl } from '../../utils/imageHelper';

// [MỚI] Import trực tiếp các queries
import { 
    useRecipesListQuery, 
    useSavedRecipesQuery, 
    useOwnerRecipesQuery 
} from '../../hooks/queries/useRecipesQueries';

export default function RecipeSearchModal({ isOpen, onClose, onSelectRecipe }) {
    const [activeTab, setActiveTab] = useState('explore'); 
    
    // State cho tìm kiếm & phân trang
    const [searchInput, setSearchInput] = useState(''); // Text lúc đang gõ trên ô input
    const [keyword, setKeyword] = useState(''); // Text chốt để gọi API (khi ấn Enter)
    const [page, setPage] = useState(1);

    // Tự động reset về trang 1 khi đổi tab
    useEffect(() => {
        setPage(1);
    }, [activeTab]);

    // 1. SỬ DỤNG REACT QUERY HOOKS TỪ useRecipesQueries.js
    // React Query sẽ tự động cache và không gọi lại API nếu dữ liệu không đổi
    const { data: exploreData, isFetching: loadingExplore } = useRecipesListQuery({ page, limit: 6, keyword });
    const { data: savedData, isFetching: loadingSaved } = useSavedRecipesQuery({ page, limit: 6 });
    const { data: mineData, isFetching: loadingMine } = useOwnerRecipesQuery();

    // 2. GÁN DỮ LIỆU ĐỘNG THEO TAB ĐANG CHỌN
    let recipes = [];
    let pagination = null;
    let isLoading = false;
    console.log("Explore Data:", exploreData);
    if (activeTab === 'explore') {
        recipes = exploreData?.data || [];
        pagination = exploreData?.meta || null;
        isLoading = loadingExplore;
    } else if (activeTab === 'saved') {
        recipes = savedData || [];
        isLoading = loadingSaved;
    } else if (activeTab === 'mine') {
        recipes = mineData || [];
        isLoading = loadingMine;
    }

    // Xử lý sự kiện khi ấn Enter trên ô tìm kiếm
    const handleSearch = () => {
        setKeyword(searchInput);
        setPage(1); // Cập nhật lại keyword và nhảy về trang 1 để trigger React Query fetch lại
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl h-[80vh] flex flex-col overflow-hidden">
                {/* Header Modal */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800">Thêm món ăn vào thực đơn</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-200">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 px-6 pt-2">
                    {[
                        { id: 'explore', label: 'Khám phá' },
                        { id: 'saved', label: 'Món đã lưu' },
                        { id: 'mine', label: 'Công thức của tôi' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
                                activeTab === tab.id 
                                ? 'border-[#ff6b35] text-[#ff6b35]' 
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Thanh tìm kiếm (Chỉ hiện ở Tab Khám phá) */}
                {activeTab === 'explore' && (
                    <div className="p-4 px-6 relative">
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm món ăn (Gà, bò, salad...)"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full bg-gray-100 border-none rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-[#f7931e] outline-none"
                        />
                        <Search className="w-5 h-5 text-gray-400 absolute left-10 top-7" />
                    </div>
                )}

                {/* Danh sách kết quả */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {isLoading ? (
                        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-10 w-10 border-4 border-[#ff6b35] border-t-transparent"></div></div>
                    ) : recipes.length === 0 ? (
                        <p className="text-center text-gray-500 py-10">Không tìm thấy món ăn nào phù hợp.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {recipes.map(recipe => (
                                <div key={recipe.recipe_id} className="bg-white p-3 rounded-2xl border border-gray-100 flex gap-4 items-center hover:shadow-md transition">
                                    <img 
                                        src={recipe.image} 
                                        alt={recipe.title} 
                                        className="w-20 h-20 object-cover rounded-xl"
                                    />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{recipe.title}</h4>
                                        <p className="text-xs text-gray-500 mt-1">{recipe.total_calo || 0} Calo • {recipe.cook_time || 0} Phút</p>
                                        <button 
                                            onClick={() => onSelectRecipe(recipe)}
                                            className="mt-2 text-xs font-bold text-white bg-[#ff6b35] hover:bg-[#f7931e] px-3 py-1.5 rounded-lg w-fit"
                                        >
                                            + Chọn món này
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Phân trang */}
                    {pagination && (
                        <Pagination pagination={pagination} onPageChange={(newPage) => setPage(newPage)} />
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}