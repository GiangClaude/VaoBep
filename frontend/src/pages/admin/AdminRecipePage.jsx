import React, { useState, useEffect} from 'react';
import useAdminRecipes from '../../hooks/admin/useAdminRecipes';
import AdminTable from '../../component/admin/AdminTable';
import StatusBadge from '../../component/admin/StatusBadge';
import ConfirmModal from '../../component/admin/ConfirmModal';

const AdminRecipePage = () => {
    const { recipes, loading, pagination, fetchRecipes, hideRecipe } = useAdminRecipes();
    const [targetRecipe, setTargetRecipe] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const onHideClick = (recipe) => {
        setTargetRecipe(recipe);
        setIsModalOpen(true);
    };

    useEffect(() => {
        fetchRecipes();
    }, [fetchRecipes]);

    const confirmHide = async () => {
        if (!targetRecipe) return;
        await hideRecipe(targetRecipe.recipe_id);
        setIsModalOpen(false);
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Quản lý Công thức</h1>

            {loading ? <div className="text-center">Đang tải...</div> : (
                <AdminTable 
                    headers={['Tên món', 'Tác giả', 'Ngày đăng', 'Calo', 'Trạng thái', 'Hành động']}
                    pagination={pagination}
                    onPageChange={(page) => fetchRecipes(page)}
                >
                    {recipes.map(recipe => (
                        <tr key={recipe.recipe_id}>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm font-medium">
                                {recipe.title}
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                {recipe.author_name}
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                {new Date(recipe.created_at).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                {recipe.total_calo} kcal
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <StatusBadge status={recipe.status} />
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                {recipe.status !== 'hidden' && (
                                    <button 
                                        onClick={() => onHideClick(recipe)}
                                        className="text-red-600 hover:text-red-900 text-sm font-semibold"
                                    >
                                        Ẩn bài
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </AdminTable>
            )}

            <ConfirmModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmHide}
                title="Ẩn công thức"
                message={`Bạn có chắc muốn ẩn công thức "${targetRecipe?.title}" không? Hành động này sẽ làm bài viết biến mất khỏi trang chủ.`}
                isDanger={true}
                confirmText="Ẩn ngay"
            />
        </div>
    );
};

export default AdminRecipePage;