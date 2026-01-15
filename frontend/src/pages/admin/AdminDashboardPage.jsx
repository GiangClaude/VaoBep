import React, { useState } from 'react';
import useAdminDashboard from '../../hooks/admin/useAdminDashboard';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// [CẬP NHẬT] Custom Tick: Format day/month và chỉnh khoảng cách
const CustomAxisTick = ({ x, y, payload }) => {
    const dateParts = payload.value.split('-'); 
    const day = dateParts[2];   
    const month = dateParts[1]; 

    return (
        // y + 10: Đẩy toàn bộ cụm text xuống dưới 10px so với trục hoành
        <g transform={`translate(${x},${y + 10})`}>
            <text 
                x={0} 
                y={0} 
                dy={0} 
                textAnchor="middle" // Căn giữa chữ so với điểm tick
                fill="#666" 
                fontSize={12}
            >
                {`${day}/${month}`}
            </text>
        </g>
    );
};

const AdminDashboardPage = () => {
    const { stats, loading } = useAdminDashboard();
    
    const [userTimeRange, setUserTimeRange] = useState(7);
    const [recipeTimeRange, setRecipeTimeRange] = useState(7);

    // Hàm xử lý dữ liệu (Giữ nguyên)
    const processChartData = (apiData, days) => {
        const result = [];
        const today = new Date();
        const dataMap = new Map();

        if (Array.isArray(apiData)) {
            apiData.forEach(item => {
                const dateStr = new Date(item.date).toLocaleDateString('en-CA'); 
                dataMap.set(dateStr, item.count);
            });
        }

        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = d.toLocaleDateString('en-CA'); 
            result.push({
                date: dateStr, 
                count: dataMap.get(dateStr) || 0 
            });
        }
        return result;
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Đang tải dữ liệu dashboard...</div>;

    const summary = stats.summary || {};
    const charts = stats.charts || {};

    // Xử lý dữ liệu
    const rawUserGrowth = charts.userGrowth || [];
    const userGrowthData = processChartData(rawUserGrowth, userTimeRange);

    const rawRecipeGrowth = charts.recipeGrowth || [];
    const recipeGrowthData = processChartData(rawRecipeGrowth, recipeTimeRange);

    const userRoleData = charts.userRoleDistribution || [];
    const recipeStatusData = charts.recipeDistribution || [];

    const statCards = [
        { title: 'Tổng Người dùng', value: summary.users, color: 'bg-blue-500', icon: '👥' },
        { title: 'Tổng Công thức', value: summary.recipes, color: 'bg-green-500', icon: '🍳' },
        { title: 'TB Công thức/User', value: summary.avgRecipePerUser, color: 'bg-orange-500', icon: '📊' }, 
        { title: 'Bài viết Học thuật', value: summary.articles, color: 'bg-purple-500', icon: '📚' },
    ];

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-gray-800">Tổng quan hệ thống</h1>
            
            {/* CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4 border-l-4 border-transparent hover:border-blue-500 transition-all">
                        <div className={`p-4 rounded-full ${card.color} text-white text-2xl shadow-sm`}>
                            {card.icon}
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">{card.title}</p>
                            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Chart 1: User Growth */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">Người dùng mới</h3>
                        <select 
                            className="border rounded-md px-2 py-1 text-sm text-gray-600 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                            value={userTimeRange}
                            onChange={(e) => setUserTimeRange(Number(e.target.value))}
                        >
                            <option value={7}>7 ngày qua</option>
                            <option value={15}>15 ngày qua</option>
                            <option value={30}>30 ngày qua</option>
                        </select>
                    </div>
                    {/* Thêm padding-bottom để chứa nhãn ngày tháng */}
                    <div className="h-72 pb-2"> 
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={userGrowthData} margin={{ bottom: 20, left: -20, right: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis 
                                    dataKey="date" 
                                    tick={<CustomAxisTick />}
                                    // [QUAN TRỌNG] Logic Interval để tránh đè chữ:
                                    // 7 ngày: Hiện hết (0)
                                    // 15 ngày: Cách 1 hiện 1 (1)
                                    // 30 ngày: Cách 2 hiện 1 (2)
                                    interval={userTimeRange === 7 ? 0 : userTimeRange === 15 ? 1 : 2}
                                    height={40} 
                                    tickMargin={10} // Khoảng cách phụ trợ
                                />
                                <YAxis allowDecimals={false} />
                                <Tooltip labelFormatter={(label) => new Date(label).toLocaleDateString('vi-VN')} />
                                <Line type="monotone" dataKey="count" name="User đăng ký" stroke="#0088FE" strokeWidth={3} dot={{r: 4}} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 2: Recipe Growth */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">Công thức mới</h3>
                        <select 
                            className="border rounded-md px-2 py-1 text-sm text-gray-600 focus:ring-2 focus:ring-green-500 outline-none cursor-pointer"
                            value={recipeTimeRange}
                            onChange={(e) => setRecipeTimeRange(Number(e.target.value))}
                        >
                            <option value={7}>7 ngày qua</option>
                            <option value={15}>15 ngày qua</option>
                            <option value={30}>30 ngày qua</option>
                        </select>
                    </div>
                    <div className="h-72 pb-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={recipeGrowthData} margin={{ bottom: 20, left: -20, right: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis 
                                    dataKey="date" 
                                    tick={<CustomAxisTick />}
                                    interval={recipeTimeRange === 7 ? 0 : recipeTimeRange === 15 ? 1 : 2}
                                    height={40} 
                                    tickMargin={10}
                                />
                                <YAxis allowDecimals={false} />
                                <Tooltip labelFormatter={(label) => new Date(label).toLocaleDateString('vi-VN')} />
                                <Line type="monotone" dataKey="count" name="Công thức mới" stroke="#00C49F" strokeWidth={3} dot={{r: 4}} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* PIE CHARTS (Giữ nguyên) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Phân bố loại tài khoản</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={userRoleData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="role"
                                    label={({ name, percent }) => `${name.toUpperCase()} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {userRoleData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Trạng thái công thức</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={recipeStatusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                    nameKey="status"
                                >
                                    {recipeStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;