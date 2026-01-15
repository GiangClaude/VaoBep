import React from 'react';

const AdminTable = ({ columns, children, pagination, onPageChange, onSort, currentSort, loading }) => {
    
    const handleSort = (columnKey) => {
        if (!onSort) return;
        
        let newOrder = 'DESC';
        if (currentSort.key === columnKey && currentSort.order === 'DESC') {
            newOrder = 'ASC';
        }
        onSort(columnKey, newOrder);
    };

    const renderSortIcon = (columnKey) => {
        if (currentSort?.key !== columnKey) return <span className="text-gray-300 ml-1 text-[10px]">↕</span>;
        return currentSort.order === 'ASC' ? <span className="ml-1 text-blue-600">↑</span> : <span className="ml-1 text-blue-600">↓</span>;
    };

    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden relative">
            <div className="overflow-x-auto">
                {/* [FIX 1] Thêm table-fixed để cố định độ rộng cột, không bị nhảy lung tung */}
                <table className="min-w-full leading-normal table-fixed">
                    <thead>
                        <tr>
                            {columns.map((col, index) => (
                                <th
                                    key={index}
                                    onClick={() => col.sortable ? handleSort(col.key) : null}
                                    // [FIX 2] Nhận className độ rộng từ bên ngoài
                                    className={`px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${col.className || ''} ${col.sortable ? 'cursor-pointer hover:bg-gray-100 select-none transition-colors' : ''}`}
                                >
                                    <div className="flex items-center">
                                        {col.label}
                                        {col.sortable && renderSortIcon(col.key)}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    {/* [FIX 3] Logic Loading mới: Không ẩn bảng, chỉ làm mờ */}
                    <tbody className={`transition-opacity duration-200 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                        {children}
                    </tbody>
                </table>
                
                {/* Spinner hiện đè lên khi đang loading, nhưng bảng vẫn nằm dưới */}
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                )}
            </div>
            
            {pagination && (
                <div className="px-5 py-5 bg-white border-t flex flex-col xs:flex-row items-center xs:justify-between">
                    <span className="text-xs xs:text-sm text-gray-900">
                        Hiển thị trang {pagination.page} trên {pagination.totalPages} (Tổng {pagination.total} mục)
                    </span>
                    <div className="inline-flex mt-2 xs:mt-0">
                        <button
                            onClick={() => onPageChange(pagination.page - 1)}
                            disabled={pagination.page <= 1 || loading}
                            className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-l disabled:opacity-50"
                        >
                            Trước
                        </button>
                        <button
                            onClick={() => onPageChange(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages || loading}
                            className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-r disabled:opacity-50"
                        >
                            Sau
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTable;