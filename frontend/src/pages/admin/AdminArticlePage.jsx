import React, { useState } from 'react';
import { FileText, Search, Eye, CheckCircle, Ban, Trash2, X, Clock } from 'lucide-react';
import AdminTable from '../../component/admin/AdminTable';
import StatusBadge from '../../component/admin/StatusBadge';
import { getArticleImageUrl } from '../../utils/imageHelper';
import { toast } from 'react-toastify';

import { useAdminArticlesQuery, useAdminFetchDetails } from '../../hooks/queries/useAdminQueries';
// Giả định bạn đã tạo mutation cho Article trong useAdminMutations.js
import { useAdminArticleMutations } from '../../hooks/mutations/useAdminMutations';

const AdminArticlePage = () => {
    // 1. Hook
    // const { 
    //     articles, pagination, isLoading, 
    //     fetchArticles, fetchArticleDetail, 
    //     handleUpdateStatus, handleDeleteArticle 
    // } = useAdminArticles();
   const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentSort, setCurrentSort] = useState({ key: 'created_at', order: 'DESC' });

    const { data, isLoading } = useAdminArticlesQuery({
        page, 
        limit: 10, 
        search: searchQuery, 
        status: statusFilter, 
        sortKey: currentSort.key, 
        sortOrder: currentSort.order
    });
    const articles = data?.data || [];
    const pagination = data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

    const { updateStatus, deleteArticle } = useAdminArticleMutations();
    const { fetchArticleDetail } = useAdminFetchDetails();

    // State cho Modal Preview
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);

    // // 3. Khởi tạo & Fetch data khi đổi filter
    // useEffect(() => {
    //     fetchArticles(1, 10, searchQuery, statusFilter, currentSort.key, currentSort.order);
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [statusFilter]); // Tự động load lại khi chọn filter khác

    // 4. Các hàm xử lý giao diện
    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
    };

    const changeStatus = async (id, newStatus) => {
        const result = await updateStatus.mutateAsync({ articleId: id, status: newStatus });
        if (result.success && isPreviewOpen) {
            setIsPreviewOpen(false); // Đóng modal nếu đang duyệt trong modal
        } else if (!result.success) {
            alert(result.message);
        }
    };

    const confirmDelete = async (item) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa bài viết "${item.title}"? Dữ liệu không thể khôi phục.`)) {
           try {
                await deleteArticle.mutateAsync(item.article_id);
                // Xử lý tự lùi trang nếu trang hiện tại bị trống đã được ReactQuery lo (nhờ invalidateQueries)
                toast.success("Xóa bài viết thành công!");
            } catch (error) {
                toast.error(error.response?.data?.message || "Lỗi khi xóa bài viết");
            }
        }
    };

    // Mở Modal Xem Trước (Gọi API lấy chi tiết HTML)
    const openPreview = async (id) => {
        setIsPreviewLoading(true);
        setIsPreviewOpen(true);
       try {
            const data = await fetchArticleDetail(id);
            setPreviewData(data);
        } catch (error) {
            toast.error(error.message);
            setIsPreviewOpen(false);
        } finally {
            setIsPreviewLoading(false);
        }
    };

    // 5. Cấu hình cột
    const columns = [
        { key: 'name', label: 'Bài viết', className: 'w-[40%]', sortable: true },
        { key: 'author', label: 'Tác giả', className: 'w-[20%]', sortable: true },
        { key: 'status', label: 'Trạng thái', className: 'w-[15%]', sortable: true },
        { key: 'created_at', label: 'Ngày tạo', className: 'w-[10%]', sortable: true },
        { key: 'actions', label: 'Hành động', className: 'w-[15%]' }
    ];

    return (
        <div className="space-y-6">
            {/* HEADER & TOOLBAR */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Quản lý Bài viết</h1>
                        <p className="text-sm text-gray-500">Kiểm duyệt và quản lý bài viết từ chuyên gia</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Bộ lọc trạng thái */}
                    <select 
                        className="px-3 py-2 border rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="draft">Chờ duyệt (Draft)</option>
                        <option value="public">Đã duyệt (Public)</option>
                        <option value="hidden">Đã ẩn (Hidden)</option>
                        <option value="banned">Vi phạm (Banned)</option>
                    </select>

                    {/* Tìm kiếm */}
                    <form onSubmit={handleSearch} className="relative">
                        <input 
                            type="text" placeholder="Tìm tiêu đề..." 
                            className="pl-10 pr-4 py-2 rounded-lg border focus:border-indigo-500 focus:outline-none"
                            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <button type="submit" className="hidden"></button>
                    </form>
                </div>
            </div>
            
            {/* TABLE */}
            <AdminTable
                columns={columns}
                loading={isLoading}
                onSort={(key, order) => {
                    setCurrentSort({ key, order });
                    setPage(1); // Quay về trang 1 khi đổi sắp xếp
                }}
                currentSort={currentSort}
                onPageChange={setPage}
            >
                {articles.length === 0 && !isLoading ? (
                    <tr><td colSpan="5" className="text-center p-8 text-gray-500">Không có bài viết nào phù hợp.</td></tr>
                ) : (
                    articles.map(article => (
                        <tr key={article.article_id} className="hover:bg-indigo-50/30 border-b">
                            {/* Tiêu đề & Thông số */}
                            <td className="px-5 py-4">
                                <div className="font-bold text-gray-800 line-clamp-2">{article.title}</div>
                                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                    <span className="flex items-center gap-1"><Clock size={12}/> {article.read_time} phút</span>
                                    {article.report_count > 0 && <span className="text-red-500 font-medium">{article.report_count} Báo cáo</span>}
                                </div>
                            </td>
                            
                            {/* Tác giả */}
                            <td className="px-5 py-4">
                                <div className="font-medium text-gray-800">{article.author_name}</div>
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${article.author_role === 'pro' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {article.author_role}
                                </span>
                            </td>

                            {/* Trạng thái */}
                            <td className="px-5 py-4">
                                <StatusBadge status={article.status} />
                            </td>

                            {/* Ngày tạo */}
                            <td className="px-5 py-4 text-sm text-gray-600">
                                {new Date(article.created_at).toLocaleDateString('vi-VN')}
                            </td>

                            {/* Hành động */}
                            <td className="px-5 py-4">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => openPreview(article.article_id)} className="p-1.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100" title="Xem trước nội dung">
                                        <Eye size={18} />
                                    </button>
                                    
                                    {article.status === 'draft' && (
                                        <button onClick={() => changeStatus(article.article_id, 'public')} className="p-1.5 bg-green-50 text-green-700 rounded hover:bg-green-100" title="Duyệt bài">
                                            <CheckCircle size={18} />
                                        </button>
                                    )}

                                    {article.status === 'public' && (
                                        <button onClick={() => changeStatus(article.article_id, 'hidden')} className="p-1.5 bg-orange-50 text-orange-700 rounded hover:bg-orange-100" title="Ẩn bài">
                                            <Ban size={18} />
                                        </button>
                                    )}

                                    <button onClick={() => confirmDelete(article)} className="p-1.5 bg-red-50 text-red-700 rounded hover:bg-red-100" title="Xóa vĩnh viễn">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))
                )}
            </AdminTable>

            {/* PAGINATION */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-end items-center gap-4 mt-4">
                    <button disabled={pagination.page === 1} onClick={() => setPage(pagination.page - 1)} className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50">Trang trước</button>
                    <span className="text-sm">Trang {pagination.page} / {pagination.totalPages}</span>
                    <button disabled={pagination.page >= pagination.totalPages} onClick={() => setPage(pagination.page + 1)} className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50">Trang sau</button>
                </div>
            )}

            {/* MODAL PREVIEW BÀI VIẾT */}
            {isPreviewOpen && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                        
                        {/* Header Modal */}
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold flex items-center gap-2"><Eye size={20} className="text-indigo-600"/> Đọc thử bài viết</h2>
                            <button onClick={() => setIsPreviewOpen(false)}><X size={24} className="text-gray-500 hover:text-red-500"/></button>
                        </div>

                        {/* Nội dung Modal (Scrollable) */}
                        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                            {isPreviewLoading ? (
                                <div className="text-center py-10 text-gray-500">Đang tải nội dung...</div>
                            ) : previewData ? (
                                <div>
                                    <h1 className="text-3xl font-extrabold text-gray-900 mb-4">{previewData.title}</h1>
                                    <div className="flex items-center gap-3 mb-6 pb-6 border-b">
                                        <img 
                                            src={getArticleImageUrl(previewData.article_id, previewData.author_avatar)} // Thêm logic fallback riêng nếu avatar rỗng
                                            alt={previewData.author_name} 
                                            className="w-10 h-10 rounded-full object-cover border"
                                            onError={(e) => e.target.src = '/assets/avatar_default.png'}
                                        />
                                        <div>
                                            <div className="font-bold text-gray-800">{previewData.author_name}</div>
                                            <div className="text-xs text-gray-500">{new Date(previewData.created_at).toLocaleDateString('vi-VN')} • Đọc {previewData.read_time} phút</div>
                                        </div>
                                    </div>
                                    
                                    {previewData.cover_image && (
                                        <img 
                                            src={getArticleImageUrl(previewData.article_id, previewData.cover_image)}
                                            alt="Cover" 
                                            className="w-full h-[400px] object-cover rounded-lg mb-8"
                                            onError={(e) => e.target.style.display = 'none'}
                                        />
                                    )}

                                    {/* Render nội dung HTML từ Editor */}
                                    <div 
                                        className="prose max-w-none prose-indigo"
                                        dangerouslySetInnerHTML={{ __html: previewData.content }}
                                    />
                                </div>
                            ) : (
                                <div className="text-center py-10 text-red-500">Lỗi không thể tải dữ liệu bài viết!</div>
                            )}
                        </div>

                        {/* Footer Modal (Công cụ Duyệt nhanh) */}
                        {!isPreviewLoading && previewData && (
                            <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-500">
                                    Trạng thái hiện tại: <StatusBadge status={previewData.status} />
                                </span>
                                <div className="flex gap-3">
                                    {previewData.status === 'draft' && (
                                        <button onClick={() => changeStatus(previewData.article_id, 'public')} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium">
                                            Duyệt & Xuất bản ngay
                                        </button>
                                    )}
                                    {previewData.status === 'public' && (
                                        <button onClick={() => changeStatus(previewData.article_id, 'hidden')} className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 font-medium">
                                            Gỡ bài (Ẩn)
                                        </button>
                                    )}
                                    <button onClick={() => setIsPreviewOpen(false)} className="px-4 py-2 border rounded hover:bg-gray-100 font-medium">Đóng</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminArticlePage;