import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Search } from 'lucide-react';
import recipeApi from '../../api/recipeApi';
import Pagination from '../common/Pagination'; // Nhớ check lại đường dẫn file này
import { getRecipeImageUrl } from '../../utils/imageHelper';

export default function RecipeSearchModal({ isOpen, onClose, onSelectRecipe }) {
    const [activeTab, setActiveTab] = useState('explore'); // explore, saved, mine
    const [keyword, setKeyword] = useState('');
    const [recipes, setRecipes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pagination, setPagination] = useState(null);

    // Tách riêng logic fetch API
    const fetchRecipes = useCallback(async (page = 1) => {
        setIsLoading(true);
        try {
            let res;
            if (activeTab === 'explore') {
                res = await recipeApi.getAllRecipes({ page, limit: 6, keyword });
            } else if (activeTab === 'saved') {
                res = await recipeApi.getSavedRecipes({ page, limit: 6 });
            } else if (activeTab === 'mine') {
                // Lấy ID user từ token hoặc context (Giả sử gọi api getUserRecipes)
                const user = JSON.parse(localStorage.getItem('user'));
                res = (await recipeApi.getOwnerRecipe()).data;
                // Vì API owner của bạn trả về data trực tiếp, ta fake pagination
                setRecipes(res.data || []);
                setPagination(null);
                setIsLoading(false);
                return;
            }

            if (res?.data) {
                // API của bạn trả về { data: [...], pagination: {...} }
                setRecipes(res.data.data ? res.data.data : res.data);
                setPagination(res.data.pagination || null);
            }
        } catch (error) {
            console.error("Lỗi tìm món ăn:", error);
        } finally {
            setIsLoading(false);
        }
    }, [activeTab, keyword]);


    useEffect(() => {
        if (isOpen) fetchRecipes(1);
    }, [isOpen, activeTab, fetchRecipes]);

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
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchRecipes(1)}
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
                                        src={getRecipeImageUrl(recipe.recipe_id, recipe.cover_image)} 
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
                        <Pagination pagination={pagination} onPageChange={(page) => fetchRecipes(page)} />
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}