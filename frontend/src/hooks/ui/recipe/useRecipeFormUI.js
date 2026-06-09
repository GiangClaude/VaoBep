import { useState, useEffect } from 'react';
import { useGlobalModal } from '../../../context/ModalContext';
import { useCreateRecipeMutation, useUpdateRecipeMutation } from '../../mutations/useContentMutations';
import { getRecipeImageUrl } from '../../../utils/imageHelper';

export const useRecipeFormUI = (initialData, isOpen, onClose) => {
    const { showModal } = useGlobalModal();
    const createMutation = useCreateRecipeMutation();
    const updateMutation = useUpdateRecipeMutation();

    const [formData, setFormData] = useState({
        id: null, title: "", description: "", coverImage: "", coverImageFile: null,
        servings: 1, cookTime: 60, totalCalo: "", status: "draft",
        ingredients: [], steps: [], tags: []
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                const rId = initialData.recipe_id || initialData.id;
                setFormData({
                    id: rId,
                    title: initialData.title || "",
                    description: initialData.description || "",
                    coverImage: initialData.image,
                    coverImageFile: null,
                    servings: initialData.servings || 1,
                    cookTime: initialData.cookTime || 60,
                    totalCalo: initialData.calories,
                    status: initialData.status || "draft",
                    ingredients: initialData.detailedIngredients ? initialData.detailedIngredients.map(ing => ({
                        id: ing.id || ing.ingredient_id || `existing-${Math.random()}`, 
                        name: ing.name || ing.ingredient_name || "", 
                        unit: ing.unit || ing.unit_name || "",       
                        amount: ing.amount || ing.quantity || "",      
                        isNew: false
                    })) : [],
                    steps: initialData.detailedSteps || [], 
                    tags: initialData.tags || [],
                });
            } else {
                setFormData({
                    id: null, title: "", description: "", coverImage: "", coverImageFile: null,
                    servings: 1, cookTime: 60, totalCalo: "", status: "draft",
                    ingredients: [], steps: [], tags: []
                });
            }
        }
    }, [isOpen, initialData]);

    const handleCoverImageUpload = (file) => {
        if (file) {
            setFormData(prev => ({ ...prev, coverImage: URL.createObjectURL(file), coverImageFile: file }));
        }
    };

    const handleRemoveCoverImage = () => {
        setFormData(prev => ({ ...prev, coverImage: "", coverImageFile: null }));
    };

    const handleSubmit = async (status) => {
        const submitData = new FormData();
        submitData.append('title', formData.title);
        submitData.append('description', formData.description || "");
        submitData.append('servings', formData.servings);
        submitData.append('cook_time', formData.cookTime);
        submitData.append('total_calo', formData.totalCalo || 0);
        submitData.append('status', status);
        submitData.append('ingredients', JSON.stringify(formData.ingredients));
        
        // [FIX] Tương thích ngược: Gửi cả steps (JSON) và instructions (TEXT) đề phòng Backend yêu cầu 1 trong 2
        submitData.append('steps', JSON.stringify(formData.steps));
        submitData.append('instructions', formData.steps.map(s => s.description).join('\n\n'));

        if (formData.coverImageFile) submitData.append('cover_image', formData.coverImageFile);
        
        const safeTags = Array.isArray(formData.tags) ? formData.tags.map(t => t.tag_id || t.id) : [];
        if (safeTags.length > 0) submitData.append('tags', JSON.stringify(safeTags));

        try {
            let res;
            if (formData.id) {
                res = await updateMutation.mutateAsync({ recipeId: formData.id, formData: submitData });
            } else {
                res = await createMutation.mutateAsync(submitData);
            }

            // [FIX QUAN TRỌNG] Bóp cổ "Thành công ảo" từ Backend trả về HTTP 200 nhưng success = false
            if (res && res.success === false) {
                throw new Error(res.message || "Lưu thất bại do Backend từ chối dữ liệu");
            }

            onClose(); // [FIX] Đóng Modal form ngay lập tức!
            
            showModal({ 
                title: "Thành công", 
                message: status === 'draft' ? "Đã lưu nháp công thức thành công!" : "Đã đăng công khai công thức!", 
                type: "success" 
            });
            
        } catch (error) {
            showModal({ 
                title: "Lỗi", 
                // Bắt lỗi từ Error ném ra ở trên HOẶC lỗi HTTP từ Axios
                message: error.message || error.response?.data?.message || "Lưu thất bại", 
                type: "error" 
            });
        }
    };

    return {
        formData, setFormData,
        handleCoverImageUpload, handleRemoveCoverImage, handleSubmit,
        isSaving: createMutation.isPending || updateMutation.isPending
    };
};