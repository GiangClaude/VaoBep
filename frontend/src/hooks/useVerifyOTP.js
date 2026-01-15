// File: src/hooks/useVerifyOTP.js
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import authApi from '../api/authApi';

export const useVerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState(''); // Chỉ dùng string để hiển thị lỗi cho dễ
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();
  
  const email = location.state?.email;
  const shouldResend = location.state?.resend;

  const hasSentRef = useRef(false);

  // 1. Kiểm tra Email
  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  useEffect(() => {
    const triggerResend = async() => {
      if (email && shouldResend && !hasSentRef.current){
          hasSentRef.current = true;
          try {
            await authApi.resendOTP(email);
            alert(`Mã OTP mới đã được gửi đến ${email}`);
          } catch (err) {
            console.log("Lỗi gửi lại OTP: ", err);
          }
      }
    };

    triggerResend();
  }, [email, shouldResend]);

  // 2. Xử lý Timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // 3. Logic nhập liệu (Handle Change)
  const handleChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return; // Chỉ cho nhập số

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // 4. Logic xóa và di chuyển (Handle KeyDown)
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // 5. Logic Paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) {
      setError('Chỉ được nhập số');
      return;
    }

    const newOtp = pastedData.split('');
    while (newOtp.length < 6) newOtp.push('');
    setOtp(newOtp.slice(0, 6));
    
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  // 6. Gọi API Verify
  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Vui lòng nhập đủ 6 số');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.verifyOTP({ email, otp: otpValue });
      setSuccess(true);
      alert(response.message || "Xác thực thành công!");
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Lỗi kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  // 7. Gọi API Resend
  const handleResend = async () => {
    if (!canResend) return;
    setTimer(60);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    setError('');
    inputRefs.current[0]?.focus();

    try {
      const response = await authApi.resendOTP(email);
      alert(response.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Không thể gửi lại mã.');
    }
  };

  return {
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
    navigate // Trả về navigate để dùng cho nút Back
  };
};