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

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Xử lý Báo cáo</h1>

            {loading ? <div>Đang tải...</div> : (
                <AdminTable headers={['Người báo cáo', 'Lý do', 'Loại nội dung', 'Ngày báo cáo', 'Hành động']}>
                    {reports.map(report => (
                        <tr key={report.report_id}>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <div>
                                    <p className="font-semibold">{report.reporter_name}</p>
                                    <p className="text-xs text-gray-500">{report.reporter_email}</p>
                                </div>
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-red-600 font-medium">
                                {report.reason}
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm capitalize">
                                {report.post_type}
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                {new Date(report.created_at).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm space-x-2">
                                <button 
                                    onClick={() => handleResolve(report, 'hide_content')}
                                    className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded text-xs font-bold border border-red-200"
                                >
                                    Ẩn nội dung
                                </button>
                                <button 
                                    onClick={() => handleResolve(report, 'ignore')}
                                    className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1 rounded text-xs font-bold border border-gray-300"
                                >
                                    Bỏ qua
                                </button>
                            </td>
                        </tr>
                    ))}
                </AdminTable>
            )}
        </div>
    );
};

export default AdminReportPage;