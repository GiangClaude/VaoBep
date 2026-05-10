const fs = require('fs');
// const fetch = require('node-fetch');
const { buildPrompt } = require('../utils/promptTemplates');

const LANGFUSE_BASE = process.env.LANGFUSE_BASE_URL;
const LANGFUSE_KEY = process.env.LANGFUSE_SECRET_KEY;

async function logToLangfuse(payload) {
  try {
    if (!LANGFUSE_BASE || !LANGFUSE_KEY) return;
    const url = `${LANGFUSE_BASE.replace(/\/$/, '')}/v1/events`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${LANGFUSE_KEY}` },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const t = await res.text();
      console.error('Langfuse log failed:', res.status, t);
    }
  } catch (err) {
    console.error('Langfuse log failed:', err.message);
  }
}

// Exposed for controller use to log SQL executions
async function logSqlExecution({ userId, sessionId, sql, rowCount, clientIp, userAgent, retrievalCount }) {
  try {
    const payload = {
      type: 'sql_execution',
      userId,
      sessionId,
      sql,
      rowCount,
      retrievalCount: retrievalCount || 0,
      clientIp: clientIp || null,
      userAgent: userAgent || null,
      timestamp: new Date().toISOString()
    };
    await logToLangfuse(payload);
  } catch (e) { /* ignore */ }
}


// Call Google Generative API (Gemini) via REST
// async function callGemini(prompt) {
//   const apiKey = process.env.GOOGLE_API_KEY;
//   const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
//   if (!apiKey) throw new Error('Missing GOOGLE_API_KEY');

//   const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;
//   const body = {
//     contents: [{
//       parts: [{ text: prompt }]
//     }],
//     generationConfig: {
//       maxOutputTokens: 512,
//       temperature: 0.2
//     }
//   };

//   const res = await fetch(url, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(body)
//   });

//   if (!res.ok) {
//     const txt = await res.text();
//     throw new Error(`Gemini API error: ${res.status} ${txt}`);
//   }

//   const json = await res.json();
//   const text = (json.candidates && json.candidates[0] && json.candidates[0].output) || (json.output && json.output[0] && json.output[0].content) || json.output?.content || JSON.stringify(json);
//   return String(text);
// }

// Call Google Generative API (Gemini) via REST
async function callGemini(prompt) {
  const apiKey = process.env.GOOGLE_API_KEY;
  // Lưu ý: Đảm bảo tên model trong file .env ghi chính xác (ví dụ: gemini-2.5-flash hoặc gemini-1.5-flash)
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'; 
  if (!apiKey) throw new Error('Missing GOOGLE_API_KEY');

  // Sửa URL thành endpoint v1beta và method generateContent (chuẩn của Gemini API hiện tại)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;
  
  // Sửa lại cấu trúc Body (payload) theo đúng chuẩn yêu cầu của Gemini
  const body = {
    contents: [{
      parts: [{ text: prompt }]
    }],
    generationConfig: {
      maxOutputTokens: 512,
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
  
  // Cập nhật lại đường dẫn lấy text từ kết quả trả về của cấu trúc JSON mới
  try {
    return json.candidates[0].content.parts[0].text;
  } catch (err) {
    // Trả về log chi tiết nếu cấu trúc Google trả về bị thay đổi đột ngột
    throw new Error('Lỗi khi đọc text từ Gemini: ' + JSON.stringify(json));
  }
}

// Detect SQL block in model output (simple heuristic)
// Thay thế hàm extractSQL cũ bằng hàm này:
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

  // Xóa bỏ dấu chấm phẩy ở cuối câu nếu có để vượt qua Validator
  if (rawSql && rawSql.endsWith(';')) {
    rawSql = rawSql.slice(0, -1);
  }
  
  return rawSql;
}

async function generateResponse({ userId, message, sessionId, rules, clientIp, userAgent }) {
  const rulesText = rules || '';
  let schemaSnippet = '';
  try {
    // Đường dẫn chuẩn: từ thư mục services lùi ra 1 cấp (..) rồi vào Database
    const schemaPath = require('path').join(__dirname, '..', '../Database/table.sql');
    if (fs.existsSync(schemaPath)) {
      const full = fs.readFileSync(schemaPath, 'utf8');
      schemaSnippet = full.split('\n').slice(0, 1500).join('\n');
      console.log("✅ Đã load thành công DB Schema vào Prompt!");
    } else {
      console.log("❌ KHÔNG TÌM THẤY FILE table.sql tại:", schemaPath);
    }
  } catch (e) { 
    console.error("Lỗi đọc schema:", e.message);
  }

  // Optionally perform vector retrieval to enrich prompt
  let retrievalContext = '';
  let retrievalCount = 0;
  try {
    const embedModel = process.env.EMBEDDING_MODEL || null;
    if (embedModel) {
      // get embedding for user message
      const embedding = await getEmbedding(message);
      const matches = await require('./vectorstore.service').retrieve(embedding, 5);
      if (matches && matches.length > 0) {
        retrievalCount = matches.length;
        retrievalContext = matches.map(m => `- ${m.id}: ${m.metadata?.text || JSON.stringify(m.metadata)}`).join('\n');
      }
    }
  } catch (e) {
    console.error('Retrieval error:', e.message);
  }

  const prompt = buildPrompt({ rulesText, schemaSnippet, examples: null, userMessage: message });
  const fullPrompt = retrievalContext ? `${prompt}\n\nRetrieved materials:\n${retrievalContext}` : prompt;

  console.log('Full prompt to Gemini:', fullPrompt);
  logToLangfuse({ type: 'request', userId, sessionId, prompt: fullPrompt, clientIp: clientIp || null, userAgent: userAgent || null, retrievalCount, timestamp: new Date().toISOString() });

  let modelText;
  try {
    modelText = await callGemini(fullPrompt);
  } catch (err) {
    console.error('Gemini call failed:', err.message);
    return { text: `Lỗi khi gọi mô hình ngôn ngữ: ${err.message}`, sql: null, executeSql: false };
  }

  logToLangfuse({ type: 'response', userId, sessionId, modelText, timestamp: new Date().toISOString(), retrievalCount });

  const sql = extractSQL(modelText);
  const executeSql = false;

  console.log("=== AI GENERATED SQL ===", sql);

  return { text: modelText, sql, executeSql, retrievalCount };
}

// Get embedding from Google or other provider
// Hàm gọi API của Google để lấy vector embedding (tọa độ không gian) cho một đoạn văn bản
// Đã được cập nhật chuẩn cấu trúc body và endpoint (embedContent) của Gemini API
async function getEmbedding(text) {
  // Nên dùng model 'text-embedding-004' (hoặc model mới nhất bạn set trong file .env)
  const model = process.env.EMBEDDING_MODEL; 
  if (!model || !process.env.GOOGLE_API_KEY) throw new Error('Missing embedding model or API key');
  
  // Sửa endpoint thành embedContent thay vì embedText
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:embedContent?key=${process.env.GOOGLE_API_KEY}`;
  
  // Sửa cấu trúc payload đúng chuẩn của Gemini API
  const body = {
    content: {
      parts: [{ text: text }]
    }
  };

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
  
  // Cập nhật lại đường dẫn lấy mảng dữ liệu vector từ response của Google
  if (j.embedding && j.embedding.values) {
    return j.embedding.values;
  }
  
  throw new Error('Unknown embedding response format: ' + JSON.stringify(j));
}

module.exports = { generateResponse, logSqlExecution, getEmbedding };
