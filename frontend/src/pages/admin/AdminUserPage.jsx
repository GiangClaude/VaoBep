import React, { useState, useEffect } from 'react';
import useAdminUsers from '../../hooks/admin/useAdminUsers';
import AdminTable from '../../component/admin/AdminTable';
import StatusBadge from '../../component/admin/StatusBadge';
import ConfirmModal from '../../component/admin/ConfirmModal';
import { toast } from 'react-toastify'; // Giả sử bạn dùng react-toastify, nếu không có thể dùng alert

const AdminUserPage = () => {
    const { users, loading, pagination, fetchUsers, toggleStatus, setSearch } = useAdminUsers();
    
    // Local State cho Modal Confirm Block
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);
    
    const handleSearch = (e) => {
        e.preventDefault();
        const keyword = e.target.search.value;
        setSearch(keyword);
        fetchUsers(1, pagination.limit, keyword);
    };

    const onBlockClick = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const confirmBlock = async () => {
        if (!selectedUser) return;
        try {
            await toggleStatus(selectedUser.user_id, selectedUser.account_status);
            setIsModalOpen(false);
            // toast.success("Cập nhật trạng thái thành công!");
        } catch (error) {
            // toast.error("Có lỗi xảy ra");
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý Người dùng</h1>
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input 
                        name="search"
                        type="text" 
                        placeholder="Tìm theo tên/email..." 
                        className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
                        Tìm kiếm
                    </button>
                </form>
            </div>

            {loading ? (
                <div className="text-center py-10">Đang tải danh sách...</div>
            ) : (
                <AdminTable 
                    headers={['Tên', 'Email', 'Vai trò', 'Ngày tham gia', 'Trạng thái', 'Hành động']}
                    pagination={pagination}
                    onPageChange={(page) => fetchUsers(page, pagination.limit)}
                >
                    {users.map(user => (
                        <tr key={user.user_id}>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <div className="flex items-center">
                                    <div className="ml-3">
                                        <p className="text-gray-900 whitespace-no-wrap font-medium">{user.full_name}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{user.email}</td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm uppercase font-bold text-xs text-gray-500">{user.role}</td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                {new Date(user.created_at).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <StatusBadge status={user.account_status} />
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <button 
                                    onClick={() => onBlockClick(user)}
                                    className={`text-xs font-semibold px-3 py-1 rounded ${
                                        user.account_status === 'active' 
                                        ? 'text-red-600 bg-red-100 hover:bg-red-200' 
                                        : 'text-green-600 bg-green-100 hover:bg-green-200'
                                    }`}
                                >
                                    {user.account_status === 'active' ? 'Khóa' : 'Mở khóa'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </AdminTable>
            )}

            <ConfirmModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmBlock}
                title={selectedUser?.account_status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                message={`Bạn có chắc muốn ${selectedUser?.account_status === 'active' ? 'KHÓA' : 'MỞ KHÓA'} người dùng ${selectedUser?.full_name} không?`}
                isDanger={selectedUser?.account_status === 'active'}
                confirmText={selectedUser?.account_status === 'active' ? 'Khóa ngay' : 'Mở khóa'}
            />
        </div>
    );
};

export default AdminUserPage;