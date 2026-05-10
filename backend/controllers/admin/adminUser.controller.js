const { v4: uuidv4 } = require('uuid');
const UserModel = require('../../models/user.model');
const path = require('path');
const fs = require('fs');
const emailUtils = require('../../utils/email.utils');
const authUtils = require('../../utils/auth.utils');

const getUsers = async (req, res) => {
    try {
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
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'blocked'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        await UserModel.updateStatus(id, status);
        res.status(200).json({ message: `User status updated to ${status}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createUser = async (req, res) => {
    try {
        const { full_name, email, password, role } = req.body;
        if (!['admin', 'vip', 'pro', 'user'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }
        if (!email || !password || !full_name) {
            return res.status(400).json({ message: 'Vui lòng điền đủ thông tin.' });
        }

        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email đã tồn tại.' });
        }

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
        if (!emailResult.success) {
            return res.status(500).json({ error: 'Failed to send verification email.' });
        }

        const userFolderPath = path.join(__dirname, '../../public/user', userId.toString());
        if (!fs.existsSync(userFolderPath)) {
            fs.mkdirSync(userFolderPath, { recursive: true });
        }

        res.status(201).json({ message: 'User created successfully', userId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await UserModel.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ data: user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, account_status } = req.body;

        if (role && !['admin', 'vip', 'pro', 'user'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }
        if (account_status && !['active', 'blocked', 'pending'].includes(account_status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        await UserModel.adminUpdateUser(id, { role, status: account_status });

        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getUsers, toggleUserStatus, createUser, getUserDetail, updateUser };
