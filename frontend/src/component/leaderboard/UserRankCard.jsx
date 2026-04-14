import React from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, PlusCircle } from 'lucide-react';
import RankBadge from './RankBadge';

const UserRankCard = ({ user, rank }) => {
    return (
        <div className="flex items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition duration-200 mb-4">
            {/* Hạng */}
            <div className="mr-4 sm:mr-6 shrink-0">
                <RankBadge rank={rank} />
            </div>

            {/* Avatar */}
            <Link to={`/user/${user.id}`} className="shrink-0 mr-4">
                <img 
                    src={user.avatar} 
                    alt={user.fullName} 
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-full border-2 border-orange-100"
                />
            </Link>

            {/* Thông tin */}
            <div className="flex-1 min-w-0">
                <Link to={`/user/${user.id}`}>
                    <h3 className="text-lg font-bold text-gray-800 truncate hover:text-orange-500 transition">
                        {user.fullName}
                    </h3>
                </Link>
                <p className="text-sm text-gray-500 truncate mt-1">
                    {user.bio}
                </p>

                {/* Tóm tắt tương tác */}
                <div className="flex items-center space-x-4 text-xs sm:text-sm text-gray-600 mt-2">
                    <div className="flex items-center" title="Tổng số công thức">
                        <BookOpen size={16} className="mr-1 text-orange-500" /> {user.totalRecipes}
                    </div>
                    {user.newRecipes > 0 && (
                        <div className="flex items-center text-green-600 font-medium" title="Công thức mới tháng này">
                            <PlusCircle size={14} className="mr-1" /> {user.newRecipes} mới
                        </div>
                    )}
                    <div className="flex items-center" title="Người theo dõi">
                        <Users size={16} className="mr-1 text-blue-500" /> {user.totalFollowers}
                    </div>
                </div>
            </div>

            {/* Điểm */}
            <div className="hidden sm:flex flex-col items-end ml-4 shrink-0">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Điểm XH</span>
                <span className="text-xl font-bold text-orange-500">{Math.round(user.score || 0)}</span>
            </div>
        </div>
    );
};

export default UserRankCard;