// File: src/pages/LoginPage.jsx
import React, { useState } from 'react'; // React 17+ không bắt buộc import React nhưng cứ để cho chắc
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useLogin } from '../hooks/useLogin'; // Import Hook vừa tạo
import "../index.css";
import Header from '../component/common/Header';
import { Footer } from '../component/common/Footer';

const LoginPage = () => {
    // Gọi Hook để lấy toàn bộ logic và state
    const { 
        loginData, 
        setLoginData, 
        errors, 
        loading, 
        handleLoginSubmit 
    } = useLogin();

    // State UI thuần túy (hiện/ẩn mật khẩu) thì để lại ở đây là hợp lý
    const [showPassword, setShowPassword] = useState(false);

return (
        <div className="min-h-screen flex flex-col bg-[#fff9f0]">
            {/* 1. Header */}
            <Header />

            {/* 2. Main Content */}
            <main className="flex-1 flex items-center justify-center p-4 py-12">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-orange-100">

                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-[#2d1b0e] mb-2">Đăng Nhập</h1>
                        <p className="text-[#7d5a3f]">Chào mừng bạn quay trở lại căn bếp nhỏ!</p>
                    </div>
                    
                    <form onSubmit={handleLoginSubmit} className="space-y-6">
                        {/* Input Email */}
                        <div>
                            <label className="block text-sm font-medium text-[#2d1b0e] mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="email"
                                    autoComplete='email'
                                    value={loginData.email}
                                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent outline-none transition bg-gray-50 focus:bg-white"
                                    placeholder="example@email.com"
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>
                        
                        {/* Input Password */}
                        <div>
                            <label className="block text-sm font-medium text-[#2d1b0e] mb-2">Mật khẩu</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    autoComplete='current-password'
                                    value={loginData.password}
                                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent outline-none transition bg-gray-50 focus:bg-white"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#ff6b35] transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                        </div>

                        {/* API Error & Verify Link */}
                        {errors.api && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl relative mb-4 flex flex-col gap-1" role="alert">
                                <span className="block sm:inline">{errors.api}</span>
                                {errors.notVerified && (
                                    <Link
                                        to='/verify-otp'
                                        state={{ email: loginData.email, resend: true }}
                                        className="font-bold text-red-800 hover:text-red-900 underline w-fit"
                                    >
                                        Xác thực ngay &rarr;
                                    </Link>
                                )}
                            </div>
                        )}
                        
                        {/* Remember & Forgot Password */}
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="rounded border-gray-300 text-[#ff6b35] focus:ring-[#ff6b35] mr-2" 
                                />
                                <span className="text-gray-600">Ghi nhớ đăng nhập</span>
                            </label>
                            <Link 
                                to="/forgot-password" 
                                className="text-[#ff6b35] hover:text-[#e05a2b] font-medium transition-colors"
                            >
                                Quên mật khẩu?
                            </Link>
                        </div>
                        
                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-xl transform active:scale-[0.98] ${
                                loading 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-[#ff6b35] to-[#f7931e] hover:from-[#f7931e] hover:to-[#ff6b35]'
                            }`}
                        >
                            {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
                        </button>
                    </form>
                    
                    <div className="mt-8 text-center border-t border-gray-100 pt-6">
                        <p className="text-gray-600">
                            Chưa có tài khoản?{' '}
                            <Link to="/register" className="text-[#ff6b35] font-bold hover:underline">
                                Đăng ký ngay
                            </Link>
                        </p>
                    </div>
                </div>
            </main>

            {/* 3. Footer */}
            <Footer />
        </div>
    );
}

export default LoginPage;