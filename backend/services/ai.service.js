// VỊ TRÍ: backend/services/ai.service.js

const fs = require('fs');
const path = require('path');
const { createClient } = require('redis');
const { buildSystemInstruction } = require('../utils/promptTemplates');
const { getAvailableKey } = require('./apiKey.service');
const vs = require('./vectorstore.service');
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
      maxOutputTokens: 8192,
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
async function generateResponse({ userId, message, sessionId, rules, clientIp, userAgent, currentContext }) {
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
  const systemInstructionText = buildSystemInstruction({ rulesText, schemaSnippet, examples: null, currentContext });

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

// ==========================================
// TÍNH NĂNG AI DÀNH RIÊNG CHO MENU PLANNER
// ==========================================
async function analyzeMenuWithAI(menuData) {
    const apiKey = await require('./apiKey.service').getAvailableKey();
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite'; 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;
  
    // Đóng gói Prompt (Vai trò chuyên gia)
    const systemInstruction = `Bạn là một Chuyên gia Dinh dưỡng hàng đầu của ứng dụng Vào Bếp. 
    Nhiệm vụ của bạn là nhận xét thực đơn của người dùng, đánh giá lượng Calo, sự cân bằng dinh dưỡng, và đưa ra lời khuyên ngắn gọn, thân thiện (dùng icon emoji). 
    Lưu ý: Chỉ trả về Text thuần hoặc định dạng Markdown cơ bản (in đậm, gạch đầu dòng). KHÔNG sinh ra mã code. Viết ngắn gọn khoảng 150-200 chữ.`;

    const body = {
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{
            role: "user",
            parts: [{ text: `Hãy nhận xét cấu trúc thực đơn sau của tôi:\n${JSON.stringify(menuData)}` }]
        }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 800 }
    };
  
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
  
    if (!res.ok) throw new Error('Gemini API error');
    const json = await res.json();
    return json.candidates[0].content.parts[0].text;
}

// ==========================================
// TÍNH NĂNG AI: TỰ ĐỘNG SINH THỰC ĐƠN (RAG)
// ==========================================
// async function generateMenuWithRAG(prompt) {
//     try {
//         // 1. Tạo Vector Embedding từ câu lệnh của User
//         const emb = await getEmbedding(prompt);
        
//         // 2. Tìm kiếm 30 món ăn phù hợp nhất trong Pinecone Vector DB
//         const matches = await vs.retrieve(emb, 30);
        
//         if (!matches || matches.length === 0) {
//             throw new Error("Không tìm thấy món ăn nào phù hợp trong kho dữ liệu.");
//         }

//         // 3. Đóng gói dữ liệu Context cho AI
//         const recipeContext = matches.map(m => {
//             // Rút gọn text để tiết kiệm token
//             const shortText = m.metadata?.text ? m.metadata.text.substring(0, 80).replace(/\n/g, ' ') : '';
//             return `ID: ${m.id} | Tên món: ${m.metadata?.title}`;
//         }).join('\n');

//         // 4. Gọi Gemini API với Prompt ép định dạng JSON cứng
//         const apiKey = await require('./apiKey.service').getAvailableKey();
//         const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite'; 
//         const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;

//         const systemInstruction = `Bạn là một hệ thống AI tự động lên thực đơn chuyên nghiệp.
//         NHIỆM VỤ CỦA BẠN: Lên thực đơn theo yêu cầu của người dùng, CHỈ ĐƯỢC PHÉP CHỌN CÁC MÓN ĂN TỪ DANH SÁCH BÊN DƯỚI.
        
//         [DANH SÁCH MÓN ĂN TRONG DATABASE CỦA HỆ THỐNG]
//         ${recipeContext}
        
//         QUY TẮC BẮT BUỘC:
//         1. Phân bổ hợp lý các món vào các bữa: breakfast (Sáng), lunch (Trưa), dinner (Tối), snack (Phụ).
//         2. BẮT BUỘC TRẢ VỀ ĐÚNG ĐỊNH DẠNG JSON SAU ĐÂY. KHÔNG BỔ SUNG TEXT. KHÔNG BỔ SUNG MARKDOWN (như \`\`\`json).
        
//         [ĐỊNH DẠNG JSON YÊU CẦU]
//         [
//             {
//                 "day_id": "random-uuid-1",
//                 "title": "Ngày 1",
//                 "meals": [
//                     {
//                         "meal_id": "random-uuid-2",
//                         "meal_type": "lunch",
//                         "title": "Bữa trưa",
//                         "recipes": [
//                             {
//                                 "recipe_id": "<ID CỦA MÓN TRONG DANH SÁCH>",
//                                 "title": "<TÊN MÓN TRONG DANH SÁCH>",
//                                 "servings_multiplier": 1,
//                                 "total_calo": 0
//                             }
//                         ]
//                     }
//                 ]
//             }
//         ]`;

//         const body = {
//             systemInstruction: { parts: [{ text: systemInstruction }] },
//             contents: [{ role: "user", parts: [{ text: `Yêu cầu lên thực đơn: ${prompt}` }] }],
//             generationConfig: { temperature: 0.2, maxOutputTokens: 2000 } // Temperature thấp để tránh AI bị ảo giác
//         };
      
//         const res = await fetch(url, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(body)
//         });

//         if (!res.ok) {
//             const errText = await res.text(); // ✅ Thêm dòng này
//             console.error('❌ Gemini API error:', res.status, errText); // ✅ Log chi tiết
//             throw new Error(`Gemini API error: ${res.status} - ${errText}`);
//         }
      
//         const jsonRes = await res.json();
//         let aiText = jsonRes.candidates[0].content.parts[0].text;

//         // 5. Làm sạch JSON (Phòng trường hợp AI vẫn cố tình nhét ```json vào)
//         aiText = aiText.replace(/```json/gi, '').replace(/```/g, '').trim();
//         if (!aiText.endsWith(']')) {
//             console.error('⚠️ AI trả về JSON bị cắt, độ dài:', aiText.length);
//             console.error('⚠️ 200 ký tự cuối:', aiText.slice(-200));
//             throw new Error('AI response bị cắt giữa chừng (maxOutputTokens quá nhỏ). Vui lòng thử lại.');
//         }

//         const daysData = JSON.parse(aiText);
//         return daysData;

//     } catch (error) {
//         console.error("Lỗi generateMenuWithRAG:", error);
//         throw error;
//     }
// }

async function generateMenuWithRAG(prompt) {
    try {
        const emb = await getEmbedding(prompt);
        const matches = await vs.retrieve(emb, 20); // ✅ Giảm từ 30 xuống 20
        
        if (!matches || matches.length === 0) {
            throw new Error("Không tìm thấy món ăn nào phù hợp trong kho dữ liệu.");
        }

        // ✅ Chỉ lấy ID + Tên, bỏ hoàn toàn phần "text" dài
        const recipeContext = matches.map(m =>
            `- ID: ${m.id} | Tên: ${m.metadata?.title}`
        ).join('\n');


        console.log("🔍 Món ăn được tìm thấy cho RAG:\n", recipeContext);
        const apiKey = await require('./apiKey.service').getAvailableKey();
        const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;

        // ✅ Tách system instruction ngắn gọn, đẩy context vào user message
        const systemInstruction = `Bạn là hệ thống lên thực đơn tự động. 
Chỉ được chọn món từ danh sách được cung cấp.
Trả về JSON thuần, không markdown, không giải thích.
Định dạng JSON:
[{"day_id":"uuid","title":"Ngày 1","meals":[{"meal_id":"uuid","meal_type":"breakfast|lunch|dinner|snack","title":"Tên bữa","recipes":[{"recipe_id":"ID_MON","title":"TÊN_MÓN","servings_multiplier":1,"total_calo":0}]}]}]`;

        const userMessage = `Danh sách món ăn:
${recipeContext}

Yêu cầu: ${prompt}
Trả về JSON theo đúng định dạng, không thêm gì khác.`;

        const body = {
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents: [{ role: "user", parts: [{ text: userMessage }] }],
            generationConfig: { 
                temperature: 0.2, 
                maxOutputTokens: 8192
            }
        };
      
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
      
        if (!res.ok) {
            const errText = await res.text();
            console.error('❌ Gemini error:', res.status, errText);
            throw new Error(`Gemini API error: ${res.status}`);
        }

        const jsonRes = await res.json();
        let aiText = jsonRes.candidates[0].content.parts[0].text;

        aiText = aiText.replace(/```json/gi, '').replace(/```/g, '').trim();
        
        if (!aiText.endsWith(']')) {
            console.error('⚠️ JSON vẫn bị cắt, độ dài:', aiText.length);
            console.error('⚠️ 300 ký tự cuối:', aiText.slice(-300));
            throw new Error('AI response bị cắt. Hãy thử yêu cầu ít ngày hơn.');
        }
        
        return JSON.parse(aiText);

    } catch (error) {
        console.error("Lỗi generateMenuWithRAG:", error);
        throw error;
    }
}

// ... (Các code cũ của ai.service.js giữ nguyên)

// HÀM MỚI: Tóm tắt bài viết / công thức (Thay thế cho recipeAi.service.js cũ)
async function generateSummary(contextText) {
    const apiKey = await getAvailableKey();
    const model = process.env.EXTENSION_GEMINI_MODEL || 'gemini-2.5-flash-lite'; 
    if (!apiKey) throw new Error('Missing GOOGLE_API_KEY');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;
    
    const systemInstruction = `Bạn là chuyên gia dinh dưỡng và đầu bếp AI. Hãy tóm tắt nội dung sau một cách ngắn gọn, súc tích. Đưa ra các điểm chính và các lưu ý quan trọng nếu có. Trình bày bằng Markdown đẹp mắt.`;

    const body = {
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: 'user', parts: [{ text: `Văn bản cần tóm tắt:\n${contextText}` }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 800 }
    };

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);

    const json = await res.json();
    return json.candidates[0].content.parts[0].text.trim();
}

// Cập nhật lại module.exports ở cuối file ai.service.js:
module.exports = { 
    generateResponse, 
    logSqlExecution, 
    getEmbedding, 
    clearChatHistory, 
    analyzeMenuWithAI, 
    generateMenuWithRAG, 
    generateSummary // Bổ sung hàm này
};

// Cập nhật module.exports cuối file:
module.exports = { 
  generateResponse, 
  logSqlExecution, 
  getEmbedding, 
  clearChatHistory, 
  analyzeMenuWithAI, 
  generateMenuWithRAG,
  generateSummary
 };
