import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
    return (
        <div className="flex min-h-screen bg-gray-100 font-sans">
            {/* Sidebar cố định bên trái */}
            <AdminSidebar />

            {/* Phần nội dung chính thay đổi dynamic */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="bg-white shadow p-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Hệ thống quản lý VaoBep</h2>
                    <div className="text-sm text-gray-500">Xin chào, Admin</div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;