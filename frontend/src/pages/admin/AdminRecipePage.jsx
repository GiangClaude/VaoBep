import React, { useState, useEffect, useCallback } from 'react';
import { Search, ChefHat, Plus, Eye, PenLine, Ban, CheckCircle, Flame, Lock, Unlock } from 'lucide-react'; // [MỚI]
import useAdminRecipes from '../../hooks/admin/useAdminRecipes';
import AdminTable from '../../component/admin/AdminTable';
import StatusBadge from '../../component/admin/StatusBadge';
import ConfirmModal from '../../component/admin/ConfirmModal';
import RecipeModal from '../../component/admin/RecipeModal';
import debounce from 'lodash.debounce';
import { toast } from 'react-toastify';

const AdminRecipePage = () => {
    // [CẬP NHẬT] Lấy thêm create/update/get từ hook
    const { recipes, loading, pagination, fetchRecipes, hideRecipe, createRecipe, updateRecipe, getRecipe } = useAdminRecipes();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', order: 'DESC' });
    
    // Modal State
    const [modalMode, setModalMode] = useState('create');
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);

    // Confirm Modal (Cho nút ẩn nhanh)
    const [targetRecipe, setTargetRecipe] = useState(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const loadData = (keyword, page, sortKey, sortOrder) => {
        fetchRecipes(page, pagination.limit, keyword, sortKey, sortOrder);
    };

    const debouncedSearch = useCallback(
        debounce((keyword) => {
            loadData(keyword, 1, sortConfig.key, sortConfig.order);
        }, 500),
        [sortConfig]
    );

    useEffect(() => {
        loadData('', 1, 'created_at', 'DESC');
    }, []);

    // --- Handlers ---
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        debouncedSearch(e.target.value);
    };

    const handleSort = (key, order) => {
        setSortConfig({ key, order });
        loadData(searchTerm, pagination.page, key, order);
    };

    // Modal Actions
    const openCreateModal = () => {
        setModalMode('create');
        setSelectedRecipe(null);
        setIsRecipeModalOpen(true);
    };

    const openViewModal = async (recipe) => {
        try {
            const data = await getRecipe(recipe.recipe_id);
            setModalMode('view');
            setSelectedRecipe(data);
            setIsRecipeModalOpen(true);
        } catch (e) {
            toast.error("Lỗi tải chi tiết");
        }
    };

    const openEditModal = (recipe) => {
        setModalMode('edit');
        setSelectedRecipe(recipe);
        setIsRecipeModalOpen(true);
    };

    const handleModalSubmit = async (data) => {
        try {
            if (modalMode === 'create') {
                await createRecipe(data); // data là FormData
                toast.success("Tạo công thức thành công");
            } else if (modalMode === 'edit') {
                await updateRecipe(selectedRecipe.recipe_id, data);
                toast.success("Cập nhật thành công");
            }
            setIsRecipeModalOpen(false);
        } catch (error) {
            toast.error("Có lỗi xảy ra");
        }
    };

    // Quick Action (Ban/Unban)
    const onQuickHide = (recipe) => {
        setTargetRecipe(recipe);
        setIsConfirmOpen(true);
    };

    const confirmQuickHide = async () => {
        if (!targetRecipe) return;
        try {
            const newStatus = targetRecipe.status === 'banned' ? 'public' : 'banned';
            await hideRecipe(targetRecipe.recipe_id, newStatus);
            setIsConfirmOpen(false);
            toast.success(`Đã cập nhật trạng thái: ${newStatus}`);
        } catch (e) {
            toast.error("Lỗi cập nhật");
        }
    };

    const columns = [
        { label: 'Tên món', key: 'title', sortable: true, className: 'w-[30%]' },
        { label: 'Tác giả', key: 'author_name', sortable: false, className: 'w-[20%]' }, 
        { label: 'Ngày đăng', key: 'created_at', sortable: true, className: 'w-[15%]' },
        { label: 'Calo', key: 'total_calo', sortable: true, className: 'w-[10%]' },
        { label: 'Trạng thái', key: 'status', sortable: true, className: 'w-[10%]' },
        { label: 'Hành động', key: 'actions', sortable: false, className: 'w-[15%]' },
    ];

    return (
        <div className="space-y-6">
            {/* HEADER TOOLBAR */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg text-[#ff6b35]">
                        <ChefHat size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Quản lý Công thức</h1>
                        <p className="text-sm text-gray-500">Danh sách các món ăn trên hệ thống</p>
                    </div>
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 sm:w-64">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Tìm tên món ăn..." 
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-orange-200 focus:ring-4 focus:ring-orange-50 outline-none transition-all text-sm font-medium text-gray-700 placeholder-gray-400"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                    
                    {/* Create Button (Đã uncomment và style lại) */}
                    <button 
                        onClick={openCreateModal}
                        className="bg-gradient-to-r from-[#ff6b35] to-[#f7931e] hover:shadow-lg hover:shadow-orange-200 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95 shrink-0"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">Tạo món</span>
                    </button>
                </div>
            </div>

            {/* TABLE */}
            <AdminTable 
                columns={columns}
                pagination={pagination}
                onPageChange={(page) => loadData(searchTerm, page, sortConfig.key, sortConfig.order)}
                onSort={handleSort}
                currentSort={sortConfig}
                loading={loading}
            >
                {recipes.map(recipe => (
                    <tr key={recipe.recipe_id} className="group hover:bg-orange-50/30 transition-colors border-b border-gray-100 last:border-none">
                        {/* Title Column */}
                        <td className="px-5 py-4">
                            <div className="flex items-center gap-2 max-w-full">
                                <span 
                                    onClick={() => openViewModal(recipe)} 
                                    className="font-bold text-gray-800 cursor-pointer hover:text-[#ff6b35] transition-colors truncate"
                                    title={recipe.title}
                                >
                                    {recipe.title}
                                </span>
                                {recipe.is_trust === 1 && (
                                    <div className="text-green-500 bg-green-50 rounded-full p-0.5" title="Trusted Recipe">
                                        <CheckCircle size={14} fill="currentColor" className="text-white" />
                                    </div>
                                )}
                            </div>
                        </td>

                        {/* Author Column */}
                        <td className="px-5 py-4 text-sm text-gray-600 truncate" title={recipe.author_name}>
                            {recipe.author_name}
                        </td>

                        {/* Date Column */}
                        <td className="px-5 py-4 text-sm text-gray-500 font-medium">
                            {new Date(recipe.created_at).toLocaleDateString('vi-VN')}
                        </td>

                        {/* Calo Column */}
                        <td className="px-5 py-4">
                            <div className="flex items-center gap-1 text-sm font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg w-fit">
                                <Flame size={12} fill="currentColor" />
                                {recipe.total_calo}
                            </div>
                        </td>

                        {/* Status Column */}
                        <td className="px-5 py-4">
                            <StatusBadge status={recipe.status} />
                        </td>

                        {/* Actions Column */}
                        <td className="px-5 py-4">
                            <div className="flex items-center gap-2 opacity-100 sm:opacity-100 sm:group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openViewModal(recipe)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" title="Xem">
                                    <Eye size={16} />
                                </button>
                                <button onClick={() => openEditModal(recipe)} className="p-2 text-yellow-600 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors" title="Sửa">
                                    <PenLine size={16} />
                                </button>
                                <button 
                                    onClick={() => onQuickHide(recipe)}
                                    className={`p-2 rounded-lg transition-colors ${
                                        recipe.status === 'banned' 
                                        ? 'text-green-600 bg-green-50 hover:bg-green-100' 
                                        : 'text-red-600 bg-red-50 hover:bg-red-100'
                                    }`}
                                    title={recipe.status === 'banned' ? 'Mở khóa' : 'Ban công thức'}
                                >
                                    {recipe.status === 'banned' ? <Unlock size={16} /> : <Ban size={16} />}
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </AdminTable>

            {/* MODALS */}
            <RecipeModal 
                isOpen={isRecipeModalOpen}
                onClose={() => setIsRecipeModalOpen(false)}
                mode={modalMode}
                recipeData={selectedRecipe}
                onSubmit={handleModalSubmit}
            />

            <ConfirmModal 
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={confirmQuickHide}
                title={targetRecipe?.status === 'banned' ? "Mở khóa công thức" : "Ban công thức"}
                message={`Xác nhận thay đổi trạng thái cho bài viết "${targetRecipe?.title}"? Hành động này sẽ ảnh hưởng đến việc hiển thị bài viết.`}
                isDanger={targetRecipe?.status !== 'banned'}
                confirmText={targetRecipe?.status === 'banned' ? 'Mở khóa' : 'Ban ngay'}
            />
        </div>
    );
};

export default AdminRecipePage;