// frontend/src/hooks/ui/auth/useAuthForms.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useGlobalModal } from '../../../context/ModalContext';
import { 
    useLoginMutation, 
    useRegisterMutation,
    useVerifyOTPMutation, // Dùng để kích hoạt tài khoản (Register)
    useVerifyOTPOnlyMutation, // Dùng để check OTP (Forgot Password)
    useResendOTPMutation  
} from '../../mutations/useAuthMutations';

export const useLoginForm = () => {
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const loginMutation = useLoginMutation();

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        
        if (!loginData.email || !loginData.password) {
            setErrors({ api: "Vui lòng nhập đủ email và mật khẩu" });
            return;
        }

        try {
            const res = await loginMutation.mutateAsync(loginData);
            if (res.success) {
                navigate('/homepage');
            } else {
                setErrors({ 
                    api: res.message, 
                    notVerified: res.message.includes("chưa được xác thực") 
                });
            }
        } catch (err) {
            setErrors({ api: err.message || "Lỗi kết nối" });
        }
    };

    return { loginData, setLoginData, errors, loading: loginMutation.isPending, handleLoginSubmit };
};

export const useRegisterForm = () => {
    const [registerData, setRegisterData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const registerMutation = useRegisterMutation();

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!registerData.fullName) newErrors.fullName = 'Họ tên không được trống';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) newErrors.email = 'Email không hợp lệ';
        if (registerData.password.length < 6) newErrors.password = 'Mật khẩu > 6 ký tự';
        if (registerData.password !== registerData.confirmPassword) newErrors.confirmPassword = 'Mật khẩu không khớp';
        if (!agreedToTerms) newErrors.terms = "Vui lòng đồng ý điều khoản";

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            try {
                await registerMutation.mutateAsync({
                    name: registerData.fullName, email: registerData.email, password: registerData.password
                });
                navigate('/verify-otp', { state: { email: registerData.email } });
            } catch (err) {
                setErrors({ api: err.message });
            }
        }
    };

    return { registerData, setRegisterData, agreedToTerms, setAgreedToTerms, errors, loading: registerMutation.isPending, handleRegisterSubmit };
};

// Thêm vào cuối file frontend/src/hooks/ui/auth/useAuthForms.js


// 1. Hook Quên Mật Khẩu
export const useForgotPasswordForm = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const forgotMutation = useForgotPasswordMutation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!email) return setError("Vui lòng nhập email");

        try {
            await forgotMutation.mutateAsync(email);
            // Thành công -> Chuyển hướng sang trang OTP kèm "intent" là quên mật khẩu
            navigate('/verify-otp', { state: { email, intent: 'reset_password' } });
        } catch (err) {
            setError(err.message || "Không thể gửi yêu cầu. Vui lòng kiểm tra lại email.");
        }
    };

    return { email, setEmail, error, loading: forgotMutation.isPending, handleSubmit, navigate };
};

// 2. Hook Reset Mật Khẩu Mới
export const useResetPasswordForm = () => {
    const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState(null);
    
    const navigate = useNavigate();
    const location = useLocation();
    const resetMutation = useResetPasswordMutation();

    const email = location.state?.email;
    const otp = location.state?.otp;

    useEffect(() => {
        if (!email || !otp) navigate('/forgot-password');
    }, [email, otp, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!passwords.newPassword || passwords.newPassword.length < 8) {
            newErrors.newPassword = 'Mật khẩu phải có ít nhất 8 ký tự';
        }
        if (passwords.newPassword !== passwords.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            try {
                const res = await resetMutation.mutateAsync({ email, otp, newPassword: passwords.newPassword });
                setSuccessMessage(res.message || 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
            } catch (err) {
                setErrors({ api: err.message || 'OTP không hợp lệ hoặc đã hết hạn.' });
            }
        }
    };

    return { passwords, setPasswords, errors, loading: resetMutation.isPending, handleSubmit, email, successMessage, clearSuccess: () => setSuccessMessage(null), navigate };
};

// 3. Hook Xác Thực OTP (Dùng chung cho cả Register và Forgot Password)
export const useVerifyOTPForm = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    
    const inputRefs = useRef([]);
    const location = useLocation();
    const navigate = useNavigate();
    
    const email = location.state?.email;
    const intent = location.state?.intent || 'register'; // register hoặc reset_password
    const shouldResend = location.state?.resend;
    const hasSentRef = useRef(false);

    const activateMutation = useVerifyOTPMutation();
    const verifyOnlyMutation = useVerifyOTPOnlyMutation();
    const resendMutation = useResendOTPMutation();

    useEffect(() => {
        if (!email) navigate('/login');
    }, [email, navigate]);

    useEffect(() => {
        if (email && shouldResend && !hasSentRef.current){
            hasSentRef.current = true;
            resendMutation.mutateAsync(email)
                .then(() => alert(`Mã OTP mới đã được gửi đến ${email}`))
                .catch(err => setError(err.message));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [email, shouldResend]);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
            return () => clearInterval(interval);
        } else {
            setCanResend(true);
        }
    }, [timer]);

    // Xử lý UI Nhập liệu
    const handleChange = (index, value) => {
        if (value && !/^\d$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            if (!otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
            else { const newOtp = [...otp]; newOtp[index] = ''; setOtp(newOtp); }
        } else if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
        else if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return setError('Chỉ được nhập số');
        const newOtp = pastedData.split('');
        while (newOtp.length < 6) newOtp.push('');
        setOtp(newOtp.slice(0, 6));
        inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    };

    // Xử lý Nút Xác Nhận
    const handleVerify = async () => {
        const otpValue = otp.join('');
        if (otpValue.length !== 6) return setError('Vui lòng nhập đủ 6 số');

        try {
            if (intent === 'reset_password') {
                await verifyOnlyMutation.mutateAsync({ email, otp: otpValue });
                navigate('/reset-password', { state: { email, otp: otpValue } });
            } else {
                const res = await activateMutation.mutateAsync({ email, otp: otpValue });
                setSuccess(true);
                alert(res.message || "Kích hoạt tài khoản thành công!");
                navigate('/login'); 
            }
        } catch (err) {
            setError(err.message || 'OTP không hợp lệ hoặc đã hết hạn.');
        }
    };

    const handleResend = async () => {
        if (!canResend) return;
        setTimer(60); setCanResend(false); setOtp(['', '', '', '', '', '']); setError('');
        inputRefs.current[0]?.focus();
        try {
            const res = await resendMutation.mutateAsync(email);
            alert(res.message);
        } catch (err) {
            setError(err.message || 'Không thể gửi lại mã.');
        }
    };

    return { email, otp, inputRefs, error, success, loading: activateMutation.isPending || verifyOnlyMutation.isPending, timer, canResend, handleChange, handleKeyDown, handlePaste, handleVerify, handleResend, navigate };
};

