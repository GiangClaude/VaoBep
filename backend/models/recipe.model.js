const { filter } = require('rxjs');
const db = require('../config/db');
const { buildRecipeQuery } = require('../utils/recipe.utils');
const pool = db.pool;
const { v4: uuidv4 } = require('uuid');

const FEATURE_CRITERIA = {
    MIN_LIKES: 1000,
    MAX_REPORTS: 2,
    MIN_AVG_RATING: 4.0,
    TIME_FRAME_DAYS: 7 // 7 ngày gần nhất
};

class Recipe{
    static async create({
        recipeId, 
        userId, 
        title, 
        description, 
        instructions,  
        coverImage, 
        servings, 
        cookTime, 
        totalCalo,
        ingredientsData,
        status,
        resultImages = []
    }) {
        const connection = await pool.getConnection();

        try {
            // Bắt đầu Transaction (đảm bảo thêm tất cả hoặc không thêm gì cả)
            await connection.beginTransaction();

            // --- 1. INSERT vào bảng Recipes ---
            const sqlRecipe = `
                INSERT INTO Recipes 
                    (recipe_id, user_id, title, description, instructions, cover_image, status, servings, cook_time, total_calo)
                VALUES 
                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            console.log("Model - Ingredients nhận được:", ingredientsData);
            await connection.execute(sqlRecipe, [
                recipeId,
                userId,
                title,
                description,
                instructions,
                coverImage,
                status || 'draft', // Mặc định là public hoặc lấy từ tham số nếu cần
                servings,
                cookTime,
                totalCalo
            ]);

            console.log("Xử lý nguyên liệu");
            // --- 2. XỬ LÝ NGUYÊN LIỆU (Ingredients & Units) ---
            if (ingredientsData && ingredientsData.length > 0) {
                // Dùng vòng lặp for...of để xử lý tuần tự (await bên trong loop)
                for (const ing of ingredientsData) {
                    
                    // A. Xử lý tên Nguyên liệu (Ingredient Name -> ID)
                    let ingredientId;
                    const [foundIng] = await connection.execute(
                        `SELECT ingredient_id FROM Ingredients WHERE name = ?`, 
                        [ing.name]
                    );
                    console.log("Tìm nguyên liệu:", ing.name, foundIng);

                    if (foundIng.length > 0) {
                        ingredientId = foundIng[0].ingredient_id;
                    } else {
                        // Nếu chưa có, tạo mới với status pending
                        const newIngId = uuidv4()
                        await connection.execute(
                            `INSERT INTO Ingredients (ingredient_id, name, status) VALUES (?, ?, 'pending')`,
                            [newIngId, ing.name]
                        );
                        ingredientId = newIngId;
                    }

                    // B. Xử lý Đơn vị (Unit Name -> ID)
                    // Frontend gửi ing.unit (string), DB cần unit_id
                    let unitId;
                    const [foundUnit] = await connection.execute(
                        `SELECT unit_id FROM Units WHERE name = ?`,
                        [ing.unit]
                    );
                    console.log("Tìm đơn vị:", ing.unit, foundUnit);

                    if (foundUnit.length > 0) {
                        unitId = foundUnit[0].unit_id;
                    } else {
                        // Nếu đơn vị chưa có, tạo mới luôn
                        const newUnitId = uuidv4();
                        await connection.execute(
                            `INSERT INTO Units (unit_id, name) VALUES (?, ?)`,
                            [newUnitId, ing.unit]
                        );
                        unitId = newUnitId;
                    }

                    console.log("Inserting into recipe_ingredients:", recipeId, ingredientId, ing.amount || ing.quantity, unitId);
                    // C. Insert vào bảng liên kết Recipe_Ingredients
                    await connection.execute(
                        `INSERT INTO Recipe_Ingredients (recipe_id, ingredient_id, quantity, unit_id) VALUES (?, ?, ?, ?)`,
                        [recipeId, ingredientId, ing.amount || ing.quantity, unitId] 
                        // Lưu ý: Frontend có thể gửi 'amount', DB dùng 'quantity'
                    );
                }
            }

            // --- 3. INSERT bảng Recipe_Images ---
            // Sửa lại cột imgLink cho đúng với file SQL của bạn
            if (resultImages && resultImages.length > 0) {
                const imgSql = `
                    INSERT INTO Recipe_Images (img_id, recipe_id, imgLink, description) 
                    VALUES (?, ?, ?, ?)
                `;

                for (const img of resultImages) {
                    const newImgId = uuidv4();
                    await connection.execute(imgSql, [
                        newImgId, 
                        recipeId, 
                        img.url, 
                        img.description
                    ]);
                }
            }

            // Commit Transaction
            await connection.commit();

            return {
                recipe_id: recipeId,
                title: title
            };

        } catch (err) {
            // Nếu có lỗi, rollback toàn bộ thao tác
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    }



    static async update(recipeId, recipeData, ingredientList) {
        const connection = await pool.getConnection();
        let newIngredientsPending = false;
        let totalCalo = recipeData.total_calo || 0; // Lấy calo từ input người dùng update

        try {
            await connection.beginTransaction();

            // 1. UPDATE bảng Recipes (Giữ nguyên logic của bạn)
            const recipeKeys = Object.keys(recipeData).filter(key => recipeData[key] !== undefined);
            if (recipeKeys.length > 0) {
                const setClauses = recipeKeys.map(key => `\`${key}\` = ?`);
                setClauses.push('update_at = NOW()');
                const queryValues = recipeKeys.map(key => recipeData[key]);
                queryValues.push(recipeId);

                const updateQuery = `UPDATE Recipes SET ${setClauses.join(', ')} WHERE recipe_id = ?`;
                await connection.execute(updateQuery, queryValues);
            }

