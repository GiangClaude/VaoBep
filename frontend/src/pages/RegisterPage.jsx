// File: src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useRegister } from '../hooks/useRegister';
import Header from '../component/common/Header';
import { Footer } from '../component/common/Footer';

const RegisterPage = () => {
  const {
    registerData,
    setRegisterData,
    errors,
    loading,
    agreedToTerms,
    setAgreedToTerms,
    handleRegisterSubmit
  } = useRegister();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#fff9f0]">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-orange-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#2d1b0e] mb-2">Đăng Ký</h1>
            <p className="text-[#7d5a3f]">Trở thành thành viên của cộng đồng yêu bếp</p>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-5">
            {/* Họ tên */}
            <div>
              <label className="block text-sm font-medium text-[#2d1b0e] mb-2">Họ và tên</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={registerData.fullName}
                  onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent outline-none transition bg-gray-50 focus:bg-white"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#2d1b0e] mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  autoComplete='email'
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent outline-none transition bg-gray-50 focus:bg-white"
                  placeholder="example@email.com"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Mật khẩu */}
            <div>
              <label className="block text-sm font-medium text-[#2d1b0e] mb-2">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete='new-password'
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
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

            {/* Xác nhận mật khẩu */}
            <div>
              <label className="block text-sm font-medium text-[#2d1b0e] mb-2">Xác nhận mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete='new-password'
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent outline-none transition bg-gray-50 focus:bg-white"
                  placeholder="••••••••"
                />
                 <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#ff6b35] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Error Message từ API */}
            {errors.api && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl relative mb-4" role="alert">
                <span className="block sm:inline">{errors.api}</span>
              </div>
            )}

            {/* Checkbox Điều khoản */}
            <div className="flex items-start">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-[#ff6b35] focus:ring-[#ff6b35] mt-1 mr-2 cursor-pointer"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
              />
              <span className="text-sm text-gray-600">
                Tôi đồng ý với{' '}
                <Link to="/terms" className="text-[#ff6b35] hover:text-[#e05a2b] font-medium transition-colors">
                  Điều khoản dịch vụ
                </Link>
                {' '}và{' '}
                <Link to="/privacy" className="text-[#ff6b35] hover:text-[#e05a2b] font-medium transition-colors">
                  Chính sách bảo mật
                </Link>
              </span>
            </div>
            
            {errors.terms && (
              <span className="text-sm text-red-600 mt-1 block">{errors.terms}</span>
            )}

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
              {loading ? 'Đang xử lý...' : 'Đăng Ký'}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <p className="text-gray-600">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-[#ff6b35] font-bold hover:underline">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RegisterPage;