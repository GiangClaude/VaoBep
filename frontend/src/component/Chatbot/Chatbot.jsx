// VỊ TRÍ: frontend/src/component/common/Chatbot.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecipeImageUrl } from '../../utils/imageHelper';
import './Chatbot.css';

// Hàm sinh ngẫu nhiên 1 chuỗi làm Session ID
const generateSessionId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const navigate = useNavigate();

  // Khởi tạo Session ID 1 lần khi mở Web
  useEffect(() => {
    let sid = sessionStorage.getItem('chatbot_session_id');
    if (!sid) {
      sid = generateSessionId();
      sessionStorage.setItem('chatbot_session_id', sid);
    }
    setSessionId(sid);
  }, []);

  const quicks = [
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
      const res = await fetch('http://localhost:5000/api/chat', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // GỬI KÈM SESSION ID LÊN BACKEND
        body: JSON.stringify({ userId: null, message: text, sessionId: sessionId })
      });
      const json = await res.json();
      
      if (json.sql) {
        let cleanText = (json.text || 'Gợi ý món ăn:').split('```sql')[0].trim();
        let responseText = cleanText;

        if (!json.data || json.data.length === 0) {
            responseText += `\n\n(Chưa tìm thấy dữ liệu phù hợp trong hệ thống. Bạn thử hỏi khác đi nhé!)`;
        }

        setMessages(m => [...m, { 
            from: 'bot', 
            text: responseText, 
            recipeData: json.data 
        }]);
      } else {
        const botText = json && (json.text || json.message || JSON.stringify(json));
        setMessages(m => [...m, { from: 'bot', text: botText }]);
      }
    } catch (err) {
      setMessages(m => [...m, { from: 'bot', text: 'Lỗi kết nối tới chatbot.' }]);
    } finally {
      setLoading(false);
    }
  }

  // Hàm xóa lịch sử
  async function handleClearChat() {
    if(!window.confirm("Bạn có chắc muốn xóa lịch sử trò chuyện không?")) return;
    
    setMessages([]); // Xóa trên giao diện
    try {
      // Gọi API xóa trên Redis (Backend)
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
            <span>Trợ lý nấu ăn</span>
            {/* THÊM NÚT XÓA LỊCH SỬ VÀO ĐÂY */}
            <button className="vaobep-clear-btn" onClick={handleClearChat} title="Xóa lịch sử trò chuyện">
              🗑️
            </button>
          </div>
          <div className="vaobep-body">
            <div className="vaobep-msg bot">Xin chào! Bạn muốn tìm công thức, bài viết hay hỏi thông tin món ăn nào?</div>
            {messages.map((m, i) => (
              <div key={i} className={`vaobep-msg-container ${m.from}`}>
                <div className={`vaobep-msg ${m.from}`}>
                  {m.text}
                </div>
                
                {m.recipeData && m.recipeData.length > 0 && (
                  <div className="vaobep-recipe-list">
                    {m.recipeData.map((recipe, idx) => (
                      <div 
                        key={idx} 
                        className="vaobep-recipe-item"
                        onClick={() => handleRecipeClick(recipe.recipe_id || recipe.article_id || recipe.dish_id)}
                      >
                        {/* Ảnh: Nếu không có cover_image, lấy default. Nếu có image_url (từ bảng dish), lấy image_url */}
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
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { sendMessage(input); setInput(''); } }} placeholder="Gõ câu hỏi của bạn..." />
            <button onClick={() => { sendMessage(input); setInput(''); }}>Gửi</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatbot;