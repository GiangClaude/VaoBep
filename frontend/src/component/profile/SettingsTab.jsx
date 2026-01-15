import { Lock, Crown, AlertTriangle, ChevronRight, Shield, Star } from "lucide-react";
import { motion } from "motion/react";

export function SettingsTab({ role, onChangePassword, onUpgradeVIP, onDeleteAccount }) {
  const isVIP = role === "vip" || role === "expert";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Security Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-[#ff6b35] to-[#f7931e] p-3 rounded-xl">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl">Bảo Mật</h2>
            <p className="text-sm text-gray-600">Quản lý mật khẩu và bảo mật tài khoản</p>
          </div>
        </div>

        <motion.button
          whileHover={{ x: 4 }}
          onClick={onChangePassword}
          className="w-full flex items-center justify-between p-5 rounded-xl border-2 border-gray-200 hover:border-[#ffc857] hover:bg-[#ffc857]/5 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 group-hover:bg-[#ffc857]/20 p-3 rounded-xl transition-all">
              <Lock className="w-5 h-5 text-gray-700 group-hover:text-[#ff6b35]" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold mb-1">Đổi Mật Khẩu</h3>
              <p className="text-sm text-gray-600">Cập nhật mật khẩu của bạn</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#ff6b35] transition-all" />
        </motion.button>
      </div>

      {/* VIP Upgrade Section */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-lg p-8 border-2 border-[#ffc857]/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-xl">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl">Nâng Cấp Tài Khoản</h2>
            <p className="text-sm text-gray-600">
              {isVIP ? "Bạn đang là thành viên VIP" : "Nâng cấp lên VIP để mở khóa tính năng"}
            </p>
          </div>
        </div>

        {/* VIP Benefits */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-[#ffc857] fill-[#ffc857]" />
            Lợi ích thành viên VIP
          </h3>
          <ul className="space-y-3">
            {[
              "Đăng công thức không giới hạn",
              "Bộ lọc tìm kiếm nâng cao",
              "AI tạo thực đơn không giới hạn",
              "Huy hiệu VIP nổi bật",
              "Ưu tiên hỗ trợ 24/7",
              "Truy cập sớm tính năng mới"
            ].map((benefit, index) => (
              <li key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gradient-to-r from-[#ff6b35] to-[#ffc857] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border-2 border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Gói Tháng</p>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-3xl">99.000₫</span>
              <span className="text-gray-500 mb-1">/tháng</span>
            </div>
            <p className="text-xs text-gray-500">Hủy bất cứ lúc nào</p>
          </div>

          <div className="bg-gradient-to-br from-[#ff6b35] to-[#f7931e] rounded-xl p-5 border-2 border-[#ff6b35] text-white relative overflow-hidden">
            <div className="absolute top-2 right-2 bg-yellow-300 text-[#ff6b35] text-xs px-2 py-1 rounded-full font-semibold">
              TIẾT KIỆM 40%
            </div>
            <p className="text-sm text-white/80 mb-2">Gói Năm</p>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-3xl">699.000₫</span>
              <span className="text-white/80 mb-1">/năm</span>
            </div>
            <p className="text-xs text-white/70">Chỉ 58.250₫/tháng</p>
          </div>
        </div>

        {/* Upgrade Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onUpgradeVIP}
          disabled={isVIP}
          className={`w-full py-4 rounded-xl font-semibold shadow-lg transition-all ${
            isVIP
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white hover:shadow-xl"
          }`}
        >
          {isVIP ? (
            <span className="flex items-center justify-center gap-2">
              <Crown className="w-5 h-5" />
              Bạn đã là VIP
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Crown className="w-5 h-5" />
              Nâng cấp VIP ngay
            </span>
          )}
        </motion.button>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-red-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-red-100 p-3 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-2xl text-red-600">Vùng Nguy Hiểm</h2>
            <p className="text-sm text-gray-600">Các hành động không thể hoàn tác</p>
          </div>
        </div>

        <div className="bg-red-50 rounded-xl p-6 mb-6">
          <h3 className="font-semibold mb-3 text-red-900">⚠️ Cảnh báo quan trọng</h3>
          <ul className="space-y-2 text-sm text-red-800">
            <li>• Tài khoản sẽ bị xóa vĩnh viễn</li>
            <li>• Tất cả công thức của bạn sẽ bị xóa</li>
            <li>• Điểm tích lũy sẽ bị mất</li>
            <li>• Không thể khôi phục sau khi xóa</li>
          </ul>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onDeleteAccount}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-semibold shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <AlertTriangle className="w-5 h-5" />
          Xóa tài khoản vĩnh viễn
        </motion.button>
      </div>
    </div>
  );
}