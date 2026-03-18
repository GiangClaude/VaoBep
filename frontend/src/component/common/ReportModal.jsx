import React, { useState, useEffect } from 'react';
import Modal from './modal';

export default function ReportModal({ isOpen, onClose, onSubmit, loading = false, serverError = '' }) {
  const reportReasons = [
    'Nội dung sai sự thật',
    'Hình ảnh không phù hợp',
    'Spam',
    'Vi phạm bản quyền',
    'Khác...'
  ];

  const [reason, setReason] = useState('');
  const [otherText, setOtherText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setReason('');
      setOtherText('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = () => {
    let finalReason = reason;
    if (!finalReason) {
      setError('Vui lòng chọn một lý do báo cáo');
      return;
    }
    if (finalReason === 'Khác...' && (!otherText || otherText.trim() === '')) {
      setError('Vui lòng nhập lý do');
      return;
    }
    if (finalReason === 'Khác...') finalReason = otherText.trim();
    setError('');
    onSubmit(finalReason);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Báo cáo bài viết"
      message={
        <div className="space-y-3">
          <div className="text-base text-gray-800">Vui lòng chọn lý do báo cáo:</div>
          <div className="space-y-2">
            {reportReasons.map((r, idx) => (
              <label key={idx} className="flex items-center gap-3 cursor-pointer text-base">
                <input
                  type="radio"
                  name="report-reason"
                  value={r}
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  className="accent-[#ff6b35]"
                  disabled={loading}
                />
                <span>{r}</span>
              </label>
            ))}
          </div>

          {reason === 'Khác...' && (
            <div>
              <textarea
                placeholder="Hãy mô tả lý do của bạn"
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-2 text-sm"
                rows={4}
                disabled={loading}
              />
            </div>
          )}

          {(error || serverError) && (
            <div className="text-red-500 text-sm">{error || serverError}</div>
          )}
        </div>
      }
      type="warning"
      actions={[
        { label: 'Hủy', onClick: onClose, style: 'secondary' },
        { label: loading ? 'Đang gửi...' : 'Gửi báo cáo', onClick: handleSubmit, style: 'primary' }
      ]}
    />
  );
}
