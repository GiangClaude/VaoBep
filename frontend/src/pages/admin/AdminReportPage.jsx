import React from 'react';
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

    // [FIX] Cấu hình cột với độ rộng cố định
    const columns = [
        { label: 'Người báo cáo', className: 'w-[20%]' },
        { label: 'Lý do', className: 'w-[30%]' },
        { label: 'Loại nội dung', className: 'w-[15%]' },
        { label: 'Ngày báo cáo', className: 'w-[15%]' },
        { label: 'Hành động', className: 'w-[20%]' }
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Xử lý Báo cáo</h1>

            {/* [FIX] Truyền columns và loading */}
            <AdminTable columns={columns} loading={loading}>
                {reports.length === 0 && !loading ? (
                    <tr>
                        <td colSpan="5" className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center text-gray-500">
                            Hiện không có báo cáo nào cần xử lý.
                        </td>
                    </tr>
                ) : (
                    reports.map(report => (
                        <tr key={report.report_id} className="hover:bg-gray-50">
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm truncate">
                                <div>
                                    <p className="font-semibold truncate" title={report.reporter_name}>{report.reporter_name}</p>
                                    <p className="text-xs text-gray-500 truncate" title={report.reporter_email}>{report.reporter_email}</p>
                                </div>
                            </td>
                            {/* Lý do báo cáo thường dài -> truncate và hiện title khi hover */}
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-red-600 font-medium truncate" title={report.reason}>
                                {report.reason}
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm capitalize">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                    report.post_type === 'recipe' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                    {report.post_type}
                                </span>
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                {new Date(report.created_at).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm space-x-2">
                                <button 
                                    onClick={() => handleResolve(report, 'hide_content')}
                                    className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded text-xs font-bold border border-red-200 transition-colors"
                                >
                                    Ẩn nội dung
                                </button>
                                <button 
                                    onClick={() => handleResolve(report, 'ignore')}
                                    className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1 rounded text-xs font-bold border border-gray-300 transition-colors"
                                >
                                    Bỏ qua
                                </button>
                            </td>
                        </tr>
                    ))
                )}
            </AdminTable>
        </div>
    );
};

export default AdminReportPage;