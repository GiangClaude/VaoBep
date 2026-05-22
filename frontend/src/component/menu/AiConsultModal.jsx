import React, { useState, useEffect , useRef} from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles } from 'lucide-react';
import { useMenu } from '../../hooks/useMenu';

export default function AiConsultModal({ isOpen, onClose, menuState }) {
    const { getAIConsultation } = useMenu();
    const [aiResponse, setAiResponse] = useState('');
    const [isThinking, setIsThinking] = useState(false);

    const hasFetched = useRef(false);

    useEffect(() => {
        if (!isOpen) {
            hasFetched.current = false;
            return;
        }

        const fetchAI = async () => {
            if (isOpen && menuState && !hasFetched.current) {
                hasFetched.current = true;
                setAiResponse('');
                setIsThinking(true);
                // Kiểm tra xem menu có món ăn chưa
                const hasRecipes = menuState.days?.some(d => d.meals?.some(m => m.recipes?.length > 0));
                
                if (!hasRecipes) {
                    setAiResponse("Thực đơn của bạn đang trống. Hãy thêm một vài món ăn vào các ngày để tôi có thể tư vấn chi tiết nhé! 😊");
                    setIsThinking(false);
                    return;
                }

                const responseText = await getAIConsultation(menuState);
                if (responseText) {
                    setAiResponse(responseText);
                } else {
                    setAiResponse("Xin lỗi, tôi đang bận xíu. Bạn thử lại sau nhé! 😅");
                }
                setIsThinking(false);
            }
        };
        fetchAI();
    }, [isOpen, menuState, getAIConsultation]);

    // Hàm render Markdown cơ bản (In đậm và xuống dòng)
    const formatText = (text) => {
        return text.split('\n').map((line, index) => {
            // Thay thế **text** thành in đậm
            const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            return <p key={index} className="mb-2" dangerouslySetInnerHTML={{ __html: formattedLine }} />;
        });
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-purple-100">
                {/* Header */}
                <div className="p-4 border-b border-purple-50 bg-gradient-to-r from-purple-50 to-indigo-50 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-indigo-600">
                        <Sparkles className="w-6 h-6 animate-pulse" />
                        <h2 className="text-xl font-extrabold">Chuyên Gia AI Vào Bếp</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 bg-white min-h-[250px] max-h-[60vh] overflow-y-auto">
                    {isThinking ? (
                        <div className="flex flex-col items-center justify-center h-full text-indigo-400 space-y-4 py-10">
                            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                            <p className="font-medium animate-pulse">Đang phân tích thực đơn của bạn...</p>
                        </div>
                    ) : (
                        <div className="text-gray-700 leading-relaxed text-sm">
                            {formatText(aiResponse)}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}