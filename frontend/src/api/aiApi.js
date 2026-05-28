import apiClient from "./index";

const aiApi = {
    // Gọi Chatbot (Kết hợp Text-to-SQL và QA Context)
    chat: async (payload) => {
        // payload: { userId, message, sessionId, currentContext }
        const response = await apiClient.post('/ai/chat', payload);
        return response;
    },

    // Lấy tóm tắt bài viết / công thức
    summarize: async (payload) => {
        // payload: { contextText }
        const response = await apiClient.post('/ai/summarize', payload);
        return response;
    },

    // Xóa lịch sử trò chuyện
    clearHistory: async (payload) => {
        // payload: { sessionId, userId }
        // Lưu ý: Axios DELETE cần truyền body vào trường `data`
        const response = await apiClient.delete('/ai/history', { data: payload });
        return response;
    }
};

export default aiApi;