// src/component/profile/GiftPointsModal.jsx
import React, { useState } from 'react';
import { Gift, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Modal from '../common/modal'; // Đã sửa import default

export function GiftPointsModal({ isOpen, onClose, recipient, onSend, maxPoints }) {
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 1. State lưu lỗi validate (để hiện chữ đỏ)
    const [validationError, setValidationError] = useState('');

    // 2. State điều khiển Modal kết quả (Success/Error)
    const [resultModal, setResultModal] = useState({
        isOpen: false,
        type: 'info', // success | error
        title: '',
        message: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidationError(''); // Reset lỗi cũ trước khi validate
        
        const points = parseInt(amount);

        // --- VALIDATION ---
        if (!amount || isNaN(points)) {
            setValidationError("Vui lòng nhập số điểm hợp lệ.");
            return;
        }
        if (points < 10) {
            setValidationError("Số điểm tặng tối thiểu là 10.");
            return;
        }
        if (points > maxPoints) {
            setValidationError(`Số dư hiện tại (${maxPoints}) không đủ.`);
            return;
        }

        // --- XỬ LÝ GỬI ---
        setIsSubmitting(true);
        const result = await onSend({
            recipientId: recipient?.id,
            amount: points,
            message: message
        });
        setIsSubmitting(false);

        // --- HIỂN THỊ KẾT QUẢ BẰNG MODAL ---
        if (result.success) {
            setResultModal({
                isOpen: true,
                type: 'success',
                title: 'Thành công!',
                message: result.message
            });
            // Reset form
            setAmount('');
            setMessage('');
        } else {
            setResultModal({
                isOpen: true,
                type: 'error',
                title: 'Thất bại',
                message: result.message
            });
        }
    };

    // Hàm đóng Modal kết quả
    const handleCloseResultModal = () => {
        setResultModal(prev => ({ ...prev, isOpen: false }));
        
        // Nếu là thông báo thành công thì đóng luôn cả Gift Modal
        if (resultModal.type === 'success') {
            onClose();
        }
    };

    return (
        <>
            <AnimatePresence>
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white flex justify-between items-center">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Gift className="w-6 h-6" />
                                Tặng điểm thưởng
                            </h3>
                            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Body */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="bg-gray-50 p-4 rounded-xl mb-4">
                                <p className="text-sm text-gray-500">Người nhận:</p>
                                <p className="font-semibold text-gray-800 text-lg">{recipient?.fullName || "Người dùng"}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Số điểm muốn tặng (Tối đa: {maxPoints})
                                </label>
                                <input
                                    type="number"
                                    min="10"
                                    max={maxPoints}
                                    value={amount}
                                    onChange={(e) => {
                                        setAmount(e.target.value);
                                        if (validationError) setValidationError(''); // Xóa lỗi khi người dùng sửa
                                    }}
                                    className={`w-full px-4 py-3 rounded-xl border ${validationError ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 focus:ring-purple-500'} focus:ring-2 outline-none transition-all font-semibold text-lg`}
                                    placeholder="Nhập số điểm (min 10)..."
                                    // Bỏ required để tự xử lý validate hiển thị lỗi chữ đỏ
                                />
                                {/* Hiển thị lỗi validation chữ đỏ */}
                                {validationError && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        {validationError}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Bạn muốn để lại lời nhắn gì không?
                                </label>
                                <textarea
                                    rows="3"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
                                    placeholder="Viết lời nhắn gửi yêu thương..."
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Gửi quà ngay"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </AnimatePresence>

            {/* Modal thông báo kết quả (Success/Error) */}
            <Modal 
                isOpen={resultModal.isOpen}
                onClose={handleCloseResultModal}
                title={resultModal.title}
                message={resultModal.message}
                type={resultModal.type}
            />
        </>
    );
}