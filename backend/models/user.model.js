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
        const [rows] = await pool.execute(
            'SELECT user_id, email, full_name, avatar, role, bio, created_at, update_at FROM users WHERE user_id = ?',
            [id]
        );
        console.log(rows);
        return rows[0]; // Trả về user đầu tiên hoặc undefined nếu không tìm thấy
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



    

}

module.exports = User;