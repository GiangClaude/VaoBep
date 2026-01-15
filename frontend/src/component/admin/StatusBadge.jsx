import React from 'react';

const StatusBadge = ({ status }) => {
    // Helper định nghĩa màu sắc
    const getConfig = (status) => {
        switch (status) {
            // SUCCESS: Active, Public, Approved, Resolved
            case 'active':
            case 'approved':
            case 'public':
            case 'resolved':
                return {
                    bg: 'bg-green-100 text-green-700 border-green-200',
                    dot: 'bg-green-500'
                };
            
            // WARNING: Pending, Draft
            case 'pending':
            case 'draft':
                return {
                    bg: 'bg-orange-100 text-orange-700 border-orange-200', // Đổi sang tone Cam cho hợp theme
                    dot: 'bg-orange-500'
                };
            
            // DANGER: Blocked, Banned, Rejected, Hidden
            case 'blocked':
            case 'banned':
            case 'rejected':
            case 'hidden':
                return {
                    bg: 'bg-red-100 text-red-700 border-red-200',
                    dot: 'bg-red-500'
                };
            
            // DEFAULT
            default:
                return {
                    bg: 'bg-gray-100 text-gray-600 border-gray-200',
                    dot: 'bg-gray-400'
                };
        }
    };

    const config = getConfig(status);

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.bg} capitalize shadow-sm`}>
            {/* Dot indicator */}
            <span className={`w-2 h-2 rounded-full ${config.dot} animate-pulse-slow`}></span>
            {status}
        </span>
    );
};

export default StatusBadge;