import React, { useState, useEffect } from 'react';
import { Carrot, Check, X, Edit, Trash2, Plus, Search } from 'lucide-react';
import  useAdminIngredients from '../../hooks/admin/useAdminIngredients';
import AdminTable from '../../component/admin/AdminTable';
import StatusBadge from '../../component/admin/StatusBadge';

const AdminIngredientPage = () => {
    // 1. Lấy state và function từ Hook
    const { 
        allIngredients, allPagination, isLoadingAll, fetchAllIngredients,
        handleCreateIngredient, handleUpdateIngredient, handleDeleteIngredient,
        processIngredient // Giữ hàm cũ để duyệt nhanh
    } = useAdminIngredients();
    
    // 2. Local State
    const [caloInputs, setCaloInputs] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [currentSort, setCurrentSort] = useState({ key: 'name', order: 'ASC' });
    
    // State Modal Form (Thêm/Sửa)
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({ name: '', calo_per_100g: '', status: 'approved' });

    // 3. Khởi tạo data lần đầu
    useEffect(() => {
        fetchAllIngredients(1, 10, '', currentSort.key, currentSort.order);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 4. Các hàm xử lý giao diện
    const handleCaloChange = (id, value) => {
        setCaloInputs(prev => ({ ...prev, [id]: value }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchAllIngredients(1, allPagination.limit, searchQuery, currentSort.key, currentSort.order);
    };

    // Hàm Duyệt / Từ chối nhanh
    const handleAction = async (id, action) => {
        const calo = caloInputs[id];
        
        if (action === 'approve' && !calo) {
            alert("Vui lòng nhập số Calo/100g trước khi duyệt!");
            return;
        }

        const result = await processIngredient(id, action, calo);
        // Sau khi duyệt xong, load lại trang hiện tại
        if(result?.success !== false) {
             fetchAllIngredients(allPagination.page, allPagination.limit, searchQuery);
        } else {
             alert(result?.message || "Có lỗi xảy ra");
        }
    };

    // Mở Form Thêm Mới
    const openCreateModal = () => {
        setEditingItem(null);
        setFormData({ name: '', calo_per_100g: '', status: 'approved' });
        setIsFormOpen(true);
    };

    // Mở Form Sửa
    const openEditModal = (item) => {
        setEditingItem(item);
        setFormData({ 
            name: item.name, 
            calo_per_100g: item.calo_per_100g || '', 
            status: item.status 
        });
        setIsFormOpen(true);
    };

    // Xử lý Lưu Form
    const submitForm = async (e) => {
        e.preventDefault();
        let result;
        if (editingItem) {
            result = await handleUpdateIngredient(editingItem.ingredient_id, formData);
        } else {
            result = await handleCreateIngredient(formData);
        }

        if (result.success) {
            setIsFormOpen(false);
        } else {
            alert(result.message);
        }
    };

    // Xử lý Xóa
    const confirmDelete = async (item) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa nguyên liệu "${item.name}"?`)) {
            const result = await handleDeleteIngredient(item.ingredient_id);
            if (!result.success) {
                alert(result.message);
            }
        }
    };

    // 5. Cấu hình cột cho bảng
    const columns = [
        { key: 'name', label: 'Tên nguyên liệu', className: 'w-[25%]', sortable: true },
        { key: 'status', label: 'Trạng thái', className: 'w-[15%]', sortable: true },
        { key: 'calo', label: 'Calo / 100g', className: 'w-[20%]', sortable: true },
        { key: 'actions', label: 'Hành động', className: 'w-[40%]' }
    ];

    return (
        <div className="space-y-6 relative">
            {/* HEADER & TOOLBAR */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg text-[#ff6b35]">
                        <Carrot size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Quản lý Nguyên liệu</h1>
                        <p className="text-sm text-gray-500">Thêm mới, chỉnh sửa và kiểm duyệt nguyên liệu</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <form onSubmit={handleSearch} className="relative">
                        <input 
                            type="text" 
                            placeholder="Tìm nguyên liệu..." 
                            className="pl-10 pr-4 py-2 rounded-lg border focus:border-[#ff6b35] focus:outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <button type="submit" className="hidden"></button>
                    </form>
                    <button 
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-4 py-2 bg-[#ff6b35] text-white rounded-lg hover:bg-[#e55a2b] transition-colors"
                    >
                        <Plus size={20} />
                        <span className="font-medium">Thêm mới</span>
                    </button>
                </div>
            </div>
            
            {/* TABLE */}
            <AdminTable
                columns={columns}
                loading={isLoadingAll}
                onSort={(key, order) => {
                    setCurrentSort({ key, order });
                    fetchAllIngredients(1, allPagination.limit, searchQuery, key, order);
                }}
                currentSort={currentSort}
                onPageChange={(newPage) => fetchAllIngredients(newPage, allPagination.limit, searchQuery, currentSort.key, currentSort.order)}
            >
                {allIngredients.length === 0 && !isLoadingAll ? (
                    <tr>
                        <td colSpan="4" className="px-5 py-8 text-center text-gray-500">
                            <div className="flex flex-col items-center justify-center gap-2">
                                <div className="p-3 bg-gray-50 rounded-full">
                                    <Carrot size={24} className="text-gray-300 grayscale" />
                                </div>
                                <p>Không tìm thấy nguyên liệu nào.</p>
                            </div>
                        </td>
                    </tr>
                ) : (
                    allIngredients.map(ing => (
                        <tr key={ing.ingredient_id} className="group hover:bg-orange-50/30 transition-colors border-b border-gray-100 last:border-none">
                            {/* Name */}
                            <td className="px-5 py-4">
                                <span className="font-bold text-gray-800 text-sm" title={ing.name}>
                                    {ing.name}
                                </span>
                            </td>

                            {/* Status */}
                            <td className="px-5 py-4">
                                <StatusBadge status={ing.status} />
                            </td>

                            {/* Calo */}
                            <td className="px-5 py-4">
                                {ing.status === 'pending' ? (
                                    <div className="relative max-w-[120px]">
                                        <input 
                                            type="number"
                                            placeholder="0"
                                            className="w-full px-3 py-2 text-sm font-medium text-center rounded-lg border-2 border-gray-200 focus:border-[#ff6b35] focus:outline-none transition-all placeholder-gray-300"
                                            value={caloInputs[ing.ingredient_id] || ''}
                                            onChange={(e) => handleCaloChange(ing.ingredient_id, e.target.value)}
                                        />
                                        <span className="absolute right-[-30px] top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">kcal</span>
                                    </div>
                                ) : (
                                    <span className="text-sm font-medium text-gray-600">
                                        {ing.calo_per_100g ? `${ing.calo_per_100g} kcal` : 'Chưa có'}
                                    </span>
                                )}
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-4">
                                <div className="flex items-center gap-2 opacity-100 sm:opacity-100 sm:group-hover:opacity-100 transition-opacity">
                                    {/* Nút Duyệt chỉ hiện khi Pending */}
                                    {ing.status === 'pending' && (
                                        <>
                                            <button 
                                                onClick={() => handleAction(ing.ingredient_id, 'approve')}
                                                className="flex items-center gap-1 p-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 border border-green-200" title="Duyệt"
                                            >
                                                <Check size={18} strokeWidth={2.5} />
                                            </button>
                                            <button 
                                                onClick={() => handleAction(ing.ingredient_id, 'reject')}
                                                className="flex items-center gap-1 p-1.5 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 border border-yellow-200" title="Từ chối"
                                            >
                                                <X size={18} strokeWidth={2.5} />
                                            </button>
                                        </>
                                    )}

                                    {/* Nút Sửa & Xóa luôn hiện */}
                                    <button 
                                        onClick={() => openEditModal(ing)}
                                        className="flex items-center gap-1 p-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 border border-blue-200" title="Chỉnh sửa"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button 
                                        onClick={() => confirmDelete(ing)}
                                        className="flex items-center gap-1 p-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 border border-red-200" title="Xóa"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))
                )}
            </AdminTable>

            {/* PAGINATION */}
            {allPagination.totalPages > 1 && (
                <div className="flex justify-end items-center gap-4 mt-4">
                    <button 
                        disabled={allPagination.page === 1}
                        onClick={() => fetchAllIngredients(allPagination.page - 1, allPagination.limit, searchQuery, currentSort.key, currentSort.order)}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Trang trước
                    </button>
                    <span className="text-sm font-medium text-gray-600">
                        Trang {allPagination.page} / {allPagination.totalPages}
                    </span>
                    <button 
                        disabled={allPagination.page >= allPagination.totalPages}
                        onClick={() => fetchAllIngredients(allPagination.page + 1, allPagination.limit, searchQuery, currentSort.key, currentSort.order)}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Trang sau
                    </button>
                </div>
            )}

            {/* MODAL FORM */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingItem ? 'Sửa nguyên liệu' : 'Thêm nguyên liệu mới'}
                            </h2>
                            <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={submitForm} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên nguyên liệu *</label>
                                <input 
                                    required autoFocus
                                    type="text" 
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#ff6b35]"
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})} 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Lượng Calo (trên 100g)</label>
                                <input 
                                    type="number" step="0.1"
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#ff6b35]"
                                    value={formData.calo_per_100g} 
                                    onChange={e => setFormData({...formData, calo_per_100g: e.target.value})} 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                                <select 
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#ff6b35]"
                                    value={formData.status} 
                                    onChange={e => setFormData({...formData, status: e.target.value})}
                                >
                                    <option value="approved">Đã duyệt (Approved)</option>
                                    <option value="pending">Chờ duyệt (Pending)</option>
                                    <option value="reject">Từ chối (Reject)</option>
                                </select>
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setIsFormOpen(false)} 
                                    className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-4 py-2 bg-[#ff6b35] text-white rounded-lg hover:bg-[#e55a2b]"
                                >
                                    Lưu thay đổi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminIngredientPage;