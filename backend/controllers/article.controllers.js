const paginationHelper = require('../utils/paginationHelper');
const { getUserIdFromToken } = require('../utils/auth.utils');
const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const ArticleModel = require('../models/article.model');
const TagModel = require('../models/tag.model');
const InteractionModel = require('../models/interaction.model');
const RecipeLinkModel = require('../models/recipe_link.model');
// Hàm hỗ trợ kiểm tra quyền sở hữu bài viết
const checkArticleOwner = async (articleId, userId) => {
    try {
        const sql = 'SELECT user_id FROM Article_Posts WHERE article_id = ?';
        const [owner] = await db.pool.execute(sql, [articleId]);
        if (owner.length === 0) return false;
        console.log(`gia trị owner: ${owner[0].user_id}, userId: ${userId}`);
        return owner[0].user_id === userId;
    } catch (error) {
        console.error("Lỗi khi kiểm tra quyền sở hữu article:", error);
        return false;     
    }
};

const ArticleController = {
    // 1. Tạo bài viết học thuật mới
    createArticle: async (req, res) => {
        const connection = await db.pool.getConnection();
        try {
            await connection.beginTransaction();

            const articleId = req.savedArticleId; // Lấy ID đã tạo từ middleware
            const userId = req.user.id; // Lấy từ token đăng nhập

            const { title, description, content, status, read_time, recipeIds} = req.body;

            
            let parsedTags = [];
            if (req.body.tags) {
                parsedTags = typeof req.body.tags === 'string' ? JSON.parse(req.body.tags) : req.body.tags;
            }

            let parsedRecipeIds = [];
            if (recipeIds) {
                parsedRecipeIds = typeof recipeIds === 'string' ? JSON.parse(recipeIds) : recipeIds;
            }

            // Xử lý ảnh bìa
            let coverImageName = null;
            if (req.files && req.files['cover_image'] && req.files['cover_image'].length > 0) {
                coverImageName = req.files['cover_image'][0].filename;
            }

            // Gọi Model để lưu
            await ArticleModel.create(connection, {
                articleId,
                userId,
                title,
                description,
                content,
                coverImage: coverImageName,
                status: status || 'draft',
                readTime: read_time || 1
            });

            if (parsedTags.length > 0) {
                await TagModel.addTagsToPost(articleId, 'article', parsedTags, connection);
            }

            if (parsedRecipeIds.length > 0) {
                await RecipeLinkModel.addRecipeLinksToArticle(connection, articleId, parsedRecipeIds);
            }

            await connection.commit();

            res.status(201).json({
                success: true,
                message: "Đăng bài học thuật thành công!",
                data: { article_id: articleId }
            });
        } catch (err) {
            await connection.rollback(); //
            console.error("Lỗi create article with links:", err);
            res.status(500).json({ success: false, message: "Lỗi server: " + err.message });
        } finally {
            connection.release();
        }
    },

    // 2. Chỉnh sửa bài viết
    updateArticle: async (req, res) => {
        const connection = await db.pool.getConnection();
        try {
            await connection.beginTransaction();
            const { articleId } = req.params;
            const userId = req.user.id;
            const userRole = req.user.role;

            const article = await ArticleModel.findById(articleId);
            if (!article) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết!' });
            }
            if (article.status === 'banned') {
                await connection.rollback();
                return res.status(403).json({ success: false, message: 'Bài viết đã bị khóa vi phạm, không thể chỉnh sửa!' });
            }

            // Kiểm tra quyền (Chỉ chủ bài viết hoặc admin mới được sửa)
            const isOwner = await checkArticleOwner(articleId, userId);
            if (!isOwner && userRole !== 'admin') {
                await connection.rollback();
                return res.status(403).json({ success: false, message: 'Bạn không có quyền chỉnh sửa bài viết này!' });
            }



            const { title, description, content, status, read_time, recipeIds } = req.body;
            let updateData = { title, description, content, status, read_time};

            // Xử lý nếu có cập nhật ảnh bìa mới
            // Xử lý nếu có cập nhật ảnh bìa mới
            if (req.files && req.files['cover_image'] && req.files['cover_image'].length > 0) {
                const newImageName = req.files['cover_image'][0].filename;
                
                // --- THÊM MỚI: Xóa ảnh cũ nếu tồn tại ---
                if (article.cover_image) {
                    const oldFilePath = path.join(__dirname, '../public/articles', articleId, article.cover_image);
                    if (fs.existsSync(oldFilePath)) {
                        fs.unlinkSync(oldFilePath); // Xóa file lẻ
                    }
                }
                // ---------------------------------------
                
                updateData.cover_image = newImageName;
            }

            // Xóa các trường undefined để không update đè null vào DB
            Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

            await ArticleModel.update(connection, articleId, updateData);

            if (req.body.tags !== undefined) {
                let parsedTags = typeof req.body.tags === 'string' ? JSON.parse(req.body.tags) : req.body.tags;
                await TagModel.updateTagsForPost(articleId, 'article', parsedTags, connection);
            }

            if (recipeIds !== undefined) {
                let parsedRecipeIds = typeof recipeIds === 'string' ? JSON.parse(recipeIds) : recipeIds;
                // Xóa cũ - Thêm mới liên kết
                await RecipeLinkModel.updateRecipeLinksForArticle(connection, articleId, parsedRecipeIds);
            }

            await connection.commit();

            res.status(200).json({
                success: true,
                message: "Cập nhật bài viết thành công!"
            });
        } catch (err) {
            await connection.rollback(); // Có lỗi là hủy hết
            console.error("Lỗi update article with links:", err);
            res.status(500).json({ success: false, message: "Lỗi server: " + err.message });
        } finally {
            connection.release(); // Trả kết nối về pool
        }
    },

    // 3. Xóa bài viết
    deleteArticle: async (req, res) => {
        try {
            const { articleId } = req.params;
            const userId = req.user.id;
            const userRole = req.user.role;

            const isOwner = await checkArticleOwner(articleId, userId);
            if (!isOwner && userRole !== 'admin') {
                return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa bài viết này!' });
            }

            // --- THÊM MỚI: Xóa thư mục ảnh vật lý ---
            const articleDir = path.join(__dirname, '../public/articles', articleId);
            if (fs.existsSync(articleDir)) {
                // Xóa thư mục và tất cả file bên trong (recursive)
                fs.rmSync(articleDir, { recursive: true, force: true });
            }
            // ---------------------------------------

            await ArticleModel.deleteById(articleId);

            res.status(200).json({
                success: true,
                message: "Đã xóa bài viết và dữ liệu hình ảnh thành công!"
            });
        } catch (err) { /*...*/ }
    },

    // 4. Lấy danh sách bài viết công khai (Cho trang Học thuật)
    getPublicArticles: async (req, res) => {
            try {
                // 1. Lấy và chuẩn hóa các tham số từ Query String
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 5;
                const offset = (page - 1) * limit;
                
                const keyword = req.query.q || ""; // Từ khóa tìm kiếm
                const sort = req.query.sort || "newest"; // Mặc định là mới nhất
                


                // Xử lý tags: Chấp nhận cả dạng mảng hoặc chuỗi phân tách bằng dấu phẩy
                let tagIds = [];
                if (req.query.tags) {
                    tagIds = Array.isArray(req.query.tags) 
                        ? req.query.tags 
                        : req.query.tags.split(',').filter(id => id.trim() !== "");
                }

                // 2. Gọi Model lấy dữ liệu và Tổng số lượng (để phân trang)
                // Chạy song song để tối ưu tốc độ
                const [articles, totalItems] = await Promise.all([
                    ArticleModel.getPublicArticles({ limit, offset, keyword, tagIds, sort }),
                    ArticleModel.countPublicArticles({ keyword, tagIds })
                ]);

                // 3. Gắn thêm Tags và Công thức liên quan cho từng bài viết
                const articlesWithDetails = await Promise.all(articles.map(async (article) => {
                    const [tags, linkedRecipes] = await Promise.all([
                        TagModel.getTagsByPostId(article.article_id),
                        RecipeLinkModel.getLinkedRecipesByArticleId(article.article_id)
                    ]);
                    return { 
                        ...article, 
                        tags, 
                        linked_recipes: linkedRecipes 
                    };
                }));

                const userId = getUserIdFromToken(req); // Lấy từ token (nếu có)
                if (userId && articlesWithDetails.length > 0) {
                    const postIds = articlesWithDetails.map(a => a.article_id);
                    const interactionStates = await InteractionModel.getBatchInteractionState(userId, postIds, 'article');
                    // Ghép trạng thái vào từng bài viết
                    articlesWithDetails.forEach(article => {
                        const state = interactionStates[article.article_id];
                        article.is_liked = state ? state.liked : false;
                        article.is_saved = state ? state.saved : false;
                    });
                }

                console.log("Danh sách bài viết đã lấy:", articlesWithDetails);

                // 4. Trả về kết quả kèm thông tin phân trang
                res.status(200).json({
                    success: true,
                    message: "Lấy danh sách bài viết thành công",
                    data: articlesWithDetails,
                    pagination: paginationHelper.createPagination(page, limit, totalItems)
                });
            } catch (err) {
                console.error("Lỗi get public articles (Search/Filter):", err);
                res.status(500).json({ success: false, message: "Lỗi server: " + err.message });
            }
        },

    // 4b. Lấy các bài viết nổi bật (featured)
    getFeaturedArticles: async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const articles = await ArticleModel.getFeaturedArticles(limit);

            const articlesWithTags = await Promise.all(articles.map(async (article) => {
                const [tags, linkedRecipes] = await Promise.all([
                    TagModel.getTagsByPostId(article.article_id),
                    RecipeLinkModel.getLinkedRecipesByArticleId(article.article_id)
                ]);
                return { ...article, tags, linked_recipes: linkedRecipes };
            }));

            res.status(200).json({ success: true, data: articlesWithTags });
        } catch (err) {
            console.error("Lỗi get featured articles:", err);
            res.status(500).json({ success: false, message: "Lỗi server: " + err.message });
        }
    },

    // 5. Lấy danh sách bài viết của chính chuyên gia (Để quản lý)
    getOwnerArticles: async (req, res) => {
        try {
            const userId = req.user.id;
            const articles = await ArticleModel.getOwnerArticles(userId);
            const articlesWithTags = await Promise.all(articles.map(async (article) => {
                const [tags, linkedRecipes] = await Promise.all([
                    TagModel.getTagsByPostId(article.article_id),
                    RecipeLinkModel.getLinkedRecipesByArticleId(article.article_id)
                ]);
                return { ...article, tags, linked_recipes: linkedRecipes };
            })); 

            res.status(200).json({
                success: true,
                data: articlesWithTags
            });
        } catch (err) {
            console.error("Lỗi get owner articles:", err);
            res.status(500).json({ success: false, message: "Lỗi server: " + err.message });
        }
    },

    // 6. Lấy chi tiết một bài viết
    getArticleById: async (req, res) => {
        try {
            const { articleId } = req.params;
            const userId = getUserIdFromToken(req);
            // Bước 1: Lấy thông tin bài viết gốc trước
            const article = await ArticleModel.findById(articleId);

            if (!article) {
                return res.status(404).json({ success: false, message: "Không tìm thấy bài viết!" });
            }

            if (article.status === 'banned') {
                return res.status(403).json({ success: false, message: "Bài viết này đã bị khóa do vi phạm nội quy!" });
            }

            // Bước 2: Chạy song song 2 luồng để lấy Tags và Comments (Tăng tốc độ)
            // Lấy trang 1, 10 comments đầu tiên (có thể lấy page từ req.query nếu bạn muốn làm nút "Tải thêm")
            const [tags, commentsData, linkedRecipes, interactionState] = await Promise.all([
                TagModel.getTagsByPostId(articleId), 
                InteractionModel.getComments(articleId, 'article', 1, 10),
                RecipeLinkModel.getLinkedRecipesByArticleId(articleId), // Lấy món ăn đã gắn
                InteractionModel.getBatchInteractionState(userId, [articleId], 'article')   
            ]);
            const state = interactionState ? interactionState[articleId] : null;
            // Bước 3: Đóng gói tất cả vào 1 cục data và trả về cho Client
            article.tags = tags;
            article.comments = commentsData.comments;
            article.total_comments = article.commentCount;
            article.linked_recipes = linkedRecipes;
            
            article.is_liked = state ? state.liked : false;
            article.is_saved = state ? state.saved : false;

            res.status(200).json({
                success: true,
                data: article
            });
        } catch (err) {
            console.error("Lỗi get article details:", err);
            res.status(500).json({ success: false, message: "Lỗi server: " + err.message });
        }
    }
};

module.exports = ArticleController;