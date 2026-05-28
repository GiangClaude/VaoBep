const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const authUtils = require('../utils/auth.utils');
const UserModel = require('../models/user.model');

const protect = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];

        const decoded = authUtils.verifyToken(token);
        if (!decoded) {
            throw new AppError('Not authorized, token failed', 401);
        }

        const fetchedUser = await UserModel.findAuth(decoded.id);
        req.user = Array.isArray(fetchedUser) ? fetchedUser[0] : fetchedUser;
        
        if (!req.user) {
            throw new AppError('User không còn tồn tại', 401);
        }

        return next();
    }

    if (!token) {
        throw new AppError('Not authorized, no token', 401);
    }
});

module.exports = {
    protect
}