import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useDishDetail from '../hooks/useDishDetail';
import { getDishImageUrl } from '../utils/imageHelper';

const DishDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { dish, loading, error } = useDishDetail(id);

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen text-[#7d5a3f] font-medium italic animate-pulse">
            Đang tải hương vị món ăn...
        </div>
    );

    if (error || !dish) return (
        <div className="text-center p-20">
            <p className="text-red-500 mb-4">Không tìm thấy thông tin món ăn này.</p>
            <button onClick={() => navigate(-1)} className="text-[#7d5a3f] underline">Quay lại</button>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 bg-[#fffcf7]">
            {/* Header & Back Button */}
            <button 
                onClick={() => navigate(-1)}
                className="mb-6 flex items-center text-[#7d5a3f] hover:font-bold transition-all"
            >
                <span className="mr-2">←</span> Quay lại bản đồ
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* CỘT TRÁI: THÔNG TIN CHÍNH */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                        <img 
                            src={getDishImageUrl(dish.dish_id, dish.image_url)} 
                            alt={dish.original_name}
                            className="w-full h-[400px] md:h-[500px] object-cover"
                        />
                    </div>
                    
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#7d5a3f]/10">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h1 className="text-4xl font-serif font-bold text-[#4a3728] mb-1">
                                    {dish.original_name}
                                </h1>
                                <p className="text-xl text-[#a68b6d] italic">{dish.english_name}</p>
                            </div>
                            <div className="bg-[#7d5a3f] text-white px-4 py-2 rounded-full text-sm font-bold">
                                ⭐ {dish.point || 0} Points
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mb-6">
                            <span className="px-3 py-1 bg-[#f3ece4] text-[#7d5a3f] rounded-lg text-sm font-semibold">
                                📍 {dish.country}
                            </span>
                        </div>

                        <div className="prose max-w-none text-gray-700 leading-relaxed">
                            <h3 className="text-[#7d5a3f] font-bold text-lg mb-2 italic">Câu chuyện & Hương vị</h3>
                            <p className="whitespace-pre-line">{dish.description}</p>
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI: SIDEBAR (EATERIES & RECIPES) */}
                <div className="space-y-6">
                    
                    {/* Placeholder: Ăn ở đâu? */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#7d5a3f]/10">
                        <h3 className="text-[#7d5a3f] font-bold text-xl mb-4 flex items-center">
                            <span className="mr-2">📍</span> Ăn ở đâu?
                        </h3>
                        <div className="space-y-4">
                            {dish.eateries && dish.eateries.length > 0 ? (
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
                    </div>

                    {/* Placeholder: Công thức liên quan */}
                    <div className="bg-[#7d5a3f] p-6 rounded-3xl shadow-lg text-[#fff9f0]">
                        <h3 className="font-bold text-xl mb-4 flex items-center">
                            <span className="mr-2">🍳</span> Công thức nấu
                        </h3>
                        <div className="space-y-4">
                            {dish.recipes && dish.recipes.length > 0 ? (
                                dish.recipes.map((recipe, index) => (
                                    <div key={index} className="bg-white/10 p-3 rounded-xl hover:bg-white/20 cursor-pointer transition-all border border-white/20">
                                        <p className="font-medium">{recipe.title || "Tên công thức"}</p>
                                        <p className="text-[10px] uppercase tracking-widest opacity-70">Xem chi tiết →</p>
                                    </div>
                                ))
                            ) : (
                                <div className="border-2 border-dashed border-white/30 rounded-2xl p-6 text-center">
                                    <p className="text-sm opacity-80">Chưa có công thức liên kết cho món ăn này.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default DishDetailPage;