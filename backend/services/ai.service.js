// VỊ TRÍ: backend/services/ai.service.js

const fs = require('fs');
const path = require('path');
const { createClient } = require('redis');
const { buildSystemInstruction } = require('../utils/promptTemplates');
const { getAvailableKey } = require('./apiKey.service');
const LANGFUSE_BASE = process.env.LANGFUSE_BASE_URL;
const LANGFUSE_KEY = process.env.LANGFUSE_SECRET_KEY;

// 1. KHỞI TẠO REDIS CHO LỊCH SỬ CHAT
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisClient = createClient({ url: redisUrl });
redisClient.on('error', (err) => console.error('❌ Redis Error in AI Service:', err.message));
redisClient.connect().catch(() => {});

// Hàm lưu log Langfuse (giữ nguyên)
async function logToLangfuse(payload) {
  try {
    if (!LANGFUSE_BASE || !LANGFUSE_KEY) return;
    const url = `${LANGFUSE_BASE.replace(/\/$/, '')}/v1/events`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${LANGFUSE_KEY}` },
      body: JSON.stringify(payload)
    });
    if (!res.ok) console.error('Langfuse log failed:', res.status);
  } catch (err) {}
}

async function logSqlExecution({ userId, sessionId, sql, rowCount, clientIp, userAgent, retrievalCount }) {
  try {
    const payload = { type: 'sql_execution', userId, sessionId, sql, rowCount, retrievalCount: retrievalCount || 0, clientIp, userAgent, timestamp: new Date().toISOString() };
    await logToLangfuse(payload);
  } catch (e) {}
}

// 2. GỌI GEMINI API VỚI SYSTEM INSTRUCTION & HISTORY
async function callGemini(systemInstructionText, chatHistory) {
  const apiKey = await getAvailableKey();
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'; 
  if (!apiKey) throw new Error('Missing GOOGLE_API_KEY');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;
  
  // Cấu trúc payload CHUẨN MỚI
  const body = {
    systemInstruction: {
      parts: [{ text: systemInstructionText }] // Luật và Database nằm riêng ở đây
    },
    contents: chatHistory, // Toàn bộ mảng lịch sử trò chuyện nằm ở đây
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.2
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${txt}`);
  }

  const json = await res.json();
  try {
    return json.candidates[0].content.parts[0].text;
  } catch (err) {
    throw new Error('Lỗi khi đọc text từ Gemini: ' + JSON.stringify(json));
  }
}

// Giữ nguyên hàm extractSQL
function extractSQL(text) {
  const sqlBlock = /```sql\s*([\s\S]*?)```/i.exec(text);
  let rawSql = null;
  if (sqlBlock) {
    rawSql = sqlBlock[1].trim();
  } else {
    const selectMatch = /(^|\n)(select[\s\S]*?)(\n|$)/i.exec(text);
    if (selectMatch) {
      const candidate = selectMatch[2].trim();
      if (/\bfrom\b/i.test(candidate)) rawSql = candidate;
    }
  }
  if (rawSql && rawSql.endsWith(';')) rawSql = rawSql.slice(0, -1);
  return rawSql;
}

// 3. HÀM XỬ LÝ CHÍNH
async function generateResponse({ userId, message, sessionId, rules, clientIp, userAgent }) {
  const rulesText = rules || '';
  let schemaSnippet = '';
  
  try {
    // ĐÃ SỬA: Load file schema rút gọn thay vì toàn bộ table.sql
    const schemaPath = path.join(__dirname, '..', 'config', 'chatbot.schema.md');
    if (fs.existsSync(schemaPath)) {
      schemaSnippet = fs.readFileSync(schemaPath, 'utf8');
      console.log("✅ Đã load thành công DB Schema Rút Gọn!");
    } else {
      console.log("⚠️ KHÔNG TÌM THẤY file chatbot.schema.md tại:", schemaPath);
    }
  } catch (e) { console.error("Lỗi đọc schema:", e.message); }

  // 4. LẤY LỊCH SỬ CHAT TỪ REDIS
  const sessionKey = `chat_history:${sessionId || userId}`;
  let chatHistory = [];
  try {
    if (redisClient.isOpen) {
      const historyStr = await redisClient.get(sessionKey);
      if (historyStr) chatHistory = JSON.parse(historyStr);
    }
  } catch (e) { console.error("Lỗi lấy lịch sử Redis:", e.message); }

  // Đẩy câu chat mới của User vào mảng lịch sử
  chatHistory.push({ role: 'user', parts: [{ text: message }] });

  // Giữ tối đa 10 tin nhắn gần nhất để tránh quá tải token
  if (chatHistory.length > 10) chatHistory = chatHistory.slice(-10);

  // Tạo System Instruction
  const systemInstructionText = buildSystemInstruction({ rulesText, schemaSnippet, examples: null });

  console.log(`💬 Đang gửi lên AI... Session: ${sessionId || userId} | Độ dài lịch sử: ${chatHistory.length}`);
  
  let modelText;
  try {
    modelText = await callGemini(systemInstructionText, chatHistory);
  } catch (err) {
    console.error('Gemini call failed:', err.message);
    // Xóa câu user vừa đưa vào nếu lỗi để không làm hỏng lịch sử
    chatHistory.pop(); 
    return { text: `Lỗi kết nối với Trợ lý AI: ${err.message}`, sql: null, executeSql: false };
  }

  // Nếu AI gọi thành công, đẩy câu trả lời của AI vào mảng lịch sử
  chatHistory.push({ role: 'model', parts: [{ text: modelText }] });

  // 5. LƯU LẠI LỊCH SỬ VÀO REDIS (Sống trong 1 tiếng)
  try {
    if (redisClient.isOpen) {
      await redisClient.set(sessionKey, JSON.stringify(chatHistory), { EX: 3600 });
    }
  } catch (e) { console.error("Lỗi lưu lịch sử Redis:", e.message); }

  const sql = extractSQL(modelText);
  const executeSql = false;

  console.log("=== AI GENERATED SQL ===", sql || "Không có SQL");

  return { text: modelText, sql, executeSql, retrievalCount: 0 };
}

// Hàm getEmbedding (Giữ nguyên)
async function getEmbedding(text) {
  const model = process.env.EMBEDDING_MODEL; 
  if (!model || !process.env.GOOGLE_API_KEY) throw new Error('Missing embedding model or API key');
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:embedContent?key=${process.env.GOOGLE_API_KEY}`;
  const body = { content: { parts: [{ text: text }] } };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  if (!res.ok) { 
    const t = await res.text(); 
    throw new Error('Embedding call failed: ' + t); 
  }
  const j = await res.json();
  if (j.embedding && j.embedding.values) return j.embedding.values;
  throw new Error('Unknown embedding response format');
}

// Thêm đoạn này vào gần cuối file ai.service.js
async function clearChatHistory(sessionId, userId) {
  const sessionKey = `chat_history:${sessionId || userId}`;
  try {
    if (redisClient.isOpen) {
      await redisClient.del(sessionKey);
      console.log(`🧹 Đã xóa lịch sử chat cho session: ${sessionKey}`);
    }
  } catch (e) {
    console.error("Lỗi xóa lịch sử Redis:", e.message);
  }
}

// Cập nhật lại dòng module.exports cuối cùng:
module.exports = { generateResponse, logSqlExecution, getEmbedding, clearChatHistory };
