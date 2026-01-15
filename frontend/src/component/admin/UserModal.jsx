import React, { useState, useEffect } from 'react';
import { getAvatarUrl } from '../../utils/imageHelper';

const UserModal = ({ isOpen, onClose, mode, userData, onSubmit }) => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        role: 'user',
        account_status: 'active'
    });

    // Reset form khi mở modal hoặc thay đổi mode/userData
    useEffect(() => {
        if (isOpen) {
            if (mode === 'create') {
                setFormData({ full_name: '', email: '', password: '', role: 'user', account_status: 'pending' });
            } else if (userData) {
                setFormData({
                    full_name: userData.fullName || userData.full_name || '',
                    email: userData.email || '',
                    password: '', // Không hiển thị password cũ
                    role: userData.role || 'user',
                    account_status: userData.account_status || 'active'
                });
            }
        }
    }, [isOpen, mode, userData]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const isViewMode = mode === 'view';
    const isEditMode = mode === 'edit';
    const title = mode === 'create' ? 'Thêm người dùng mới' : mode === 'edit' ? 'Chỉnh sửa người dùng' : 'Thông tin chi tiết';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 overflow-hidden animate-fade-in-down">
                
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 font-bold text-xl">&times;</button>
                </div>

                {/* Body */}
                <div className="p-6 max-h-[80vh] overflow-y-auto">
                    
                    {/* Phần hiển thị Avatar & Stats cho chế độ VIEW */}
                    {isViewMode && userData && (
                        <div className="flex flex-col items-center mb-6">
                            <img 
                                src={getAvatarUrl(userData.id || userData.user_id, userData.avatar)}
                                alt="Avatar" 
                                className="w-24 h-24 rounded-full object-cover mb-3 border border-gray-300"
                            />
                            <h2 className="text-xl font-bold">{userData.fullName}</h2>
                            <p className="text-gray-500 text-sm">{userData.email}</p>
                            
                            <div className="flex space-x-6 mt-4 w-full justify-center">
                                <div className="text-center p-2 bg-gray-50 rounded min-w-[80px]">
                                    <span className="block font-bold text-lg text-blue-600">{userData.points}</span>
                                    <span className="text-xs text-gray-500 uppercase">Điểm</span>
                                </div>
                                <div className="text-center p-2 bg-gray-50 rounded min-w-[80px]">
                                    <span className="block font-bold text-lg text-green-600">{userData.stats?.recipes || 0}</span>
                                    <span className="text-xs text-gray-500 uppercase">Công thức</span>
                                </div>
                                <div className="text-center p-2 bg-gray-50 rounded min-w-[80px]">
                                    <span className="block font-bold text-lg text-purple-600">{userData.stats?.followers || 0}</span>
                                    <span className="text-xs text-gray-500 uppercase">Follower</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Tên & Email (Chỉ nhập khi Create, View/Edit chỉ xem - Edit không cho sửa info này theo yêu cầu) */}
                        {!isViewMode && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
                                    <input 
                                        type="text" 
                                       className={`mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 
                                            ${mode !== 'create' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900'}
                                        `}
                                        value={formData.full_name}
                                        onChange={(e) => mode === 'create' && setFormData({...formData, full_name: e.target.value})}
                                        disabled={mode !== 'create'} // Chỉ cho nhập khi tạo mới
                                    />
                                    {mode === 'edit' && <p className="text-xs text-red-500 mt-1">*Không thể chỉnh sửa thông tin cá nhân</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input 
                                        type="email" 
                                        className={`mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 
                                            ${mode !== 'create' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900'}
                                        `}
                                        value={formData.email}
                                        onChange={(e) => mode === 'create' && setFormData({...formData, email: e.target.value})}
                                        disabled={mode !== 'create'}
                                    />
                                </div>
                            </>
                        )}

                        {/* Password (Chỉ hiện khi Create) */}
                        {mode === 'create' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                                <input 
                                    type="password" 
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    required
                                />
                            </div>
                        )}

                        {/* Role & Status (Editable for Edit & Create, Read-only for View) */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Vai trò</label>
                                <select 
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                    value={formData.role}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                    disabled={isViewMode}
                                >
                                    <option value="user">User</option>
                                    <option value="vip">VIP</option>
                                    <option value="pro">Pro (Chuyên gia)</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                                <select 
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                    value={formData.account_status}
                                    onChange={(e) => setFormData({...formData, account_status: e.target.value})}
                                    disabled={isViewMode}
                                >
                                    <option value="active">Active</option>
                                    <option value="pending">Pending</option>
                                    <option value="blocked">Blocked</option>
                                </select>
                            </div>
                        </div>

                        {/* Actions */}
                        {!isViewMode && (
                            <div className="flex justify-end pt-4 space-x-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                                >
                                    {mode === 'create' ? 'Tạo mới' : 'Lưu thay đổi'}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserModal;