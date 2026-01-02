const db = require('../config/db'); 
// 2. Định nghĩa pool bằng cách lấy từ đối tượng db
const pool = db.pool;


class User {
    static async create(name, email, passwordHash, otp, otpExpires) {
        const [result] = await pool.execute(
            'INSERT INTO users (full_name, email, password, account_status, verification_otp, otp_expires_at) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, passwordHash, 'pending', otp, otpExpires]
        );
        return result.insertId;
    }

    static async findByEmail(email) {
        try {
            const [rows] = await pool.execute(
                    'SELECT user_id, full_name, email, password, account_status FROM users WHERE email = ?',
                    [email]
                );
                return rows[0];
            } catch (error) {
                console.error('LỖI CHI TIẾT TRONG findByEmail:', error.message);
                throw error; 
            }
    }

    static async findById(id) {
        const sql = `
            SELECT 
                u.user_id, 
                u.email, 
                u.full_name, 
                u.avatar, 
                u.role, 
                u.bio, 
                u.points,
                u.account_status,
                u.created_at,
               -- Đếm số công thức (có thể thêm điều kiện status = 'public' nếu muốn)
                (SELECT COUNT(*) FROM Recipes r WHERE r.user_id = u.user_id) as recipes_count,
                
                -- Đếm số người theo dõi
                (SELECT COUNT(*) FROM Follows f WHERE f.following_id = u.user_id) as followers_count,
                
                -- Đếm số bài đã lưu
                (SELECT COUNT(*) FROM Saved_Posts s WHERE s.user_id = u.user_id) as saved_count -- Placeholder tạm thời
            FROM users u 
            WHERE u.user_id = ?
            `;
        const [rows] = await pool.execute(sql, [id]);
        
        if (!rows[0]) return null;

        const user = rows[0];

        return {
            id: user.user_id,
            fullName: user.full_name,
            email: user.email,
            avatar: user.avatar || 'default.png', // Xử lý fallback ở backend hoặc frontend đều được
            bio: user.bio,
            role: user.role, // 'user', 'vip', 'pro'
            stats: {
                recipes: user.recipes_count || 0,
                saved: user.saved_count || 0,
                followers: user.followers_count || 0
            },
            joinDate: user.created_at
        };
    }

    static async findAuth (userId){
        const sql = "SELECT user_id, email, role, account_status FROM users WHERE user_id = ?";
        const [rows] = await pool.execute(sql, [userId]);
        return rows[0];        
    }

