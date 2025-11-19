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
    static async create(userId, title, description, instructions, ingredientsData){
        console.log(ingredientsData);
        
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const newRecipeId = uuidv4();

            const sql = `
                INSERT INTO Recipes 
                    (recipe_id, user_id, title, description, instructions, status)
                VALUES 
                    (?, ?, ?, ?, ?, ?)
            `;
            
            const params = [
                newRecipeId,
                userId, // <-- user_id lấy từ token
                title,
                description,
                instructions,
                'public' // Hoặc 'draft' tùy logic của bạn
            ];

            await connection.execute(sql, params);

            const ingredientPlaceholders = [];
            const ingredientParams = [];

            await Promise.all(ingredientsData.map(async (ing) => {
                
                let ingredientId;

                let [foundIng] = await connection.execute(
                    `SELECT ingredient_id FROM Ingredients WHERE name = ? AND status = 'approved'`, 
                    [ing.name]  
                );

                if (foundIng.length > 0){
                    ingredientId = foundIng[0].ingredient_id;
                } else {
                    const [newIng] = await connection.execute(
                        `INSERT IGNORE INTO Ingredients (name, status) VALUES (?, 'pending')`, 
                        [ing.name]
                    );

                    if (newIng.insertId) {
                        ingredientId = newIng.insertId;
                    } else {
                        [foundIng] = await connection.execute(
                            `SELECT ingredient_id FROM Ingredients WHERE name = ?`, 
                            [ing.name]
                        );
                        ingredientId = foundIng[0].ingredient_id;
                    }
                }

                // Bước 4.2: Thêm vào mảng để INSERT hàng loạt
                ingredientPlaceholders.push('(?, ?, ?, ?)'); // (recipe_id, ingredient_id, quantity, unit_id)
                ingredientParams.push(newRecipeId, ingredientId, ing.quantity, ing.unit_id);            

            }));

            if (ingredientPlaceholders.length > 0) {
                const ingredientSql = `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id) VALUES ${ingredientPlaceholders.join(', ')}`;
                await connection.execute(ingredientSql, ingredientParams);
            }

            await connection.commit();

            return {
                recipe_id: newRecipeId,
                user_id: userId,
                title: title
            }

        } catch (err) {
            await connection.rollback();
            console.log(err.message);
            throw err;
        } finally {
            connection.release();
        }
    }

    static async update(recipeId, recipeData, ingredientList) {
        const connection = await pool.getConnection();

        let newIngredientsPending = false;
        let totalCalo;

        try {
            await connection.beginTransaction();

            const recipeKeys = Object.keys(recipeData).filter(
                (key) => key !== 'total_calo'
            );

            if (recipeKeys.length > 0) {
                const setClauses = recipeKeys.map(key => `\`${key}\` = ?`);

                setClauses.push('update_at = NOW()');

                const queryValues = recipeKeys.map(key => recipeData[key]);
                queryValues.push(recipeId);

                // const recipeIdPlaceholder = `$${queryValues.length}`;

                const updateQuery = `
                    UPDATE Recipes 
                    SET ${setClauses.join(', ')} 
                    WHERE recipe_id = ?
                `;

                await connection.execute(updateQuery, queryValues);
            }

            await connection.execute(
                'DELETE FROM recipe_ingredients WHERE recipe_id = ?',
                [recipeId]
            );

            if (ingredientList && ingredientList.length > 0){
                const processedIngredients = await Promise.all(ingredientList.map(async (item) => {
                    const {name: ingredientName, quantity, unit_id: unitId} = item;

                    let ingredientId;
                    let ingredientStatus = 'approved';

                    let [foundIng] = await connection.execute(
                        `SELECT ingredient_id, status FROM Ingredients WHERE name = ?`, 
                         [ingredientName]                   
                    )

                    if (foundIng.length > 0){
                        ingredientId = foundIng[0].ingredient_id;
                        ingredientStatus = foundIng[0].status;
                    } else {
                        const [newIng] = await connection.execute(
                            `INSERT IGNORE INTO Ingredients (name, status) VALUES (?, 'pending')`, 
                            [ingredientName]
                        );

                        if (newIng.insertId) { // insertId là của mysql2
                        ingredientId = newIng.insertId;
                        ingredientStatus = 'pending';
                        } else {
                        // Bị IGNORE (do race condition), query lại để lấy ID
                        [foundIng] = await connection.execute(
                            `SELECT ingredient_id, status FROM Ingredients WHERE name = ?`, 
                            [ingredientName]
                        );
                        ingredientId = foundIng[0].ingredient_id;
                        ingredientStatus = foundIng[0].status;
                        }                        
                    }

                    if (ingredientStatus === 'pending') {
                        newIngredientsPending = true; // Đặt cờ thông báo
                    }     
                    
                    // // 3. Tính toán Calo (Tạm thời = 0 nếu pending)
                    let calculatedCalo = 0;
                    // if (ingredientStatus === 'approved') {
                    //     // ... (Logic tính calo của bạn ở đây) ...
                    //     // const [caloData] = await connection.execute('SELECT ...');
                    //     // calculatedCalo = ...
                    // }         
                    
                    // Trả về đối tượng để bulk insert và tính tổng calo
                    return {
                        ingredientId,
                        quantity,
                        unitId,
                        calo: calculatedCalo,
                        isPending: ingredientStatus === 'pending'
                    };                    
                }));

                // 4.1. Tính tổng calo (An toàn, sau khi Promise.all hoàn tất)
                totalCalo = processedIngredients.reduce((sum, item) => sum + item.calo, 0);
                // 4.2. Tạo câu lệnh bulk insert
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

            await connection.execute(
                'UPDATE Recipes SET total_calo = ? WHERE recipe_id = ?',
                [totalCalo, recipeId]
            );

            await connection.commit();

            return { 
                success: true, 
                message: 'Cập nhật công thức thành công!',
                notification: newIngredientsPending 
                ? 'Một số nguyên liệu mới đã được thêm và đang chờ duyệt. Lượng calo có thể chưa chính xác.' 
                : null 
            };

        } catch (error) {
            // 7. Rollback nếu có lỗi (cú pháp mysql2)
            await connection.rollback();
            console.error('Lỗi khi cập nhật công thức (MySQL):', error);
            // Ném lỗi ra để controller bắt được
            throw new Error(`Cập nhật thất bại: ${error.message}`);
        } finally {
            if (connection){
                connection.release();
            }
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
                WHERE R.recipe_id = ? AND R.status = 'public'
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

        const selectFragment = 'SELECT R.cover_image, R.title, like_count,comment_count, rating_avg_score, U.full_name FROM Recipes AS R LEFT JOIN users AS U ON R.user_id = U.user_id';
        // selectFragment += '';
        const countFragment = 'SELECT COUNT(DISTINCT R.recipe_id) AS total FROM Recipes AS R';

        // 1. JOIN 
        const joinString = queryParts.joinClauses.join(' ');

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
            let sql = 'Select * from recipes where status = "public"';
            let sqlParams = [];
            sql += 'order by created_at Desc limit ?';
            sqlParams.push(limit.toString());
            
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

}

module.exports = Recipe;