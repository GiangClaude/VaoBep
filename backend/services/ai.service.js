const fs = require('fs');
// const fetch = require('node-fetch');
const { buildPrompt } = require('../utils/promptTemplates');

const LANGFUSE_BASE = process.env.LANGFUSE_BASE_URL;
const LANGFUSE_KEY = process.env.LANGFUSE_SECRET_KEY;

async function logToLangfuse(payload) {
  try {
    if (!LANGFUSE_BASE || !LANGFUSE_KEY) return;
    const url = `${LANGFUSE_BASE.replace(/\/$/, '')}/v1/events`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${LANGFUSE_KEY}` },
      body: JSON.stringify(payload)
    });
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
function extractSQL(text) {
  const sqlBlock = /```sql\s*([\s\S]*?)```/i.exec(text);
  if (sqlBlock) return sqlBlock[1].trim();
  const selectMatch = /(^|\n)(select[\s\S]*?)(\n|$)/i.exec(text);
  if (selectMatch) {
    const candidate = selectMatch[2].trim();
    if (/\bfrom\b/i.test(candidate)) return candidate;
  }
  return null;
}

async function generateResponse({ userId, message, sessionId, rules, clientIp, userAgent }) {
  const rulesText = rules || '';
  let schemaSnippet = '';
  try {
    const schemaPath = require('path').join(__dirname, '..', 'config', '..', 'Database', 'table.sql');
    if (fs.existsSync(schemaPath)) {
      const full = fs.readFileSync(schemaPath, 'utf8');
      schemaSnippet = full.split('\n').slice(0, 400).join('\n');
    }
  } catch (e) { }

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

  return { text: modelText, sql, executeSql, retrievalCount };
}

// Get embedding from Google or other provider
async function getEmbedding(text) {
  const model = process.env.EMBEDDING_MODEL; // e.g., 'textembedding-gecko-001'
  if (!model || !process.env.GOOGLE_API_KEY) throw new Error('Missing embedding model or API key');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:embedText?key=${process.env.GOOGLE_API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: text })
  });
  if (!res.ok) { const t = await res.text(); throw new Error('Embedding call failed: ' + t); }
  const j = await res.json();
  // Expect embedding in j.embeddings[0].value or similar
  if (j.embeddings && j.embeddings[0] && j.embeddings[0].embedding) return j.embeddings[0].embedding;
  if (j["data"] && j.data[0] && j.data[0].embedding) return j.data[0].embedding;
  throw new Error('Unknown embedding response format: ' + JSON.stringify(j));
}

module.exports = { generateResponse, logSqlExecution, getEmbedding };
