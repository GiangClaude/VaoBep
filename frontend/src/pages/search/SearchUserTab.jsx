import { useState, useEffect } from 'react';
import { useSearchParams } from "react-router-dom";
import { UserGrid, EmptyState } from "../../component/search/SearchShared";
import Pagination from "../../component/common/Pagination";
import { useSearchUsersQuery } from "../../hooks/queries/useSearchQueries";

export default function SearchUserTab() {
    const [searchParams] = useSearchParams();
    const keyword = searchParams.get("keyword") || "";
    
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState("newest");

    // Reset về trang 1 khi đổi từ khóa
    useEffect(() => { setPage(1); }, [keyword]);

    const { data, isFetching } = useSearchUsersQuery({
        keyword, page, sort, limit: 12, enabled: true
    });

    const users = data?.data || [];
    const pagination = data?.pagination || {};

    return (
        <div className="animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Mọi người</h2>
                
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 font-medium">Sắp xếp:</span>
                    <select 
                        value={sort} 
                        onChange={(e) => { setSort(e.target.value); setPage(1); }}
                        className="bg-white border border-gray-200 text-gray-700 text-sm rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-[#ff6b35] transition-all"
                    >
                        <option value="newest">Mới tham gia</option>
                        <option value="oldest">Thành viên cũ</option>
                        <option value="most_followed">Nhiều follow nhất</option>
                    </select>
                </div>
            </div>

            {isFetching ? (
                <div className="py-20 text-center animate-pulse text-[#ff6b35] font-bold">Đang tìm kiếm...</div>
            ) : users.length > 0 ? (
                <>
                    <UserGrid data={users} />
                    <Pagination pagination={pagination} onPageChange={setPage} />
                </>
            ) : (
                <EmptyState text="Không tìm thấy người dùng nào phù hợp." />
            )}
        </div>
    );
}