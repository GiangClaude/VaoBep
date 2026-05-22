// VỊ TRÍ TẠO FILE MỚI: frontend/src/component/common/AiSummaryBanner.jsx

import React, {useEffect} from 'react';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import usePostAi from '../../hooks/usePostAi';

export default function AiSummaryBanner({ contextText, title = "Nhờ AI tóm tắt & phân tích bài viết này" }) {
    const { summary, loadingSummary, errorSummary, fetchSummary } = usePostAi();

    useEffect(() => {
        if (contextText) {
            // Lưu ngữ cảnh vào session để Chatbot đọc được
            sessionStorage.setItem('vaobep_ai_context', contextText);
            // Phát tín hiệu cho Chatbot biết ngữ cảnh đã thay đổi
            window.dispatchEvent(new Event('ai_context_updated'));
        }

        // Cleanup: Khi rời khỏi trang, xóa ngữ cảnh đi
        return () => {
            sessionStorage.removeItem('vaobep_ai_context');
            window.dispatchEvent(new Event('ai_context_updated'));
        };
    }, [contextText]);

    const handleAnalyzeClick = () => {
        fetchSummary(contextText);
    };

    return (
    <div className="mt-8 p-5 bg-gradient-to-br from-[#ff6b35] to-[#f7931e] rounded-2xl text-white">

        <div className="w-full bg-gradient-to-r from-orange-50 to-[#fffcf7] border border-orange-200 rounded-2xl p-5 shadow-sm">
            {!summary && !loadingSummary && !errorSummary && (
                <button 
                    onClick={handleAnalyzeClick}
                    className="flex items-center justify-center w-full gap-2 text-[#ff6b35] font-bold hover:text-[#f7931e] transition-colors"
                >
                    <Sparkles className="w-5 h-5" />
                    {title}
                </button>
            )}

            {loadingSummary && (
                <div className="flex items-center justify-center gap-3 text-orange-400 font-medium py-4">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    AI đang đọc và phân tích dữ liệu, vui lòng đợi giây lát...
                </div>
            )}

            {errorSummary && (
                <div className="flex items-center justify-center gap-2 text-red-500 font-medium">
                    <AlertCircle className="w-5 h-5" />
                    {errorSummary}
                </div>
            )}

            {summary && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <h4 className="flex items-center gap-2 font-bold text-[#ff6b35] mb-3 border-b border-orange-100 pb-2">
                        <Sparkles className="w-5 h-5" /> AI Phân Tích & Lưu Ý
                    </h4>
                    {/* Render Markdown đơn giản (vì AI trả về text có thể chứa * hoặc #) */}
                    <div className="prose prose-sm md:prose-base prose-orange max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
                        {summary.replace(/\*\*/g, '') /* Regex tạm xóa dấu ** markdown để text dễ đọc nếu chưa cài thư viện react-markdown */}
                    </div>
                </div>
            )}
        </div>
    </div>
);
}