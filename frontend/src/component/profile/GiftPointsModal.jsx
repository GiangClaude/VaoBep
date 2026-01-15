// src/component/profile/GiftPointsModal.jsx (FILE MỚI)
import React, { useState } from 'react';
import { Gift, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function GiftPointsModal({ isOpen, onClose, recipient, onSend, maxPoints }) {
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!amount || parseInt(amount) < 10) {
            alert("Số điểm tặng tối thiểu là 10.");
            return;
        }
        if (parseInt(amount) > maxPoints) {
            alert("Số dư không đủ.");
            return;
        }

        setIsSubmitting(true);
        // Gọi hàm onSend được truyền từ parent (Hook)
        const result = await onSend({
            recipientId: recipient?.id, // ID người nhận
            amount: parseInt(amount),
            message: message
        });
        setIsSubmitting(false);

        if (result.success) {
            alert(result.message);
            onClose();
            setAmount('');
            setMessage('');
        } else {
            alert(result.message);
        }
    };

    return (
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
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all font-semibold text-lg"
                                placeholder="Nhập số điểm (min 10)..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Lời nhắn (Tùy chọn)
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
    );
}