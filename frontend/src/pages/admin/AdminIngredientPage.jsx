import React, { useState } from 'react';
import useAdminIngredients from '../../hooks/admin/useAdminIngredients';
import AdminTable from '../../component/admin/AdminTable';
import StatusBadge from '../../component/admin/StatusBadge';

const AdminIngredientPage = () => {
    const { ingredients, loading, processIngredient } = useAdminIngredients();
    
    // State cục bộ để lưu giá trị Calo đang nhập cho từng dòng
    const [caloInputs, setCaloInputs] = useState({});

    const handleCaloChange = (id, value) => {
        setCaloInputs(prev => ({ ...prev, [id]: value }));
    };

    const handleAction = async (id, action) => {
        const calo = caloInputs[id];
        
        if (action === 'approve' && !calo) {
            alert("Vui lòng nhập số Calo/100g trước khi duyệt!");
            return;
        }

        await processIngredient(id, action, calo);
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Duyệt Nguyên liệu mới</h1>
            
            {loading ? <div>Đang tải...</div> : (
                ingredients.length === 0 ? (
                    <div className="bg-white p-6 rounded shadow text-center text-gray-500">
                        Không có nguyên liệu nào đang chờ duyệt.
                    </div>
                ) : (
                    <AdminTable headers={['Tên nguyên liệu', 'Trạng thái', 'Calo / 100g (Nhập)', 'Hành động']}>
                        {ingredients.map(ing => (
                            <tr key={ing.ingredient_id}>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm font-bold">
                                    {ing.name}
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <StatusBadge status={ing.status} />
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <input 
                                        type="number"
                                        placeholder="Nhập Calo..."
                                        className="border rounded px-2 py-1 w-32 focus:ring-2 focus:ring-blue-500"
                                        value={caloInputs[ing.ingredient_id] || ''}
                                        onChange={(e) => handleCaloChange(ing.ingredient_id, e.target.value)}
                                    />
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm space-x-2">
                                    <button 
                                        onClick={() => handleAction(ing.ingredient_id, 'approve')}
                                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-bold"
                                    >
                                        ✓ Duyệt
                                    </button>
                                    <button 
                                        onClick={() => handleAction(ing.ingredient_id, 'reject')}
                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-bold"
                                    >
                                        ✕ Từ chối
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </AdminTable>
                )
            )}
        </div>
    );
};

export default AdminIngredientPage;