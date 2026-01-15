import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Mail, Shield, Activity, Lock, Camera, Award, BookOpen, Users } from 'lucide-react';
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
    
    // Title mapping
    const titleMap = {
        create: 'Thêm User Mới',
        edit: 'Chỉnh Sửa User',
        view: 'Hồ Sơ User'
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-[#fff9f0] rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header Gradient */}
                            <div className="bg-gradient-to-r from-[#ff6b35] to-[#f7931e] px-6 py-4 flex justify-between items-center shrink-0 relative overflow-hidden">
                                {/* Decor */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-10 -translate-y-10 blur-xl"></div>
                                
                                <div className="flex items-center gap-3 relative z-10 text-white">
                                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                                        <User size={20} />
                                    </div>
                                    <h3 className="text-xl font-bold">{titleMap[mode]}</h3>
                                </div>
                                
                                <button 
                                    onClick={onClose} 
                                    className="relative z-10 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 p-1.5 rounded-full transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Body (Scrollable) */}
                            <div className="p-6 overflow-y-auto custom-scrollbar">
                                
                                {/* --- VIEW MODE: Profile Card Style --- */}
                                {isViewMode && userData && (
                                    <div className="flex flex-col items-center">
                                        <div className="relative mb-4">
                                            <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-br from-[#ff6b35] to-[#f7931e] shadow-lg">
                                                <img 
                                                    src={getAvatarUrl(userData.id || userData.user_id, userData.avatar)}
                                                    alt="Avatar" 
                                                    className="w-full h-full rounded-full object-cover border-4 border-white"
                                                />
                                            </div>
                                            <div className={`absolute bottom-1 right-1 px-3 py-1 rounded-full text-xs font-bold text-white border-2 border-white shadow-sm capitalize ${
                                                userData.account_status === 'active' ? 'bg-green-500' : 'bg-red-500'
                                            }`}>
                                                {userData.account_status}
                                            </div>
                                        </div>

                                        <h2 className="text-2xl font-bold text-gray-800">{userData.fullName}</h2>
                                        <p className="text-gray-500 flex items-center gap-1 mb-6">
                                            <Mail size={14} /> {userData.email}
                                        </p>
                                        
                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-3 gap-4 w-full mb-2">
                                            <div className="bg-white p-3 rounded-2xl shadow-sm border border-orange-100 flex flex-col items-center">
                                                <Award className="text-[#ff6b35] mb-1" size={20} />
                                                <span className="font-bold text-lg text-gray-800">{userData.points}</span>
                                                <span className="text-[10px] uppercase text-gray-400 font-bold">Điểm</span>
                                            </div>
                                            <div className="bg-white p-3 rounded-2xl shadow-sm border border-orange-100 flex flex-col items-center">
                                                <BookOpen className="text-green-600 mb-1" size={20} />
                                                <span className="font-bold text-lg text-gray-800">{userData.stats?.recipes || 0}</span>
                                                <span className="text-[10px] uppercase text-gray-400 font-bold">Công thức</span>
                                            </div>
                                            <div className="bg-white p-3 rounded-2xl shadow-sm border border-orange-100 flex flex-col items-center">
                                                <Users className="text-purple-600 mb-1" size={20} />
                                                <span className="font-bold text-lg text-gray-800">{userData.stats?.followers || 0}</span>
                                                <span className="text-[10px] uppercase text-gray-400 font-bold">Follower</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* --- FORM: Create / Edit --- */}
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Info Fields (Ẩn khi View nếu muốn gọn, hoặc hiện read-only) */}
                                    {!isViewMode && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Họ và tên</label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                    <input 
                                                        type="text" 
                                                        className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all outline-none 
                                                            ${mode !== 'create' 
                                                                ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed' 
                                                                : 'bg-white border-gray-200 focus:border-[#ff6b35] text-gray-800'
                                                            }`}
                                                        value={formData.full_name}
                                                        onChange={(e) => mode === 'create' && setFormData({...formData, full_name: e.target.value})}
                                                        disabled={mode !== 'create'}
                                                        placeholder="Nhập họ tên..."
                                                    />
                                                </div>
                                                {mode === 'edit' && <p className="text-xs text-orange-500 mt-1 ml-1 flex items-center gap-1"><Lock size={10} /> Không thể chỉnh sửa thông tin cá nhân</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Email</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                    <input 
                                                        type="email" 
                                                        className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all outline-none 
                                                            ${mode !== 'create' 
                                                                ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed' 
                                                                : 'bg-white border-gray-200 focus:border-[#ff6b35] text-gray-800'
                                                            }`}
                                                        value={formData.email}
                                                        onChange={(e) => mode === 'create' && setFormData({...formData, email: e.target.value})}
                                                        disabled={mode !== 'create'}
                                                        placeholder="example@mail.com"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Password (Chỉ hiện khi Create) */}
                                    {mode === 'create' && (
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Mật khẩu</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <input 
                                                    type="password" 
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-[#ff6b35] outline-none transition-all"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                                    required
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Role & Status Selection */}
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Vai trò</label>
                                            <div className="relative">
                                                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <select 
                                                    className="w-full pl-10 pr-8 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-[#ff6b35] outline-none transition-all appearance-none disabled:bg-gray-100"
                                                    value={formData.role}
                                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                                    disabled={isViewMode}
                                                >
                                                    <option value="user">User</option>
                                                    <option value="vip">VIP Member</option>
                                                    <option value="pro">Pro (Chuyên gia)</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Trạng thái</label>
                                            <div className="relative">
                                                <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <select 
                                                    className="w-full pl-10 pr-8 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-[#ff6b35] outline-none transition-all appearance-none disabled:bg-gray-100"
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
                                    </div>
                                    
                                    {/* Nút Submit ẩn khi View */}
                                    <button type="submit" className="hidden"></button>
                                </form>
                            </div>

                            {/* Footer Actions */}
                            {!isViewMode && (
                                <div className="p-6 border-t border-orange-100 bg-white flex justify-end gap-3 shrink-0">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-5 py-2.5 rounded-xl border-2 border-gray-100 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
                                    >
                                        Hủy bỏ
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white font-bold shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:scale-[1.02] transition-all"
                                    >
                                        {mode === 'create' ? 'Tạo mới' : 'Lưu thay đổi'}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default UserModal;