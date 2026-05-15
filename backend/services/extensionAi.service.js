// VỊ TRÍ TẠO FILE MỚI: backend/services/extensionAi.service.js

const { getAvailableKey } = require('./apiKey.service');
const { VISION_PROMPT, CONTEXT_PROMPT } = require('../utils/extensionPrompts');

// Sử dụng model Flash Lite để siêu tối ưu token và tốc độ (hoặc lấy từ env)
const EXTENSION_MODEL = process.env.EXTENSION_GEMINI_MODEL || 'gemini-2.5-flash-lite';

/**
 * Hàm gọi API chung (Tránh lặp code)
 */
async function callGeminiApi(contentsArray) {
  // 1. Lấy API Key đang rảnh từ Redis
  const apiKey = await getAvailableKey();
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${EXTENSION_MODEL}:generateContent?key=${apiKey}`;

  const body = {
    contents: contentsArray,
    generationConfig: {
      temperature: 0.1, // Cực thấp để kết quả chính xác, không lan man
      maxOutputTokens: 500 // Extension không cần trả lời quá dài
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Lỗi từ Gemini API: ${res.status} - ${errorText}`);
  }

  const json = await res.json();
  try {
    return json.candidates[0].content.parts[0].text.trim();
  } catch (err) {
    throw new Error('Định dạng trả về từ Gemini không hợp lệ.');
  }
}

/**
 * 1. Chức năng phân tích ảnh -> Tên món ăn
 * Nhận vào base64Image (chuỗi base64 không bao gồm data:image/jpeg;base64,)
 */
async function identifyDishFromImage(base64Image, mimeType = 'image/jpeg') {
  const contentsArray = [
    {
      role: 'user',
      parts: [
        { text: VISION_PROMPT },
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Image
          }
        }
      ]
    }
  ];

  return await callGeminiApi(contentsArray);
}

/**
 * 2. Chức năng đọc web và trả lời (Context Q&A)
 */
async function answerContextQuestion(contextText, userQuestion) {
  // Thay thế biến {context_text} trong prompt mẫu
  const systemInstruction = CONTEXT_PROMPT.replace('{context_text}', contextText || 'Không có dữ liệu văn bản nào.');

  const contentsArray = [
    {
      role: 'user',
      parts: [
        { text: systemInstruction },
        { text: `Câu hỏi của tôi: ${userQuestion}` }
      ]
    }
  ];

  return await callGeminiApi(contentsArray);
}

module.exports = { identifyDishFromImage, answerContextQuestion };