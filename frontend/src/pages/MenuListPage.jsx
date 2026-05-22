import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMenu } from '../hooks/useMenu';

const MenuListPage = () => {
    const navigate = useNavigate();
    const { fetchMyMenus, createNewMenu, isLoading, error } = useMenu();
    const [menus, setMenus] = useState([]);

    useEffect(() => {
        const loadMenus = async () => {
            const data = await fetchMyMenus();
            if (data) setMenus(data);
        };
        loadMenus();
    }, [fetchMyMenus]);

    const handleCreateBlankMenu = async () => {
        // Tạo nhanh 1 thực đơn trống
        const result = await createNewMenu({ 
            name: "Thực đơn mới chưa đặt tên",
            days: [] // Backend sẽ tự xử lý mảng rỗng
        });
        
        if (result.success && result.data.menu_id) {
            navigate(`/menus/planner/${result.data.menu_id}`);
        } else {
            alert("Lỗi tạo thực đơn: " + result.message);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Đang tải danh sách thực đơn...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Lỗi: {error}</div>;

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Thực đơn của tôi</h1>
                <button 
                    onClick={handleCreateBlankMenu}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow transition"
                >
                    + Tạo thực đơn mới
                </button>
            </div>

            {menus.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500 mb-4">Bạn chưa có thực đơn nào.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menus.map((menu) => (
                        <div 
                            key={menu.menu_id} 
                            className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md cursor-pointer transition"
                            onClick={() => navigate(`/menus/planner/${menu.menu_id}`)}
                        >
                            <h3 className="text-xl font-semibold text-gray-800 mb-2 truncate">{menu.name}</h3>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                                {menu.description || "Chưa có mô tả"}
                            </p>
                            <div className="flex justify-between items-center text-xs text-gray-400">
                                <span>{menu.total_days} ngày</span>
                                <span>{menu.is_public ? '🌍 Công khai' : '🔒 Riêng tư'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MenuListPage;