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

    // [FIX] Định nghĩa columns thay vì headers
    const columns = [
        { label: 'Tên nguyên liệu', className: 'w-[30%]' },
        { label: 'Trạng thái', className: 'w-[15%]' },
        { label: 'Calo / 100g (Nhập)', className: 'w-[25%]' },
        { label: 'Hành động', className: 'w-[30%]' }
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Duyệt Nguyên liệu mới</h1>
            
            {/* [FIX] Truyền loading vào AdminTable để dùng hiệu ứng mờ thay vì ẩn hiện */}
            <AdminTable 
                columns={columns} 
                loading={loading}
            >
                {ingredients.length === 0 && !loading ? (
                    <tr>
                        <td colSpan="4" className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center text-gray-500">
                            Không có nguyên liệu nào đang chờ duyệt.
                        </td>
                    </tr>
                ) : (
                    ingredients.map(ing => (
                        <tr key={ing.ingredient_id} className="hover:bg-gray-50">
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm font-bold truncate" title={ing.name}>
                                {ing.name}
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <StatusBadge status={ing.status} />
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <input 
                                    type="number"
                                    placeholder="Nhập Calo..."
                                    className="border rounded px-3 py-1 w-full max-w-[150px] focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                    value={caloInputs[ing.ingredient_id] || ''}
                                    onChange={(e) => handleCaloChange(ing.ingredient_id, e.target.value)}
                                />
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm space-x-2">
                                <button 
                                    onClick={() => handleAction(ing.ingredient_id, 'approve')}
                                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-bold transition-colors"
                                >
                                    ✓ Duyệt
                                </button>
                                <button 
                                    onClick={() => handleAction(ing.ingredient_id, 'reject')}
                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-bold transition-colors"
                                >
                                    ✕ Từ chối
                                </button>
                            </td>
                        </tr>
                    ))
                )}
            </AdminTable>
        </div>
    );
};

export default AdminIngredientPage;