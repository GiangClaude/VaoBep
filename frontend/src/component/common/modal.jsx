import React from 'react';
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

  return (
    <AnimatePresence>
      {/* Overlay: fixed, full screen, chặn click xuyên qua */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      >
        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 flex items-center gap-4">
            <div className={`p-3 rounded-full ${bg} ${color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800">{title}</h3>
            </div>
            {/* Nút đóng góc trên (tùy chọn) */}
            {/* <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button> */}
          </div>

          {/* Body */}
          <div className="px-5 pb-4">
            <p className="text-gray-600 leading-relaxed">{message}</p>
          </div>

          {/* Footer Actions */}
          <div className="p-5 bg-gray-50 flex gap-3 justify-end">
            {actions.length > 0 ? (
              actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`px-4 py-2 rounded-full font-medium transition-all transform active:scale-95 ${
                    action.style === 'primary' 
                      ? 'bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white shadow-md hover:shadow-lg'
                      : action.style === 'danger'
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {action.label}
                </button>
              ))
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300"
              >
                Đóng
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}