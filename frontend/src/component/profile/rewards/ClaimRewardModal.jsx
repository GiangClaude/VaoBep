import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Gift, Star, Coins, Ticket, X } from "lucide-react";

export const ClaimRewardModal = ({ isOpen, onClose, boxName, items, isOpening }) => {
    const [step, setStep] = useState('opening'); // 'opening' -> 'result'

    // Tự động chuyển step sau 5 giây nếu API đã trả về kết quả
    useEffect(() => {
        let timer;
        
        // Chỉ bắt đầu đếm ngược khi: 
        // 1. Modal đang mở
        // 2. API đã gọi xong (isOpening === false)
        // 3. Đang ở bước 'opening'
        if (isOpen && !isOpening && step === 'opening') {
            timer = setTimeout(() => {
                setStep('result');
            }, 5000); // 5 giây
        }

        // Dọn dẹp timer khi component unmount hoặc user bấm nút thủ công
        return () => clearTimeout(timer);
    }, [isOpen, isOpening, step]);

    // Reset trạng thái khi đóng/mở modal mới
    useEffect(() => {
        if (isOpen) setStep('opening');
    }, [isOpen]);

    const handleViewResult = () => {
        setStep('result');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-[40px] p-10 max-w-sm w-full relative overflow-hidden text-center shadow-2xl"
            >
                <AnimatePresence mode="wait">
                    {step === 'opening' ? (
                        <motion.div
                            key="opening"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="py-4"
                        >
                            <motion.div
                                animate={{ 
                                    rotate: [0, -10, 10, -10, 10, 0],
                                    y: [0, -5, 0]
                                }}
                                transition={{ repeat: Infinity, duration: 0.6 }}
                                className="inline-block p-8 bg-orange-50 rounded-full mb-8"
                            >
                                <Gift size={80} className="text-orange-500" />
                            </motion.div>

                            <h2 className="text-3xl font-extrabold text-gray-800 mb-4 leading-tight">
                                Đang mở {boxName || "Hộp Quà"}...
                            </h2>
                            <p className="text-gray-500 mb-8 text-lg">
                                Chờ chút, món quà bất ngờ đang tới!
                            </p>
                            
                            {/* Nút bấm mở ngay - Chỉ clickable khi API đã trả về dữ liệu */}
                            <button 
                                onClick={handleViewResult}
                                disabled={isOpening}
                                className={`px-10 py-3 rounded-full font-bold text-lg transition-all shadow-lg shadow-orange-200 ${
                                    isOpening 
                                    ? "bg-gray-200 text-gray-400 cursor-wait" 
                                    : "bg-[#ff7b31] text-white hover:scale-105 active:scale-95"
                                }`}
                            >
                                {isOpening ? "Đang xử lý..." : "Xem kết quả"}
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 1.2 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-4"
                        >
                            <div className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 cursor-pointer" onClick={onClose}>
                                <X size={28} />
                            </div>

                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                            >
                                <Star className="text-yellow-400 w-16 h-16 mx-auto mb-6 fill-yellow-400" />
                            </motion.div>

                            <h2 className="text-3xl font-extrabold text-gray-800 mb-8">Tuyệt vời!</h2>
                            
                            <div className="space-y-4 mb-10">
                                {items.map((item, idx) => (
                                    <motion.div 
                                        key={idx}
                                        initial={{ x: -30, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: idx * 0.15 }}
                                        className="flex items-center gap-4 p-4 bg-orange-50 rounded-2xl border border-orange-100"
                                    >
                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                            {item.type === 'points' ? <Coins className="text-orange-500" /> : <Ticket className="text-blue-500" />}
                                        </div>
                                        <span className="font-bold text-xl text-gray-700">
                                            {item.type === 'points' ? `+${item.value} Điểm` : `1x Vé Quảng Bá`}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>

                            <button 
                                onClick={onClose}
                                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-xl"
                            >
                                Xác nhận
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};