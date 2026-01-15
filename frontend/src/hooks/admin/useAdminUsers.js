import { useState, useEffect, useCallback } from 'react';
import adminApi from '../../api/adminApi';

const useAdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
    const [search, setSearch] = useState('');

    // Hàm lấy danh sách user
    const fetchUsers = useCallback(async (page = 1, limit = 10, keyword = '') => {
        try {
            setLoading(true);
            const response = await adminApi.getUsers({ page, limit, search: keyword });
            // API trả về: { users: [...], pagination: {...} } (theo Backend đã sửa ở User Controller)
            // Hoặc { data: [...], pagination: {...} } (theo Backend Admin Controller)
            // Cần check lại AdminController trả về key nào. 
            // AdminController.getUsers trả về: { data: users, pagination: ... }
            
            const { data, pagination: pagingData } = response.data;
            setUsers(data || []);
            setPagination(pagingData);
        } catch (err) {
            console.error("Fetch Users Error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Tự động fetch khi search hoặc đổi page thay đổi (nếu muốn), 
    // ở đây ta để Page gọi hàm fetchUsers chủ động sẽ kiểm soát tốt hơn.

    // Hàm Block/Unblock
    const toggleStatus = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
        try {
            await adminApi.updateUserStatus(userId, newStatus);
            // Cập nhật lại state local ngay lập tức để UI mượt mà
            setUsers(prev => prev.map(u => 
                u.user_id === userId ? { ...u, account_status: newStatus } : u
            ));
            return true;
        } catch (err) {
            console.error("Toggle Status Error:", err);
            throw err;
        }
    };

    // Hàm tạo user
    const createUser = async (userData) => {
        try {
            await adminApi.createUser(userData);
            // Refresh lại danh sách sau khi tạo
            fetchUsers(1, pagination.limit, search); 
            return true;
        } catch (err) {
            throw err;
        }
    };

    return { 
        users, 
        loading, 
        pagination, 
        fetchUsers, 
        toggleStatus, 
        createUser,
        setSearch // Để component search update state này
    };
};

export default useAdminUsers;