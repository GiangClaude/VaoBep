import { useState, useEffect } from 'react';
import aiApi from '../api/aiApi';

const generateSessionId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export default function useChatbot() {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const [currentContext, setCurrentContext] = useState(null);

    // 1. Khởi tạo Session ID
    useEffect(() => {
        let sid = sessionStorage.getItem('chatbot_session_id');
        if (!sid) {
            sid = generateSessionId();
            sessionStorage.setItem('chatbot_session_id', sid);
        }
        setSessionId(sid);
    }, []);

    // 2. Lắng nghe thay đổi ngữ cảnh (Context)
    useEffect(() => {
        const checkContext = () => {
            const ctx = sessionStorage.getItem('vaobep_ai_context');
            setCurrentContext(ctx || null);
        };

        checkContext();
        window.addEventListener('ai_context_updated', checkContext);
        return () => window.removeEventListener('ai_context_updated', checkContext);
    }, []);

    // 3. Câu hỏi gợi ý động dựa theo ngữ cảnh
    const quicks = currentContext 
        ? [
            'Có thể thay thế nguyên liệu trong món này không?',
            'Có mẹo nào để nấu món này ngon hơn không?',
            'Tìm cho tôi món khác tương tự món này đi.' 
          ]
        : [
            'Tôi bị dị ứng tôm, có món nào để ăn không?',
            'Tôi có cà chua, trứng thì nên nấu gì?',
            'Có món nào nhanh gọn trong 5 phút không?'
          ];

    // 4. Gửi tin nhắn
    const sendMessage = async (text) => {
        if (!text.trim()) return;
        
        const userMsg = { from: 'user', text };
        setMessages(m => [...m, userMsg]);
        setInput(''); // Clear input ngay lập tức
        setLoading(true);
        
        try {
            const response = await aiApi.chat({ 
                userId: null, 
                message: text, 
                sessionId: sessionId,
                currentContext: currentContext 
            });

            if (response.success) {

                const data = response.data; // Axios tự parse JSON
                console.log("AI API response data:", data);
                if (data.sql) {
                    // Xử lý khi AI tìm kiếm Database
                    let cleanText = (data.text || 'Gợi ý món ăn:').split('```sql')[0].trim();
                    let responseText = cleanText;

                    if (!data.data || data.data.length === 0) {
                        responseText += `\n\n(Chưa tìm thấy dữ liệu phù hợp trong hệ thống. Bạn thử hỏi khác đi nhé!)`;
                    }
                    setMessages(m => [...m, { from: 'bot', text: responseText, recipeData: data.data }]);
                } else {
                    // Xử lý text bình thường
                    const botText = data.text || 'Tôi không hiểu ý bạn.';
                    setMessages(m => [...m, { from: 'bot', text: botText }]);
                }
            }
        } catch (err) {
            console.error("Lỗi Chatbot:", err);
            setMessages(m => [...m, { from: 'bot', text: 'Lỗi kết nối tới Trợ lý AI. Vui lòng thử lại sau.' }]);
        } finally {
            setLoading(false);
        }
    };

    // 5. Xóa lịch sử
    const handleClearChat = async () => {
        if (!window.confirm("Bạn có chắc muốn xóa lịch sử trò chuyện không?")) return;
        
        setMessages([]);
        try {
            await aiApi.clearHistory({ sessionId: sessionId, userId: null });
        } catch (error) {
            console.error("Lỗi xóa lịch sử:", error);
        }
    };

    const toggleOpen = () => setOpen(!open);

    return {
        open,
        toggleOpen,
        input,
        setInput,
        messages,
        loading,
        currentContext,
        quicks,
        sendMessage,
        handleClearChat
    };
}