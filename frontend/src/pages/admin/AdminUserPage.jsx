import React, { useState, useEffect, useCallback } from 'react';
import { Search, UserPlus, Eye, PenLine, Lock, Unlock, Users } from 'lucide-react'; // [MỚI]
import useAdminUsers from '../../hooks/admin/useAdminUsers';
import AdminTable from '../../component/admin/AdminTable';
import StatusBadge from '../../component/admin/StatusBadge';
import ConfirmModal from '../../component/admin/ConfirmModal';
import UserModal from '../../component/admin/UserModal';
import { toast } from 'react-toastify'; 
import debounce from 'lodash.debounce';

const AdminUserPage = () => {
    const { users, loading, pagination, fetchUsers, toggleStatus, createUser, getUser, updateUser } = useAdminUsers();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', order: 'DESC' });
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create', 'view', 'edit'
    const [selectedUserData, setSelectedUserData] = useState(null);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);

    const loadData = (keyword, page, sortKey, sortOrder) => {
        fetchUsers(page, pagination.limit, keyword, sortKey, sortOrder);
    };



    const debouncedSearch = useCallback(
        debounce((keyword) => {
            loadData(keyword, 1, sortConfig.key, sortConfig.order);
        }, 500),
        [sortConfig] 
    );

    useEffect(() => {
        loadData('', 1, 'created_at', 'DESC');
    }, []); 

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedSearch(value);
    };

    const handleSort = (key, order) => {
        setSortConfig({ key, order });
        loadData(searchTerm, pagination.page, key, order); // Giữ nguyên trang hiện tại khi sort nếu muốn
    };

    const onBlockClick = (user) => {
        if (user.role === 'admin') {
            toast.warning("Không thể tương tác với tài khoản Admin!");
            return;
        }
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const confirmBlock = async () => {
        if (!selectedUser) return;
        try {
            await toggleStatus(selectedUser.user_id, selectedUser.account_status);
            setIsModalOpen(false);
            toast.success(`Đã cập nhật trạng thái user: ${selectedUser.full_name}`);
        } catch (error) {
            toast.error("Có lỗi xảy ra");
        }
    };

    const openCreateModal = () => {
        setModalMode('create');
        setSelectedUserData(null);
        setIsUserModalOpen(true);
    };

    const openViewModal = async (user) => {
        try {
            const fullData = await getUser(user.user_id); // Fetch detail
            setModalMode('view');
            setSelectedUserData(fullData);
            setIsUserModalOpen(true);
        } catch (error) {
            toast.error("Không tải được thông tin chi tiết");
        }
    };

    const openEditModal = async (user) => {
        // Edit mode không cần fetch detail full nếu chỉ sửa role/status, 
        // nhưng để chắc chắn có data mới nhất ta cứ fetch (hoặc dùng data từ row bảng cũng được)
        // Ở đây dùng data từ row cho nhanh, vì role/status có sẵn ở row rồi
        setModalMode('edit');
        setSelectedUserData(user); 
        setIsUserModalOpen(true);
    };

    const handleModalSubmit = async (formData) => {
        try {
            if (modalMode === 'create') {
                await createUser(formData);
                toast.success("Tạo người dùng thành công");
            } else if (modalMode === 'edit') {
                // Chỉ gửi role và status
                await updateUser(selectedUserData.user_id, {
                    role: formData.role,
                    account_status: formData.account_status
                });
                toast.success("Cập nhật người dùng thành công");
            }
            setIsUserModalOpen(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Có lỗi xảy ra");
        }
    };

// [CẤU HÌNH CỘT]
    const columns = [
        { label: 'Người dùng', key: 'full_name', sortable: true, className: 'w-[30%]' }, 
        { label: 'Vai trò', key: 'role', sortable: true, className: 'w-[15%]' },  
        { label: 'Ngày tham gia', key: 'created_at', sortable: true, className: 'w-[15%]' },
        { label: 'Trạng thái', key: 'account_status', sortable: true, className: 'w-[15%]' },
        { label: 'Hành động', key: 'actions', sortable: false, className: 'w-[25%]' },
    ];

    return (
        <div className="space-y-6">
            {/* HEADER TOOLBAR */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg text-[#ff6b35]">
                        <Users size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Quản lý Người dùng</h1>
                        <p className="text-sm text-gray-500">Danh sách tài khoản hệ thống</p>
                    </div>
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                    {/* Search Input */}
                    <div className="relative flex-1 sm:w-64">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Tìm tên, email..." 
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-orange-200 focus:ring-4 focus:ring-orange-50 outline-none transition-all text-sm font-medium text-gray-700 placeholder-gray-400"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                    
                    {/* Add Button */}
                    <button 
                        onClick={openCreateModal}
                        className="bg-gradient-to-r from-[#ff6b35] to-[#f7931e] hover:shadow-lg hover:shadow-orange-200 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95 shrink-0"
                    >
                        <UserPlus size={18} />
                        <span className="hidden sm:inline">Thêm mới</span>
                    </button>
                </div>
            </div>

            {/* TABLE */}
            <AdminTable 
                columns={columns}
                pagination={pagination}
                onPageChange={(page) => loadData(searchTerm, page, sortConfig.key, sortConfig.order)}
                onSort={handleSort}
                currentSort={sortConfig}
                loading={loading}
            >
                {users.map(user => (
                    <tr key={user.user_id} className="group hover:bg-orange-50/30 transition-colors border-b border-gray-100 last:border-none">
                        {/* User Info Column */}
                        <td className="px-5 py-4">
                            <div className="flex flex-col">
                                <span className="font-bold text-gray-800 text-sm truncate" title={user.full_name}>{user.full_name}</span>
                                <span className="text-xs text-gray-500 truncate" title={user.email}>{user.email}</span>
                            </div>
                        </td>

                        {/* Role Column */}
                        <td className="px-5 py-4">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                                user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                user.role === 'pro' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                                'bg-gray-50 text-gray-600 border-gray-100'
                            }`}>
                                {user.role.toUpperCase()}
                            </span>
                        </td>

                        {/* Date Column */}
                        <td className="px-5 py-4 text-sm text-gray-600 font-medium">
                            {new Date(user.created_at).toLocaleDateString('vi-VN')}
                        </td>

                        {/* Status Column */}
                        <td className="px-5 py-4">
                            <StatusBadge status={user.account_status} />
                        </td>

                        {/* Actions Column */}
                        <td className="px-5 py-4">
                            <div className="flex items-center gap-2 opacity-100 sm:opacity-100 sm:group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => openViewModal(user)}
                                    className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                    title="Xem chi tiết"
                                >
                                    <Eye size={16} />
                                </button>

                                {user.role !== 'admin' && (
                                    <button 
                                        onClick={() => openEditModal(user)}
                                        className="p-2 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                                        title="Chỉnh sửa"
                                    >
                                        <PenLine size={16} />
                                    </button>
                                )}

                                {user.role !== 'admin' && (
                                    <button 
                                        onClick={() => onBlockClick(user)}
                                        className={`p-2 rounded-lg transition-colors ${
                                            user.account_status === 'active' 
                                            ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                                            : 'text-green-600 bg-green-50 hover:bg-green-100'
                                        }`}
                                        title={user.account_status === 'active' ? 'Khóa tài khoản' : 'Mở khóa'}
                                    >
                                        {user.account_status === 'active' ? <Lock size={16} /> : <Unlock size={16} />}
                                    </button>
                                )}
                            </div>
                        </td>
                    </tr>
                ))}
            </AdminTable>

            {/* MODALS */}
            <ConfirmModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmBlock}
                title={selectedUser?.account_status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                message={`Bạn có chắc muốn ${selectedUser?.account_status === 'active' ? 'KHÓA' : 'MỞ KHÓA'} người dùng ${selectedUser?.full_name}? Hành động này sẽ ảnh hưởng đến quyền truy cập của họ.`}
                isDanger={selectedUser?.account_status === 'active'}
                confirmText={selectedUser?.account_status === 'active' ? 'Khóa ngay' : 'Mở khóa'}
            />

            <UserModal 
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
                mode={modalMode}
                userData={selectedUserData}
                onSubmit={handleModalSubmit}
            />
        </div>
    );
};

export default AdminUserPage;