            // 2. XỬ LÝ NGUYÊN LIỆU (QUAN TRỌNG)
            // Xóa nguyên liệu cũ
            await connection.execute('DELETE FROM recipe_ingredients WHERE recipe_id = ?', [recipeId]);

            if (ingredientList && ingredientList.length > 0) {
                const processedIngredients = await Promise.all(ingredientList.map(async (item) => {
                    const { name: ingredientName, quantity, unit: unitName } = item; // Lấy unitName thay vì unitId

                    // A. Xử lý Ingredients (Tìm hoặc Tạo)
                    let ingredientId;
                    let ingredientStatus = 'approved';

                    let [foundIng] = await connection.execute(
                        `SELECT ingredient_id, status FROM Ingredients WHERE name = ?`, 
                        [ingredientName]
                    );

                    if (foundIng.length > 0) {
                        ingredientId = foundIng[0].ingredient_id;
                        ingredientStatus = foundIng[0].status;
                    } else {
                        const [newIng] = await connection.execute(
                            `INSERT INTO Ingredients (name, status) VALUES (?, 'pending')`,
                            [ingredientName]
                        );
                        // Lấy ID vừa insert (cần check lại hàm insert của bạn trả về gì, thường là insertId với auto_increment hoặc phải query lại nếu dùng UUID)
                        // Vì bạn dùng UUID default trong DB, insertId sẽ không hoạt động nếu DB tự sinh UUID.
                        // Tốt nhất là generate UUID từ code JS:
                        /* const newUuid = uuidv4(); 
                        await connection.execute(..., [newUuid, ingredientName]); 
                        ingredientId = newUuid; 
                        */
                    // Để đơn giản và khớp với code cũ của bạn, tôi giả sử bạn query lại:
                    const [reQuery] = await connection.execute(`SELECT ingredient_id FROM Ingredients WHERE name = ?`, [ingredientName]);
                    ingredientId = reQuery[0].ingredient_id;
                    ingredientStatus = 'pending';
                    }

                    if (ingredientStatus === 'pending') newIngredientsPending = true;

                    // B. Xử lý Units (Tìm hoặc Tạo - Logic còn thiếu ở code cũ)
                    let unitId;
                    const [foundUnit] = await connection.execute(
                        `SELECT unit_id FROM Units WHERE name = ?`,
                        [unitName]
                    );

                    if (foundUnit.length > 0) {
                        unitId = foundUnit[0].unit_id;
                    } else {
                        // Tạo mới Unit
                        await connection.execute(`INSERT INTO Units (name) VALUES (?)`, [unitName]);
                        // Lại query lấy UUID (do DB tự sinh)
                        const [reQueryUnit] = await connection.execute(`SELECT unit_id FROM Units WHERE name = ?`, [unitName]);
                        unitId = reQueryUnit[0].unit_id;
                    }

                    return {
                        ingredientId,
                        quantity,
                        unitId
                    };
                }));

                // C. Insert Bulk vào recipe_ingredients
                const ingredientPlaceholders = processedIngredients.map(() => '(?, ?, ?, ?)');
                const ingredientParams = processedIngredients.flatMap(item => 
                    [recipeId, item.ingredientId, item.quantity, item.unitId]
                );

                if (ingredientPlaceholders.length > 0) {
                    const ingredientSql = `
                        INSERT INTO recipe_ingredients 
                        (recipe_id, ingredient_id, quantity, unit_id) 
                        VALUES ${ingredientPlaceholders.join(', ')}
                    `;
                    await connection.execute(ingredientSql, ingredientParams);
                }
            }

