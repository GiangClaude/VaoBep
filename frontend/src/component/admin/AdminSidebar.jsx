import React, { useState } from 'react'; // [SỬA] Import thêm useState
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

const AdminSidebar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    
    // [THÊM] State quản lý trạng thái đóng/mở sidebar
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/admin/users', label: 'Quản lý User', icon: '👥' },
        { path: '/admin/recipes', label: 'Quản lý Recipe', icon: '🍳' },
        { path: '/admin/ingredients', label: 'Duyệt Nguyên liệu', icon: '🥕' },
        { path: '/admin/reports', label: 'Xử lý Báo cáo', icon: '🚩' },
    ];

    return (
        // [SỬA] Thay đổi w-64 cố định thành dynamic width & thêm transition, relative
        <div 
            className={`${
                isCollapsed ? 'w-20' : 'w-64'
            } bg-gray-900 text-white min-h-screen flex flex-col transition-all duration-300 relative border-r border-gray-800`}
        >
            {/* [THÊM] Nút Toggle Sidebar (Mũi tên) */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-9 bg-blue-600 hover:bg-blue-700 text-white p-1 rounded-full shadow-lg transition-transform focus:outline-none z-50 border border-gray-800"
                title={isCollapsed ? "Mở rộng" : "Thu gọn"}
            >
                {isCollapsed ? (
                    // Mũi tên phải (>)
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                ) : (
                    // Mũi tên trái (<)
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                )}
            </button>

            {/* [SỬA] Header: Ẩn chữ hoặc hiện viết tắt khi đóng */}
            <div className={`p-6 border-b border-gray-700 flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} h-20`}>
                <div className={`font-bold transition-all duration-300 whitespace-nowrap overflow-hidden ${isCollapsed ? 'text-xl' : 'text-2xl'}`}>
                    {isCollapsed ? 'AP' : 'Admin Panel'}
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        // [SỬA] Điều chỉnh padding và căn lề khi đóng/mở
                        className={({ isActive }) =>
                            `flex items-center rounded transition-colors duration-200 ${
                                isCollapsed ? 'justify-center px-2 py-3' : 'space-x-3 px-4 py-3'
                            } ${
                                isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                            }`
                        }
                        title={isCollapsed ? item.label : ""} // Hiện tooltip khi đóng
                    >
                        <span className="text-xl">{item.icon}</span>
                        {/* [SỬA] Ẩn label khi đóng */}
                        {!isCollapsed && <span className="whitespace-nowrap overflow-hidden transition-all duration-300">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-700">
                <button
                    onClick={handleLogout}
                    // [SỬA] Điều chỉnh nút đăng xuất
                    className={`w-full flex items-center rounded transition bg-red-600 hover:bg-red-700 text-white ${
                        isCollapsed ? 'justify-center px-2 py-2' : 'justify-center space-x-2 py-2'
                    }`}
                    title={isCollapsed ? "Đăng xuất" : ""}
                >
                    <span>🚪</span>
                    {!isCollapsed && <span>Đăng xuất</span>}
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;