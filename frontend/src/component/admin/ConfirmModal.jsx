import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Info, X, Check } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Xác nhận', isDanger = false }) => {
    
    // Style config dựa trên isDanger
    const theme = isDanger ? {
        gradient: 'from-red-500 to-red-600',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        icon: AlertTriangle,
        button: 'bg-red-600 hover:bg-red-700 shadow-red-200'
    } : {
        gradient: 'from-[#ff6b35] to-[#f7931e]', // Màu cam chủ đạo
        iconBg: 'bg-orange-100',
        iconColor: 'text-[#ff6b35]',
        icon: Info,
        button: 'bg-gradient-to-r from-[#ff6b35] to-[#f7931e] shadow-orange-200'
    };

    const IconComponent = theme.icon;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay: Mờ nền & Blur nhẹ */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Decorative Background Header */}
                            <div className={`h-24 bg-gradient-to-r ${theme.gradient} relative overflow-hidden`}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl"></div>
                                
                                <button 
                                    onClick={onClose}
                                    className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors bg-black/10 hover:bg-black/20 rounded-full p-1"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Content Body */}
                            <div className="px-6 pb-6 -mt-10 relative">
                                {/* Icon nổi lên giữa */}
                                <div className={`w-20 h-20 rounded-2xl bg-white p-2 shadow-lg mx-auto mb-4 flex items-center justify-center`}>
                                    <div className={`w-full h-full rounded-xl ${theme.iconBg} flex items-center justify-center`}>
                                        <IconComponent className={`w-8 h-8 ${theme.iconColor}`} strokeWidth={2.5} />
                                    </div>
                                </div>

                                <div className="text-center space-y-2">
                                    <h3 className="text-xl font-bold text-gray-800">
                                        {title}
                                    </h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">
                                        {message}
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 mt-8">
                                    <button
                                        onClick={onClose}
                                        className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                                    >
                                        Hủy bỏ
                                    </button>
                                    <button
                                        onClick={onConfirm}
                                        className={`flex-1 px-4 py-3 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 ${theme.button}`}
                                    >
                                        {isDanger ? null : <Check size={18} />}
                                        {confirmText}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ConfirmModal;