// VỊ TRÍ TẠO FILE MỚI: backend/services/recipeAi.service.js

const { getAvailableKey } = require('./apiKey.service');
const { RECIPE_SUMMARY_PROMPT, RECIPE_QA_PROMPT } = require('../utils/recipeAiPrompts');

// Sử dụng model Flash Lite tiết kiệm token
const RECIPE_AI_MODEL = process.env.EXTENSION_GEMINI_MODEL || 'gemini-2.5-flash-lite';

/**
 * Hàm gọi API chung
 */
async function callGemini(contentsArray, systemInstructionText) {
    const apiKey = await getAvailableKey();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${RECIPE_AI_MODEL}:generateContent?key=${apiKey}`;

    const body = {
        systemInstruction: {
            parts: [{ text: systemInstructionText }]
        },
        contents: contentsArray,
        generationConfig: {
            temperature: 0.3, // Thấp để câu trả lời bám sát thực tế, ít lan man
            maxOutputTokens: 800
        }
    };

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Gemini API error: ${res.status} - ${errorText}`);
    }

    const json = await res.json();
    try {
        return json.candidates[0].content.parts[0].text.trim();
    } catch (err) {
        throw new Error('Định dạng trả về từ AI không hợp lệ.');
    }
}

/**
 * Chức năng 1: Tóm tắt và đưa ra lưu ý
 */
async function generateRecipeSummary(recipeContext) {
    const systemInstruction = RECIPE_SUMMARY_PROMPT.replace('{recipe_context}', recipeContext);
    
    const contentsArray = [
        {
            role: 'user',
            parts: [{ text: 'Hãy tóm tắt và đưa ra lưu ý cho tôi.' }]
        }
    ];

    return await callGemini(contentsArray, systemInstruction);
}

/**
 * Chức năng 2: Chatbot QA theo ngữ cảnh công thức
 * Nhận vào mảng lịch sử chat từ Frontend để giữ ngữ cảnh câu chuyện
 */
async function answerRecipeChat(recipeContext, chatHistory) {
    const systemInstruction = RECIPE_QA_PROMPT.replace('{recipe_context}', recipeContext);
    
    // Đảm bảo chatHistory tuân thủ format của Gemini [{ role: 'user'/'model', parts: [{ text: '...' }] }]
    return await callGemini(chatHistory, systemInstruction);
}

module.exports = { generateRecipeSummary, answerRecipeChat };