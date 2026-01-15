// File: src/pages/VerifyOTPPage.jsx
import React from 'react';
import { Shield, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { useVerifyOTP } from '../hooks/useVerifyOTP'; // Import Hook

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        
        {/* Header: Back Button */}
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate(-1)} // Quay lại trang trước
            className="text-gray-600 hover:text-gray-800 transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Icon Shield */}
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full p-4 shadow-lg">
            <Shield className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Xác Thực OTP</h1>
          <p className="text-gray-600">Mã xác thực đã được gửi đến</p>
          <p className="text-indigo-600 font-bold mt-1 text-lg">{email}</p>
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
                // 👇 EDIT: w-12 h-12 (hình vuông), rounded-md (bo góc nhẹ)
                className={`w-12 h-16 text-center text-2xl font-bold border-2 rounded-md outline-none transition-all transform focus:-translate-y-1 duration-200 shadow-sm
                  ${success ? 'border-green-500 bg-green-50 text-green-600' : 
                    error ? 'border-red-500 bg-red-50 text-red-600' : 
                    digit ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 
                    'border-gray-200 bg-gray-50 hover:border-indigo-300'}
                  focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:bg-white`}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md text-sm text-center mb-4 animate-pulse">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="text-green-600 text-sm text-center mb-4 flex items-center justify-center gap-2 font-semibold">
              <CheckCircle className="w-5 h-5" />
              Xác thực thành công! Đang chuyển hướng...
            </div>
          )}
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={loading || success || otp.join('').length !== 6}
          className={`w-full py-3.5 rounded-lg font-bold text-lg transition-all duration-200 shadow-lg flex items-center justify-center gap-2
            ${loading || success || otp.join('').length !== 6
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl hover:-translate-y-0.5'
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
                  Gửi lại sau <span className="font-mono font-bold text-indigo-600 ml-1">
                    {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                  </span>
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  className="text-indigo-600 hover:text-purple-600 font-bold hover:underline transition-all"
                >
                  Gửi lại mã OTP
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VerifyOTPPage;