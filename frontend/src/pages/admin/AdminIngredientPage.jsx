import React, { useState } from 'react';
import { Carrot, Check, X, AlertCircle } from 'lucide-react'; // [MỚI]
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

const columns = [
        { label: 'Tên nguyên liệu', className: 'w-[30%]' },
        { label: 'Trạng thái', className: 'w-[15%]' },
        { label: 'Calo / 100g (Nhập)', className: 'w-[25%]' },
        { label: 'Hành động', className: 'w-[30%]' }
    ];

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg text-[#ff6b35]">
                    <Carrot size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Duyệt Nguyên liệu</h1>
                    <p className="text-sm text-gray-500">Kiểm tra và xác nhận nguyên liệu mới từ người dùng</p>
                </div>
            </div>
            
            {/* TABLE */}
            <AdminTable 
                columns={columns} 
                loading={loading}
            >
                {ingredients.length === 0 && !loading ? (
                    <tr>
                        <td colSpan="4" className="px-5 py-8 text-center text-gray-500">
                            <div className="flex flex-col items-center justify-center gap-2">
                                <div className="p-3 bg-gray-50 rounded-full">
                                    <Carrot size={24} className="text-gray-300 grayscale" />
                                </div>
                                <p>Không có nguyên liệu nào đang chờ duyệt.</p>
                            </div>
                        </td>
                    </tr>
                ) : (
                    ingredients.map(ing => (
                        <tr key={ing.ingredient_id} className="group hover:bg-orange-50/30 transition-colors border-b border-gray-100 last:border-none">
                            {/* Name Column */}
                            <td className="px-5 py-4">
                                <span className="font-bold text-gray-800 text-sm" title={ing.name}>
                                    {ing.name}
                                </span>
                            </td>

                            {/* Status Column */}
                            <td className="px-5 py-4">
                                <StatusBadge status={ing.status} />
                            </td>

                            {/* Calo Input Column */}
                            <td className="px-5 py-4">
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
                            </td>

                            {/* Actions Column */}
                            <td className="px-5 py-4">
                                <div className="flex items-center gap-3 opacity-100 sm:opacity-100 sm:group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => handleAction(ing.ingredient_id, 'approve')}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 border border-green-200 transition-all active:scale-95"
                                        title="Duyệt"
                                    >
                                        <Check size={16} strokeWidth={2.5} />
                                        <span className="text-xs font-bold">Duyệt</span>
                                    </button>
                                    
                                    <button 
                                        onClick={() => handleAction(ing.ingredient_id, 'reject')}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 border border-red-200 transition-all active:scale-95"
                                        title="Từ chối"
                                    >
                                        <X size={16} strokeWidth={2.5} />
                                        <span className="text-xs font-bold">Hủy</span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))
                )}
            </AdminTable>
        </div>
    );
};

export default AdminIngredientPage;