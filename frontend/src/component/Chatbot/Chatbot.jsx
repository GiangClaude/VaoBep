import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecipeImageUrl } from '../../utils/imageHelper';
import useChatbot from '../../hooks/useChatbot';
import './Chatbot.css';

function Chatbot() {
  const navigate = useNavigate();
  
  // Lấy toàn bộ state và hàm từ Custom Hook
  const { 
      open, toggleOpen, 
      input, setInput, 
      messages, loading, currentContext, quicks, 
      sendMessage, handleClearChat 
  } = useChatbot();

  const handleRecipeClick = (recipeId) => {
    navigate(`/recipe/${recipeId}`);
    toggleOpen(); // Đóng chatbot khi chuyển trang
  };

  return (
    <div className={`vaobep-chatbot ${open ? 'open' : ''}`}>
      <div className="vaobep-toggle" onClick={toggleOpen}>
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
                      <div 
                        key={idx} 
                        className="vaobep-recipe-item" 
                        onClick={() => handleRecipeClick(recipe.recipe_id || recipe.article_id || recipe.dish_id)}
                      >
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

          {/* CÂU HỎI GỢI Ý */}
          {messages.length <= 0 && (
            <div className="vaobep-quicks">
              {quicks.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)}>{q}</button>
              ))}
            </div>
          )}

          {/* THANH NHẬP LIỆU */}
          <div className="vaobep-input">
            <input 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                onKeyDown={e => { if (e.key === 'Enter') sendMessage(input); }} 
                placeholder="Gõ câu hỏi của bạn..." 
            />
            <button onClick={() => sendMessage(input)}>Gửi</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatbot;