import { useState, useEffect } from 'react';
import adminApi from '../../api/adminApi';

const useAdminReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await adminApi.getReports();
            setReports(response.data.data || []);
        } catch (err) {
            console.error("Fetch Reports Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const processReport = async (reportId, action, postId, postType) => {
        try {
            // action: 'hide_content' | 'ignore'
            await adminApi.processReport({ report_id: reportId, action, post_id: postId, post_type: postType });
            // Xóa report đã xử lý khỏi danh sách
            setReports(prev => prev.filter(r => r.report_id !== reportId));
            return true;
        } catch (err) {
            console.error("Process Report Error:", err);
            throw err;
        }
    };

    return { reports, loading, processReport, refresh: fetchReports };
};

export default useAdminReports;