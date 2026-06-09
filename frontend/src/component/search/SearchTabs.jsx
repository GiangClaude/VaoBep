import React from 'react';
import { NavLink, useSearchParams } from "react-router-dom";
import { Users, FileText, ChefHat, LayoutGrid } from "lucide-react"; 

export default function SearchTabs() {
    const [searchParams] = useSearchParams();
    const keyword = searchParams.get("keyword") || "";

    const tabs = [
        { path: "", label: "Tất cả", icon: LayoutGrid, exact: true },
        { path: "users", label: "Mọi người", icon: Users },
        { path: "recipes", label: "Món ăn", icon: ChefHat },
        { path: "articles", label: "Bài viết", icon: FileText },
    ];

    const getUrl = (path) => `/search${path ? `/${path}` : ''}?keyword=${encodeURIComponent(keyword)}`;

    return (
        <div className="flex overflow-x-auto scrollbar-hide gap-2 border-b border-gray-200 mb-8 pb-1">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                    <NavLink
                        key={tab.path}
                        to={getUrl(tab.path)}
                        end={tab.exact}
                        className={({ isActive }) => `flex items-center gap-2 px-5 py-3 rounded-t-xl transition-all font-semibold whitespace-nowrap border-b-2 ${
                            isActive 
                            ? "border-[#ff6b35] text-[#ff6b35] bg-orange-50/50" 
                            : "border-transparent text-gray-500 hover:text-[#ff6b35] hover:bg-gray-50"
                        }`}
                    >
                        <Icon className="w-5 h-5" />
                        <span>{tab.label}</span>
                    </NavLink>
                );
            })}
        </div>
    );
}