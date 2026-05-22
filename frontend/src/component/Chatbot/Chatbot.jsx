// VỊ TRÍ: frontend/src/component/Chatbot/Chatbot.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecipeImageUrl } from '../../utils/imageHelper';
import './Chatbot.css';

const generateSessionId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  
  // --- STATE: Lưu trữ Context hiện tại ---
  const [currentContext, setCurrentContext] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let sid = sessionStorage.getItem('chatbot_session_id');
    if (!sid) {
      sid = generateSessionId();
      sessionStorage.setItem('chatbot_session_id', sid);
    }
    setSessionId(sid);
  }, []);

  // Lắng nghe sự thay đổi ngữ cảnh (Khi user vào/ra trang bài viết)
  useEffect(() => {
    const checkContext = () => {
      const ctx = sessionStorage.getItem('vaobep_ai_context');
      setCurrentContext(ctx || null);
    };

    checkContext(); // Check lần đầu
    window.addEventListener('ai_context_updated', checkContext);
    return () => window.removeEventListener('ai_context_updated', checkContext);
  }, []);

  // BỘ CÂU HỎI GỢI Ý ĐỘNG
  const quicks = currentContext 
    ? [
        'Có thể thay thế nguyên liệu trong món này không?',
        'Có mẹo nào để nấu món này ngon hơn không?',
        'Tìm cho tôi món khác tương tự món này đi.' // Câu hỏi mồi để AI query DB
      ]
    : [
        'Tôi bị dị ứng tôm, có món nào để ăn không?',
        'Tôi có cà chua, trứng thì nên nấu gì?',
        'Có món nào nhanh gọn trong 5 phút không?'
      ];

  async function sendMessage(text) {
    if (!text) return;
    const userMsg = { from: 'user', text };
    setMessages(m => [...m, userMsg]);
    setLoading(true);
    
    try {
      // HỢP NHẤT: Luôn gọi 1 API duy nhất, truyền kèm currentContext
      const res = await fetch('http://localhost:5000/api/chat', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            userId: null, 
            message: text, 
            sessionId: sessionId,
            currentContext: currentContext // Gửi ngữ cảnh (nếu có) xuống Backend
        })
      });
      const json = await res.json();
      
      // AI TRẢ VỀ SQL VÀ CÓ DATA (Trường hợp tìm kiếm)
      if (json.sql) {
        let cleanText = (json.text || 'Gợi ý món ăn:').split('```sql')[0].trim();
        let responseText = cleanText;

        if (!json.data || json.data.length === 0) {
            responseText += `\n\n(Chưa tìm thấy dữ liệu phù hợp trong hệ thống. Bạn thử hỏi khác đi nhé!)`;
        }

        setMessages(m => [...m, { from: 'bot', text: responseText, recipeData: json.data }]);
      } 
      // AI CHỈ TRẢ VỀ TEXT (Trường hợp tư vấn ngữ cảnh hoặc giao tiếp thường)
      else {
        const botText = json && (json.text || json.message || JSON.stringify(json));
        setMessages(m => [...m, { from: 'bot', text: botText }]);
      }
    } catch (err) {
      setMessages(m => [...m, { from: 'bot', text: 'Lỗi kết nối tới Trợ lý AI.' }]);
    } finally {
      setLoading(false);
    }
  }

  // Xóa lịch sử trò chuyện
  async function handleClearChat() {
    if(!window.confirm("Bạn có chắc muốn xóa lịch sử trò chuyện không?")) return;
    setMessages([]);
    
    // Luôn gọi Backend để xóa Redis
    try {
        await fetch('http://localhost:5000/api/chat/history', { 
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: sessionId, userId: null })
        });
    } catch (error) {
        console.error("Lỗi xóa lịch sử:", error);
    }
  }

  const handleRecipeClick = (recipeId) => {
    navigate(`/recipe/${recipeId}`);
    setOpen(false);
  };

  return (
    <div className={`vaobep-chatbot ${open ? 'open' : ''}`}>
      <div className="vaobep-toggle" onClick={() => setOpen(!open)}>
        {open ? '✕' : 'Chat'}
      </div>

      {open && (
        <div className="vaobep-panel">
          <div className="vaobep-header">
            <span>Trợ lý Vào Bếp</span>
            <button className="vaobep-clear-btn" onClick={handleClearChat} title="Xóa lịch sử trò chuyện">
              🗑️
            </button>
          </div>
          
          {/* BANNER GHIM NGỮ CẢNH */}
          {currentContext && (
            <div className="bg-orange-50 text-[#ff6b35] text-xs font-medium text-center py-2 border-b border-orange-100 flex items-center justify-center gap-1 shadow-inner">
                <span>📍</span> Đang tham chiếu nội dung bài viết hiện tại
            </div>
          )}

          <div className="vaobep-body">
            {messages.length === 0 && (
                <div className="vaobep-msg bot">
                    Xin chào! Bạn cần tìm món ăn hay thắc mắc về công thức nào, cứ hỏi mình nhé!
                </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`vaobep-msg-container ${m.from}`}>
                <div className={`vaobep-msg ${m.from}`}>
                  {m.text?.replace(/\*\*/g, '')} 
                </div>
                
                {m.recipeData && m.recipeData.length > 0 && (
                  <div className="vaobep-recipe-list">
                    {m.recipeData.map((recipe, idx) => (
                      <div key={idx} className="vaobep-recipe-item" onClick={() => handleRecipeClick(recipe.recipe_id || recipe.article_id || recipe.dish_id)}>
                        <img 
                          src={recipe.cover_image ? getRecipeImageUrl(recipe.recipe_id || recipe.article_id, recipe.cover_image) : (recipe.image_url || '/default-recipe.jpg')} 
                          alt={recipe.title || recipe.original_name} 
                          className="vaobep-recipe-img"
                        />
                        <div className="vaobep-recipe-info">
                          <p className="vaobep-recipe-title">{recipe.title || recipe.original_name}</p>
                          {recipe.cook_time && <span className="vaobep-recipe-time">⏱ {Math.floor(recipe.cook_time)} phút</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && <div className="vaobep-msg bot">Đang suy nghĩ...</div>}
          </div>

          {messages.length <= 0 && (
            <div className="vaobep-quicks">
              {quicks.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)}>{q}</button>
              ))}
            </div>
          )}

          <div className="vaobep-input">
            <input 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                onKeyDown={e => { if (e.key === 'Enter') { sendMessage(input); setInput(''); } }} 
                placeholder="Gõ câu hỏi của bạn..." 
            />
            <button onClick={() => { sendMessage(input); setInput(''); }}>Gửi</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatbot;