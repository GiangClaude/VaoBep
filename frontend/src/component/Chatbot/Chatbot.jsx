import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecipeImageUrl } from '../../utils/imageHelper';
import useChatbot from '../../hooks/useChatbot';

function Chatbot() {
  const navigate = useNavigate();
  
  const { 
      open, toggleOpen, 
      input, setInput, 
      messages, loading, currentContext, quicks, 
      sendMessage, handleClearChat 
  } = useChatbot();

  const handleRecipeClick = (recipeId) => {
    navigate(`/recipe/${recipeId}`);
    toggleOpen(); 
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999]">
      {/* NÚT BẬT/TẮT */}
      <div 
        onClick={toggleOpen}
        className="w-[60px] h-[60px] bg-[#ff4757] text-white rounded-full flex items-center justify-center cursor-pointer shadow-[0_4px_10px_rgba(0,0,0,0.2)] font-bold ml-auto transition-transform hover:scale-105"
      >
        {open ? '✕' : 'Chat'}
      </div>

      {/* KHUNG CỬA SỔ CHAT */}
      {open && (
        <div className="absolute bottom-[80px] right-0 w-[350px] h-[500px] bg-white rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden">
          
          {/* HEADER */}
          <div className="bg-[#ff4757] text-white p-[15px] font-bold flex justify-between items-center">
            <span>Trợ lý Vào Bếp</span>
            <button 
              onClick={handleClearChat} 
              title="Xóa lịch sử trò chuyện"
              className="bg-transparent border-none text-white text-lg cursor-pointer px-1 transition-transform duration-200 hover:scale-110 hover:text-[#ffcccc]"
            >
              🗑️
            </button>
          </div>
          
          {/* BANNER GHIM NGỮ CẢNH */}
          {currentContext && (
            <div className="bg-orange-50 text-[#ff6b35] text-xs font-medium text-center py-2 border-b border-orange-100 flex items-center justify-center gap-1 shadow-inner">
                <span>📍</span> Đang tham chiếu nội dung bài viết hiện tại
            </div>
          )}

          {/* BODY: KHU VỰC CHAT */}
          <div className="flex-1 p-[15px] overflow-y-auto bg-[#f8f9fa] flex flex-col gap-2.5">
            {messages.length === 0 && (
                <div className="px-[14px] py-[10px] rounded-[18px] max-w-[85%] break-words text-sm leading-[1.4] bg-[#e9ecef] text-[#333] rounded-bl-[4px] self-start">
                    Xin chào! Bạn cần tìm món ăn hay thắc mắc về công thức nào, cứ hỏi mình nhé!
                </div>
            )}

            {messages.map((m, i) => (
              <div 
                key={i} 
                className={`flex flex-col ${m.from === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* BONG BÓNG TIN NHẮN */}
                <div 
                  className={`px-[14px] py-[10px] rounded-[18px] max-w-[85%] break-words text-sm leading-[1.4] 
                  ${m.from === 'user' 
                    ? 'bg-[#ff4757] text-white rounded-br-[4px]' 
                    : 'bg-[#e9ecef] text-[#333] rounded-bl-[4px]'}`}
                >
                  {m.text?.replace(/\*\*/g, '')} 
                </div>
                
                {/* DANH SÁCH MÓN ĂN GỢI Ý (Nếu có) */}
                {m.recipeData && m.recipeData.length > 0 && (
                  <div className="flex flex-col gap-2 mt-1.5 w-[90%]">
                    {m.recipeData.map((recipe, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => handleRecipeClick(recipe.recipe_id || recipe.article_id || recipe.dish_id)}
                        className="flex items-center bg-white border border-[#ffcccc] rounded-lg p-1.5 cursor-pointer transition-all duration-200 ease-in-out shadow-sm hover:bg-[#fff0f0] hover:border-[#ff6b6b] hover:-translate-y-[1px]"
                      >
                        <img 
                          src={recipe.cover_image ? getRecipeImageUrl(recipe.recipe_id || recipe.article_id, recipe.cover_image) : (recipe.image_url || '/default-recipe.jpg')} 
                          alt={recipe.title || recipe.original_name} 
                          className="w-[45px] h-[45px] rounded-md object-cover mr-2.5"
                        />
                        <div className="flex flex-col justify-center">
                          <p className="m-0 text-[13px] font-semibold text-[#333] line-clamp-2">
                            {recipe.title || recipe.original_name}
                          </p>
                          {recipe.cook_time && (
                            <span className="text-[11px] text-[#777] mt-[3px]">
                              ⏱ {Math.floor(recipe.cook_time)} phút
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="px-[14px] py-[10px] rounded-[18px] max-w-[85%] break-words text-sm leading-[1.4] bg-[#e9ecef] text-[#333] rounded-bl-[4px] self-start animate-pulse">
                Đang suy nghĩ...
              </div>
            )}
          </div>

          {/* CÂU HỎI GỢI Ý */}
          {messages.length <= 0 && (
            <div className="p-[10px] flex flex-wrap gap-2 bg-white border-t border-[#eee]">
              {quicks.map((q, i) => (
                <button 
                  key={i} 
                  onClick={() => sendMessage(q)}
                  className="bg-[#fff0f0] border border-[#ffcccc] px-3 py-1.5 rounded-full text-xs text-[#ff4757] cursor-pointer transition-colors duration-200 hover:bg-[#ffe0e0]"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* THANH NHẬP LIỆU */}
          <div className="flex p-3 bg-white border-t border-[#eee]">
            <input 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                onKeyDown={e => { if (e.key === 'Enter') sendMessage(input); }} 
                placeholder="Gõ câu hỏi của bạn..." 
                className="flex-1 px-[15px] py-[10px] border border-[#ddd] rounded-full outline-none text-sm transition-colors focus:border-[#ff4757]"
            />
            <button 
              onClick={() => sendMessage(input)}
              className="bg-[#ff4757] text-white border-none px-5 ml-2 rounded-full font-bold cursor-pointer transition-colors hover:bg-[#e63c4b]"
            >
              Gửi
            </button>
          </div>

        </div>
      )}
    </div>
  );
}

export default Chatbot;