const UserModel = require('../models/user.model');
const authUtils = require('../utils/auth.utils');
const PointModel = require('../models/point.model');
const db = require('../config/db');

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
        
        const viewerId = authUtils.getUserIdFromToken(req);
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
            sort,
            currentUserId: viewerId
        });

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

const dailyCheckIn = async (req, res) => {
    try {
        const userId = req.user.user_id;

        // 1. Kiểm tra đã điểm danh hôm nay chưa
        const hasCheckedIn = await PointModel.hasCheckedInToday(userId);
        if (hasCheckedIn) {
            return res.status(400).json({
                success: false,
                message: "Hôm nay bạn đã điểm danh rồi. Hãy quay lại vào ngày mai!"
            });
        }

        // 2. Cộng điểm (+10)
        const bonusPoints = 10;
        await UserModel.updatePoints(userId, bonusPoints);

        // 3. Ghi log transaction
        await PointModel.create({
            userId,
            type: 'checkin',
            amount: bonusPoints,
            message: 'Điểm danh hàng ngày'
        });

        return res.status(200).json({
            success: true,
            message: `Điểm danh thành công! Bạn nhận được ${bonusPoints} điểm.`
        });

    } catch (error) {
        console.error('Check-in Error:', error);
        return res.status(500).json({ success: false, message: "Lỗi server khi điểm danh." });
    }
};

// [THÊM MỚI] - Lấy lịch sử điểm
const getPointHistory = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { page, month } = req.query; // month format: '2024-05'

        const result = await PointModel.getHistory(
            userId, 
            parseInt(page) || 1, 
            10, 
            month === 'all' ? null : month // Nếu client gửi 'all' thì lấy tất cả
        );

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Get Point History Error:', error);
        return res.status(500).json({ success: false, message: "Lỗi server khi lấy lịch sử điểm." });
    }
};

// [THÊM MỚI] - Tặng điểm cho user khác
const giftPoints = async (req, res) => {
    const connection = await db.pool.getConnection(); // 1. Lấy connection riêng
    try {
        const senderId = req.user.user_id;
        const { recipientId, amount, message } = req.body;
        const pointsToSend = parseInt(amount);

        // --- VALIDATE CƠ BẢN ---
        if (!recipientId || !pointsToSend) {
            return res.status(400).json({ success: false, message: "Thiếu thông tin người nhận hoặc số điểm." });
        }
        if (pointsToSend < 10) {
            return res.status(400).json({ success: false, message: "Số điểm tặng tối thiểu là 10." });
        }
        if (senderId === recipientId) {
            return res.status(400).json({ success: false, message: "Không thể tự tặng điểm cho mình." });
        }

        // --- BẮT ĐẦU TRANSACTION ---
        await connection.beginTransaction();

        // 2. KHÓA và Lấy thông tin người gửi (Sender)
        // Dòng này sẽ khiến các request khác vào Sender phải chờ
        const sender = await UserModel.findByIdForUpdate(senderId, connection);
        
        // Check số dư sau khi đã khóa
        if (!sender || sender.points < pointsToSend) {
            await connection.rollback(); // Hủy giao dịch ngay
            return res.status(400).json({ success: false, message: "Số điểm của bạn không đủ để tặng." });
        }

        // 3. KHÓA và Lấy thông tin người nhận (Recipient) 
        // Để đảm bảo người nhận tồn tại và active, đồng thời tránh race condition khi cộng tiền
        const recipient = await UserModel.findByIdForUpdate(recipientId, connection);
        
        if (!recipient) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: "Người nhận không tồn tại." });
        }
        
        // Check trạng thái người nhận (Active/Block)
        if (recipient.account_status !== 'active') {
            await connection.rollback();
            return res.status(400).json({ success: false, message: "Người nhận đang bị khóa hoặc chưa kích hoạt." });
        }

        // 4. Thực hiện TRỪ tiền người gửi
        await UserModel.updatePoints(senderId, -pointsToSend, connection);
        await PointModel.create({
            userId: senderId,
            type: 'gift_sent',
            amount: -pointsToSend,
            relatedUserId: recipientId,
            message: message || `Tặng điểm cho ${recipient.full_name}`
        }, connection);

        // 5. Thực hiện CỘNG tiền người nhận
        await UserModel.updatePoints(recipientId, pointsToSend, connection);
        await PointModel.create({
            userId: recipientId,
            type: 'gift_received',
            amount: pointsToSend,
            relatedUserId: senderId,
            message: message || `Nhận điểm từ ${sender.full_name}`
        }, connection);

        // 6. Mọi thứ OK -> COMMIT (Lưu vào DB)
        await connection.commit();

        return res.status(200).json({
            success: true,
            message: "Tặng điểm thành công!"
        });

    } catch (error) {
        // Có lỗi -> ROLLBACK (Hoàn tác mọi thay đổi)
        await connection.rollback();
        console.error('Gift Points Transaction Error:', error);
        return res.status(500).json({ success: false, message: "Giao dịch thất bại. Vui lòng thử lại." });
    } finally {
        // Luôn phải giải phóng connection trả về pool
        connection.release();
    }
};

const getUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        
        // [MỚI] Lấy ID người xem từ token (nếu có)
        // Không dùng req.user vì route này có thể public (không qua middleware protect)
        const viewerId = authUtils.getUserIdFromToken(req);

        console.log(`👉 Get Public Profile: Target=${id}, Viewer=${viewerId}`);

        // Gọi model lấy thông tin public, truyền thêm viewerId
        const user = await UserModel.findPublicProfileById(id, viewerId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Người dùng không tồn tại hoặc tài khoản đã bị khóa."
            });
        }

        return res.status(200).json({
            success: true,
            data: user // Data đã bao gồm isFollowing và stats chính xác
        });

    } catch (error) {
        console.error('Get Public Profile Error:', error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy thông tin người dùng."
        });
    }
}

//Admin 

const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const offset = (page - 1) * limit;
        
        // Query đếm tổng số lượng để phân trang
        const countQuery = `SELECT COUNT(*) as total FROM Users WHERE full_name LIKE ? OR email LIKE ?`;
        const [totalResult] = await db.promise().query(countQuery, [`%${search}%`, `%${search}%`]);
        const total = totalResult[0].total;

        // Query lấy dữ liệu
        const query = `
            SELECT user_id, full_name, email, role, account_status, points, created_at 
            FROM Users 
            WHERE full_name LIKE ? OR email LIKE ?
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?`;
        
        const [users] = await db.promise().query(query, [`%${search}%`, `%${search}%`, parseInt(limit), parseInt(offset)]);

        res.status(200).json({
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving users' });
    }
};

// 2. Xem chi tiết User (UC0060)
const getUserDetailAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Lấy thông tin user
        const userQuery = `SELECT user_id, full_name, email, avatar, bio, role, account_status, points, created_at FROM Users WHERE user_id = ?`;
        const [users] = await db.promise().query(userQuery, [id]);
        
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        // Lấy thống kê phụ (Số bài đăng, số báo cáo bị nhận)
        const statsQuery = `
            SELECT 
                (SELECT COUNT(*) FROM Recipes WHERE user_id = ?) as total_recipes,
                (SELECT COUNT(*) FROM Article_Posts WHERE user_id = ?) as total_articles,
                (SELECT COUNT(*) FROM Reports WHERE post_id IN (SELECT recipe_id FROM Recipes WHERE user_id = ?)) as total_reports_received
        `;
        const [stats] = await db.promise().query(statsQuery, [id, id, id]);

        res.status(200).json({
            user: users[0],
            stats: stats[0]
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error retrieving user detail' });
    }
};

// 3. Khóa/Mở khóa User (UC0059)
const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'active' hoặc 'blocked'

        if (!['active', 'blocked'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        await db.promise().query(`UPDATE Users SET account_status = ? WHERE user_id = ?`, [status, id]);
        
        res.status(200).json({ message: `User status updated to ${status}` });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user status' });
    }
};

// 4. Tạo tài khoản mới (UC0061)
const createUserAdmin = async (req, res) => {
    try {
        const { full_name, email, password, role } = req.body;

        // Validate cơ bản
        if (!email || !password || !full_name) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check email tồn tại
        const [existing] = await db.promise().query(`SELECT email FROM Users WHERE email = ?`, [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Hash mật khẩu tạm
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert vào DB
        const query = `
            INSERT INTO Users (full_name, email, password, role, account_status) 
            VALUES (?, ?, ?, ?, 'active')`;
        
        await db.promise().query(query, [full_name, email, hashedPassword, role || 'user']);

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating user' });
    }
};




module.exports = {
    updatePassword,
    getMyProfile,
    searchUsers,
    updateUserProfile,
    dailyCheckIn,
    getPointHistory,
    giftPoints,
    getUserProfile,
    getAllUsers,
    getUserDetailAdmin,
    updateUserStatus,
    createUserAdmin
}