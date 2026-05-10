import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Dùng để chuyển trang
import { getRecipeImageUrl } from '../../utils/imageHelper'; // ĐỔI ĐƯỜNG DẪN NÀY CHO ĐÚNG VỚI FOLDER CỦA BẠN
import './Chatbot.css';

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      const res = await fetch('http://localhost:5000/api/chat', { // Nhớ giữ nguyên URL localhost của bạn
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: null, message: text })
      });
      const json = await res.json();
      
      if (json.sql) {
        let cleanText = (json.text || 'Gợi ý món ăn:').split('```sql')[0].trim();
        let responseText = cleanText;

        // Nếu KHÔNG có data, báo lỗi nhẹ nhàng
        if (!json.data || json.data.length === 0) {
            responseText += `\n\n(Chưa tìm thấy món nào phù hợp trong hệ thống. Bạn thử hỏi món khác nhé!)`;
        }

        // Lưu ý: Lần này chúng ta truyền thẳng mảng json.data vào state với key là 'recipeData'
        setMessages(m => [...m, { 
            from: 'bot', 
            text: responseText, 
            recipeData: json.data // <--- Truyền mảng data vào đây
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

  // Hàm xử lý khi bấm vào món ăn
  const handleRecipeClick = (recipeId) => {
    navigate(`/recipe/${recipeId}`); // Đổi đường dẫn này theo route chi tiết món ăn của web bạn
    setOpen(false); // Đóng chatbot lại cho gọn
  };

  return (
    <div className={`vaobep-chatbot ${open ? 'open' : ''}`}>
      <div className="vaobep-toggle" onClick={() => setOpen(!open)}>
        {open ? '✕' : 'Chat'}
      </div>

      {open && (
        <div className="vaobep-panel">
          <div className="vaobep-header">Trợ lý nấu ăn</div>
          <div className="vaobep-body">
            {messages.map((m, i) => (
              <div key={i} className={`vaobep-msg-container ${m.from}`}>
                <div className={`vaobep-msg ${m.from}`}>
                  {m.text}
                </div>
                
                {/* RENDER DANH SÁCH MÓN ĂN Ở ĐÂY NẾU CÓ DATA */}
                {m.recipeData && m.recipeData.length > 0 && (
                  <div className="vaobep-recipe-list">
                    {m.recipeData.map((recipe, idx) => (
                      <div 
                        key={idx} 
                        className="vaobep-recipe-item"
                        onClick={() => handleRecipeClick(recipe.recipe_id || recipe.id)}
                      >
                        <img 
                          src={getRecipeImageUrl(recipe.recipe_id, recipe.cover_image)} 
                          alt={recipe.title} 
                          className="vaobep-recipe-img"
                        />
                        <div className="vaobep-recipe-info">
                          <p className="vaobep-recipe-title">{recipe.title}</p>
                          {recipe.cook_time && <span className="vaobep-recipe-time">⏱ {recipe.cook_time} phút</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && <div className="vaobep-msg bot">Đang suy nghĩ...</div>}
          </div>

          <div className="vaobep-quicks">
            {quicks.map((q, i) => (
              <button key={i} onClick={() => sendMessage(q)}>{q}</button>
            ))}
          </div>

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