import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X } from 'lucide-react';

export default function Toast({ message, isVisible, onClose, type = 'success' }) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(onClose, 3000); // Tự đóng sau 3s
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, x: '-50%' }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="fixed bottom-10 left-1/2 z-[10000] flex items-center gap-3 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl"
                >
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-sm font-medium">{message}</span>
                    <button onClick={onClose} className="ml-2 hover:text-gray-400">
                        <X className="w-4 h-4" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}