import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ pagination, onPageChange }) => {
     if (!pagination) return null; 
     
    const { currentPage, totalPages, totalItems } = pagination;

    // Không hiện nếu chỉ có 1 trang hoặc không có dữ liệu
    if (!totalPages || totalPages <= 1) return null;

    // Logic tạo dãy số trang (Ví dụ: [1, 2, 3])
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="flex flex-col items-center gap-4 mt-12 pb-8">
            {/* Hiển thị tóm tắt */}
            <p className="text-xs text-gray-400 font-medium">
                Hiển thị trang <span className="text-gray-700">{currentPage}</span> / {totalPages} (Tổng {totalItems} kết quả)
            </p>

            <div className="flex items-center gap-2">
                {/* Nút Previous */}
                <button 
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="p-2.5 rounded-xl border border-gray-100 bg-white text-gray-500 hover:text-[#ff6b35] hover:border-[#ff6b35] disabled:opacity-30 disabled:hover:border-gray-100 disabled:hover:text-gray-500 transition-all"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Dãy số trang */}
                <div className="flex items-center gap-1.5">
                    {pages.map(p => (
                        <button
                            key={p}
                            onClick={() => onPageChange(p)}
                            className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                                currentPage === p 
                                ? "bg-[#ff6b35] text-white shadow-lg shadow-orange-100 scale-110" 
                                : "bg-white text-gray-400 border border-gray-50 hover:border-[#ff6b35] hover:text-[#ff6b35]"
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>

                {/* Nút Next */}
                <button 
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="p-2.5 rounded-xl border border-gray-100 bg-white text-gray-500 hover:text-[#ff6b35] hover:border-[#ff6b35] disabled:opacity-30 disabled:hover:border-gray-100 disabled:hover:text-gray-500 transition-all"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default Pagination;