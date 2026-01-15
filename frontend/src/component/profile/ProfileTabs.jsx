import { FileText, Heart, User, Coins, Settings } from "lucide-react";
import { motion } from "motion/react";

const tabs = [
  { id: "my-recipes", label: "Bài Viết Của Tôi", icon: FileText },
  { id: "saved", label: "Đã Lưu", icon: Heart },
  { id: "info", label: "Thông Tin", icon: User },
  { id: "points", label: "Quản Lý Điểm", icon: Coins },
  { id: "settings", label: "Cài Đặt", icon: Settings }
];

export function ProfileTabs({ activeTab, onTabChange }) {
  return (
    <div className=" z-40 bg-[#fff9f0] border-b-2 border-[#ffc857]/30 mb-8">
      <div className="container mx-auto px-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative flex-shrink-0"
              >
                <div
                  className={`flex items-center gap-2 px-6 py-4 transition-all ${
                    isActive
                      ? "text-[#ff6b35]"
                      : "text-gray-600 hover:text-[#ff6b35]"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium whitespace-nowrap">{tab.label}</span>
                </div>

                {/* Active Underline */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff6b35] to-[#ffc857] rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}