import { useState, useEffect, useRef } from 'react';
import { useGlobalModal } from '../../../context/ModalContext';
import { useCreateArticleMutation, useUpdateArticleMutation } from '../../mutations/useContentMutations';
import recipeApi from '../../../api/recipeApi';
import { getRecipeImageUrl } from '../../../utils/imageHelper';

export const useArticleFormUI = (initialData, isOpen, onClose) => {
    const { showModal } = useGlobalModal();
    const createMutation = useCreateArticleMutation();
    const updateMutation = useUpdateArticleMutation();

    const [formData, setFormData] = useState({
        id: null, title: '', excerpt: '', content: '', status: 'draft',
        tags: [], recipes: [], coverFile: null, coverPreview: null, readTime: '1 phút'
    });
    
    const [tagQuery, setTagQuery] = useState('');
    const [recipeQuery, setRecipeQuery] = useState('');
    const [recipeResults, setRecipeResults] = useState([]);
    const [errors, setErrors] = useState({});

    // Xử lý nạp dữ liệu ban đầu
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    id: initialData.id || initialData.article_id,
                    title: initialData.title || '',
                    excerpt: initialData.excerpt || '',
                    content: initialData.content || '',
                    status: initialData.status || 'draft',
                    tags: initialData.tags || [],
                    recipes: initialData.recipes || [],
                    coverFile: null,
                    coverPreview: initialData.image || null,
                    readTime: initialData.readTime || '1 phút'
                });
            } else {
                setFormData({ 
                    id: null, title: '', excerpt: '', content: '', status: 'draft', 
                    tags: [], recipes: [], coverFile: null, coverPreview: null, readTime: '1 phút' 
                });
            }
            setErrors({});
        }
    }, [initialData, isOpen]);

    // Helpers
    const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    const handleCoverChange = (file) => {
        if (!file) return;
        updateField('coverFile', file);
        const reader = new FileReader();
        reader.onload = () => updateField('coverPreview', reader.result);
        reader.readAsDataURL(file);
    };

    // Tìm kiếm Recipes (Debounce 300ms)
    useEffect(() => {
        const q = (recipeQuery || '').trim();
        if (!q) { setRecipeResults([]); return; }
        const t = setTimeout(async () => {
            try {
                const resp = await recipeApi.searchSimple(q);
                const results = resp.data || [];
                const formatted = results.map(r => ({
                    id: r.recipe_id, title: r.title, image: getRecipeImageUrl(r.recipe_id, r.cover_image)
                }));
                setRecipeResults(formatted.filter(r => !formData.recipes.find(s => s.id === r.id)));
            } catch (err) { console.error(err); }
        }, 300);
        return () => clearTimeout(t);
    }, [recipeQuery, formData.recipes]);

    // Submit Form
    const handleSave = async () => {
        const newErrors = {};
        if (!formData.title.trim() || formData.title.length < 5) newErrors.title = 'Tiêu đề phải có ít nhất 5 ký tự.';
        if (!formData.excerpt.trim()) newErrors.excerpt = 'Vui lòng nhập mô tả ngắn.';
        if (formData.tags.length === 0) newErrors.tags = 'Vui lòng chọn ít nhất 1 thẻ (Tag).';
        const plainText = formData.content.replace(/<[^>]+>/g, '').trim();
        if (plainText.length < 20) newErrors.content = 'Nội dung bài viết phải có ít nhất 20 ký tự.';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Tự động tính readTime trước khi submit
        const words = plainText.split(/\s+/).filter(w => w.length > 0).length;
        const readTime = Math.max(1, Math.ceil(words / 200));

        // Build FormData
        const submitData = new FormData();
        submitData.append('title', formData.title);
        submitData.append('description', formData.excerpt);
        submitData.append('content', formData.content);
        submitData.append('status', formData.status);
        submitData.append('read_time', readTime);
        if (formData.coverFile) submitData.append('cover_image', formData.coverFile);
        submitData.append('tags', JSON.stringify(formData.tags.map(t => t.id || t.tag_id)));
        submitData.append('recipeIds', JSON.stringify(formData.recipes.map(r => r.id || r.recipe_id)));

        try {
            if (formData.id) {
                await updateMutation.mutateAsync({ articleId: formData.id, formData: submitData });
            } else {
                await createMutation.mutateAsync(submitData);
            }
            showModal({ 
                title: 'Thành công', 
                message: 'Lưu bài viết thành công.', 
                type: 'success',
                actions: [{ label: 'Đóng', style: 'primary', onClick: onClose }]
            });
        } catch (err) {
            showModal({ title: 'Lỗi', message: err.response?.data?.message || 'Lỗi khi lưu', type: 'error' });
        }
    };

    return {
        formData, updateField, handleCoverChange,
        tagQuery, setTagQuery,
        recipeQuery, setRecipeQuery, recipeResults,
        errors, handleSave,
        isSaving: createMutation.isPending || updateMutation.isPending
    };
};