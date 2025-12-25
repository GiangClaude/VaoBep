// models/interaction.model.js
const db = require('../config/db');
const pool = db.pool;

class Interaction {
    
    // --- 1. LIKE / UNLIKE (Hỗ trợ Recipe, Article, Dish) ---
    static async toggleLike({ userId, postId, postType }) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Xác định bảng cần update count
            let targetTable = '';
            let idColumn = '';

            const [ispublic] = await connection.execute(
                `SELECT status FROM Recipes WHERE recipe_id = ?`,
                [postId]
            );
            console.log(ispublic[0].status);
            if (ispublic[0].status == 'draft' || ispublic[0].status == 'hidden'){
                throw new Error('Bài viết không công khai');
            }
            
            if (postType === 'recipe') { targetTable = 'Recipes'; idColumn = 'recipe_id'; }
            else if (postType === 'article') { targetTable = 'Article_Posts'; idColumn = 'article_id'; }
            else if (postType === 'dish') { targetTable = 'Dictionary_Dishes'; idColumn = 'dish_id'; }
            else { throw new Error('Invalid post_type'); }

            // Kiểm tra đã like chưa
            const [exists] = await connection.execute(
                `SELECT * FROM Likes WHERE user_id = ? AND post_id = ? AND post_type = ?`,
                [userId, postId, postType]
            );

            let isLiked = false;

            if (exists.length > 0) {
                // Đã like -> Xóa (Unlike) -> Giảm count
                await connection.execute(
                    `DELETE FROM Likes WHERE user_id = ? AND post_id = ? AND post_type = ?`,
                    [userId, postId, postType]
                );
                await connection.execute(
                    `UPDATE ${targetTable} SET like_count = GREATEST(like_count - 1, 0) WHERE ${idColumn} = ?`,
                    [postId]
                );
                isLiked = false;
            } else {
                // Chưa like -> Thêm (Like) -> Tăng count
                await connection.execute(
                    `INSERT INTO Likes (user_id, post_id, post_type) VALUES (?, ?, ?)`,
                    [userId, postId, postType]
                );
                await connection.execute(
                    `UPDATE ${targetTable} SET like_count = like_count + 1 WHERE ${idColumn} = ?`,
                    [postId]
                );
                isLiked = true;
            }

