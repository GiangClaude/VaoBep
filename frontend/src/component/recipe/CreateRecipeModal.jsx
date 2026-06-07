import { X, Upload, Save, Eye, FileText, Clock, Users, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { IngredientInput } from "./IngredientInput";
import { StepInput } from "./StepInput";
import ImageWithFallBack from "../figma/ImageWithFallBack";
import TagSelector from "../common/TagSelector";

// UI Hook
import { useRecipeFormUI } from "../../hooks/ui/recipe/useRecipeFormUI";

export function CreateRecipeModal({ isOpen, onClose, initialData = null }) {
    const {
        formData, setFormData,
        handleCoverImageUpload, handleRemoveCoverImage, handleSubmit,
        isSaving
    } = useRecipeFormUI(initialData, isOpen, onClose);

    console.log("Form Data:", formData, initialData); // Debug: Kiểm tra dữ liệu form mỗi khi nó thay đổi
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-[#fff9f0] rounded-3xl shadow-2xl w-full max-w-5xl my-8" onClick={(e) => e.stopPropagation()}>
                    
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white p-6 rounded-t-3xl flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <FileText className="w-6 h-6" />
                            <h2 className="text-xl font-bold">{formData.id ? "Chỉnh Sửa Công Thức" : "Đăng Công Thức Mới"}</h2>
                        </div>
                        <button onClick={onClose} className="bg-white/20 p-2 rounded-xl hover:bg-white/30"><X className="w-6 h-6" /></button>
                    </div>

                    {/* Body */}
                    <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
                        {/* Ảnh Bìa */}
                        <div>
                            <label className="block text-lg mb-3 font-bold text-gray-800 flex items-center gap-2"><Upload className="w-5 h-5 text-[#ff6b35]" /> Ảnh đại diện</label>
                            {formData.coverImage ? (
                                <div className="relative group w-1/2 aspect-video rounded-2xl overflow-hidden border-2 border-[#ffc857]/30">
                                    <ImageWithFallBack src={formData.coverImage} className="w-full h-full object-cover" />
                                    <button onClick={handleRemoveCoverImage} className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all"><X className="w-4 h-4" /></button>
                                </div>
                            ) : (
                                <label className="w-1/2 aspect-video border-2 border-dashed border-[#ff6b35] rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-orange-50/50">
                                    <input type="file" accept="image/*" onChange={(e) => handleCoverImageUpload(e.target.files[0])} className="hidden" />
                                    <Upload className="w-8 h-8 text-[#ff6b35] mb-2" />
                                    <span className="text-gray-600 font-medium">Click để tải ảnh lên</span>
                                </label>
                            )}
                        </div>

                        {/* Text Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm mb-2 text-gray-700">Tên công thức *</label>
                                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#ff6b35] outline-none" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm mb-2 text-gray-700">Mô tả ngắn</label>
                                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#ff6b35] outline-none resize-none" />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm mb-2 text-gray-700"><Users className="w-4 h-4 text-[#ff6b35]" /> Khẩu phần</label>
                                <input type="number" min="1" value={formData.servings} onChange={(e) => setFormData({ ...formData, servings: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#ff6b35] outline-none" />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm mb-2 text-gray-700"><Clock className="w-4 h-4 text-[#ff6b35]" /> Thời gian (phút)</label>
                                <input type="number" min="1" value={formData.cookTime} onChange={(e) => setFormData({ ...formData, cookTime: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#ff6b35] outline-none" />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm mb-2 text-gray-700"><Flame className="w-4 h-4 text-[#ff6b35]" /> Tổng calo</label>
                                <input type="number" min="0" value={formData.totalCalo} onChange={(e) => setFormData({ ...formData, totalCalo: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#ff6b35] outline-none" />
                            </div>
                        </div>

                        {/* Tags, Ings, Steps */}
                        <div>
                            <label className="block text-lg mb-3 font-bold text-gray-800">🏷️ Thẻ (Tags)</label>
                            <TagSelector selectedTags={formData.tags} onChange={(newTags) => setFormData({...formData, tags: newTags})} />
                        </div>
                        <div>
                            <label className="block text-lg mb-3 font-bold text-gray-800">🥘 Nguyên liệu *</label>
                            <IngredientInput ingredients={formData.ingredients} onChange={(ingredients) => setFormData({ ...formData, ingredients })} />
                        </div>
                        <div>
                            <label className="block text-lg mb-3 font-bold text-gray-800">📝 Các bước thực hiện *</label>
                            <StepInput steps={formData.steps} onChange={(steps) => setFormData({ ...formData, steps })} />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-white border-t-2 border-gray-200 rounded-b-3xl flex gap-3">
                        <button onClick={onClose} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium">Hủy</button>
                        <button onClick={() => handleSubmit("draft")} disabled={isSaving || !formData.title} className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-xl flex items-center justify-center gap-2 font-semibold disabled:opacity-50">
                            <Save className="w-5 h-5" /> Lưu nháp
                        </button>
                        <button onClick={() => handleSubmit("public")} disabled={isSaving || !formData.title || formData.ingredients.length === 0 || formData.steps.length === 0} className="flex-1 px-6 py-3 bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white rounded-xl flex items-center justify-center gap-2 font-semibold disabled:opacity-50">
                            <Eye className="w-5 h-5" /> Đăng công khai
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}