    static async findByEmailAndOTP(email, otp) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM users WHERE email = ? AND verification_otp = ?',
                [email, otp]
            );
            return rows[0];
        } catch (error) {
            console.error('Lỗi khi tìm user', error);
            throw error;
        }
    }

    static async activateUser(userId) {
        try {
            const [result] = await pool.execute(
                'UPDATE users SET account_status = ?, verification_otp = ?, otp_expires_at = ? WHERE user_id = ?',
                ['active', null, null, userId] // Set active, xóa OTP
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Lỗi khi kích hoạt user:', error);
            throw error;
        }
    }

    static async updateOTP(userId, otp, otpExpires) {
        try{
            console.log(userId, otp, otpExpires)
            const [result] = await pool.execute(
                'UPDATE users SET verification_otp = ?, otp_expires_at = ? WHERE user_id = ?',
                [otp, otpExpires, userId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Lỗi khi cập nhật OTP:', error);
            throw error;
        }
    }

    static async findPasswordByUserId (userId){
        const sql = "SELECT password FROM users WHERE user_id = ?";
        const [rows] = await pool.execute(sql, [userId]);
        return rows[0] ? rows[0].password : null;
    };

    // // Chủ động đổi mk => cần mật khẩu cũ
    // static async updatePassword(userId,  hashedNewPassword) {
    //     const updateSql = "UPDATE users SET password = ? WHERE user_id = ?";
    //     await pool.execute(updateSql, [hashedNewPassword, userId]);
    //     return true;
    // }

    // Quên mật khẩu nên phải đổi
    static async changePassword(userId, hashedNewPassword){
        try {
            const sql = "UPDATE users SET password = ? WHERE user_id = ?";
            await pool.execute(sql, [hashedNewPassword, userId]);
            return true;
        } catch (error) {
            throw error;
        }
    }

    static async clearOTP(userId) {
        try {
            const sql = `
                UPDATE users
                SET
                    verification_otp = NULL,
                    otp_expires_at = NULL
                WHERE
                    user_id = ?;
            `

            await pool.execute(sql, [userId]);
            return true;
        } catch (error) {
            console.error('Lỗi Model (clearOTP):', error);
            throw new Error(`Xóa otp thất bại: ${error.message}`);
        }
    }

    // Thêm đoạn này vào trong class User (trước dấu đóng '}')
    static async searchUsers({ keyword, page = 1, limit = 10, sort = 'newest' }) {
        const offset = (page - 1) * limit;
        const kw = `%${keyword}%`;

        try {
            // Query đếm tổng để phân trang
            const countSql = `
                SELECT COUNT(*) as total 
                FROM Users 
                WHERE (full_name LIKE ? OR email LIKE ?) AND account_status = 'active'
            `;
            const [countRows] = await pool.execute(countSql, [kw, kw]);
            const totalItems = countRows[0].total;

            // Xử lý Sort
            let orderBy = 'u.created_at DESC'; // Default newest
            if (sort === 'oldest') orderBy = 'u.created_at ASC';
            if (sort === 'most_followed') orderBy = 'followers_count DESC';

            // Query chính: Join bảng Follows để đếm số người theo dõi
            const sql = `
                SELECT 
                    u.user_id, 
                    u.full_name, 
                    u.email, 
                    u.avatar, 
                    u.bio,
                    u.created_at,
                    COUNT(f.follower_id) as followers_count
                FROM Users u
                LEFT JOIN Follows f ON u.user_id = f.following_id
                WHERE (u.full_name LIKE ? OR u.email LIKE ?) 
                  AND u.account_status = 'active'
                GROUP BY u.user_id
                ORDER BY ${orderBy}
                LIMIT ? OFFSET ?
            `;

            const [users] = await pool.query(sql, [kw, kw, parseInt(limit), parseInt(offset)]);

            return {
                users,
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: parseInt(page)
            };
        } catch (error) {
            console.error('User Model Search Error:', error);
            throw error;
        }
    }

    // --- THÊM MỚI BẮT ĐẦU ---
/**
     * Cập nhật thông tin profile user (Dynamic Update)
     * @param {string} userId 
     * @param {object} data { fullName, bio, avatar } - Các trường có thể undefined
     */
    static async updateProfile(userId, data) {
        try {
            const updates = [];
            const values = [];

            // Kiểm tra từng trường, nếu có dữ liệu thì push vào mảng updates
            if (data.fullName !== undefined) {
                updates.push("full_name = ?");
                values.push(data.fullName);
            }

            if (data.bio !== undefined) {
                updates.push("bio = ?");
                values.push(data.bio);
            }

            if (data.avatar !== undefined) {
                updates.push("avatar = ?");
                values.push(data.avatar);
            }

            // Luôn cập nhật thời gian update
            updates.push("update_at = NOW()");

            // Nếu không có gì để update (ngoài update_at) thì return sớm
            // (Tuy nhiên controller đã check rồi, đây là check phòng hờ)
            if (updates.length === 1) return 0;

            // Xây dựng câu query
            const sql = `UPDATE Users SET ${updates.join(", ")} WHERE user_id = ?`;
            
            // Push userId vào cuối mảng values (cho dấu ? ở WHERE)
            values.push(userId);

            const [result] = await pool.execute(sql, values);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('User Model Update Error:', error);
            throw error;
        }
    }

}

module.exports = User;