import React from 'react';
import useLeaderboard from '../hooks/useLeaderboard';
import RecipeRankCard from '../component/leaderboard/RecipeRankCard';
import UserRankCard from '../component/leaderboard/UserRankCard';
import { ChefHat, Utensils, AlertCircle } from 'lucide-react';

const LeaderboardPage = () => {
    // Gọi Hook để lấy toàn bộ state và logic
    const { 
        activeTab, 
        selectedPeriod, 
        data, 
        loading, 
        error, 
        handleTabChange, 
        handlePeriodChange 
    } = useLeaderboard();

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
            {/* Header Trang */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                    Bảng Xếp Hạng
                </h1>
                <p className="mt-2 text-lg text-gray-600">
                    Tôn vinh những công thức và đầu bếp xuất sắc nhất cộng đồng
                </p>
            </div>

            {/* Các bộ lọc (Tabs và Select) */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 space-y-4 sm:space-y-0">
                
                {/* Tabs Chuyển đổi */}
                <div className="flex p-1 space-x-1 bg-gray-100 rounded-xl w-full sm:w-auto">
                    <button
                        onClick={() => handleTabChange('recipe')}
                        className={`flex items-center justify-center flex-1 sm:flex-none px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                            activeTab === 'recipe' 
                                ? 'bg-white text-orange-600 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        <Utensils size={18} className="mr-2" />
                        Công thức
                    </button>
                    <button
                        onClick={() => handleTabChange('user')}
                        className={`flex items-center justify-center flex-1 sm:flex-none px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                            activeTab === 'user' 
                                ? 'bg-white text-orange-600 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        <ChefHat size={18} className="mr-2" />
                        Đầu bếp
                    </button>
                </div>

                {/* Dropdown Thời gian */}
                <select
                    value={selectedPeriod}
                    onChange={(e) => handlePeriodChange(e.target.value)}
                    className="w-full sm:w-auto border border-gray-300 text-gray-700 rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-2.5"
                >
                    <option value="current">Tháng này</option>
                    <option value="previous">Tháng trước</option>
                </select>
            </div>

            {/* Hiển thị Dữ liệu */}
            <div className="mt-4">
                {/* Error State */}
                {error && (
                    <div className="flex items-center justify-center p-6 bg-red-50 text-red-600 rounded-xl">
                        <AlertCircle className="mr-2" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Loading State */}
                {loading && !error && (
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="animate-pulse flex items-center p-4 bg-gray-100 rounded-xl h-28"></div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && data.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500 text-lg">Chưa có dữ liệu xếp hạng cho tháng này.</p>
                    </div>
                )}

                {/* Data List */}
                {!loading && !error && data.length > 0 && (
                    <div className="space-y-4">
                        {data.map((item, index) => {
                            const rank = index + 1;
                            if (activeTab === 'recipe') {
                                return <RecipeRankCard key={item.id} recipe={item} rank={rank} />;
                            } else {
                                return <UserRankCard key={item.id} user={item} rank={rank} />;
                            }
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeaderboardPage;