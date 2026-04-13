import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useResetPassword } from '../hooks/useResetPassword';
import Header from '../component/common/Header';
import { Footer } from '../component/common/Footer';
import Modal from '../component/common/modal';
import { useNavigate } from 'react-router-dom';

const ResetPasswordPage = () => {
    const { passwords, setPasswords, errors, loading, handleSubmit, email, successMessage, clearSuccess } = useResetPassword();
    const navigate = useNavigate();
    
    // State quản lý việc show/hide password (UI Only)
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Tránh render lỗi nếu useEffect đang redirect
    if (!email) return null; 

    return (
        <div className="min-h-screen flex flex-col bg-[#fff9f0]">
            <Header />
            <main className="flex-1 flex items-center justify-center p-4 py-12">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-orange-100">
                    
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-[#2d1b0e] mb-2">Tạo Mật Khẩu Mới</h1>
                        <p className="text-[#7d5a3f]">Vui lòng nhập mật khẩu mới cho tài khoản của bạn.</p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-medium text-[#2d1b0e] mb-2">Mật khẩu mới</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={passwords.newPassword}
                                    onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff6b35] outline-none transition bg-gray-50 focus:bg-white"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#ff6b35]"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-[#2d1b0e] mb-2">Xác nhận mật khẩu</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    value={passwords.confirmPassword}
                                    onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff6b35] outline-none transition bg-gray-50 focus:bg-white"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#ff6b35]"
                                >
                                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                        </div>

                        {/* API Error */}
                        {errors.api && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                                {errors.api}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg ${
                                loading 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-[#ff6b35] to-[#f7931e] hover:shadow-xl transform active:scale-[0.98]'
                            }`}
                        >
                            {loading ? 'Đang cập nhật...' : 'Xác nhận đổi mật khẩu'}
                        </button>
                    </form>
                </div>
            </main>
            <Footer />

            {/* Success Modal */}
            <Modal
                isOpen={!!successMessage}
                onClose={() => clearSuccess()}
                title="Đổi mật khẩu thành công"
                message={successMessage}
                type="success"
                actions={[
                    {
                        label: 'Đăng nhập',
                        onClick: () => navigate('/login'),
                        style: 'primary'
                    },
                    {
                        label: 'Đóng',
                        onClick: () => clearSuccess(),
                        style: 'secondary'
                    }
                ]}
            />
        </div>
    );
};

export default ResetPasswordPage;