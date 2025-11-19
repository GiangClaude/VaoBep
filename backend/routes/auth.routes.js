const express = require('express');
const authController = require('../controllers/auth.controllers');
const router = express.Router();
const {protect} = require('../controllers/auth.controllers');


// Đăng ký
router.post('/register', authController.register);
// Đăng nhập
router.post('/login', authController.login);
//Xác thực
router.post('/verify-otp', authController.verifyOTP);
router.post('/resend-otp', authController.resendOTP)
router.post('/request-password-reset', authController.requestPasswordReset)
router.put('/reset-password', authController.resetPassword);

module.exports = router;