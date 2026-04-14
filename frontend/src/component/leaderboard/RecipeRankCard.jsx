import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Star } from 'lucide-react';
import RankBadge from './RankBadge';

const RecipeRankCard = ({ recipe, rank }) => {
    return (
        <div className="flex items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition duration-200 mb-4">
            {/* Hạng */}
            <div className="mr-4 sm:mr-6 shrink-0">
                <RankBadge rank={rank} />
            </div>

            {/* Ảnh */}
            <Link to={`/recipe/${recipe.id}`} className="shrink-0 mr-4">
                <img 
                    src={recipe.coverImage} 
                    alt={recipe.title} 
                    className="w-20 h-20 sm:w-28 sm:h-28 object-cover rounded-lg"
                />
            </Link>

            {/* Thông tin */}
            <div className="flex-1 min-w-0">
                <Link to={`/recipe/${recipe.id}`}>
                    <h3 className="text-lg font-bold text-gray-800 truncate hover:text-orange-500 transition">
                        {recipe.title}
                    </h3>
                </Link>

                <Link to={`/user/${recipe.authorId}`} className="flex items-center mt-1 mb-2 group w-max">
                    <img src={recipe.authorAvatar} alt={recipe.authorName} className="w-5 h-5 rounded-full mr-2 object-cover" />
                    <span className="text-sm text-gray-500 group-hover:text-orange-500">{recipe.authorName}</span>
                </Link>

                {/* Tóm tắt tương tác */}
                <div className="flex items-center space-x-4 text-xs sm:text-sm text-gray-600 mt-2">
                    <div className="flex items-center"><Heart size={16} className="mr-1 text-red-500" /> {recipe.likes}</div>
                    <div className="flex items-center"><MessageCircle size={16} className="mr-1 text-blue-500" /> {recipe.comments}</div>
                    <div className="flex items-center"><Star size={16} className="mr-1 text-yellow-500" /> {recipe.rating}</div>
                </div>
            </div>

            {/* Điểm (Hiện trên Desktop, ẩn trên Mobile nhỏ nếu chật) */}
            <div className="hidden sm:flex flex-col items-end ml-4 shrink-0">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Điểm XH</span>
                <span className="text-xl font-bold text-orange-500">{Math.round(recipe.score || 0)}</span>
            </div>
        </div>
    );
};

export default RecipeRankCard;