// VỊ TRÍ: backend/controllers/chatbot.controllers.js

const aiService = require('../services/ai.service');
const sqlValidator = require('../services/sqlValidator.service');
const sqlExecutor = require('../services/sqlExecutor.service');
const crypto = require('crypto'); // Thêm thư viện có sẵn của Nodejs để sinh chuỗi ngẫu nhiên
const TagModel = require('../models/tag.model'); // Giả sử bạn có model này để tương tác với DB

let cachedTags = null;

async function fetchAllTagsFromDB() {
    const tags = await TagModel.getAll();
    return tags.map(t => t.name); // Giả sử mỗi tag có trường 'name'
}




const handleChat = async (req, res) => {
  try {
    let { userId, message, sessionId, executeSql } = req.body;
    
    if (!cachedTags) {
      try {
        cachedTags = await fetchAllTagsFromDB();
        console.log("✅ Đã cache tags:", cachedTags);
      } catch (e) {
        console.error("❌ Lỗi khi lấy tags từ DB:", e.message);
        cachedTags = []; // Đặt mặc định để tránh lỗi sau này
      }
    }
    // NẾU FRONTEND KHÔNG GỬI LÊN HOẶC LÀ NULL, TỰ SINH SESSION ID ĐỂ TRÁNH LỖI "DÙNG CHUNG"
    if (!sessionId && !userId) {
       sessionId = crypto.randomBytes(16).toString('hex');
    }

    const clientIp = req.ip || (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection?.remoteAddress || null;
    const userAgent = req.get('user-agent') || null;

    if (!message) return res.status(400).json({ success: false, message: 'Missing message' });

    const tagListString = cachedTags.join(', ');
    const extraRule = `\nQUAN TRỌNG: Cơ sở dữ liệu hiện có các tag sau: [${tagListString}]. 
    - Khi người dùng nhắc đến nguyên liệu hoặc mục tiêu (ví dụ: ăn sáng, ăn chay, healthy, thịt gà), HÃY LINH HOẠT KẾT HỢP tìm kiếm trong bảng 'ingredients', các cột thuộc tính (như 'total_calo') VÀ tìm các tag đồng nghĩa có trong danh sách trên.
    - Khi dùng LIKE tìm kiếm, hãy cố gắng dùng TỪ KHÓA DÀI có nghĩa (ví dụ: dùng '%thịt gà%' thay vì chỉ '%gà%', dùng '%thịt bò%' thay vì '%bò%') để kết quả chính xác nhất.
    - NGƯƠI CHỈ ĐƯỢC PHÉP CHỌN CÁC TAG CÓ TRONG DANH SÁCH NÀY. Không tự bịa ra tag ngoài danh sách.`;


    const finalRules = (req.rules || '') + extraRule;

// Gửi finalRules thay vì req.rules ban đầu xuống aiService

    const aiResult = await aiService.generateResponse({ userId, message, sessionId, rules: finalRules, clientIp, userAgent });

    if (aiResult && aiResult.sql) {
      const sqlToRun = (req.body.sql) ? req.body.sql : aiResult.sql;
      if (sqlToRun) {
        const validation = sqlValidator.validateSQL(sqlToRun);
        if (!validation.valid) {
          console.log("❌ SQL BỊ TỪ CHỐI DO:", validation.reason);
          return res.status(200).json({ success: true, text: aiResult.text, sql: aiResult.sql, validation });
        }

        const rows = await sqlExecutor.execute(sqlToRun, { timeout: parseInt(process.env.CHATBOT_SQL_TIMEOUT_MS || '2000', 10), maxRows: parseInt(process.env.CHATBOT_MAX_ROWS || '200') });
        try {
          await aiService.logSqlExecution({ userId, sessionId, sql: sqlToRun, rowCount: Array.isArray(rows) ? rows.length : 0, clientIp, userAgent, retrievalCount: aiResult.retrievalCount || 0 });
        } catch (e) { }
        return res.status(200).json({ success: true, text: aiResult.text, sql: aiResult.sql, data: rows });
      }
      return res.status(200).json({ success: true, text: aiResult.text, sql: aiResult.sql, executeRecommended: true });
    }

    return res.status(200).json({ success: true, text: aiResult.text });
  } catch (err) {
    console.error('Chatbot handle error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// HÀM MỚI: Xóa lịch sử chat
const clearHistory = async (req, res) => {
  try {
    const { sessionId, userId } = req.body;
    if(sessionId || userId) {
      await aiService.clearChatHistory(sessionId, userId);
    }
    return res.status(200).json({ success: true, message: "Đã xóa lịch sử" });
  } catch(err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { handleChat, clearHistory };