import React from 'react';
import { Heart, Share2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

import { getDishImageUrl } from '../utils/imageHelper';
import CommentSection from '../component/comment/CommentSection';
import RecipeProposalSection from '../component/dictionary/RecipeProposalSection';
import AiSummaryBanner from "../component/common/AiSummaryBanner";
import { useAuth } from '../AuthContext';

// [MỚI] Import Hooks
import { useDishDetailQuery } from '../hooks/queries/useDictionaryQueries';
import { useInteractionStateQuery } from '../hooks/queries/useInteractionQueries';
import { usePostActions } from '../hooks/ui/interaction/usePostActions';

const DishDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    // 1. Fetch dữ liệu tĩnh
    const { data: dish, isLoading, error, refetch } = useDishDetailQuery(id);

    // 2. Fetch trạng thái tương tác
    const { data: interactionState } = useInteractionStateQuery(id, 'dish', !!currentUser);
 
    // console.log("Dish Detail:", dish, interactionState); // Debug log để kiểm tra dữ liệu trả vềs
    // 3. UI Hooks Action
    const { handleLike, handleShare } = usePostActions({
        id: id,
        type: 'dish',
        isLiked: interactionState?.liked || false,
        likesCount: dish?.like_count || 0,
        isSaved: false // Thường thì Dish không có save
    });

    if (isLoading) return (
        <div className="flex justify-center items-center min-h-screen text-[#7d5a3f] font-medium italic animate-pulse">
            Đang tải hương vị món ăn...
        </div>
    );

    if (error || !dish) return (
        <div className="text-center p-20 min-h-screen flex flex-col justify-center items-center">
            <p className="text-red-500 mb-4 font-bold text-xl">{error?.message || "Không tìm thấy thông tin món ăn này."}</p>
            <button onClick={() => navigate(-1)} className="px-6 py-2 bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200">Quay lại</button>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 bg-[#fffcf7]">
            <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-[#7d5a3f] hover:font-bold transition-all">
                <span className="mr-2">←</span> Quay lại bản đồ
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="relative group rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                        <img src={getDishImageUrl(dish.dish_id, dish.image_url)} alt={dish.original_name} className="w-full h-[400px] md:h-[500px] object-cover" />
                        
                        <div className="absolute top-4 right-4 flex flex-col gap-3">
                            <button onClick={handleLike} className={`p-3 rounded-full shadow-lg transition-all ${interactionState?.liked ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:text-red-500'}`}>
                                <Heart size={24} fill={interactionState?.liked ? "currentColor" : "none"} />
                            </button>
                            <button onClick={handleShare} className="p-3 bg-white rounded-full shadow-lg text-gray-600 hover:text-blue-500 transition-all">
                                <Share2 size={24} />
                            </button>
                        </div>
                    </div>
                    
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#7d5a3f]/10">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h1 className="text-4xl font-serif font-bold text-[#4a3728] mb-1">{dish.original_name}</h1>
                                <p className="text-xl text-[#a68b6d] italic">{dish.english_name}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xl text-[#7d5a3f]/60 font-bold">{dish.like_count || 0} lượt thích</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mb-6">
                            <span className="px-3 py-1 bg-[#f3ece4] text-[#7d5a3f] rounded-lg text-sm font-semibold">📍 {dish.country}</span>
                        </div>

                        <div className="prose max-w-none text-gray-700 leading-relaxed">
                            <h3 className="text-[#7d5a3f] font-bold text-lg mb-2 italic">Câu chuyện & Hương vị</h3>
                            <p className="whitespace-pre-line">{dish.description}</p>
                        </div>
                    </div>

                    {/* Component Độc lập */}
                    <CommentSection postId={id} postType="dish" />
                </div>

                {/* CỘT PHẢI */}
                <div className="space-y-6">
                    {/* <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#7d5a3f]/10">
                        <h3 className="text-[#7d5a3f] font-bold text-xl mb-4 flex items-center"><span className="mr-2">📍</span> Ăn ở đâu?</h3>
                        <div className="space-y-4">
                            {dish.eateries?.length > 0 ? (
                                dish.eateries.map((place, index) => (
                                    <div key={index} className="border-b border-dashed border-[#e6dcd3] pb-3 last:border-0 hover:bg-[#fffcf7] p-2 rounded-xl transition-colors">
                                        <p className="font-bold text-[#4a3728]">{place.name}</p>
                                        <p className="text-sm text-gray-500 italic">{place.address}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400 italic text-sm">Thông tin địa điểm đang được cập nhật...</p>
                            )}
                        </div>
                    </div> */}

                    <div className="bg-[#7d5a3f] p-6 rounded-3xl shadow-lg text-[#fff9f0]">
                        <h3 className="font-bold text-xl mb-4 flex items-center"><span className="mr-2">🍳</span> Công thức nấu</h3>
                        <div className="space-y-4">
                            {/* Refetch là query action */}
                            <RecipeProposalSection dishId={id} initialRecipes={dish.recipes || []} onRefresh={refetch} />
                        </div>
                    </div>

                    <div className="mt-6">
                        <AiSummaryBanner 
                            title="✨ Nhờ AI phân tích thêm về món này"
                            contextText={`Món: ${dish.original_name}. Từ: ${dish.country}. Mô tả: ${dish.description}`} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DishDetailPage;