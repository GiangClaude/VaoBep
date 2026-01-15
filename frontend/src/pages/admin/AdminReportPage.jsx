import React from 'react';
import { Flag, EyeOff, Archive, MessageSquareWarning, FileText, User } from 'lucide-react'; // [MỚI]
import useAdminReports from '../../hooks/admin/useAdminReports';
import AdminTable from '../../component/admin/AdminTable';

const AdminReportPage = () => {
    const { reports, loading, processReport } = useAdminReports();

    const handleResolve = async (report, action) => {
        // action: 'hide_content' hoặc 'ignore'
        if (action === 'hide_content') {
            const confirm = window.confirm("Bạn chắc chắn muốn ẩn nội dung bị báo cáo này?");
            if (!confirm) return;
        }
        await processReport(report.report_id, action, report.post_id, report.post_type);
    };

const columns = [
        { label: 'Người báo cáo', className: 'w-[20%]' },
        { label: 'Lý do', className: 'w-[35%]' },
        { label: 'Loại nội dung', className: 'w-[15%]' },
        { label: 'Ngày báo cáo', className: 'w-[15%]' },
        { label: 'Hành động', className: 'w-[15%]' }
    ];

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg text-red-500">
                    <Flag size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Xử lý Báo cáo</h1>
                    <p className="text-sm text-gray-500">Xem xét và xử lý các nội dung vi phạm cộng đồng</p>
                </div>
            </div>

            {/* TABLE */}
            <AdminTable 
                columns={columns} 
                loading={loading}
            >
                {reports.length === 0 && !loading ? (
                    <tr>
                        <td colSpan="5" className="px-5 py-8 text-center text-gray-500">
                            <div className="flex flex-col items-center justify-center gap-2">
                                <div className="p-3 bg-green-50 rounded-full">
                                    <Archive size={24} className="text-green-500" />
                                </div>
                                <p>Tuyệt vời! Hiện không có báo cáo nào cần xử lý.</p>
                            </div>
                        </td>
                    </tr>
                ) : (
                    reports.map(report => (
                        <tr key={report.report_id} className="group hover:bg-red-50/10 transition-colors border-b border-gray-100 last:border-none">
                            {/* Reporter Column */}
                            <td className="px-5 py-4">
                                <div className="flex items-start gap-2">
                                    <User size={16} className="text-gray-400 mt-1 shrink-0" />
                                    <div className="flex flex-col overflow-hidden">
                                        <p className="font-bold text-gray-800 text-sm truncate" title={report.reporter_name}>{report.reporter_name}</p>
                                        <p className="text-xs text-gray-500 truncate" title={report.reporter_email}>{report.reporter_email}</p>
                                    </div>
                                </div>
                            </td>

                            {/* Reason Column */}
                            <td className="px-5 py-4">
                                <div className="flex items-start gap-2 text-sm text-gray-700">
                                    <MessageSquareWarning size={16} className="text-orange-500 shrink-0 mt-0.5" />
                                    <span className="truncate block max-w-xs" title={report.reason}>
                                        {report.reason}
                                    </span>
                                </div>
                            </td>

                            {/* Type Column */}
                            <td className="px-5 py-4">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                                    report.post_type === 'recipe' 
                                        ? 'bg-orange-50 text-orange-700 border-orange-100' 
                                        : 'bg-blue-50 text-blue-700 border-blue-100'
                                } capitalize`}>
                                    <FileText size={12} />
                                    {report.post_type}
                                </span>
                            </td>

                            {/* Date Column */}
                            <td className="px-5 py-4 text-sm text-gray-500 font-medium">
                                {new Date(report.created_at).toLocaleDateString('vi-VN')}
                            </td>

                            {/* Actions Column */}
                            <td className="px-5 py-4">
                                <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => handleResolve(report, 'hide_content')}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200 transition-all active:scale-95 shadow-sm"
                                        title="Ẩn nội dung vi phạm"
                                    >
                                        <EyeOff size={16} strokeWidth={2.5} />
                                        <span className="text-xs font-bold hidden xl:inline">Ẩn bài</span>
                                    </button>
                                    
                                    <button 
                                        onClick={() => handleResolve(report, 'ignore')}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 border border-gray-200 transition-all active:scale-95 shadow-sm"
                                        title="Bỏ qua báo cáo này"
                                    >
                                        <Archive size={16} strokeWidth={2.5} />
                                        <span className="text-xs font-bold hidden xl:inline">Bỏ qua</span>
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

export default AdminReportPage;