// VỊ TRÍ TẠO FILE MỚI: backend/controllers/extension.controllers.js

const db = require('../config/db'); // Dùng pool DB hiện có của bạn
const extensionAiService = require('../services/extensionAi.service');

// 1. Lấy 3 món ăn ngẫu nhiên (Cho màn hình chính của Extension)
const suggestRecipes = async (req, res) => {
  try {
    const sql = `
      SELECT recipe_id, title, cover_image, cook_time, total_calo 
      FROM recipes 
      WHERE status = 'public' 
      ORDER BY RAND() 
      LIMIT 3
    `;
    const [rows] = await db.pool.execute(sql);
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Lỗi API Suggest:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// 2. Tìm kiếm theo text bôi đen (Không dùng AI, query LIKE trực tiếp)
const searchRecipes = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Thiếu từ khóa tìm kiếm' });
    }

    const sql = `
      SELECT recipe_id, title, cover_image, cook_time, total_calo
      FROM recipes 
      WHERE status = 'public' AND title LIKE ? 
      ORDER BY RAND()
      LIMIT 5
    `;
    const searchTerm = `%${query.trim()}%`;
    const [rows] = await db.pool.execute(sql, [searchTerm]);

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Lỗi API Search:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// 3. Phân tích ảnh -> Lấy tên món -> Truy vấn DB (Kết hợp AI + DB trong 1 lần gọi)
const identifyImage = async (req, res) => {
  try {
    const { image } = req.body; // Chuỗi base64
    if (!image) return res.status(400).json({ success: false, message: 'Thiếu ảnh' });

    // Dọn dẹp chuỗi base64 nếu Frontend lỡ gửi kèm header 'data:image/jpeg;base64,'
    const base64Data = image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

    // Bước 1: Gọi AI nhận diện tên món
    const dishName = await extensionAiService.identifyDishFromImage(base64Data);
    
    // Bước 2: Dùng tên món đó truy vấn ngay Database để tìm công thức liên quan
    const sql = `
      SELECT recipe_id, title, cover_image, cook_time, total_calo 
      FROM recipes 
      WHERE status = 'public' AND title LIKE ? 
      LIMIT 3
    `;
    const searchTerm = `%${dishName.replace(/["']/g, '').trim()}%`; 
    const [recipes] = await db.pool.execute(sql, [searchTerm]);

    return res.status(200).json({ 
      success: true, 
      dishName: dishName, // Trả về tên món để UI hiện "Có phải là: Phở bò?"
      data: recipes       // Trả về danh sách món nấu luôn
    });
  } catch (error) {
    console.error('Lỗi API Identify Image:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Trả lời câu hỏi dựa trên text bóc từ Web
const askContext = async (req, res) => {
  try {
    const { context, question } = req.body;
    if (!question) return res.status(400).json({ success: false, message: 'Thiếu câu hỏi' });

    // Gọi AI (Gửi cả text bóc được từ web và câu hỏi)
    const answer = await extensionAiService.answerContextQuestion(context, question);
    
    return res.status(200).json({ success: true, text: answer });
  } catch (error) {
    console.error('Lỗi API Ask Context:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { suggestRecipes, searchRecipes, identifyImage, askContext };