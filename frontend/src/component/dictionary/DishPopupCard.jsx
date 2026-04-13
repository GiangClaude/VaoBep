import React from 'react';
import { getDishImageUrl } from '../../utils/imageHelper';
import { Heart, MapPin, ChevronRight } from 'lucide-react'; // Sử dụng lucide giống project của bạn
import useInteraction from '../../hooks/useInteraction';
const DishPopupCard = ({ dish }) => {
    return (
        <div className="w-64 bg-[#fff9f0] rounded-2xl overflow-hidden shadow-2xl border border-[#d4b99a]/30 font-sans">
            {/* Image Container */}
            <div className="relative h-40">
                <img 
                    className="w-full h-full object-cover" 
                    src={getDishImageUrl(dish.dish_id, dish.image_url)} 
                    alt={dish.original_name} 
                />
                <div className="absolute top-2 right-2 bg-[#7d5a3f] text-[#fff9f0] text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter">
                    {dish.country}
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="text-lg font-bold text-[#7d5a3f] leading-tight mb-1">
                    {dish.original_name}
                </h3>
                <p className="text-[#a68b6d] text-xs mb-3 italic flex items-center">
                    <MapPin size={10} className="mr-1" /> {dish.english_name}
                </p>
                
                <p className="text-[#5c4033] text-xs leading-relaxed mb-4 line-clamp-3 bg-[#fcf5e8] p-2 rounded-lg border border-[#d4b99a]/20">
                    {dish.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-[#d4b99a]/30 pt-3">
                    <div className="flex items-center text-[#e67e22]">
                        <Heart size={14} fill="currentColor" className="mr-1" />
                        <span className="text-sm font-bold">{dish.point || 0}</span>
                    </div>
                    
                    <button 
                        onClick={() => window.location.href = `/dish/${dish.dish_id}`}
                        className="flex items-center text-[#7d5a3f] hover:text-[#5c4033] text-xs font-bold uppercase transition-colors"
                    >
                        Chi tiết <ChevronRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DishPopupCard;