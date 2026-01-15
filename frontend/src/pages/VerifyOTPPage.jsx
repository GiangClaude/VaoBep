// File: src/pages/VerifyOTPPage.jsx
import React from 'react';
import { Shield, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { useVerifyOTP } from '../hooks/useVerifyOTP';
import Header from '../component/common/Header';
import { Footer } from '../component/common/Footer';

const VerifyOTPPage = () => {
  const {
    email,
    otp,
    inputRefs,
    error,
    success,
    loading,
    timer,
    canResend,
    handleChange,
    handleKeyDown,
    handlePaste,
    handleVerify,
    handleResend,
    navigate
  } = useVerifyOTP();

  // Nếu không có email (đang redirect), không render gì cả
  if (!email) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#fff9f0]">
      {/* 1. Header */}
      <Header />

      {/* 2. Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-orange-100">
          
          {/* Header: Back Button */}
          <div className="flex items-center mb-6">
            <button 
              onClick={() => navigate(-1)} 
              className="text-gray-500 hover:text-[#ff6b35] transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          </div>

          {/* Icon Shield */}
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-[#ff6b35] to-[#f7931e] rounded-full p-4 shadow-lg shadow-orange-200">
              <Shield className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#2d1b0e] mb-2">Xác Thực OTP</h1>
            <p className="text-[#7d5a3f]">Mã xác thực đã được gửi đến</p>
            <p className="text-[#ff6b35] font-bold mt-1 text-lg">{email}</p>
          </div>

          {/* OTP Input Section */}
          <div className="mb-6">
            <div className="flex gap-2 justify-center mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  disabled={loading || success}
                  className={`w-12 h-16 text-center text-2xl font-bold border-2 rounded-xl outline-none transition-all transform focus:-translate-y-1 duration-200 shadow-sm
                    ${success 
                      ? 'border-green-500 bg-green-50 text-green-600' 
                      : error 
                        ? 'border-red-500 bg-red-50 text-red-600' 
                        : digit 
                          ? 'border-[#ff6b35] bg-orange-50 text-[#d95d2e]' // Màu khi đã nhập số
                          : 'border-gray-200 bg-gray-50 hover:border-orange-200' // Màu mặc định
                    }
                    focus:border-[#ff6b35] focus:ring-4 focus:ring-orange-100 focus:bg-white`}
                />
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm text-center mb-4 animate-pulse">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="text-green-600 text-sm text-center mb-4 flex items-center justify-center gap-2 font-semibold bg-green-50 py-2 rounded-xl border border-green-200">
                <CheckCircle className="w-5 h-5" />
                Xác thực thành công! Đang chuyển hướng...
              </div>
            )}
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={loading || success || otp.join('').length !== 6}
            className={`w-full py-3.5 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg flex items-center justify-center gap-2
              ${loading || success || otp.join('').length !== 6
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white hover:from-[#f7931e] hover:to-[#ff6b35] hover:shadow-xl hover:-translate-y-0.5'
              }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Đang xử lý...
              </>
            ) : success ? 'Đã Xác Thực' : 'Xác Thực Ngay'}
          </button>

          {/* Resend / Timer Section */}
          <div className="mt-8 text-center border-t pt-6 border-gray-100">
            <div className="text-sm text-gray-500">
              Không nhận được mã?{' '}
              <div className="mt-2">
                {timer > 0 ? (
                  <p className="text-gray-500 bg-gray-100 inline-block px-3 py-1 rounded-full">
                    Gửi lại sau <span className="font-mono font-bold text-[#ff6b35] ml-1">
                      {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                    </span>
                  </p>
                ) : (
                  <button
                    onClick={handleResend}
                    className="text-[#ff6b35] hover:text-[#e05a2b] font-bold hover:underline transition-all"
                  >
                    Gửi lại mã OTP
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* 3. Footer */}
      <Footer />
    </div>
  );
};

export default VerifyOTPPage;