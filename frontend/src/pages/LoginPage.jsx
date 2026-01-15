// File: src/pages/LoginPage.jsx
import React, { useState } from 'react'; // React 17+ không bắt buộc import React nhưng cứ để cho chắc
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useLogin } from '../hooks/useLogin'; // Import Hook vừa tạo
import "../index.css";

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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Đăng Nhập</h1>
                    <p className="text-gray-600">Chào mừng bạn quay trở lại!</p>
                </div>
                
                <form onSubmit={handleLoginSubmit} className="space-y-6">
                    {/* Input Email */}
                    <div>

                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="email"
                                autoComplete='email'
                                value={loginData.email}
                                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="example@email.com"
                            />
                        </div>
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                    
                    {/* Input Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type={showPassword ? "text" : "password"}
                                autoComplete='current-password'
                                value={loginData.password}
                                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>

                    {/* Hiển thị lỗi API và Link Verify */}
                    {errors.api && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                            <span className="block sm:inline">{errors.api}</span>
                            {errors.notVerified && (
                                <span className="block sm:inline sm:ml-2">
                                    <Link
                                        to='/verify-otp'
                                        state={{
                                            email: loginData.email,
                                            resend: true
                                        }}
                                        className="font-bold text-red-800 hover:text-red-900 underline"
                                    >
                                        Xác thực ngay
                                    </Link>
                                </span>
                            )}
                        </div>
                    )}
                    
                    {/* Các phần phụ khác */}
                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center">
                            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2" />
                            <span className="text-gray-600">Ghi nhớ đăng nhập</span>
                        </label>
                        <Link 
                            to="/forgot-password" 
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Quên mật khẩu?
                        </Link>
                    </div>
                    
                    {/* Nút Submit có loading */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-lg font-semibold text-white transition duration-200 shadow-lg hover:shadow-xl ${
                            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
                    </button>
                </form>
                
                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Chưa có tài khoản?{' '}
                        <Link to="/register" className="text-blue-600 font-medium hover:underline">
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;