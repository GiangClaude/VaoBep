import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ThumbsUp, Loader2 } from 'lucide-react';
import { useDishProposalUI } from '../../hooks/ui/dictionary/useDishProposalUI';
import { getRecipeImageUrl } from '../../utils/imageHelper';
import Pagination from '../common/Pagination';
import ImageWithFallBack from '../figma/ImageWithFallBack';
import { useGlobalModal } from '../../context/ModalContext'; 

export default function RecipeProposalSection({ dishId, initialRecipes, onRefresh }) {
    const navigate = useNavigate();
    const { showModal } = useGlobalModal(); 

    const {
        searchTerm, searchResults, isSearching,
        paginatedRecipes, paginationInfo,
        setCurrentPage, handleSearchRecipes, handleVote
    } = useDishProposalUI(dishId, initialRecipes, onRefresh);

    /**
     * Hàm xử lý khi người dùng bấm bình chọn/đề xuất.
     * Ngăn chặn hành vi click lan ra component cha và kích hoạt API vote.
     */
    const onVoteClick = async (e, rid) => {
        e.stopPropagation(); 
        await handleVote(rid);
    };

    /**
     * Hàm kiểm tra trạng thái vote của một công thức từ kết quả tìm kiếm.
     * Đối chiếu kết quả search với danh sách initialRecipes đã có để lấy chính xác trạng thái is_voted.
     */
    const checkIsVoted = (recipe) => {
        const existingInList = initialRecipes.find(ir => ir.recipe_id === recipe.recipe_id);
        return existingInList ? existingInList.is_voted : recipe.is_voted;
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center justify-between">
                Cộng đồng đề cử công thức
                <span className="text-sm font-normal text-gray-400">{initialRecipes.length} liên kết</span>
            </h3>

            {/* Thanh tìm kiếm */}
            <div className="relative mb-8">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                        type="text"
                        placeholder="Tìm công thức để đề xuất cho món này..."
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-200 transition-all outline-none text-sm text-gray-900 placeholder:text-gray-400"
                        value={searchTerm}
                        onChange={(e) => handleSearchRecipes(e.target.value)}
                    />
                    {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin w-5 h-5" />}
                </div>

                {/* Kết quả tìm kiếm nhanh */}
                {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 max-h-80 overflow-y-auto p-2">
                        {searchResults.map(r => {
                            const isVoted = checkIsVoted(r);
                            return (
                                <div key={r.recipe_id} className="flex items-center justify-between p-2 hover:bg-orange-50 rounded-xl transition-colors">
                                    <div className="flex items-center gap-3">
                                        <img src={getRecipeImageUrl(r.recipe_id, r.cover_image)} className="w-12 h-12 rounded-lg object-cover" alt="" />
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">{r.title}</p>
                                            <p className="text-xs text-gray-500">Tác giả: {r.author_name}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={(e) => onVoteClick(e, r.recipe_id)}
                                        className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                                            isVoted 
                                            ? 'bg-gray-200 text-gray-600 hover:bg-gray-300' 
                                            : 'bg-orange-500 text-white hover:bg-orange-600'
                                        }`}
                                    >
                                        {isVoted ? 'Bỏ đề xuất' : 'Đề xuất'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Danh sách đã liên kết */}
            <div className="space-y-4">
                {paginatedRecipes.map((r, index) => (
                    <div 
                        key={r.recipe_id} 
                        className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 cursor-pointer"
                        onClick={() => navigate(`/recipe/${r.recipe_id}`)}
                    >
                        <div className="relative">
                            <ImageWithFallBack 
                                src={getRecipeImageUrl(r.recipe_id, r.cover_image)} 
                                className="w-16 h-16 rounded-xl object-cover" 
                            />
                            <div className="absolute -top-2 -left-2 w-6 h-6 bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                                {((paginationInfo.currentPage - 1) * 5) + index + 1}
                            </div>
                        </div>
                        
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{r.title}</h4>
                            <p className="text-xs text-gray-500">Bởi {r.author_name}</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-xs font-bold text-orange-600">{r.vote_count || 1} vote</p>
                            </div>
                            <button 
                                onClick={(e) => onVoteClick(e, r.recipe_id)}
                                className={`p-2 rounded-lg shadow-sm transition-all ${
                                    r.is_voted 
                                    ? "bg-orange-500 text-white" 
                                    : "bg-white text-gray-400 hover:text-orange-600 hover:bg-orange-50" 
                                }`}
                                title={r.is_voted ? "Hủy bình chọn" : "Bình chọn cho công thức này"}
                            >
                                <ThumbsUp className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <Pagination 
                pagination={paginationInfo} 
                onPageChange={(p) => setCurrentPage(p)} 
            />
        </div>
    );
}