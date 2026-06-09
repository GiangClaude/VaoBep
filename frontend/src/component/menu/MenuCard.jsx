import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, User, UtensilsCrossed, Sparkles } from 'lucide-react';
import { getAvatarUrl } from '../../utils/imageHelper';

const MenuCard = ({ menu }) => {
    const navigate = useNavigate();
    
    return (
        <div 
            onClick={() => navigate(`/menus/planner/${menu.menu_id}`)}
            className="group relative bg-white rounded-[32px] overflow-hidden shadow-[0_8px_20px_-10px_rgba(255,117,31,0.2)] hover:shadow-[0_16px_32px_-10px_rgba(255,117,31,0.4)] transition-all duration-300 cursor-pointer flex flex-col h-full hover:-translate-y-1.5 border-2 border-transparent hover:border-orange-100"
        >
            {/* Vùng Top: Thay thế ảnh bằng Gradient Pattern ngộ nghĩnh */}
            <div className="h-36 bg-gradient-to-br from-[#ff751f] via-orange-400 to-yellow-400 p-5 flex flex-col justify-between relative overflow-hidden">
                {/* Icon trang trí làm pattern chìm */}
                <UtensilsCrossed className="absolute -right-4 -top-4 w-28 h-28 text-white opacity-20 group-hover:rotate-12 transition-transform duration-700" />
                <CalendarDays className="absolute -left-6 -bottom-6 w-24 h-24 text-white opacity-20 group-hover:-rotate-12 transition-transform duration-700" />
                
                {/* Header trong ảnh (Badge trạng thái) */}
                <div className="flex justify-between items-start z-10">
                    <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full border border-white/30">
                        {menu.is_public ? 'Công khai' : 'Cá nhân'}
                    </span>
                </div>

                {/* Badge Số Ngày - Dạng nổi */}
                <div className="z-10 bg-white shadow-lg px-4 py-2 rounded-2xl w-max border border-orange-100 group-hover:scale-105 transition-transform duration-300">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Kế hoạch</div>
                    <div className="text-[#ff751f] font-extrabold text-sm flex items-center gap-1.5">
                        <CalendarDays className="w-4 h-4" /> {menu.total_days} Ngày
                    </div>
                </div>
            </div>

            {/* Vùng Thông tin (Bottom) */}
            <div className="p-5 flex flex-col flex-1 bg-white relative">
                {/* Viền đứt khúc phân cách giả lập tấm vé (ticket) */}
                <div className="absolute top-0 left-4 right-4 border-t-2 border-dashed border-orange-100/50 -translate-y-1/2"></div>

                <h3 className="font-extrabold text-gray-800 text-[18px] mb-2 line-clamp-2 group-hover:text-[#ff751f] transition-colors leading-snug">
                    {menu.name}
                </h3>
                
                {menu.description ? (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 font-medium italic">
                        "{menu.description}"
                    </p>
                ) : (
                    <p className="text-sm text-gray-400 line-clamp-2 mb-4 font-medium">
                        Cùng khám phá thực đơn hấp dẫn này nhé! 😋
                    </p>
                )}

                {/* Footer: User Info (Dạng Pill) */}
                <div className="mt-auto pt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 bg-orange-50/50 hover:bg-orange-50 border border-transparent hover:border-orange-100 px-2 py-1.5 rounded-full transition-colors w-max pr-4">
                        {menu.author_avatar ? (
                            <img src={getAvatarUrl(menu.author_id, menu.author_avatar)} alt="avatar" className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm" />
                        ) : (
                            <div className="w-8 h-8 bg-gradient-to-tr from-gray-200 to-gray-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                <User className="w-4 h-4 text-gray-400" />
                            </div>
                        )}
                        
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-700 truncate max-w-[100px]">
                                {menu.author_name || 'Đầu bếp ẩn danh'}
                            </span>
                            {/* Xử lý hiển thị role (Admin / Pro / User) */}
                            {menu.author_role === 'pro' && (
                                <span className="text-[9px] font-black text-yellow-500 uppercase tracking-wider flex items-center gap-0.5">
                                    <Sparkles className="w-2.5 h-2.5" /> Chuyên gia
                                </span>
                            )}
                            {menu.author_role === 'admin' && (
                                <span className="text-[9px] font-black text-[#ff751f] uppercase tracking-wider">
                                    Quản trị viên
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MenuCard;