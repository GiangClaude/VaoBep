const UserModel = require('../models/user.model');
const authUtils = require('../utils/auth.utils');

// Update mật khẩu mới (chủ động)
const updatePassword = async(req, res) => {
    try {
        const userId = req.user.user_id;
        // const currentPass = req.user.password;

        const {oldPassword, newPassword, confirmPassword} = req.body;

        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ mật khẩu cũ, mật khẩu mới và xác nhận.'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu mới và xác nhận không khớp.'
            });
        }  

        if (oldPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu mới phải khác mật khẩu cũ.'
            });
        }

        const currentHashedPass = await UserModel.findPasswordByUserId(userId);
        if (!currentHashedPass) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }

        // 2. Controller tự so sánh (dùng utils)
        const isMatch = authUtils.comparePassword(oldPassword, currentHashedPass);
        if (!isMatch) {
            return res.status(401).json({ message: 'Mật khẩu cũ không chính xác.' });
        }

        // 3. Controller tự hash (dùng utils)
        const hashedNewPassword = await authUtils.hashPassword(newPassword);        
        await UserModel.changePassword(userId, hashedNewPassword);
        return res.status(200).json({
            success: true,
            message: 'Đổi mật khẩu thành công'
        })
    } catch (error) {
        console.error('Controller: ', error.message);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

const getMyProfile = async(req, res) => {
    try {
        const userId = req.user.user_id;

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "Không tìm thấy người dùng"
            })
        }

        return res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.log('UserController: ', error.message);
        return res.status(500).json({
            success: false,
            message: "Có lỗi xảy ra phía server: " + error.message
        });
    }
}

// Thêm hàm này vào file, nhớ export ra ở cuối
const searchUsers = async (req, res) => {
    try {
        const { keyword, page, limit, sort } = req.query;
        
        // Nếu không có keyword thì trả về rỗng hoặc list mặc định tuỳ logic (ở đây tui trả rỗng)
        if (!keyword) {
            return res.status(200).json({
                success: true,
                data: [],
                pagination: { totalItems: 0, totalPages: 0, currentPage: 1 }
            });
        }

        const result = await UserModel.searchUsers({ 
            keyword, 
            page, 
            limit, 
            sort 
        });
        console.log("usercontroller: ", result);

        return res.status(200).json({
            success: true,
            data: result.users,
            pagination: {
                totalItems: result.totalItems,
                totalPages: result.totalPages,
                currentPage: result.currentPage
            }
        });
    } catch (error) {
        console.error('User Controller Search Error:', error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi tìm kiếm user."
        });
    }
}

const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.user_id; 
        const { fullName, bio } = req.body;
        
        // Tạo object chứa dữ liệu cần update
        const updateData = {};

        // 1. Xử lý Fullname: Chỉ validate nếu client CÓ gửi field này lên
        if (fullName !== undefined) {
            if (fullName.trim() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Họ và tên không được để trống."
                });
            }
            updateData.fullName = fullName;
        }

        // 2. Xử lý Bio: Nếu client có gửi thì update
        if (bio !== undefined) {
            updateData.bio = bio;
        }
        
        // 3. Xử lý Avatar: Nếu có file upload thì thêm vào data
        if (req.file) {
            updateData.avatar = req.file.filename;
        }

        // Nếu không có trường nào để update thì báo lỗi hoặc return luôn
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Không có dữ liệu nào được gửi để cập nhật."
            });
        }

        // Gọi Model update
        await UserModel.updateProfile(userId, updateData);

        // Lấy lại thông tin user mới nhất
        const updatedUser = await UserModel.findById(userId);

        return res.status(200).json({
            success: true,
            message: "Cập nhật hồ sơ thành công.",
            data: updatedUser
        });

    } catch (error) {
        console.error('Update Profile Controller Error:', error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi cập nhật hồ sơ."
        });
    }
}


module.exports = {
    updatePassword,
    getMyProfile,
    searchUsers,
    updateUserProfile
}