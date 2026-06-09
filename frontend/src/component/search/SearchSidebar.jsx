import React, { useState } from 'react';
import { NavLink, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, FileText, ChefHat, LayoutGrid, ChevronLeft, ChevronRight } from "lucide-react"; 

export default function SearchSidebar() {
    const [isOpen, setIsOpen] = useState(true);
    const [searchParams] = useSearchParams();
    const keyword = searchParams.get("keyword") || "";

    const tabs = [
        { path: "", label: "Tất cả", icon: LayoutGrid, exact: true },
        { path: "users", label: "Mọi người", icon: Users },
        { path: "recipes", label: "Món ăn", icon: ChefHat },
        { path: "articles", label: "Bài viết", icon: FileText },
    ];

    // Hàm giữ nguyên từ khóa tìm kiếm khi chuyển URL
    const getUrl = (path) => `/search${path ? `/${path}` : ''}?keyword=${encodeURIComponent(keyword)}`;

    return (
        <motion.div animate={{ width: isOpen ? "100%" : "80px" }} className="bg-white rounded-2xl shadow-sm p-4 transition-all">
            <div className="flex items-center justify-between mb-4 px-2">
                {isOpen && <h3 className="font-bold text-gray-800 text-lg whitespace-nowrap">Tìm kiếm</h3>}
                <button onClick={() => setIsOpen(!isOpen)} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 ml-auto">
                    {isOpen ? <ChevronLeft className="w-5 h-5"/> : <ChevronRight className="w-5 h-5"/>}
                </button>
            </div>
            <div className="flex flex-col gap-2">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <NavLink
                            key={tab.path}
                            to={getUrl(tab.path)}
                            end={tab.exact}
                            onClick={() => { if (!isOpen) setIsOpen(true); }}
                            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-left whitespace-nowrap ${
                                isActive ? "bg-[#ff6b35] text-white shadow-md shadow-orange-200" : "text-gray-600 hover:bg-[#fff9f0] hover:text-[#ff6b35]"
                            }`}
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            {isOpen && <span>{tab.label}</span>}
                        </NavLink>
                    );
                })}
            </div>
        </motion.div>
    );
}