// VỊ TRÍ: backend/controllers/admin/adminUser.controller.js
const adminUserService = require('../../services/admin/adminUser.service');
const asyncHandler = require('../../utils/asyncHandler');

const getUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const sortKey = req.query.sortKey || 'created_at';
    const sortOrder = req.query.sortOrder || 'DESC';

    const result = await adminUserService.getUsers(page, limit, search, sortKey, sortOrder);

    res.status(200).json({
        data: result.users,
        pagination: { page, limit, total: result.total, totalPages: result.totalPages }
    });
});

const toggleUserStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    const updatedStatus = await adminUserService.toggleUserStatus(id, status);
    
    res.status(200).json({ message: `User status updated to ${updatedStatus}` });
});

const createUser = asyncHandler(async (req, res) => {
    const userId = await adminUserService.createUser(req.body);
    res.status(201).json({ message: 'User created successfully', userId });
});

const getUserDetail = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await adminUserService.getUserDetail(id);
    res.status(200).json({ data: user });
});

const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await adminUserService.updateUser(id, req.body);
    res.status(200).json({ message: 'User updated successfully' });
});

module.exports = { getUsers, toggleUserStatus, createUser, getUserDetail, updateUser };