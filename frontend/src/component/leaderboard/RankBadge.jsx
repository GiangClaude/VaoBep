import React from 'react';
import { Trophy } from 'lucide-react';

const RankBadge = ({ rank }) => {
    let bgColor = 'bg-gray-100 text-gray-500';
    let icon = null;

    if (rank === 1) {
        bgColor = 'bg-yellow-100 text-yellow-600 border border-yellow-300';
        icon = <Trophy size={18} className="mr-1" />;
    } else if (rank === 2) {
        bgColor = 'bg-gray-200 text-gray-600 border border-gray-400';
        icon = <Trophy size={18} className="mr-1" />;
    } else if (rank === 3) {
        bgColor = 'bg-orange-100 text-orange-600 border border-orange-300';
        icon = <Trophy size={18} className="mr-1" />;
    }

    return (
        <div className={`flex items-center justify-center font-bold text-lg w-12 h-12 rounded-full shadow-sm ${bgColor}`}>
            {icon}
            {rank}
        </div>
    );
};

export default RankBadge;