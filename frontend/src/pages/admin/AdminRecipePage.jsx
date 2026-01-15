import React, { useState, useEffect, useCallback } from 'react';
import useAdminRecipes from '../../hooks/admin/useAdminRecipes';
import AdminTable from '../../component/admin/AdminTable';
import StatusBadge from '../../component/admin/StatusBadge';
import ConfirmModal from '../../component/admin/ConfirmModal';
import RecipeModal from '../../component/admin/RecipeModal'; // [IMPORT MỚI]
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
        { label: 'Tên món', key: 'title', sortable: true, className: 'w-[25%]' },
        { label: 'Tác giả', key: 'author_name', sortable: false, className: 'w-[20%]' }, 
        { label: 'Ngày đăng', key: 'created_at', sortable: true, className: 'w-[15%]' },
        { label: 'Calo', key: 'total_calo', sortable: true, className: 'w-[10%]' },
        { label: 'Trạng thái', key: 'status', sortable: true, className: 'w-[10%]' },
        { label: 'Hành động', key: 'actions', sortable: false, className: 'w-[20%]' },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý Công thức</h1>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Tìm tên món ăn..." 
                        className="border rounded px-3 py-2 text-sm w-64 focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <button 
                        onClick={openCreateModal}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium flex items-center"
                    >
                        + Tạo món
                    </button>
                </div>
            </div>

            <AdminTable 
                columns={columns}
                pagination={pagination}
                onPageChange={(page) => loadData(searchTerm, page, sortConfig.key, sortConfig.order)}
                onSort={handleSort}
                currentSort={sortConfig}
                loading={loading}
            >
                {recipes.map(recipe => (
                    <tr key={recipe.recipe_id} className="hover:bg-gray-50">
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm font-medium truncate" title={recipe.title}>
                            <span onClick={() => openViewModal(recipe)} className="cursor-pointer hover:text-blue-600">
                                {recipe.title}
                            </span>
                            {recipe.is_trust === 1 && <span className="ml-1 text-xs text-green-600 border border-green-600 px-1 rounded">Trust</span>}
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm truncate">{recipe.author_name}</td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            {new Date(recipe.created_at).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{recipe.total_calo}</td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            <StatusBadge status={recipe.status} />
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            <div className="flex space-x-2">
                                <button onClick={() => openViewModal(recipe)} className="text-blue-600 hover:bg-blue-50 p-1 rounded" title="Xem">👁️</button>
                                <button onClick={() => openEditModal(recipe)} className="text-yellow-600 hover:bg-yellow-50 p-1 rounded" title="Sửa">✏️</button>
                                <button 
                                    onClick={() => onQuickHide(recipe)}
                                    className={`text-xs font-bold px-2 py-1 rounded border ${recipe.status === 'banned' ? 'text-green-600 border-green-200' : 'text-red-600 border-red-200'}`}
                                >
                                    {recipe.status === 'banned' ? 'Mở' : 'Ban'}
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </AdminTable>

            {/* Recipe Modal */}
            <RecipeModal 
                isOpen={isRecipeModalOpen}
                onClose={() => setIsRecipeModalOpen(false)}
                mode={modalMode}
                recipeData={selectedRecipe}
                onSubmit={handleModalSubmit}
            />

            {/* Confirm Modal */}
            <ConfirmModal 
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={confirmQuickHide}
                title={targetRecipe?.status === 'banned' ? "Mở khóa công thức" : "Ẩn công thức"}
                message={`Xác nhận thay đổi trạng thái cho bài viết "${targetRecipe?.title}"?`}
                isDanger={targetRecipe?.status !== 'banned'}
                confirmText="Xác nhận"
            />
        </div>
    );
};

export default AdminRecipePage;