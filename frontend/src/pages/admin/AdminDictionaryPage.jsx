import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, Edit, Trash2, X, Upload, MapPin } from 'lucide-react';
import { useAdminDictionary } from '../../hooks/admin/useAdminDictionary';
import AdminTable from '../../component/admin/AdminTable';
import { getDishImageUrl } from '../../utils/imageHelper';
const AdminDictionaryPage = () => {
    const { 
        dishes, pagination, isLoading, fetchDishes,
        handleCreateDish, handleUpdateDish, handleDeleteDish
    } = useAdminDictionary();

    const [searchQuery, setSearchQuery] = useState('');
    
    // State Form Modal
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    
    // Dữ liệu Form
    const [formData, setFormData] = useState({
        original_name: '', english_name: '', description: '', 
        history: '', country: '', latitude: '', longitude: ''
    });
    
    // Ảnh
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Quán ăn (Eateries)
    const [editEateries, setEditEateries] = useState(false); // Bật/tắt chế độ sửa quán ăn
    const [eateries, setEateries] = useState([]);

    // 1. Khởi tạo data
    const [currentSort, setCurrentSort] = useState({ key: 'created_at', order: 'DESC' });
    useEffect(() => {
        fetchDishes(1, 10, '', currentSort.key, currentSort.order);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 2. Các hàm xử lý giao diện
    const handleSearch = (e) => {
        e.preventDefault();
        fetchDishes(1, pagination.limit, searchQuery, currentSort.key, currentSort.order);
    };

    const openCreateModal = () => {
        setEditingItem(null);
        setFormData({
            original_name: '', english_name: '', description: '', 
            history: '', country: '', latitude: '', longitude: ''
        });
        setImageFile(null);
        setImagePreview(null);
        setEditEateries(true); // Tạo mới thì auto bật nhập quán ăn
        setEateries([]);
        setIsFormOpen(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setFormData({
            original_name: item.original_name || '', 
            english_name: item.english_name || '', 
            description: item.description || '', 
            history: item.history || '', 
            country: item.country || '', 
            latitude: item.latitude || '', 
            longitude: item.longitude || ''
        });
        
        setImageFile(null);
        // Hiển thị ảnh cũ nếu có (Cấu trúc URL tùy vào server backend của bạn)
        if (item.image_url) {
            // VD: process.env.REACT_APP_API_URL + ...
            setImagePreview(getDishImageUrl(item.dish_id, item.image_url));
        } else {
            setImagePreview(null);
        }

        setEditEateries(false); // Mặc định ẩn để không vô tình ghi đè mất quán cũ
        setEateries([]);
        setIsFormOpen(true);
    };

    // Hàm xử lý ảnh
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file)); // Preview ảnh Local
        }
    };

    // Quản lý Mảng Quán ăn
    const addEatery = () => setEateries([...eateries, { name: '', address: '' }]);
    const updateEatery = (index, field, value) => {
        const newEateries = [...eateries];
        newEateries[index][field] = value;
        setEateries(newEateries);
    };
    const removeEatery = (index) => setEateries(eateries.filter((_, i) => i !== index));

    // 3. Xử lý Submit (Dùng FormData vì có File)
    const submitForm = async (e) => {
        e.preventDefault();
        const submitData = new FormData();
        
        // Append text fields
        Object.keys(formData).forEach(key => {
            if (formData[key]) submitData.append(key, formData[key]);
        });

        // Append file
        if (imageFile) {
            submitData.append('image_url', imageFile);
        }

        // Append eateries (Chỉ gửi nếu bật cờ editEateries, giúp bảo vệ dữ liệu cũ)
        if (editEateries) {
            // Lọc bỏ các dòng quán ăn bị trống tên
            const validEateries = eateries.filter(e => e.name.trim() !== '');
            submitData.append('eateries', JSON.stringify(validEateries));
        }

        let result;
        if (editingItem) {
            result = await handleUpdateDish(editingItem.dish_id, submitData);
        } else {
            result = await handleCreateDish(submitData);
        }

        if (result.success) {
            setIsFormOpen(false);
        } else {
            alert(result.message);
        }
    };

    // 4. Xử lý Xóa
    const confirmDelete = async (item) => {
        if (window.confirm(`Xóa món "${item.original_name}" sẽ xóa cả các địa điểm ăn uống kèm theo. Bạn có chắc chắn?`)) {
            const result = await handleDeleteDish(item.dish_id);
            if (!result.success) alert(result.message);
        }
    };

    const columns = [
        { key: 'image', label: 'Ảnh', className: 'w-[10%]' },
        { key: 'name', label: 'Tên món', className: 'w-[30%]', sortable: true },
        { key: 'country', label: 'Quốc gia', className: 'w-[20%]', sortable: true },
        { key: 'actions', label: 'Hành động', className: 'w-[20%]' }
    ];

    return (
        <div className="space-y-6">
            {/* HEADER & TOOLBAR */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Từ điển món ăn</h1>
                        <p className="text-sm text-gray-500">Thêm và quản lý bài viết từ điển ẩm thực</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <form onSubmit={handleSearch} className="relative">
                        <input 
                            type="text" placeholder="Tìm tên món..." 
                            className="pl-10 pr-4 py-2 rounded-lg border focus:border-blue-500 focus:outline-none"
                            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <button type="submit" className="hidden"></button>
                    </form>
                    <button 
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Plus size={20} /> <span className="font-medium">Thêm mới</span>
                    </button>
                </div>
            </div>
            
            {/* TABLE */}
            <AdminTable
                columns={columns}
                loading={isLoading}
                onSort={(key, order) => {
                    setCurrentSort({ key, order });
                    fetchDishes(1, pagination.limit, searchQuery, key, order);
                }}
                currentSort={currentSort}
                onPageChange={(newPage) => fetchDishes(newPage, pagination.limit, searchQuery, currentSort.key, currentSort.order)}
            >
                {dishes.length === 0 && !isLoading ? (
                    <tr><td colSpan="4" className="text-center p-8 text-gray-500">Không tìm thấy món ăn nào.</td></tr>
                ) : (
                    dishes.map(dish => (
                        <tr key={dish.dish_id} className="hover:bg-blue-50/30 border-b">
                            <td className="px-5 py-2">
                                {dish.image_url ? (
                                    <img 
                                        src={getDishImageUrl(dish.dish_id, dish.image_url)} 
                                        alt={dish.original_name} 
                                        className="w-12 h-12 rounded object-cover border"
                                        onError={(e) => e.target.src = '/default-dish.png'} // Đường dẫn ảnh default
                                    />
                                ) : (
                                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">Trống</div>
                                )}
                            </td>
                            <td className="px-5 py-4">
                                <div className="font-bold text-gray-800">{dish.original_name}</div>
                                <div className="text-xs text-gray-500">{dish.english_name}</div>
                            </td>
                            <td className="px-5 py-4">{dish.country || 'Chưa cập nhật'}</td>
                            <td className="px-5 py-4">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => openEditModal(dish)} className="p-1.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100">
                                        <Edit size={18} />
                                    </button>
                                    <button onClick={() => confirmDelete(dish)} className="p-1.5 bg-red-50 text-red-700 rounded hover:bg-red-100">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))
                )}
            </AdminTable>

            {/* PAGINATION */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-end items-center gap-4 mt-4">
                    <button disabled={pagination.page === 1} onClick={() => fetchDishes(pagination.page - 1, pagination.limit, searchQuery, currentSort.key, currentSort.order)} className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50">Trang trước</button>
                    <span className="text-sm">Trang {pagination.page} / {pagination.totalPages}</span>
                    <button disabled={pagination.page >= pagination.totalPages} onClick={() => fetchDishes(pagination.page + 1, pagination.limit, searchQuery, currentSort.key, currentSort.order)} className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50">Trang sau</button>
                </div>
            )}

            {/* MODAL FORM THÊM / SỬA */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center z-10">
                            <h2 className="text-xl font-bold">{editingItem ? 'Sửa món ăn' : 'Thêm món ăn vào từ điển'}</h2>
                            <button onClick={() => setIsFormOpen(false)}><X size={24} className="text-gray-500 hover:text-red-500"/></button>
                        </div>
                        
                        <form onSubmit={submitForm} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* CỘT TRÁI: THÔNG TIN CƠ BẢN */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Tên gốc *</label>
                                        <input required type="text" className="w-full px-3 py-2 border rounded" value={formData.original_name} onChange={e => setFormData({...formData, original_name: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Tên tiếng Anh</label>
                                        <input type="text" className="w-full px-3 py-2 border rounded" value={formData.english_name} onChange={e => setFormData({...formData, english_name: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Quốc gia</label>
                                        <input type="text" className="w-full px-3 py-2 border rounded" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Vĩ độ (Latitude)</label>
                                            <input type="number" step="any" className="w-full px-3 py-2 border rounded" value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Kinh độ (Longitude)</label>
                                            <input type="number" step="any" className="w-full px-3 py-2 border rounded" value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})} />
                                        </div>
                                    </div>
                                </div>

                                {/* CỘT PHẢI: ẢNH VÀ MÔ TẢ */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Ảnh món ăn</label>
                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded cursor-pointer hover:bg-gray-50 relative overflow-hidden">
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <Upload className="text-gray-400 mb-2" size={24} />
                                                    <span className="text-sm text-gray-500">Tải ảnh lên</span>
                                                </div>
                                            )}
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                        </label>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Mô tả chung</label>
                                        <textarea rows="2" className="w-full px-3 py-2 border rounded" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Lịch sử / Nguồn gốc</label>
                                        <textarea rows="2" className="w-full px-3 py-2 border rounded" value={formData.history} onChange={e => setFormData({...formData, history: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            {/* PHẦN ĐỊA ĐIỂM ĂN UỐNG (EATERIES) */}
                            <div className="mt-8 border-t pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold flex items-center gap-2"><MapPin size={20} className="text-red-500" /> Danh sách Quán ăn gợi ý</h3>
                                    {editingItem && !editEateries ? (
                                        <button type="button" onClick={() => setEditEateries(true)} className="text-sm px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200">
                                            Bật chế độ ghi đè quán ăn
                                        </button>
                                    ) : null}
                                </div>

                                {editingItem && !editEateries ? (
                                    <div className="p-4 bg-gray-50 text-gray-500 rounded text-sm text-center border border-dashed">
                                        Để bảo vệ dữ liệu cũ, danh sách quán ăn đang bị ẩn. Nhấn nút "Bật chế độ ghi đè" nếu bạn muốn thay mới hoàn toàn danh sách quán ăn.
                                    </div>
                                ) : (
                                    <div className="space-y-3 bg-gray-50 p-4 rounded border border-gray-200">
                                        {eateries.map((eatery, index) => (
                                            <div key={index} className="flex items-start gap-2">
                                                <input required type="text" placeholder="Tên quán" className="flex-1 px-3 py-2 border rounded" value={eatery.name} onChange={e => updateEatery(index, 'name', e.target.value)} />
                                                <input required type="text" placeholder="Địa chỉ" className="flex-[2] px-3 py-2 border rounded" value={eatery.address} onChange={e => updateEatery(index, 'address', e.target.value)} />
                                                <button type="button" onClick={() => removeEatery(index)} className="p-2 text-red-500 hover:bg-red-100 rounded mt-0.5"><Trash2 size={20}/></button>
                                            </div>
                                        ))}
                                        <button type="button" onClick={addEatery} className="text-sm text-blue-600 font-medium hover:underline">+ Thêm quán ăn</button>
                                    </div>
                                )}
                            </div>

                            {/* NÚT LƯU */}
                            <div className="mt-8 flex justify-end gap-3 sticky bottom-0 bg-white pt-4 border-t">
                                <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-2 border rounded text-gray-600">Hủy</button>
                                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">Lưu Thông Tin</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDictionaryPage;