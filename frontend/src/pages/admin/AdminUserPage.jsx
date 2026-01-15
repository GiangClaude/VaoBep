import React, { useState, useEffect, useCallback } from 'react';
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

    // [CẤU HÌNH CỘT] Cố định độ rộng tại đây
    const columns = [
        { label: 'Tên', key: 'full_name', sortable: true, className: 'w-[20%]' }, 
        { label: 'Email', key: 'email', sortable: true, className: 'w-[25%]' },    
        { label: 'Vai trò', key: 'role', sortable: true, className: 'w-[10%]' },  
        { label: 'Ngày tham gia', key: 'created_at', sortable: true, className: 'w-[15%]' },
        { label: 'Trạng thái', key: 'account_status', sortable: true, className: 'w-[15%]' },
        { label: 'Hành động', key: 'actions', sortable: false, className: 'w-[15%]' },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý Người dùng</h1>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Tìm theo tên/email..." 
                        className="border rounded px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <button 
                        onClick={openCreateModal}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium flex items-center"
                    >
                        <span className="mr-1">+</span> Thêm mới
                    </button>
                </div>
            </div>

            {/* [UX CẢI TIẾN] Luôn render bảng, truyền loading vào trong */}
            <AdminTable 
                columns={columns}
                pagination={pagination}
                onPageChange={(page) => loadData(searchTerm, page, sortConfig.key, sortConfig.order)}
                onSort={handleSort}
                currentSort={sortConfig}
                loading={loading} // Truyền state loading vào đây
            >
                {users.map(user => (
                    <tr key={user.user_id} className="hover:bg-gray-50 transition-colors">
                        {/* Thêm class truncate để cắt chữ nếu quá dài, giữ khung bảng cố định */}
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm truncate" title={user.full_name}>
                            <span className="font-medium text-gray-900">{user.full_name}</span>
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm truncate" title={user.email}>
                            {user.email}
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                user.role === 'pro' ? 'bg-blue-100 text-blue-800' : 
                                'bg-gray-100 text-gray-600'
                            }`}>
                                {user.role.toUpperCase()}
                            </span>
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            {new Date(user.created_at).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            <StatusBadge status={user.account_status} />
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            <div className="flex items-center space-x-2">
                                {/* Nút Xem Chi Tiết */}
                                <button 
                                    onClick={() => openViewModal(user)}
                                    className="text-blue-600 hover:bg-blue-50 p-1 rounded"
                                    title="Xem chi tiết"
                                >
                                    👁️
                                </button>

                                {/* Nút Sửa (Chỉ hiện nếu không phải Admin hoặc là chính mình) */}
                                {user.role !== 'admin' && (
                                    <button 
                                        onClick={() => openEditModal(user)}
                                        className="text-yellow-600 hover:bg-yellow-50 p-1 rounded"
                                        title="Chỉnh sửa quyền"
                                    >
                                        ✏️
                                    </button>
                                )}

                                {/* Nút Khóa (Giữ nguyên) */}
                                {user.role !== 'admin' && (
                                    <button 
                                        onClick={() => onBlockClick(user)}
                                        className={`text-xs font-semibold px-2 py-1 rounded border transition-colors ${
                                            user.account_status === 'active' 
                                            ? 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100' 
                                            : 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100'
                                        }`}
                                    >
                                        {user.account_status === 'active' ? 'Khóa' : 'Mở'}
                                    </button>
                                )}
                            </div>
                        </td>
                    </tr>
                ))}
            </AdminTable>

            <ConfirmModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmBlock}
                title={selectedUser?.account_status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                message={`Bạn có chắc muốn ${selectedUser?.account_status === 'active' ? 'KHÓA' : 'MỞ KHÓA'} người dùng ${selectedUser?.full_name}?`}
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