import React from 'react';
import { ArrowRight } from 'lucide-react';
import MenuCard from '../menu/MenuCard';

export const MenuSection = ({ title, menus, isLoading }) => {
    if (isLoading) {
        return (
            <div className="w-full h-40 flex items-center justify-center text-[#7d5a3f]">
                Đang tải thực đơn...
            </div>
        );
    }

    if (!menus || menus.length === 0) return null;

    return (
        <section className="mb-12">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        {title}
                        <span className="text-[#ff6b35]">🔥</span>
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Khám phá các thực đơn được yêu thích nhất</p>
                </div>
                <button className="text-[#ff6b35] font-semibold hover:text-[#e65a2a] transition-colors flex items-center text-sm">
                    Xem tất cả <ArrowRight className="w-4 h-4 ml-1" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {menus.map((menu) => (
                    <MenuCard key={menu.menu_id} menu={menu} />
                ))}
            </div>
        </section>
    );
};