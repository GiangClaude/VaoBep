const { v4: uuidv4 } = require('uuid');
const UserModel = require('../../models/user.model');
const path = require('path');
const fs = require('fs');
const emailUtils = require('../../utils/email.utils');
const authUtils = require('../../utils/auth.utils');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/AppError');

const getUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const sortKey = req.query.sortKey || 'created_at';
    const sortOrder = req.query.sortOrder || 'DESC';
    const offset = (page - 1) * limit;

    const users = await UserModel.getAllUsers(limit, offset, search, sortKey, sortOrder);
    const total = await UserModel.countUsers(search);

    res.status(200).json({
        data: users,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
});

const toggleUserStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'blocked'].includes(status)) throw new AppError('Invalid status', 400);

    await UserModel.updateStatus(id, status);
    res.status(200).json({ message: `User status updated to ${status}` });
});

const createUser = asyncHandler(async (req, res) => {
    const { full_name, email, password, role } = req.body;
    if (!['admin', 'vip', 'pro', 'user'].includes(role)) throw new AppError('Invalid role', 400);
    if (!email || !password || !full_name) throw new AppError('Vui lòng điền đủ thông tin.', 400);

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) throw new AppError('Email đã tồn tại.', 400);

        const hashedPassword = await authUtils.hashPassword(password);
        const userId = uuidv4();

        const otp = authUtils.generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        await UserModel.createWithRole({
            id: userId,
            full_name,
            email,
            passwordHash: hashedPassword,
            role,
            otp,
            otpExpires
        });

    const emailResult = await emailUtils.sendVerificationEmail(email, otp);
    if (!emailResult.success) throw new AppError('Failed to send verification email.', 500);

    const userFolderPath = path.join(__dirname, '../../public/user', userId.toString());
    if (!fs.existsSync(userFolderPath)) fs.mkdirSync(userFolderPath, { recursive: true });

    res.status(201).json({ message: 'User created successfully', userId });
});

const getUserDetail = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await UserModel.findById(id);
    if (!user) throw new AppError('User not found', 404);
    res.status(200).json({ data: user });
});

const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { role, account_status } = req.body;

    if (role && !['admin', 'vip', 'pro', 'user'].includes(role)) throw new AppError('Invalid role', 400);
    if (account_status && !['active', 'blocked', 'pending'].includes(account_status)) throw new AppError('Invalid status', 400);

    await UserModel.adminUpdateUser(id, { role, status: account_status });

    res.status(200).json({ message: 'User updated successfully' });
});

module.exports = { getUsers, toggleUserStatus, createUser, getUserDetail, updateUser };