            await connection.commit();
            return { isLiked };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // --- 2. SAVE / UNSAVE (Bookmark) ---
    static async toggleSave({ userId, postId, postType }) {
        const connection = await pool.getConnection();
        try {
            // Kiểm tra đã lưu chưa
            const [exists] = await connection.execute(
                `SELECT * FROM Saved_Posts WHERE user_id = ? AND post_id = ? AND post_type = ?`,
                [userId, postId, postType]
            );

            let isSaved = false;
            if (exists.length > 0) {
                // Đã lưu -> Bỏ lưu
                await connection.execute(
                    `DELETE FROM Saved_Posts WHERE user_id = ? AND post_id = ? AND post_type = ?`,
                    [userId, postId, postType]
                );
                isSaved = false;
            } else {
                // Chưa lưu -> Lưu
                await connection.execute(
                    `INSERT INTO Saved_Posts (user_id, post_id, post_type) VALUES (?, ?, ?)`,
                    [userId, postId, postType]
                );
                isSaved = true;
            }
            return { isSaved };
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    // --- 3. COMMENT (Bình luận) ---
    static async createComment({ userId, postId, postType, content }) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

             // Xác định bảng cần update comment_count
            let targetTable = '';
            let idColumn = '';
            if (postType === 'recipe') { targetTable = 'Recipes'; idColumn = 'recipe_id'; }
            else if (postType === 'article') { targetTable = 'Article_Posts'; idColumn = 'article_id'; }
            else if (postType === 'dish') { targetTable = 'Dictionary_Dishes'; idColumn = 'dish_id'; }

            // Insert Comment
            // Lưu ý: bảng Comments có cột comment_id default uuid() nhưng MySQL < 8.0 có thể cần gen ID từ code.
            // Giả sử DB tự gen hoặc dùng uuid() trong SQL
            const sqlInsert = `INSERT INTO Comments (user_id, post_id, post_type, content) VALUES (?, ?, ?, ?)`;
            await connection.execute(sqlInsert, [userId, postId, postType, content]);

            // Update Count
            if (targetTable) {
                await connection.execute(
                    `UPDATE ${targetTable} SET comment_count = comment_count + 1 WHERE ${idColumn} = ?`,
                    [postId]
                );
            }

            await connection.commit();
            return { success: true };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async getComments(postId, postType, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const sql = `
            SELECT C.*, U.full_name, U.avatar 
            FROM Comments C
            JOIN Users U ON C.user_id = U.user_id
            WHERE C.post_id = ? AND C.post_type = ?
            ORDER BY C.created_at DESC
            LIMIT ? OFFSET ?
        `;
        const [rows] = await pool.execute(sql, [postId, postType, limit.toString(), offset.toString()]);
        
        // Đếm tổng comment để phân trang
        const [countRows] = await pool.execute(
            `SELECT COUNT(*) as total FROM Comments WHERE post_id = ? AND post_type = ?`, 
            [postId, postType]
        );
        
        return {
            comments: rows,
            total: countRows[0].total
        };
    }

    // --- 4. RATING (Đánh giá sao) ---
    static async ratePost({ userId, postId, postType, score }) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Dùng INSERT ON DUPLICATE KEY UPDATE để xử lý việc user đánh giá lại
            // Bảng Ratings khóa chính là (user_id, post_id) -> Đảm bảo 1 user chỉ rate 1 lần/bài
            const sqlRate = `
                INSERT INTO Ratings (user_id, post_id, post_type, score) 
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE score = VALUES(score)
            `;
            await connection.execute(sqlRate, [userId, postId, postType, score]);

            // Tính toán lại điểm trung bình
            const [stats] = await connection.execute(
                `SELECT COUNT(*) as count, SUM(score) as sum_score 
                 FROM Ratings 
                 WHERE post_id = ? AND post_type = ?`,
                [postId, postType]
            );

            const ratingCount = stats[0].count;
            const sumScore = stats[0].sum_score || 0; // Tránh null
            const avgScore = ratingCount > 0 ? (sumScore / ratingCount) : 0;

            // Update ngược lại vào bảng cha (Recipes/Article)
            let targetTable = '';
            let idColumn = '';
            if (postType === 'recipe') { targetTable = 'Recipes'; idColumn = 'recipe_id'; }
            else if (postType === 'article') { targetTable = 'Article_Posts'; idColumn = 'article_id'; }
            else if (postType === 'dish') { targetTable = 'Dictionary_Dishes'; idColumn = 'dish_id'; }

            if (targetTable) {
                await connection.execute(
                    `UPDATE ${targetTable} 
                     SET rating_count = ?, rating_sum_score = ?, rating_avg_score = ? 
                     WHERE ${idColumn} = ?`,
                    [ratingCount, sumScore, avgScore, postId]
                );
            }

            await connection.commit();
            return { avgScore, ratingCount };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // --- 5. FOLLOW USER (Theo dõi người dùng) ---
    static async toggleFollow(followerId, followingId) {
        const connection = await pool.getConnection();
        try {
            // Không được follow chính mình
            if (followerId === followingId) throw new Error("Không thể tự follow bản thân");

            const [exists] = await connection.execute(
                `SELECT * FROM Follows WHERE follower_id = ? AND following_id = ?`,
                [followerId, followingId]
            );

            let isFollowing = false;
            if (exists.length > 0) {
                // Unfollow
                await connection.execute(
                    `DELETE FROM Follows WHERE follower_id = ? AND following_id = ?`,
                    [followerId, followingId]
                );
                isFollowing = false;
            } else {
                // Follow
                await connection.execute(
                    `INSERT INTO Follows (follower_id, following_id) VALUES (?, ?)`,
                    [followerId, followingId]
                );
                isFollowing = true;
            }
            return { isFollowing };
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }
    
    // Check trạng thái (Dùng khi load trang chi tiết)
    static async getUserInteractionState(userId, postId, postType) {
        if (!userId) return { liked: false, saved: false, rated: 0 };
        
        const [likeRows] = await pool.execute(
            `SELECT 1 FROM Likes WHERE user_id = ? AND post_id = ? AND post_type = ?`, 
            [userId, postId, postType]
        );
        const [saveRows] = await pool.execute(
            `SELECT 1 FROM Saved_Posts WHERE user_id = ? AND post_id = ? AND post_type = ?`, 
            [userId, postId, postType]
        );
         const [rateRows] = await pool.execute(
            `SELECT score FROM Ratings WHERE user_id = ? AND post_id = ? AND post_type = ?`, 
            [userId, postId, postType]
        );
        
        return {
            liked: likeRows.length > 0,
            saved: saveRows.length > 0,
            rated: rateRows.length > 0 ? rateRows[0].score : 0
        };
    }
}

module.exports = Interaction;