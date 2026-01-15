import React, { useState, useEffect } from 'react';
import { getRecipeImageUrl, getAvatarUrl } from '../../utils/imageHelper';

const RecipeModal = ({ isOpen, onClose, mode, recipeData, onSubmit }) => {
    // State cho Form Create/Edit
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        servings: 1,
        cook_time: 0,
        total_calo: 0,
        instructions: '',
        status: 'public',
        is_trust: 0,
        cover_image: null,
        ingredients: [] // [{name: '', quantity: '', unit: ''}]
    });

    const [previewImage, setPreviewImage] = useState(null);

    // Reset Form
   useEffect(() => {
        if (isOpen) {
            if (mode === 'create') {
                setFormData({
                    title: '', description: '', servings: 2, cook_time: 30, total_calo: 500,
                    instructions: '', status: 'public', is_trust: 0, cover_image: null, ingredients: []
                });
                setPreviewImage(null);
            } else if (recipeData) {
                // [SỬA LỖI] Phải khởi tạo đầy đủ structure cho formData, đặc biệt là ingredients
                setFormData({
                    title: recipeData.title || '',
                    description: recipeData.description || '',
                    servings: recipeData.servings || 1,
                    cook_time: recipeData.cook_time || 0,
                    total_calo: recipeData.total_calo || 0,
                    instructions: recipeData.instructions || '',
                    status: recipeData.status || 'public',
                    is_trust: recipeData.is_trust || 0,
                    cover_image: null,
                    ingredients: recipeData.ingredients || [] // [QUAN TRỌNG] Thêm dòng này để không bị lỗi .map
                });
            }
        }
    }, [isOpen, mode, recipeData]);

    if (!isOpen) return null;

    // --- Handlers cho Create Form ---
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, cover_image: file });
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleAddIngredient = () => {
        setFormData({
            ...formData,
            ingredients: [...formData.ingredients, { name: '', quantity: '', unit: '' }]
        });
    };

    const handleIngredientChange = (index, field, value) => {
        const newIngs = [...formData.ingredients];
        newIngs[index][field] = value;
        setFormData({ ...formData, ingredients: newIngs });
    };

    const handleRemoveIngredient = (index) => {
        const newIngs = formData.ingredients.filter((_, i) => i !== index);
        setFormData({ ...formData, ingredients: newIngs });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (mode === 'create') {
            // Build FormData
            const submission = new FormData();
            submission.append('title', formData.title);
            submission.append('description', formData.description);
            submission.append('servings', formData.servings);
            submission.append('cook_time', formData.cook_time);
            submission.append('total_calo', formData.total_calo);
            submission.append('instructions', formData.instructions);
            if (formData.cover_image) submission.append('cover_image', formData.cover_image);
            submission.append('ingredients', JSON.stringify(formData.ingredients));
            
            onSubmit(submission);
        } else if (mode === 'edit') {
            // Edit chỉ gửi JSON thường
            onSubmit({
                status: formData.status,
                is_trust: parseInt(formData.is_trust)
            });
        }
    };

    const titleMap = {
        'create': 'Tạo công thức mới',
        'edit': 'Chỉnh sửa trạng thái',
        'view': 'Chi tiết công thức'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 overflow-hidden animate-fade-in-down flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">{titleMap[mode]}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 font-bold text-xl">&times;</button>
                </div>

                {/* Body (Scrollable) */}
                <div className="p-6 overflow-y-auto flex-1">
                    
                    {/* --- VIEW MODE --- */}
                    {mode === 'view' && recipeData && (
                        <div className="space-y-6">
                            {/* Header Info */}
                            <div className="flex items-start space-x-4">
                                <img 
                                    src={getRecipeImageUrl(recipeData.recipe_id, recipeData.cover_image)} 
                                    alt="Cover" 
                                    className="w-32 h-32 object-cover rounded-lg shadow"
                                />
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-gray-900">{recipeData.title}</h2>
                                    <div className="flex items-center mt-2 space-x-2">
                                        <img 
                                            src={getAvatarUrl(recipeData.user_id, recipeData.author_avatar)} 
                                            className="w-6 h-6 rounded-full" 
                                            alt="Author"
                                        />
                                        <span className="text-sm text-gray-600">bởi {recipeData.author_name}</span>
                                    </div>
                                    <div className="flex mt-3 space-x-3">
                                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded font-bold">{recipeData.total_calo} Kcal</span>
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-bold">{recipeData.cook_time} phút</span>
                                        {recipeData.is_trust === 1 && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded font-bold">✓ Trusted</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                                <div className="text-center">
                                    <span className="block font-bold text-xl">{recipeData.like_count || 0}</span>
                                    <span className="text-xs text-gray-500">Yêu thích</span>
                                </div>
                                <div className="text-center">
                                    <span className="block font-bold text-xl">{recipeData.rating_avg_score || 0}</span>
                                    <span className="text-xs text-gray-500">Đánh giá</span>
                                </div>
                                <div className="text-center">
                                    <span className="block font-bold text-xl">{recipeData.comment_count || 0}</span>
                                    <span className="text-xs text-gray-500">Bình luận</span>
                                </div>
                            </div>

                            {/* Ingredients */}
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">Nguyên liệu:</h4>
                                <ul className="list-disc list-inside text-sm text-gray-700 bg-gray-50 p-3 rounded">
                                    {recipeData.ingredients?.map((ing, idx) => (
                                        <li key={idx}>
                                            <span className="font-medium">{ing.ingredient_name}</span>: {ing.quantity} {ing.unit_name}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Instructions */}
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">Cách làm:</h4>
                                <div className="text-sm text-gray-700 whitespace-pre-line p-3 bg-gray-50 rounded">
                                    {recipeData.instructions}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- CREATE MODE --- */}
                    {mode === 'create' && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tên món ăn</label>
                                <input type="text" required className="input-field w-full border rounded p-2" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium">Khẩu phần</label>
                                    <input type="number" className="border rounded p-2 w-full" value={formData.servings} onChange={e => setFormData({...formData, servings: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Phút nấu</label>
                                    <input type="number" className="border rounded p-2 w-full" value={formData.cook_time} onChange={e => setFormData({...formData, cook_time: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Calo</label>
                                    <input type="number" className="border rounded p-2 w-full" value={formData.total_calo} onChange={e => setFormData({...formData, total_calo: e.target.value})} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Mô tả ngắn</label>
                                <textarea className="border rounded p-2 w-full h-20" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                            </div>

                            {/* Ingredient Dynamic List */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Nguyên liệu</label>
                                {formData.ingredients.map((ing, idx) => (
                                    <div key={idx} className="flex gap-2 mb-2">
                                        <input placeholder="Tên" className="border rounded p-1 w-1/2" value={ing.name} onChange={e => handleIngredientChange(idx, 'name', e.target.value)} />
                                        <input placeholder="Lượng" className="border rounded p-1 w-1/4" value={ing.quantity} onChange={e => handleIngredientChange(idx, 'quantity', e.target.value)} />
                                        <input placeholder="Đơn vị" className="border rounded p-1 w-1/4" value={ing.unit} onChange={e => handleIngredientChange(idx, 'unit', e.target.value)} />
                                        <button type="button" onClick={() => handleRemoveIngredient(idx)} className="text-red-500 font-bold px-2">x</button>
                                    </div>
                                ))}
                                <button type="button" onClick={handleAddIngredient} className="text-sm text-blue-600 hover:underline">+ Thêm nguyên liệu</button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Hướng dẫn (Các bước)</label>
                                <textarea className="border rounded p-2 w-full h-32" placeholder="Bước 1... Bước 2..." value={formData.instructions} onChange={e => setFormData({...formData, instructions: e.target.value})}></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Ảnh bìa</label>
                                <input type="file" onChange={handleFileChange} className="mt-1" />
                                {previewImage && <img src={previewImage} className="mt-2 h-32 object-cover rounded" alt="Preview" />}
                            </div>
                        </form>
                    )}

                    {/* --- EDIT MODE --- */}
                    {mode === 'edit' && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                                <select 
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                    value={formData.status}
                                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                                >
                                    <option value="public">Unbanned</option>
                                    <option value="banned">Banned</option>
                                </select>
                            </div>
                            
                            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded border">
                                <input 
                                    type="checkbox" 
                                    id="is_trust"
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                    checked={formData.is_trust === 1}
                                    onChange={(e) => setFormData({...formData, is_trust: e.target.checked ? 1 : 0})}
                                />
                                <label htmlFor="is_trust" className="font-medium text-gray-700 cursor-pointer">
                                    Đánh dấu là công thức đáng tin (Trusted)
                                </label>
                            </div>
                            <p className="text-sm text-gray-500 italic">*Công thức đáng tin sẽ được ưu tiên hiển thị và có huy hiệu xác thực.</p>
                        </form>
                    )}
                </div>

                {/* Footer Buttons */}
                {mode !== 'view' && (
                    <div className="flex justify-end px-6 py-4 border-t bg-gray-50 space-x-3">
                        <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100">
                            Hủy
                        </button>
                        <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
                            {mode === 'create' ? 'Tạo mới' : 'Lưu thay đổi'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecipeModal;