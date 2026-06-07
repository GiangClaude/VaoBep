import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Image as ImageIcon, Clock } from 'lucide-react';
import {useTagQueries} from "../../hooks/queries/useTagQueries";

// UI Hook
import { useArticleFormUI } from '../../hooks/ui/article/useArticleFormUI';

export default function ArticleEditorModal({ isOpen, onClose, initialData = null }) {
    const { tags: availableTags = [] } = useTagQueries();
    const editorRef = useRef(null);

    // Kéo toàn bộ State và Actions từ UI Hook
    const {
        formData, updateField, handleCoverChange,
        tagQuery, setTagQuery, recipeQuery, setRecipeQuery, recipeResults,
        errors, handleSave, isSaving
    } = useArticleFormUI(initialData, isOpen, onClose);

    // Cập nhật nội dung editor khi form thay đổi
    useEffect(() => {
        if (isOpen && editorRef.current && editorRef.current.innerHTML !== formData.content) {
            editorRef.current.innerHTML = formData.content;
        }
    }, [isOpen, formData.content]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center pt-20 p-4">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl z-20 overflow-hidden flex flex-col max-h-[90vh]">
                
                <div className="p-4 border-b flex items-center gap-4 shrink-0">
                    <h3 className="text-lg font-bold flex-1">{formData.id ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}</h3>
                    <div className="flex items-center gap-3 text-sm text-[#7d5a3f]"><Clock className="w-4 h-4" /> {formData.readTime}</div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto">
                    {/* Tiêu đề */}
                    <div>
                        <input value={formData.title} onChange={(e) => updateField('title', e.target.value)} placeholder="Tiêu đề..." className="w-full text-xl font-bold border-b pb-2 focus:outline-none" />
                        {errors.title && <div className="text-sm text-red-600 mt-1">{errors.title}</div>}
                    </div>

                    {/* Mô tả */}
                    <div>
                        <input value={formData.excerpt} onChange={(e) => updateField('excerpt', e.target.value)} placeholder="Mô tả ngắn..." className="w-full text-sm text-[#7d5a3f] border-b pb-2 focus:outline-none" />
                        {errors.excerpt && <div className="text-xs text-red-500 mt-1">{errors.excerpt}</div>}
                    </div>

                    {/* Tags */}
                    <div>
                        <div className="mb-2 text-sm text-gray-700 font-medium">Thẻ (Tags)</div>
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                            {formData.tags.map(t => (
                                <div key={t.id || t.tag_id} className="flex items-center gap-1.5 bg-orange-50 text-[#ff6b35] border border-orange-100 text-sm px-3 py-1.5 rounded-full">
                                    <span>{t.name}</span>
                                    <button onClick={() => updateField('tags', formData.tags.filter(tag => (tag.id || tag.tag_id) !== (t.id || t.tag_id)))}><X className="w-4 h-4" /></button>
                                </div>
                            ))}
                        </div>
                        <input value={tagQuery} onChange={(e) => setTagQuery(e.target.value)} placeholder="Tìm tag..." className="w-full sm:w-1/2 px-4 py-2 border rounded-lg focus:outline-none" />
                        {tagQuery && (
                            <div className="bg-white border mt-1 rounded-lg shadow-xl max-h-40 overflow-y-auto">
                                {availableTags.filter(t => t.name.toLowerCase().includes(tagQuery.toLowerCase()) && !formData.tags.find(s => (s.id || s.tag_id) === t.tag_id)).map(t => (
                                    <div key={t.tag_id} onClick={() => { updateField('tags', [...formData.tags, { id: t.tag_id, name: t.name }]); setTagQuery(''); }} className="p-2 hover:bg-orange-50 cursor-pointer text-sm">
                                        {t.name}
                                    </div>
                                ))}
                            </div>
                        )}
                        {errors.tags && <div className="text-xs text-red-500 mt-1">{errors.tags}</div>}
                    </div>

                    {/* Recipes Liên kết */}
                    <div>
                        <div className="mb-2 text-sm text-gray-700 font-medium">Công thức liên quan</div>
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                            {formData.recipes.map(r => (
                                <div key={r.id} className="flex items-center gap-2 bg-gray-50 border text-sm px-2 py-1 rounded-md">
                                    <img src={r.image} alt="" className="w-8 h-8 object-cover rounded-sm" />
                                    <span className="font-medium">{r.title}</span>
                                    <button onClick={() => updateField('recipes', formData.recipes.filter(rec => rec.id !== r.id))} className="ml-2 text-red-500"><X className="w-3 h-3"/></button>
                                </div>
                            ))}
                        </div>
                        <input value={recipeQuery} onChange={(e) => setRecipeQuery(e.target.value)} placeholder="Tìm món ăn..." className="w-full sm:w-1/2 px-4 py-2 border rounded-lg focus:outline-none" />
                        {recipeResults.length > 0 && (
                            <div className="bg-white border mt-1 rounded-lg shadow-xl max-h-40 overflow-y-auto">
                                {recipeResults.map(r => (
                                    <div key={r.id} onClick={() => { if(formData.recipes.length >= 5) { alert("Tối đa 5 món"); return; } updateField('recipes', [...formData.recipes, r]); setRecipeQuery(''); }} className="p-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2 border-b">
                                        <img src={r.image} className="w-8 h-8 object-cover rounded" alt="" />
                                        <span className="text-sm">{r.title}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Ảnh bìa */}
                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 px-3 py-2 bg-white border rounded-md cursor-pointer hover:bg-gray-50">
                            <ImageIcon className="w-4 h-4" /> <span className="text-sm">Ảnh bìa</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleCoverChange(e.target.files[0])} />
                        </label>
                        {formData.coverPreview && <img src={formData.coverPreview} alt="cover" className="w-24 h-12 object-cover rounded-md ml-auto" />}
                    </div>

                    {/* Editor (Text thuần HTML) */}
                    <div>
                        <div 
                            ref={editorRef} 
                            contentEditable={formData.status !== 'banned'} 
                            onInput={(e) => updateField('content', e.currentTarget.innerHTML)} 
                            className={`min-h-[200px] border rounded-lg p-4 text-sm prose max-w-none focus:outline-none ${formData.status === 'banned' ? 'opacity-60 bg-gray-100' : ''}`} 
                        />
                        {errors.content && <div className="text-xs text-red-500 mt-1">{errors.content}</div>}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center gap-4 justify-between pt-4 border-t">
                        <select value={formData.status} onChange={(e) => updateField('status', e.target.value)} className="px-4 py-2 border rounded-md text-sm">
                            <option value="draft">Nháp</option>
                            <option value="public">Công khai</option>
                        </select>
                        <button onClick={handleSave} disabled={isSaving} className="bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white px-6 py-2 rounded-full font-semibold shadow-md disabled:opacity-50">
                            {isSaving ? 'Đang lưu...' : 'Lưu bài viết'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}