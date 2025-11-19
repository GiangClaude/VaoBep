const fs = require('fs');
const path = require('path');
const { generate } = require('rxjs');
const UserModel = require('../models/user.model');
const authUtils = require('../utils/auth.utils');
const emailUtils = require('../utils/email.utils');
const bcrypt = require('bcryptjs');

// Đăng ký người dùng mới
const register = async (req, res) => {
    const { name, email, password } = req.body;

    console.log('Register request body:', req.body);
    
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
    }


    try {
        let user = await UserModel.findByEmail(email);
        if (user) {
            if (user.account_status === 'active'){
                return res.status(409).json({
                    error: 'Email is already registered!'
                })
            }

            return res.status(409).json({ error: 'Email is already registered' });
        }

        //Tạo otp
        const otp = authUtils.generateOTP();
        const otpExpires = new Date(Date.now() + 10*60*1000);

        const hashedPassword = await authUtils.hashPassword(password);

        const newUserId = await UserModel.create(name, email, hashedPassword, otp, otpExpires);

        const emailResult = await emailUtils.sendVerificationEmail(email, otp);

        if (!emailResult.success){
            return res.status(500).json({ error: 'Failed to send verification email.' });
        }

        //Tạo folder name
        const userFolderPath = path.join(__dirname, '../../public/user', newUserId.toString());

        // 3. Kiểm tra và tạo thư mục nếu chưa có
        if (!fs.existsSync(userFolderPath)) {
            fs.mkdirSync(userFolderPath, { recursive: true });
            // recursive: true giúp tạo cả thư mục cha nếu lỡ nó chưa tồn tại
        }
        
        console.log(`Đã tạo thư mục cho user: ${userFolderPath}`);

        res.status(201).json({
            message: 'User registered successfully. Please check your email for verification OTP.',
            // token,
            // previewUrl: emailResult.url,
            user: {id: newUserId, name, email}
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
        console.error('Error during registration:', error);
    }
}

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    
    try {
        const user = await UserModel.findByEmail(email);
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const isMatch = await authUtils.comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        if (user.account_status === 'pending') {
            return res.status(403).json({
                error: 'Tài khoản chưa xác thực'
            })
        } 

        const token = authUtils.generateToken(user.user_id);
        res.json({
            message: 'Login successful',
            token,
            user: {id: user.user_id, name: user.name, email: user.email}
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = authUtils.verifyToken(token);
            if (!decoded) {
                return res.status(401).json({ error: 'Not authorized, token failed' });
            }

            
            req.user = await UserModel.findAuth(decoded.id);
            console.log('User gán vào req.user:', req.user);

            if (!req.user) {
                return res.status(401).json({ message: 'User không còn tồn tại.' });
            }
            next();
        } catch (error) {
            console.error('Error in protect middleware:', error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
}

const verifyOTP = async (req, res) => {
    const {email, otp} = req.body;

    if (!email || !otp) {
        return res.status(400).json({ error: 'Email and OTP are required' });
    }

    try {
        //Tìm user
        const user = authUtils.validateOTP(email, otp);

        // 4. Nếu OTP đúng và còn hạn -> Kích hoạt user
        await UserModel.activateUser(user.user_id);

        await UserModel.clearOTP(user.user_id);

        // 5. Tạo token cho user đăng nhập luôn
        const token = authUtils.generateToken(user.user_id);

        res.status(200).json({
            message: 'Account verified successfully. You are now logged in.',
            token,
            user: { 
                id: user.user_id, 
                name: user.full_name, 
                email: user.email 
            }
        });
    } catch (error) {
        console.error('Error during OTP verification:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const resendOTP = async (req, res) => {
    const {email} = req.body;

    if (!email) {
        return res.status(400).json({
            error: "Không nhận được email"
        })
    }

    try {
        const user = await UserModel.findByEmail(email);

        if (!user) {
            return res.status(400).json({
                error: "Không tìm thấy tài khoản"
            })
        }

        if (user.account_status === 'active') {
            return res.status(400).json({
                error: "Tài khoản đã được xác thực"
            })
        }

        const otp = authUtils.generateOTP();
        const otpExpires = new Date(Date.now() + 10*60*1000);


        await User.updateOTP(user.user_id, otp, otpExpires);
        await emailUtils.sendPasswordResetEmail(email, otp);

        res.status(200).json({ message: 'Đã gửi lại OTP'});
    } catch (error) {
        console.error('Error during resend OTP:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const requestPasswordReset = async(req, res) => {
    try {
        const {email} = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const user = await UserModel.findByEmail(email);

        if (!user) {
            return res.status(200).json({
                success:true,
                message: "If your email is registered, you will receive a password reset OTP."
            })
        }

        const otp = authUtils.generateOTP();
        const otpExpires = new Date(Date.now() + 10*60*1000);

        await UserModel.updateOTP(user.user_id, otp, otpExpires);

        await emailUtils.sendPasswordResetEmail(email, otp);

        return res.status(200).json({
            success: true,
            message: "Password reset OTP sent to your email!"
        })
    } catch (error) {
        console.error('Error during requestPasswordReset:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });       
    }
}

//Đổi mật khẩu khi đã quên mật khẩu cũ => sử dụng hàm changePassword
const resetPassword = async(req, res) => {
    const {email, otp, newPassword} = req.body;

    if (!email || !otp || !newPassword) {
        return res.status(400).json({
            error: 'Email, OTP, and new password are required'
        });
    }

    try {
        const user = await authUtils.validateOTP(email, otp);
        const hashedNewPassword = await authUtils.hashPassword(newPassword);
        await UserModel.changePassword(user.user_id, hashedNewPassword);

        await UserModel.clearOTP(user.user_id);

        res.status(200).json({
            message: 'Password reset successfully'
        });
    } catch (error) {
        console.error('Error during password reset:', error);
        res.status(400).json({ error: error.message });
    }
}

module.exports = {
    register,
    login,
    protect, 
    verifyOTP,
    resendOTP,
    requestPasswordReset,
    resetPassword
};