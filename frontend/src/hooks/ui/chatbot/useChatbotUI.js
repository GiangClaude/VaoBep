import { useState, useEffect } from 'react';
import { useChatMutation, useClearAiHistoryMutation } from '../../mutations/useAiMutations';

const generateSessionId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const useChatbotUI = () => {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [sessionId, setSessionId] = useState('');
    const [currentContext, setCurrentContext] = useState(null);

    // Sử dụng Mutation thay vì gọi API trực tiếp
    const chatMutation = useChatMutation();
    const clearHistoryMutation = useClearAiHistoryMutation();

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

    // 3. Câu hỏi gợi ý động
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
        setInput(''); 
        
        try {
            const response = await chatMutation.mutateAsync({ 
                userId: null, 
                message: text, 
                sessionId: sessionId,
                currentContext: currentContext 
            });

            if (response.success) {
                const data = response.data;
                if (data.sql) {
                    let cleanText = (data.text || 'Gợi ý món ăn:').split('```sql')[0].trim();
                    let responseText = cleanText;

                    if (!data.data || data.data.length === 0) {
                        responseText += `\n\n(Chưa tìm thấy dữ liệu phù hợp trong hệ thống. Bạn thử hỏi khác đi nhé!)`;
                    }
                    setMessages(m => [...m, { from: 'bot', text: responseText, recipeData: data.data }]);
                } else {
                    const botText = data.text || 'Tôi không hiểu ý bạn.';
                    setMessages(m => [...m, { from: 'bot', text: botText }]);
                }
            }
        } catch (err) {
            console.error("Lỗi Chatbot:", err);
            setMessages(m => [...m, { from: 'bot', text: 'Lỗi kết nối tới Trợ lý AI. Vui lòng thử lại sau.' }]);
        }
    };

    // 5. Xóa lịch sử
    const handleClearChat = async () => {
        if (!window.confirm("Bạn có chắc muốn xóa lịch sử trò chuyện không?")) return;
        
        setMessages([]);
        try {
            await clearHistoryMutation.mutateAsync({ sessionId: sessionId, userId: null });
        } catch (error) {
            console.error("Lỗi xóa lịch sử:", error);
        }
    };

    const toggleOpen = () => setOpen(!open);

    return {
        open, toggleOpen,
        input, setInput,
        messages,
        loading: chatMutation.isPending, // Gắn cờ loading vào trạng thái của Mutation
        currentContext,
        quicks,
        sendMessage,
        handleClearChat
    };
};