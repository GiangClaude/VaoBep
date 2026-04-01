import React from 'react';
import { createPortal } from 'react-dom'; // <--- THÊM MỚI: Dùng để đưa modal ra khỏi Card
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// Map icon và màu sắc theo type
const modalTypes = {
  success: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100' },
  error: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-100' },
  warning: { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-100' },
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-100' },
};

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info', // success | error | warning | info
  actions = []   // Mảng các nút: [{ label, onClick, style: 'primary' | 'secondary' | 'danger' }]
}) {
  if (!isOpen) return null;

  const { icon: Icon, color, bg } = modalTypes[type] || modalTypes.info;

  // Sử dụng createPortal để gắn Modal vào cuối thẻ <body> thay vì nằm trong ArticleCard
  return createPortal(
    <AnimatePresence mode="wait">
      {/* Overlay: fixed, full screen */}
      <motion.div
        key="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        // QUAN TRỌNG: Chặn click từ Modal lan ra ArticleCard cha bên dưới
        onClick={(e) => {
          e.stopPropagation(); 
          // Nếu muốn click ra ngoài để đóng, có thể gọi onClose() ở đây
        }}
        className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        {/* Modal Content Container */}
        <motion.div
          key="modal-content"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
          // Chặn click bên trong modal không làm kích hoạt đóng modal từ overlay
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
        >
          {/* Header Section */}
          <div className="p-6 flex flex-col items-center text-center gap-4 border-b border-gray-50">
            <div className={`p-4 rounded-2xl ${bg} ${color} shadow-inner`}>
              <Icon className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            </div>
          </div>

          {/* Body Section */}
          <div className="px-6 py-5">
            <div className="text-gray-600 text-center leading-relaxed font-medium">
              {message}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-5 bg-gray-50/80 flex flex-col sm:flex-row gap-3">
            {actions.length > 0 ? (
              actions.map((action, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation(); // Chặn click nút bấm làm nhảy trang detail
                    action.onClick();
                  }}
                  className={`flex-1 px-5 py-3 rounded-2xl font-bold transition-all transform active:scale-95 text-sm ${
                    action.style === 'primary' 
                      ? 'bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white shadow-lg shadow-orange-200 hover:brightness-110'
                      : action.style === 'danger'
                      ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-100'
                      : 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {action.label}
                </button>
              ))
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="w-full px-5 py-3 bg-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-300 transition-colors"
              >
                Đóng
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body // Gắn trực tiếp vào body của trang web
  );
}