import React from 'react';

const StatusBadge = ({ status }) => {
    const getStyle = (status) => {
        switch (status) {
            // User & General Status
            case 'active':
            case 'approved':
            case 'public':
            case 'resolved': // Report đã xử lý
                return 'bg-green-100 text-green-800 border-green-200';
            
            // Warnings / Pending
            case 'pending':
            case 'draft':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            
            // Danger / Blocked
            case 'blocked':
            case 'banned':
            case 'rejected':
            case 'hidden':
                return 'bg-red-100 text-red-800 border-red-200';
            
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStyle(status)} capitalize`}>
            {status}
        </span>
    );
};

export default StatusBadge;