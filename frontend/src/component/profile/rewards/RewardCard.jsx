import { Gift, CheckCircle, Package } from "lucide-react";
import { motion } from "motion/react";

export const RewardCard = ({ reward, onOpen }) => {
    const isClaimed = reward.status === 'claimed';

    return (
        <motion.div 
            whileHover={!isClaimed ? { y: -5 } : {}}
            className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                isClaimed 
                ? "bg-gray-50 border-gray-100 opacity-70" 
                : "bg-white border-orange-100 shadow-sm hover:shadow-md"
            }`}
        >
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${isClaimed ? 'bg-gray-200' : 'bg-orange-100'}`}>
                    {isClaimed ? <Package className="text-gray-500" /> : <Gift className="text-orange-500 animate-bounce" />}
                </div>
                <div>
                    <h4 className="font-bold text-gray-800">{reward.box_name}</h4>
                    <p className="text-xs text-gray-500">
                        {reward.challenge_title ? `Từ: ${reward.challenge_title}` : 'Phần thưởng hệ thống'}
                    </p>
                </div>
            </div>

            {isClaimed ? (
                <div className="flex items-center gap-1 text-green-600 font-medium text-sm">
                    <CheckCircle size={16} /> Đã nhận
                </div>
            ) : (
                <button 
                    onClick={() => onOpen(reward)}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-400 text-white rounded-lg text-sm font-bold shadow-sm hover:brightness-110"
                >
                    Mở ngay
                </button>
            )}
        </motion.div>
    );
};