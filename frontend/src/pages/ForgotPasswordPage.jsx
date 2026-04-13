import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { useForgotPassword } from '../hooks/useForgotPassword';
import Header from '../component/common/Header';
import { Footer } from '../component/common/Footer';

const ForgotPasswordPage = () => {
    const { email, setEmail, error, loading, handleSubmit, navigate } = useForgotPassword();

    return (
        <div className="min-h-screen flex flex-col bg-[#fff9f0]">
            <Header />
            <main className="flex-1 flex items-center justify-center p-4 py-12">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-orange-100">
                    
                    <div className="flex items-center mb-6">
                        <button onClick={() => navigate('/login')} className="text-gray-500 hover:text-[#ff6b35] transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-[#2d1b0e] mb-2">Quên Mật Khẩu</h1>
                        <p className="text-[#7d5a3f]">Nhập email của bạn để nhận mã xác thực (OTP) đặt lại mật khẩu.</p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-[#2d1b0e] mb-2">Email của bạn</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent outline-none transition bg-gray-50 focus:bg-white"
                                    placeholder="example@email.com"
                                />
                            </div>
                            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg ${
                                loading 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-[#ff6b35] to-[#f7931e] hover:shadow-xl transform active:scale-[0.98]'
                            }`}
                        >
                            {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
                        </button>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ForgotPasswordPage;