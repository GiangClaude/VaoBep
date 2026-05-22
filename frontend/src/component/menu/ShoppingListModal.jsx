import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ShoppingCart, Check } from 'lucide-react';
import { useMenu } from '../../hooks/useMenu';

// Map tên category sang tiếng Việt
const CATEGORY_MAP = {
    meat: 'Thịt & Hải sản',
    vegetable: 'Rau củ & Trái cây',
    spice: 'Gia vị',
    dry: 'Đồ khô',
    others: 'Khác'
};

export default function ShoppingListModal({ isOpen, onClose, menuId }) {
    const { fetchShoppingList, isLoading } = useMenu();
    const [listData, setListData] = useState(null);
    
    // Lưu ID các item đã tick (Dùng chuỗi 'category-index' làm ID tạm)
    const [checkedItems, setCheckedItems] = useState(new Set());

    useEffect(() => {
        const loadList = async () => {
            if (isOpen && menuId) {
                const data = await fetchShoppingList(menuId);
                setListData(data);
                setCheckedItems(new Set()); // Reset tick khi mở lại
            }
        };
        loadList();
    }, [isOpen, menuId, fetchShoppingList]);

    const toggleCheck = (itemId) => {
        const newChecked = new Set(checkedItems);
        if (newChecked.has(itemId)) newChecked.delete(itemId);
        else newChecked.add(itemId);
        setCheckedItems(newChecked);
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-orange-50 to-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#ff6b35]/10 text-[#ff6b35] rounded-xl">
                            <ShoppingCart className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-extrabold text-gray-800">Danh sách đi chợ</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                    {isLoading ? (
                        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-4 border-[#ff6b35] border-t-transparent"></div></div>
                    ) : !listData || Object.keys(listData).length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                            <p>Chưa có nguyên liệu nào. Hãy thêm món ăn vào thực đơn nhé!</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(listData).map(([category, items]) => (
                                <div key={category} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                                    <h3 className="font-bold text-gray-800 mb-3 text-lg border-b border-gray-100 pb-2">
                                        {CATEGORY_MAP[category] || CATEGORY_MAP.others}
                                    </h3>
                                    <div className="space-y-2">
                                        {items.map((item, index) => {
                                            const itemId = `${category}-${index}`;
                                            const isChecked = checkedItems.has(itemId);
                                            
                                            return (
                                                <div 
                                                    key={itemId}
                                                    onClick={() => toggleCheck(itemId)}
                                                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                                                        isChecked 
                                                        ? 'bg-gray-50 border-gray-100 opacity-60' 
                                                        : 'bg-white border-transparent hover:border-orange-200 hover:bg-orange-50/30'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                                                            isChecked ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'
                                                        }`}>
                                                            {isChecked && <Check className="w-3 h-3" strokeWidth={3} />}
                                                        </div>
                                                        <span className={`font-semibold ${isChecked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                                            {item.name}
                                                        </span>
                                                    </div>
                                                    <span className={`font-bold ${isChecked ? 'text-gray-400' : 'text-[#ff6b35]'}`}>
                                                        {item.quantity} <span className="text-sm font-medium text-gray-500">{item.unit}</span>
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-white">
                    <p className="text-center text-xs text-gray-400 font-medium">
                        Tick vào nguyên liệu bạn đã mua để dễ theo dõi nhé!
                    </p>
                </div>
            </div>
        </div>,
        document.body
    );
}