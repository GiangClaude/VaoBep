import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User } from 'lucide-react';
import { getAvatarUrl } from '../../utils/imageHelper';
const MenuCard = ({ menu }) => {
    const navigate = useNavigate();
    console.log('MenuCard render, menu:', menu);
    return (
        <div 
            onClick={() => navigate(`/menus/planner/${menu.menu_id}`)}
            className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-[#ff6b35]/30 transition-all cursor-pointer flex flex-col h-full"
        >
            {/* Ảnh minh họa (Ghép ảnh tĩnh hoặc ảnh của 1 món trong menu nếu có, hiện tại dùng màu gradient) */}
            <div className="h-32 bg-gradient-to-br from-orange-100 to-[#ff6b35]/20 flex items-center justify-center relative">
                <Calendar className="w-12 h-12 text-[#ff6b35] opacity-50 group-hover:scale-110 transition-transform" />
                <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-gray-700 shadow-sm">
                    {menu.total_days} Ngày
                </div>
            </div>

            {/* Thông tin */}
            <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2 group-hover:text-[#ff6b35] transition-colors">
                    {menu.name}
                </h3>
                
                {menu.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                        {menu.description}
                    </p>
                )}

                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center gap-2">
                    {menu.author_avatar ? (
                        <img src={getAvatarUrl(menu.author_id, menu.author_avatar)} alt="avatar" className="w-6 h-6 rounded-full" />
                    ) : (
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 text-gray-400" />
                        </div>
                    )}
                    <span className="text-xs font-medium text-gray-600">
                        {menu.author_name || 'Người dùng ẩn danh'}
                    </span>
                    {/* Tick xanh cho Admin */}
                    {menu.author_role === 'admin' && (
                        <img src="/verified-badge.png" alt="verified" className="w-4 h-4" /> 
                    )}
                </div>
            </div>
        </div>
    );
};

export default MenuCard;