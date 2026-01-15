import React, { useState } from 'react';
import { motion } from 'motion/react'; // Thêm animation
import { Users, Utensils, BookOpen, Activity, TrendingUp, Calendar, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import useAdminDashboard from '../../hooks/admin/useAdminDashboard';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

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
                textAnchor="middle"
                fill="#7d5a3f" // [SỬA] Màu nâu đất hợp theme
                fontSize={12}
                fontWeight={500}
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
        { 
            title: 'Tổng Người dùng', 
            value: summary.users, 
            icon: Users,
            bg: 'bg-blue-50', 
            iconColor: 'text-blue-600',
            borderColor: 'border-blue-100'
        },
        { 
            title: 'Tổng Công thức', 
            value: summary.recipes, 
            icon: Utensils,
            bg: 'bg-orange-50', 
            iconColor: 'text-[#ff6b35]',
            borderColor: 'border-orange-100'
        },
        { 
            title: 'TB Công thức/User', 
            value: summary.avgRecipePerUser, 
            icon: Activity,
            bg: 'bg-green-50', 
            iconColor: 'text-green-600',
            borderColor: 'border-green-100'
        }, 
        { 
            title: 'Bài viết Học thuật', 
            value: summary.articles, 
            icon: BookOpen,
            bg: 'bg-purple-50', 
            iconColor: 'text-purple-600',
            borderColor: 'border-purple-100'
        },
    ];

    // Animation variants cho container
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-100 rounded-lg text-[#ff6b35]">
                    <BarChart3 size={24} />
                </div>
                <h1 className="text-2xl font-bold text-gray-800">Tổng quan hệ thống</h1>
            </div>
            
            {/* CARDS SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, index) => (
                    <motion.div 
                        key={index} 
                        variants={itemVariants}
                        className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-6 border ${card.borderColor} relative overflow-hidden group`}
                    >
                        {/* Decor circle background */}
                        <div className={`absolute top-0 right-0 w-24 h-24 ${card.bg} rounded-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform`} />
                        
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <p className="text-gray-500 text-sm font-semibold mb-1">{card.title}</p>
                                <h3 className="text-3xl font-bold text-gray-800">{card.value}</h3>
                            </div>
                            <div className={`p-3 rounded-xl ${card.bg} ${card.iconColor}`}>
                                <card.icon size={24} />
                            </div>
                        </div>
                        
                        {/* Fake trend indicator
                        <div className="mt-4 flex items-center gap-1 text-xs font-medium text-gray-400">
                            <TrendingUp size={12} className="text-green-500" />
                            <span className="text-green-600">+ Cập nhật</span>
                            <span>vừa xong</span>
                        </div> */}
                    </motion.div>
                ))}
            </div>

            {/* CHARTS SECTION - LINE CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Chart 1: User Growth */}
                <motion.div variants={itemVariants} className="bg-white p-6 rounded-3xl shadow-sm border border-orange-100/50">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                                <Users size={16} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-700">Người dùng mới</h3>
                        </div>
                        <div className="relative">
                            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select 
                                className="bg-white border-2 border-gray-100 text-gray-600 text-sm rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none pl-9 pr-3 py-1.5 cursor-pointer transition-all hover:bg-gray-50 appearance-none font-medium"
                                value={userTimeRange}
                                onChange={(e) => setUserTimeRange(Number(e.target.value))}
                            >
                                <option value={7}>7 ngày qua</option>
                                <option value={15}>15 ngày qua</option>
                                <option value={30}>30 ngày qua</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="h-72 pb-2"> 
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={userGrowthData} margin={{ bottom: 20, left: -20, right: 10, top: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis 
                                    dataKey="date" 
                                    tick={<CustomAxisTick />}
                                    interval={userTimeRange === 7 ? 0 : userTimeRange === 15 ? 1 : 2}
                                    height={40} 
                                    tickMargin={10}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString('vi-VN')} 
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="count" 
                                    name="User" 
                                    stroke="#3b82f6" 
                                    strokeWidth={3} 
                                    dot={{r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}} 
                                    activeDot={{r: 6, strokeWidth: 0}}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Chart 2: Recipe Growth */}
                <motion.div variants={itemVariants} className="bg-white p-6 rounded-3xl shadow-sm border border-orange-100/50">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-[#ff6b35]">
                                <Utensils size={16} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-700">Công thức mới</h3>
                        </div>
                        <div className="relative">
                            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select 
                                className="bg-white border-2 border-gray-100 text-gray-600 text-sm rounded-xl focus:ring-2 focus:ring-orange-100 focus:border-orange-300 outline-none pl-9 pr-3 py-1.5 cursor-pointer transition-all hover:bg-gray-50 appearance-none font-medium"
                                value={recipeTimeRange}
                                onChange={(e) => setRecipeTimeRange(Number(e.target.value))}
                            >
                                <option value={7}>7 ngày qua</option>
                                <option value={15}>15 ngày qua</option>
                                <option value={30}>30 ngày qua</option>
                            </select>
                        </div>
                    </div>
                    <div className="h-72 pb-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={recipeGrowthData} margin={{ bottom: 20, left: -20, right: 10, top: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis 
                                    dataKey="date" 
                                    tick={<CustomAxisTick />}
                                    interval={recipeTimeRange === 7 ? 0 : recipeTimeRange === 15 ? 1 : 2}
                                    height={40} 
                                    tickMargin={10}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString('vi-VN')} 
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="count" 
                                    name="Recipe" 
                                    stroke="#10b981" 
                                    strokeWidth={3} 
                                    dot={{r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff'}} 
                                    activeDot={{r: 6, strokeWidth: 0}}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* PIE CHARTS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div variants={itemVariants} className="bg-white p-6 rounded-3xl shadow-sm border border-orange-100/50">
                    <div className="flex items-center gap-2 mb-4">
                        <PieChartIcon size={20} className="text-purple-500" />
                        <h3 className="text-lg font-bold text-gray-700">Phân bố Tài khoản</h3>
                    </div>
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
                                    stroke="none"
                                >
                                    {userRoleData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white p-6 rounded-3xl shadow-sm border border-orange-100/50">
                    <div className="flex items-center gap-2 mb-4">
                        <PieChartIcon size={20} className="text-orange-500" />
                        <h3 className="text-lg font-bold text-gray-700">Trạng thái Công thức</h3>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={recipeStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="status"
                                    stroke="none"
                                >
                                    {recipeStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );

};

export default AdminDashboardPage;