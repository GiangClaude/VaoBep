import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Image as ImageIcon, Clock } from 'lucide-react';
import Modal from '../common/modal';
import useArticleAction from '../../hooks/useArticleAction';
import useTags from '../../hooks/useTags';
import { normalizeArticle } from '../../utils/normalizeArticle';

export default function ArticleEditorModal({ isOpen, onClose, initialData = null, onSaved }) {
  // 1. Chỉ dùng duy nhất hook này để xử lý API
  const { saveArticle, searchRecipes, loading: saving } = useArticleAction();
  const { tags: availableTags = [] } = useTags();

  // 2. CHỈ DÙNG 1 STATE DUY NHẤT CHO FORM
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    excerpt: '',
    content: '',
    status: 'draft',
    tags: [],
    recipes: [],
    coverFile: null,
    coverPreview: null,
    readTime: '1 phút'
  });

  const [tagQuery, setTagQuery] = useState('');
  const [recipeQuery, setRecipeQuery] = useState('');
  const [recipeResults, setRecipeResults] = useState([]);
  const [errors, setErrors] = useState({});
  const [messageModal, setMessageModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const editorRef = useRef(null);

  // 3. Cập nhật dữ liệu khi mở Modal
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Bước 2 chúng ta đã sửa normalizeArticle để nó hiểu cả 'excerpt' và 'description'
        const clean = normalizeArticle(initialData);
        
        setFormData({
          id: clean.id,
          title: clean.title || '',
          excerpt: clean.excerpt || '', // Bây giờ đã có dữ liệu từ hàm normalize đã fix
          content: clean.content || '',
          status: clean.status || 'draft',
          tags: clean.tags || [],
          recipes: clean.recipes || [],
          coverFile: null,
          coverPreview: clean.image || null,
          readTime: clean.readTime || '1 phút'
        });

        // Đưa việc gán nội dung vào setTimeout để đảm bảo Editor DOM đã sẵn sàng
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.innerHTML = clean.content || "";
          }
        }, 0);
        
      } else {
        // Reset form khi tạo mới
        setFormData({ 
          id: null, title: '', excerpt: '', content: '', 
          status: 'draft', tags: [], recipes: [], 
          coverFile: null, coverPreview: null, readTime: '1 phút' 
        });
        if (editorRef.current) editorRef.current.innerHTML = "";
      }
      setErrors({});
    }
  }, [initialData, isOpen]);
  // Helper cập nhật field trong formData
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };


  const calculateReadTime = (html) => {
    const text = html?.replace(/<[^>]*>?/gm, '') || '';
    const words = text.split(/\s+/).filter(w => w.length > 0).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} phút`;
  };

  const displayReadTime = calculateReadTime(formData.content);

  const handleContentInput = (e) => {
    const content = e.currentTarget.innerHTML;
    updateField('content', content);
  };

  const addRecipe = (recipe) => {
    if (formData.recipes.length >= 5) {
      alert("Bạn chỉ được gắn tối đa 5 công thức nấu ăn.");
      return;
    }
    updateField('recipes', [...formData.recipes, recipe]);
    setRecipeQuery('');
  };

  const handleCoverChange = (file) => {
    if (!file) return;
    updateField('coverFile', file);
    const reader = new FileReader();
    reader.onload = () => updateField('coverPreview', reader.result);
    reader.readAsDataURL(file);
  };

  // Logic tìm kiếm Recipes
  useEffect(() => {
    const q = (recipeQuery || '').trim();
    if (!q) { setRecipeResults([]); return; }
    const t = setTimeout(async () => {
      const results = await searchRecipes(q);
      const filtered = results.filter(r => !formData.recipes.find(s => s.id === r.id));
      setRecipeResults(filtered);
    }, 300);
    return () => clearTimeout(t);
  }, [recipeQuery, formData.recipes, searchRecipes]);

  const handleSave = async () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề không được để trống.';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Tiêu đề phải có ít nhất 5 ký tự.';
    }

    if (!formData.excerpt.trim()) {
      newErrors.excerpt = 'Vui lòng nhập mô tả ngắn.';
    }

    if (formData.tags.length === 0) {
      newErrors.tags = 'Vui lòng chọn ít nhất 1 thẻ (Tag).';
    }

    const plainText = formData.content.replace(/<[^>]+>/g, '').trim();
    if (plainText.length < 20) {
      newErrors.content = 'Nội dung bài viết phải có ít nhất 20 ký tự.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; 
    }


    try {

      const dataToSave = { ...formData, readTime: displayReadTime };
      const result = await saveArticle(dataToSave);   

      setMessageModal({ 
        isOpen: true, 
        title: 'Thành công', 
        message: 'Lưu bài viết thành công.', 
        type: 'success',
        savedData: result
      });
    } catch (err) {
      setMessageModal({ isOpen: true, title: 'Lỗi', message: err.response?.data?.message || 'Lỗi khi lưu', type: 'error' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pt-20 p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl z-20 overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="p-4 border-b flex items-center gap-4 shrink-0">
          <h3 className="text-lg font-bold flex-1">{formData.id ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}</h3>
          <div className="flex items-center gap-3 text-sm text-[#7d5a3f]"><Clock className="w-4 h-4" /> {displayReadTime}</div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Tiêu đề */}
          <div>
            <input 
              value={formData.title} 
              onChange={(e) => updateField('title', e.target.value)} 
              placeholder="Tiêu đề..." 
              className="w-full text-xl font-bold border-b pb-2 focus:outline-none" 
            />
            {errors.title && <div className="text-sm text-red-600 mt-1">{errors.title}</div>}
          </div>

          {/* Mô tả */}
          <div>
            <input 
              value={formData.excerpt} 
              onChange={(e) => updateField('excerpt', e.target.value)} 
              placeholder="Mô tả ngắn..." 
              className="w-full text-sm text-[#7d5a3f] border-b pb-2 focus:outline-none" 
            />
            {errors.excerpt && <div className="text-xs text-red-500 mt-1">{errors.excerpt}</div>}
          </div>

          {/* Tags */}
          <div>
            <div className="mb-2 text-sm text-gray-700 font-medium">Thẻ (Tags)</div>
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {formData.tags.map(t => (
                <div key={t.id} className="flex items-center gap-1.5 bg-orange-50 text-[#ff6b35] border border-orange-100 text-sm px-3 py-1.5 rounded-full">
                  <span>{t.name}</span>
                  <button onClick={() => updateField('tags', formData.tags.filter(tag => tag.id !== t.id))}><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
            <input 
              value={tagQuery} 
              onChange={(e) => setTagQuery(e.target.value)} 
              placeholder="Tìm tag..." 
              className="w-full sm:w-1/2 px-4 py-2 border rounded-lg focus:outline-none" 
            />
            {tagQuery && (
               <div className="bg-white border mt-1 rounded-lg shadow-xl max-h-40 overflow-y-auto">
                 {availableTags.filter(t => t.name.toLowerCase().includes(tagQuery.toLowerCase()) && !formData.tags.find(s => s.id === t.tag_id)).map(t => (
                   <div key={t.tag_id} onClick={() => { updateField('tags', [...formData.tags, {id: t.tag_id, name: t.name}]); setTagQuery(''); }} className="p-2 hover:bg-orange-50 cursor-pointer text-sm">
                     {t.name}
                   </div>
                 ))}
               </div>
            )}
            {errors.tags && <div className="text-xs text-red-500 mt-1">{errors.tags}</div>}
          </div>

          {/* Recipes */}
          <div>
            <div className="mb-2 text-sm text-gray-700 font-medium">Công thức liên quan</div>
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {formData.recipes.map(r => (
                <div key={r.id} className="flex items-center gap-2 bg-gray-50 border text-sm px-2 py-1 rounded-md">
                  <img src={r.image} alt="" className="w-8 h-8 object-cover rounded-sm" />
                  <span className="font-medium">{r.title}</span>
                  <button onClick={() => updateField('recipes', formData.recipes.filter(rec => rec.id !== r.id))} className="ml-2 text-red-500">✕</button>
                </div>
              ))}
            </div>
            <input 
              value={recipeQuery} 
              onChange={(e) => setRecipeQuery(e.target.value)} 
              placeholder="Tìm món ăn..." 
              className="w-full sm:w-1/2 px-4 py-2 border rounded-lg focus:outline-none" 
            />
            {recipeResults.length > 0 && (
              <div className="bg-white border mt-1 rounded-lg shadow-xl max-h-40 overflow-y-auto">
                {recipeResults.map(r => (
                  <div key={r.id} onClick={() => addRecipe(r)} className="p-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2 border-b">
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

          {/* Editor */}
          <div>
            <div 
              ref={editorRef} 
              contentEditable={formData.status !== 'banned'} 
              onInput={handleContentInput} 
              className={`min-h-[200px] border rounded-lg p-4 text-sm prose max-w-none focus:outline-none ${formData.status === 'banned' ? 'opacity-60 bg-gray-100' : ''}`} 
            />
            {errors.content && <div className="text-xs text-red-500 mt-1">{errors.content}</div>}
            {!formData.content && (
              <div className="absolute top-4 left-4 text-gray-400 pointer-events-none text-sm">
                Viết nội dung bài viết...
              </div>
            )}
           
          </div>

          {/* Footer */}
          <div className="flex items-center gap-4 justify-between pt-4 border-t">
            <select value={formData.status} onChange={(e) => updateField('status', e.target.value)} className="px-4 py-2 border rounded-md text-sm">
              <option value="draft">Nháp</option>
              <option value="public">Công khai</option>
            </select>
            <button 
              onClick={handleSave} 
              disabled={saving} 
              className="bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white px-6 py-2 rounded-full font-semibold shadow-md disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>

        <Modal 
          isOpen={messageModal.isOpen} 
          onClose={() => {
            setMessageModal(prev => ({ ...prev, isOpen: false }));
            if (messageModal.type === 'success') onSaved && onSaved(messageModal.savedData);
          }} 
          title={messageModal.title} 
          message={messageModal.message} 
          type={messageModal.type} 
        />
      </motion.div>
    </div>
  );
}