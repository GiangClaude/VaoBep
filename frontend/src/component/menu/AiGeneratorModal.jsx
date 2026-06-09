// VỊ TRÍ: frontend/src/component/menu/AiGeneratorModal.jsx

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Wand2 } from 'lucide-react';
import { useMenuState, MENU_ACTIONS } from '../../context/MenuContext';
// [MỚI] Dùng Mutation mới tạo
import { useAutoGenerateMenuMutation } from '../../hooks/mutations/useMenuMutations';
import { useGlobalModal } from '../../context/ModalContext';
import { v4 as uuidv4 } from 'uuid';
export default function AiGeneratorModal({ isOpen, onClose }) {
    const { dispatch } = useMenuState();
    const [prompt, setPrompt] = useState('');
    const { showModal } = useGlobalModal();
    // 1. KẾT NỐI MUTATION
    const generateMutation = useAutoGenerateMenuMutation();
    const isThinking = generateMutation.isPending; // Tự động có state loading từ React Query

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        
        try {
            // Gọi Mutation
            const result = await generateMutation.mutateAsync(prompt);

            

            if (result.success && result.data) {

                let aiDays = Array.isArray(result.data) ? result.data : result.data.days;
                if (!aiDays) throw new Error("Dữ liệu AI không đúng định dạng mảng ngày");
                console.log("AiGen: ", aiDays);
                console.log("AiGen Result: ", result);
                const normalizedDays = aiDays.map((day, dIdx) => ({
                    ...day,
                    day_id: uuidv4(), // Bắt buộc gắn ID ngày
                    title: day.title || `Ngày ${dIdx + 1}`,
                    meals: (day.meals || []).map(meal => ({
                        ...meal,
                        meal_id: uuidv4(), // Bắt buộc gắn ID bữa ăn
                        title: meal.title || (meal.meal_type === 'breakfast' ? 'Sáng' : meal.meal_type === 'lunch' ? 'Trưa' : meal.meal_type === 'dinner' ? 'Tối' : 'Bữa phụ'),
                        recipes: (meal.recipes || meal.dishes || []).map(recipe => ({
                            ...recipe,
                            recipe_id: recipe.recipe_id || recipe.id || uuidv4(), // Bắt buộc có ID món ăn
                            servings_multiplier: recipe.servings_multiplier || 1,
                            total_calo: recipe.total_calo || recipe.calories || 0,
                            cover_image: recipe.cover_image || recipe.image || ''
                        }))
                    }))
                }));
                // Đẩy vào Context Kanban
                dispatch({ type: MENU_ACTIONS.OVERRIDE_DAYS, payload: result.data });
                showModal({
                    type: 'success',
                    title: 'Tạo thực đơn thành công',
                    message: "✨ AI đã lên xong thực đơn! Hãy kiểm tra bảng Kanban và bấm 'Lưu Thực Đơn' để lưu vào hệ thống nhé."
                });
                onClose();
            } else {
                showModal({ type: 'error', title: 'Lỗi sinh thực đơn', message: result.message || "Có lỗi xảy ra" });
            }
        } catch (error) {
            showModal({ type: 'error', title: 'Lỗi kết nối AI', message: error.message });
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-orange-100">
                <div className="p-4 bg-gradient-to-r from-orange-50 to-[#ff6b35]/10 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-[#ff6b35]">
                        <Wand2 className="w-6 h-6 animate-pulse" />
                        <h2 className="text-xl font-extrabold">AI Tự Động Lên Thực Đơn</h2>
                    </div>
                    <button onClick={onClose} disabled={isThinking} className="p-2 text-gray-400 hover:text-red-500 rounded-full transition-colors disabled:opacity-50">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 bg-white">
                    {isThinking ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <div className="w-12 h-12 border-4 border-orange-200 border-t-[#ff6b35] rounded-full animate-spin"></div>
                            <p className="font-bold text-gray-700 animate-pulse text-center">
                                AI đang tìm kiếm món ăn phù hợp trong dữ liệu...<br/>
                                <span className="text-sm text-gray-400 font-normal">Quá trình này có thể mất 10-15 giây</span>
                            </p>
                        </div>
                    ) : (
                        <>
                            <p className="text-gray-600 mb-4 text-sm font-medium">
                                Hãy nhập yêu cầu của bạn. AI sẽ tìm kiếm các món ăn trong hệ thống và tự ráp thành một thực đơn hoàn chỉnh cho bạn.
                            </p>
                            <textarea 
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Ví dụ: Lên cho tôi thực đơn 3 ngày ăn chay nhẹ nhàng..."
                                className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ff6b35] outline-none resize-none mb-4"
                            />
                            <div className="flex justify-end gap-3">
                                <button onClick={onClose} className="px-5 py-2.5 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">
                                    Hủy
                                </button>
                                <button onClick={handleGenerate} className="px-5 py-2.5 bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white font-bold rounded-xl shadow-lg hover:brightness-110 flex items-center gap-2">
                                    <Wand2 className="w-4 h-4" /> Bắt đầu tạo
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}