import React from 'react';
import { LayoutGrid } from "lucide-react"; 
import UserCard from "../common/UserCard";
import ArticleCard from "../common/ArticleCard";

// 1. Component Trạng thái trống
export const EmptyState = ({ text }) => (
    <div className="bg-white rounded-2xl p-10 text-center border-2 border-dashed border-gray-200">
        <div className="text-4xl mb-3">🕵️‍♀️</div>
        <p className="text-gray-500">{text}</p>
    </div>
);

// 2. Component Danh sách User
export const UserGrid = ({ data, isHorizontal = false, onTabChange }) => {
    if (data.length === 0) return <EmptyState text="Không tìm thấy người dùng phù hợp" />;

    if (isHorizontal) {
        return (
            <div className="flex overflow-x-auto pb-6 gap-4 scrollbar-hide -mx-4 px-4">
                {data.map((user) => (
                    <div key={user.user_id} className="w-64 flex-shrink-0">
                        <UserCard 
                            id={user.user_id}
                            fullName={user.full_name}
                            avatar={user.avatar} 
                            bio={user.bio}
                            followersCount={user.followers_count}
                            isFollowing={user.isFollowing} 
                        />
                    </div>
                ))}
                <div className="flex items-center justify-center min-w-[100px]">
                    <button 
                        onClick={() => onTabChange('user')} 
                        className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#ff6b35] hover:text-white transition-all"
                    >
                        <LayoutGrid className="w-6 h-6"/>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((user) => (
                <UserCard 
                    key={user.user_id}
                    id={user.user_id}
                    fullName={user.full_name}
                    avatar={user.avatar}
                    bio={user.bio}
                    followersCount={user.followers_count}
                    isFollowing={user.isFollowing} 
                />
            ))}
        </div>
    );
};

// 3. Component Danh sách Article
export const ArticleList = ({ data, onCardClick }) => (
    <div className="grid grid-cols-1 gap-6">
        {data.map((article) => (
            <ArticleCard
                key={article.id}
                {...article}
                onClick={() => onCardClick?.(article.id)}
            />
        ))}
    </div>
);