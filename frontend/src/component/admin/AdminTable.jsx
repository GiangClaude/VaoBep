import React from 'react';
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ArrowUpDown, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

const AdminTable = ({ columns, children, pagination, onPageChange, onSort, currentSort, loading }) => {
    
    const handleSort = (columnKey) => {
        if (!onSort) return;
        
        let newOrder = 'DESC';
        if (currentSort.key === columnKey && currentSort.order === 'DESC') {
            newOrder = 'ASC';
        }
        onSort(columnKey, newOrder);
    };

// [CẬP NHẬT] Dùng Lucide Icon cho Sort
    const renderSortIcon = (columnKey) => {
        if (currentSort?.key !== columnKey) return <ArrowUpDown size={14} className="text-gray-400 ml-1 opacity-30" />;
        return currentSort.order === 'ASC' 
            ? <ArrowUp size={14} className="ml-1 text-[#ff6b35]" /> 
            : <ArrowDown size={14} className="ml-1 text-[#ff6b35]" />;
    };

    return (
        // [CẬP NHẬT] Container: Bo góc lớn (rounded-3xl), bóng đổ màu cam nhạt, viền mỏng
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white shadow-xl shadow-orange-100/50 rounded-3xl overflow-hidden border border-orange-100 relative flex flex-col h-full"
        >
            <div className="overflow-x-auto flex-1">
                <table className="min-w-full leading-normal table-fixed">
                    <colgroup>
                        {columns.map((col, index) => (
                            // Áp dụng class width (vd: w-[30%]) vào thẻ col này
                            <col key={index} className={col.className || "w-auto"} />
                        ))}
                    </colgroup>
                    <thead>
                        <tr className="bg-orange-50/50 border-b border-orange-100">
                            {columns.map((col, index) => (
                                <th
                                    key={index}
                                    onClick={() => col.sortable ? handleSort(col.key) : null}
                                    // [CẬP NHẬT] Header Styles: Text màu nâu, font đậm vừa phải
                                    className={`px-5 py-4 text-left text-xs font-bold text-[#7d5a3f] uppercase tracking-wider ${col.className || ''} ${col.sortable ? 'cursor-pointer hover:bg-orange-100/50 select-none transition-colors' : ''}`}
                                >
                                    <div className="flex items-center gap-1">
                                        {col.label}
                                        {col.sortable && renderSortIcon(col.key)}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    
                    {/* [LOGIC CŨ] Loading làm mờ body */}
                    <tbody className={`transition-opacity duration-200 divide-y divide-gray-100 ${loading ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                        {children}
                    </tbody>
                </table>
                
                {/* [CẬP NHẬT] Spinner Loading hiện đại hơn */}
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/30 backdrop-blur-[1px]">
                        <div className="bg-white p-3 rounded-full shadow-lg">
                            <Loader2 className="w-8 h-8 text-[#ff6b35] animate-spin" />
                        </div>
                    </div>
                )}
            </div>
            
            {/* [CẬP NHẬT] Pagination UI: Nút bo tròn, style Clean */}
            {pagination && (
                <div className="px-5 py-4 bg-white border-t border-orange-100 flex flex-col xs:flex-row items-center justify-between gap-4">
                    <span className="text-sm text-gray-500 font-medium">
                        Trang <span className="text-[#ff6b35] font-bold">{pagination.page}</span> / {pagination.totalPages} 
                        <span className="text-gray-400 mx-2">|</span> 
                        Tổng {pagination.total} mục
                    </span>

                    <div className="inline-flex gap-2">
                        <button
                            onClick={() => onPageChange(pagination.page - 1)}
                            disabled={pagination.page <= 1 || loading}
                            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:border-[#ff6b35] hover:text-[#ff6b35] hover:bg-orange-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-600 shadow-sm"
                        >
                            <ChevronLeft size={16} />
                            <span className="text-sm font-medium">Trước</span>
                        </button>
                        <button
                            onClick={() => onPageChange(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages || loading}
                            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:border-[#ff6b35] hover:text-[#ff6b35] hover:bg-orange-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-600 shadow-sm"
                        >
                            <span className="text-sm font-medium">Sau</span>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default AdminTable;