import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
// [MỚI] Import icons và animation
import { LayoutDashboard, Users, UtensilsCrossed, Carrot, Flag, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

const AdminSidebar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    
    // [THÊM] State quản lý trạng thái đóng/mở sidebar
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // const menuItems = [
    //     { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    //     { path: '/admin/users', label: 'Quản lý User', icon: Users },
    //     { path: '/admin/recipes', label: 'Quản lý Recipe', icon: UtensilsCrossed },
    //     { path: '/admin/ingredients', label: 'Duyệt Nguyên liệu', icon: Carrot },
    //     { path: '/admin/reports', label: 'Xử lý Báo cáo', icon: Flag },
    // ];

    const menuItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/users', label: 'Quản lý User', icon: Users },
        { path: '/admin/recipes', label: 'Quản lý Recipe', icon: UtensilsCrossed },
        { path: '/admin/ingredients', label: 'Duyệt Nguyên liệu', icon: Carrot },
    ];


    return (
        // [CẬP NHẬT] Style mới: Nền trắng, shadow cam nhạt, bo góc mềm mại
        <motion.div 
            initial={{ width: 256 }}
            animate={{ width: isCollapsed ? 80 : 260 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white text-gray-700 h-screen flex flex-col relative border-r-2 border-orange-100 shadow-[4px_0_24px_rgba(255,107,53,0.08)] z-50"
        >
            {/* [MỚI] Nút Toggle Sidebar (Hình tròn nổi bật) */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-4 top-8 bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white p-1.5 rounded-full shadow-lg hover:shadow-orange-300/50 hover:scale-110 transition-all focus:outline-none z-50 border-2 border-white"
            >
                {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>

            {/* Header: Logo / Title */}
            <div className="p-6 flex items-center justify-center h-24">
                <div className={`font-bold transition-all duration-300 whitespace-nowrap overflow-hidden flex items-center gap-2 ${isCollapsed ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
                    {/* Giả lập Logo Text phong cách cute */}
                    <span className="text-3xl text-[#ff6b35]">AdminPanel</span>
                    {/* <span className="text-xl text-gray-400"></span> */}
                </div>
                {/* Logo thu gọn */}
                <div className={`absolute transition-all duration-300 font-black text-2xl text-[#ff6b35] ${isCollapsed ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                    AP
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-3 mt-4">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        title={isCollapsed ? item.label : ""}
                        className={({ isActive }) =>
                            `flex items-center rounded-xl transition-all duration-300 relative group overflow-hidden ${
                                isCollapsed ? 'justify-center p-3' : 'px-4 py-3 space-x-3'
                            } ${
                                isActive 
                                    // Active: Gradient Cam, Chữ trắng, Bóng đổ
                                    ? 'bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white shadow-md shadow-orange-200' 
                                    // Inactive: Hover nền cam nhạt, chữ xám đậm
                                    : 'text-gray-600 hover:bg-[#fff9f0] hover:text-[#ff6b35]'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {/* Icon render */}
                                <item.icon 
                                    size={22} 
                                    className={`min-w-[22px] transition-transform duration-300 ${isActive ? 'animate-pulse-slow' : 'group-hover:scale-110'}`} 
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                
                                {/* Label text */}
                                {!isCollapsed && (
                                    <motion.span 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="font-medium whitespace-nowrap"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-orange-100 bg-[#fff9f0]/50">
                <button
                    onClick={handleLogout}
                    className={`w-full flex items-center rounded-xl transition-all duration-300 hover:bg-red-50 text-gray-500 hover:text-red-500 border border-transparent hover:border-red-100 ${
                        isCollapsed ? 'justify-center p-3' : 'px-4 py-3 space-x-3'
                    }`}
                    title={isCollapsed ? "Đăng xuất" : ""}
                >
                    <LogOut size={22} />
                    {!isCollapsed && <span className="font-medium">Đăng xuất</span>}
                </button>
            </div>
        </motion.div>
    );
};

export default AdminSidebar;