            await connection.commit();

            return { 
                success: true, 
                message: 'Cập nhật công thức thành công!',
                notification: newIngredientsPending ? 'Nguyên liệu mới đang chờ duyệt.' : null 
            };

        } catch (error) {
            await connection.rollback();
            console.error('Lỗi Model Update:', error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    static async deleteById(recipeId){
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const postType = 'recipe';

            await connection.execute(
                'DELETE FROM recipe_ingredients WHERE recipe_id = ?',
                [recipeId]
            );
            await connection.execute(
                'DELETE FROM Menu_Recipes WHERE recipe_id = ?',
                [recipeId]
            );

            await connection.execute(
                'DELETE FROM Likes WHERE post_id = ? AND post_type = ?',
                [recipeId, postType]
            );

            await connection.execute(
                'DELETE FROM Comments WHERE post_id = ? AND post_type = ?',
                [recipeId, postType]
            );
            await connection.execute(
                'DELETE FROM Ratings WHERE post_id = ? AND post_type = ?',
                [recipeId, postType]
            );
            await connection.execute(
                'DELETE FROM Reports WHERE post_id = ? AND post_type = ?',
                [recipeId, postType]
            );
            await connection.execute(
                'DELETE FROM Saved_Posts WHERE post_id = ? AND post_type = ?',
                [recipeId, postType]
            );

           const [deleteResult] = await connection.execute(
                'DELETE FROM Recipes WHERE recipe_id = ?',
                [recipeId]
            ); 

            if (deleteResult.affectedRows === 0) {
                await connection.rollback();
                throw new Error('Không tìm thấy công thức để xóa.');
            }

            // 5. Commit Transaction
            await connection.commit();
            return {
                success: true,
                message: "Đã xóa thành công!"
            };            
        } catch (error) {
            await connection.rollback();
            console.error('Lỗi Model (deleteById):', error);
            throw new Error(`Xóa thất bại: ${error.message}`); 
        } finally {
            if (connection) connection.release();
        }
    }

    static async findById(recipeId) {
        if (!recipeId) {
            console.log("RecipeModel: Không có recipeId");
            return null;
        }

        const connection = await pool.getConnection();
        try {
            // --- Query 1: Lấy thông tin Recipe và User ---

            const recipeSql = `
                SELECT 
                    R.*, 
                    U.full_name AS author_name, 
                    U.avatar AS author_avatar
                FROM Recipes R
                JOIN Users U ON R.user_id = U.user_id
                WHERE R.recipe_id = ? 
            `;
            
            const sqlParams = [recipeId]; 

            let [recipeRows] = await connection.execute(recipeSql, sqlParams);

            if (recipeRows.length === 0) {
                return null; // Không tìm thấy công thức
            }

            const recipe = recipeRows[0];

            // --- Query 2: Lấy thông tin Nguyên liệu ---

            const ingredientSql = `
                SELECT 
                    RI.quantity, 
                    I.name AS ingredient_name,
                    U.name AS unit_name,
                    U.unit_id
                FROM recipe_ingredients RI
                JOIN Ingredients I ON RI.ingredient_id = I.ingredient_id
                JOIN Units U ON RI.unit_id = U.unit_id
                WHERE RI.recipe_id = ?
            `;
            
            // Sửa 3: Thực thi 'ingredientSql' (không phải 'sql')
            // Dùng mảng [recipeId] làm tham số
            let [ingredientRows] = await connection.execute(ingredientSql, [recipeId]);

            // Sửa 4: Gán kết quả nguyên liệu (ngay cả khi rỗng)
            // Không nên return null ở đây, vì công thức có thể không có nguyên liệu
            recipe.ingredients = ingredientRows;

            return recipe;

        } catch (error) {
            console.error('Lỗi Model (findById):', error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    static async getRecipes(page, limit, filters = {}){
        const skip = (page-1) *limit;

        const queryParts = buildRecipeQuery(filters);

        const selectFragment = 'SELECT R.cover_image, R.title, like_count,comment_count, rating_avg_score, U.full_name FROM Recipes AS R LEFT JOIN users AS U ON R.user_id = U.user_id ';
        // selectFragment += '';
        const countFragment = 'SELECT COUNT(DISTINCT R.recipe_id) AS total FROM Recipes AS R ';

        // 1. JOIN 
        const joinString =queryParts.joinClauses.join(' ');

        // 2. WHERE (Luôn có ít nhất status = "public")
        const whereString = ' WHERE ' + queryParts.whereClauses.join(' AND ');

        // 3. Tham số
        const filterParams = queryParts.params;

        // --- Truy vấn SELECT ---
        const orderLimitOffset = ' ORDER BY R.created_at DESC LIMIT ? OFFSET ?';

        // Số lượng
        // --- Truy vấn COUNT ---
        const [countResult] = await pool.execute(
            countFragment + joinString + whereString,
            filterParams
        );
        const totalItems = Number(countResult[0].total);

        // Kết hợp tham số lọc và tham số phân trang
        const finalParams = [
            ...filterParams, 
            limit.toString(), 
            skip.toString()
        ];

        const [result] = await pool.execute(
            selectFragment + joinString + whereString + orderLimitOffset,
            finalParams
        );
        return {
            recipes: result,
            totalItems: totalItems
        }
    }

    static async getRecentlyRecipes(category, tag, limit = 10) {
        try {
            const sql = `
            SELECT 
                R.*, 
                U.full_name as author_name, 
                U.avatar as author_avatar,
                GROUP_CONCAT(DISTINCT I.name SEPARATOR ',') as ingredient_names,
                
                GROUP_CONCAT(
                    DISTINCT CONCAT(Commenter.full_name, ':::', C.content) 
                    SEPARATOR '|||'
                ) as comment_data

            FROM Recipes R
            JOIN Users U ON R.user_id = U.user_id
            
            -- Join Ingredients (Giữ nguyên)
            LEFT JOIN recipe_ingredients RI ON R.recipe_id = RI.recipe_id
            LEFT JOIN Ingredients I ON RI.ingredient_id = I.ingredient_id
            
            -- Join Comments (MỚI)
            -- Lưu ý điều kiện post_type = 'recipe'
            LEFT JOIN Comments C ON R.recipe_id = C.post_id AND C.post_type = 'recipe'
            -- Join User lần 2 (đặt tên là Commenter) để lấy tên người bình luận
            LEFT JOIN Users Commenter ON C.user_id = Commenter.user_id

            WHERE R.status = 'public'
            GROUP BY R.recipe_id
            ORDER BY R.created_at DESC 
            LIMIT ?
            `;

            const sqlParams = [limit.toString()];
            
            const [result] = await pool.execute(sql, sqlParams);

            return result;
        } catch (err){
            console.log(err.message);
            throw err;
        }
    }

    static async getFeatureRecipes(limit = 10) {
        try {
            const criteria = FEATURE_CRITERIA;

            const sql = `
                SELECT * FROM recipes
                WHERE status = 'public'
                AND like_count >= ?
                AND report_count < ?
                AND rating_avg_score >= ?
                ORDER BY report_count ASC, rating_avg_score DESC, created_at DESC, like_count DESC 
                LIMIT 5;
            `

            const sqlParams = [
                criteria.MIN_LIKES,
                criteria.MAX_REPORTS,
                criteria.MIN_AVG_RATING,
            ];

            console.log("Vừa gán tham số xong");
            const [result] = await pool.execute(sql, sqlParams);
            console.log("Vừa mới truy vấn dtb");
            return result;
        } catch(err) {
            console.log(err.message);
            throw err;
        }
    }

    static async getOwnerRecipe(userId){
        try {
            const sql = `
                SELECT * FROM recipes
                WHERE user_id = ?
                ORDER BY update_at DESC
            `
            const [result] = await pool.execute(sql, [userId]);
            console.log(`Đang lấy công thức cá nhân: ${result}`);
            return result;
        } catch (error) {
            console.error('Lỗi Model (getOwnerRecipe):', error);
            throw new Error(`Lấy recipe thất bại: ${error.message}`);
        }
    }

    static async getUserRecipe(userId){
         try {
            const sql = `
                SELECT * FROM recipes
                WHERE user_id = ? AND status = "public"
            `
            const [result] = await pool.execute(sql, [userId]);
            return result;
        } catch (error) {
            console.error('Lỗi Model (getUserRecipe):', error);
            throw new Error(`Lấy recipe thất bại: ${error.message}`);
        }
    }

    static async updateStatus(recipeId, newStatus) {
        try {
            const sql = `
                UPDATE Recipes 
                SET status = ?, update_at = NOW() 
                WHERE recipe_id = ?
            `;
            const [result] = await pool.execute(sql, [newStatus, recipeId]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Lỗi Model (updateStatus):', error);
            throw error;
        }
    }


    
}

module.exports = Recipe;