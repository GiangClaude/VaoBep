import { Coins, TrendingUp, TrendingDown, Gift, Star, Calendar, Filter, CheckCircle, Clock } from "lucide-react"; // [THÊM] Import icon CheckCircle, Clock
import { motion } from "motion/react";
import { useState } from "react";

// [CẬP NHẬT] Nhận thêm props: loading, isCheckedIn, onCheckIn
export function PointsTab({ 
  currentPoints, 
  role, 
  history, 
  loading, 
  isCheckedIn, 
  onCheckIn, 
  onGiftPoints, 
  onPromoteRecipe 
}) {
  const [filter, setFilter] = useState("all"); // Mặc định hiển thị tất cả

  const getRoleInfo = (role) => {
    const roles = {
      user: { name: "Thành viên", color: "text-gray-600", bg: "bg-gray-100" },
      vip: { name: "VIP", color: "text-yellow-600", bg: "bg-yellow-100" },
      pro: { name: "Chuyên gia", color: "text-purple-600", bg: "bg-purple-100" } // Sửa 'expert' thành 'pro' cho khớp DB
    };
    return roles[role] || roles.user;
  };

  const roleInfo = getRoleInfo(role);

  // [THÊM MỚI] Helper map loại giao dịch từ DB sang Giao diện
  const getTransactionInfo = (type) => {
    switch (type) {
      case "checkin":
        return { 
          icon: <CheckCircle className="w-5 h-5 text-green-500" />, 
          label: "Điểm danh", 
          color: "text-green-600" 
        };
      case "earn":
        return { 
          icon: <TrendingUp className="w-5 h-5 text-blue-500" />, 
          label: "Nhận điểm", 
          color: "text-blue-600" 
        };
      case "redeem": // Đổi quà/Tiêu điểm
      case "spend":
        return { 
          icon: <TrendingDown className="w-5 h-5 text-orange-500" />, 
          label: "Tiêu điểm", 
          color: "text-orange-600" 
        };
      case "gift_sent":
        return { 
          icon: <Gift className="w-5 h-5 text-red-500" />, 
          label: "Tặng quà", 
          color: "text-red-600" 
        };
      case "gift_received":
        return { 
          icon: <Gift className="w-5 h-5 text-purple-500" />, 
          label: "Nhận quà", 
          color: "text-purple-600" 
        };
      default:
        return { 
          icon: <Coins className="w-5 h-5 text-gray-500" />, 
          label: "Khác", 
          color: "text-gray-600" 
        };
    }
  };

  return (
    <div className="space-y-8">
      
      {/* [THÊM MỚI] 1. CARD ĐIỂM DANH HÀNG NGÀY */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-full ${isCheckedIn ? 'bg-green-100' : 'bg-orange-100'}`}>
            {isCheckedIn ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
                <Calendar className="w-8 h-8 text-[#ff6b35]" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              {isCheckedIn ? "Đã điểm danh hôm nay" : "Điểm danh nhận quà"}
            </h3>
            <p className="text-gray-500 text-sm">
              {isCheckedIn 
                ? "Tuyệt vời! Hãy quay lại vào ngày mai để nhận thêm điểm." 
                : "Điểm danh ngay để nhận +10 điểm tích lũy."}
            </p>
          </div>
        </div>

        <button
          onClick={onCheckIn}
          disabled={isCheckedIn}
          className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all transform active:scale-95 flex items-center gap-2 ${
            isCheckedIn
              ? "bg-gray-200 text-gray-500 cursor-not-allowed shadow-none"
              : "bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white hover:shadow-orange-200 hover:-translate-y-1"
          }`}
        >
          {isCheckedIn ? (
            <>
              <Clock className="w-5 h-5" />
              Đã nhận +10 điểm
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Điểm danh ngay
            </>
          )}
        </button>
      </motion.div>

      {/* 2. Points Overview Cards (Giữ nguyên layout cũ, cập nhật data) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Points Card */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-gradient-to-br from-[#ff6b35] to-[#f7931e] rounded-2xl p-8 text-white shadow-xl relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full blur-xl" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <Coins className="w-8 h-8" />
              </div>
              <div>
                <p className="text-white/80 text-sm">Số điểm hiện tại</p>
                {/* [CẬP NHẬT] Hiển thị điểm thật */}
                <h2 className="text-4xl font-bold">{currentPoints.toLocaleString()}</h2>
              </div>
            </div>

            <div className={`inline-flex items-center gap-2 ${roleInfo.bg} ${roleInfo.color} px-4 py-2 rounded-full text-sm font-semibold`}>
              <Star className="w-4 h-4" />
              {roleInfo.name}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions Card */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-[#ffc857]/30">
          <h3 className="text-xl mb-6 flex items-center gap-2 font-bold text-gray-800">
            <Star className="w-6 h-6 text-[#ff6b35]" />
            Hành Động Nhanh
          </h3>

          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onGiftPoints}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl flex items-center justify-center gap-2 shadow-md font-semibold"
            >
              <Gift className="w-5 h-5" />
              Tặng điểm cho tác giả
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onPromoteRecipe}
              className="w-full bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white py-3 rounded-xl flex items-center justify-center gap-2 shadow-md font-semibold"
            >
              <TrendingUp className="w-5 h-5" />
              Quảng bá công thức
            </motion.button>
          </div>
        </div>
      </div>

      {/* 3. Points History (Xử lý dữ liệu thật) */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
            <Calendar className="w-6 h-6 text-[#ff6b35]" />
            Lịch Sử Điểm
          </h3>

          {/* Filter UI (Tạm thời chưa active logic backend filter) */}
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all flex items-center gap-2 text-sm">
              <Filter className="w-4 h-4" />
              Lọc (Sắp ra mắt)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Ngày</th>
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Nội dung</th>
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Loại</th>
                <th className="text-right py-3 px-4 text-gray-700 font-semibold">Số điểm</th>
              </tr>
            </thead>
            <tbody>
              {/* [CẬP NHẬT] Xử lý Loading */}
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : history.length === 0 ? (
                /* [CẬP NHẬT] Xử lý Trống */
                <tr>
                  <td colSpan={4} className="text-center py-12">
                    <div className="inline-flex bg-gradient-to-br from-[#ff6b35]/10 to-[#ffc857]/10 p-6 rounded-full mb-3">
                      <Coins className="w-12 h-12 text-[#ff6b35]" />
                    </div>
                    <p className="text-gray-600">Chưa có lịch sử giao dịch điểm</p>
                  </td>
                </tr>
              ) : (
                /* [CẬP NHẬT] Map dữ liệu thật */
                history.map((item) => {
                  const transInfo = getTransactionInfo(item.type);
                  return (
                    <motion.tr
                      key={item.transaction_id || item.id} // Dùng transaction_id từ DB
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4 text-gray-600 text-sm">
                        {/* Format ngày: dd/mm/yyyy */}
                        {new Date(item.created_at).toLocaleDateString('vi-VN')}
                        <br/>
                        <span className="text-xs text-gray-400">
                           {new Date(item.created_at).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-800 font-medium">
                        {item.message}
                        {/* Nếu có related user (ví dụ tặng quà), hiển thị thêm tên */}
                        {item.related_user_name && (
                            <span className="block text-xs text-gray-500 mt-1">
                                Liên quan: {item.related_user_name}
                            </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {transInfo.icon}
                          <span className={`text-sm ${transInfo.color}`}>{transInfo.label}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span
                          className={`font-bold text-lg ${
                            item.amount > 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {item.amount > 0 ? "+" : ""}
                          {item.amount.toLocaleString()}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* [GIỮ NGUYÊN] Pagination logic nếu cần, hiện tại ẩn đi nếu ít data */}
        {history.length > 10 && (
          <div className="mt-6 pt-6 border-t border-gray-200 text-center text-gray-500">
             (Phân trang sẽ hiển thị khi dữ liệu nhiều hơn)
          </div>
        )}
      </div>
    </div>
  );
}