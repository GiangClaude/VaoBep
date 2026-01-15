import React from 'react';
import useAdminDashboard from '../../hooks/admin/useAdminDashboard';

const AdminDashboardPage = () => {
    const { stats, loading } = useAdminDashboard();

    if (loading) return <div className="p-4">Đang tải dữ liệu...</div>;

    const statCards = [
        { title: 'Tổng Người dùng', value: stats.users, color: 'bg-blue-500', icon: '👥' },
        { title: 'Tổng Công thức', value: stats.recipes, color: 'bg-green-500', icon: '🍳' },
        { title: 'Bài viết Học thuật', value: stats.articles, color: 'bg-purple-500', icon: '📚' },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Tổng quan hệ thống</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((card, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
                        <div className={`p-4 rounded-full ${card.color} text-white text-2xl`}>
                            {card.icon}
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">{card.title}</p>
                            <p className="text-3xl font-bold text-gray-800">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboardPage;