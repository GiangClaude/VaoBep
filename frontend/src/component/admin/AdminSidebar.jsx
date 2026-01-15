import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

const AdminSidebar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

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
        <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
            <div className="p-6 text-2xl font-bold border-b border-gray-700">
                Admin Panel
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center space-x-3 px-4 py-3 rounded transition-colors ${
                                isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                            }`
                        }
                    >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="p-4 border-t border-gray-700">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded transition"
                >
                    <span>🚪</span>
                    <span>Đăng xuất</span>
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;