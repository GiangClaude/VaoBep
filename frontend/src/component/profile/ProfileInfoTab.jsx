import { useState, useRef, useEffect} from "react";
import { Camera, Calendar, Mail, Award, Save, X, CalendarCheck, History } from "lucide-react";
import { motion } from "motion/react";
import ImageWithFallback from "../figma/ImageWithFallBack";
import { getAvatarUrl } from "../../utils/imageHelper";

const API_BASE_URL = "http://localhost:5000";


export function ProfileInfoTab({ user, onSave, onCheckIn, onViewPointsHistory }) {
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null); // Ref để kích hoạt input file ẩn
  const [previewAvatar, setPreviewAvatar] = useState(user.avatar); // State lưu ảnh preview
  const [selectedFile, setSelectedFile] = useState(null); // State lưu file thực tế để upload


  const [formData, setFormData] = useState({
    fullName: user.fullName,
    bio: user.bio,
    // avatar: user.avatar // Không lưu avatar string vào formData này nữa, dùng state riêng
  });

  // Effect để reset dữ liệu khi user props thay đổi (ví dụ khi load xong data thật)
  useEffect(() => {
    setFormData({
        fullName: user.fullName,
        bio: user.bio
    });
    setPreviewAvatar(user.avatar);
  }, [user]);

  // Hàm xử lý khi chọn file
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        // 1. Lưu file để gửi lên server
        setSelectedFile(file);
        // 2. Tạo URL preview local để hiện ngay lập tức
        const objectUrl = URL.createObjectURL(file);
        setPreviewAvatar(objectUrl);
    }
  };

  const handleSave = () => {
    // Gửi cả thông tin text và file (nếu có) ra ngoài cho ProfilePage xử lý
    onSave({
        ...formData,
        avatarFile: selectedFile // Truyền file kèm theo
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset về giá trị ban đầu của user
    setFormData({
      fullName: user.fullName,
      bio: user.bio,
    });
    setPreviewAvatar(user.avatar); // Reset ảnh về avatar cũ
    setSelectedFile(null); // Xóa file đang chọn
    setIsEditing(false);
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column - Profile Form */}
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl mb-6 flex items-center gap-2">
          <Award className="w-6 h-6 text-[#ff6b35]" />
          Thông Tin Cá Nhân
        </h2>

        <div className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#ffc857]">
                <ImageWithFallback
                  src={getAvatarUrl(user.id, previewAvatar)} 
                  alt={formData.fullName}
                  className="w-full h-full object-cover"
                />
              </div>

              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden" 
              />

              {isEditing && (
                <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()} // Kích hoạt input file
                    className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera className="w-6 h-6 text-white" />
                </button>
              )}
            </div>
            <div>
              <h3 className="font-semibold mb-1">{formData.fullName}</h3>
              <p className="text-sm text-gray-600">
                {isEditing ? "Click ảnh để thay đổi avatar" : "Avatar của bạn"}
              </p>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm mb-2 text-gray-700">
              Họ và Tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              disabled={!isEditing}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                isEditing
                  ? "border-[#ffc857] focus:border-[#ff6b35] focus:outline-none"
                  : "border-gray-200 bg-gray-50"
              }`}
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm mb-2 text-gray-700">
              Tiểu sử
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              disabled={!isEditing}
              rows={4}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all resize-none ${
                isEditing
                  ? "border-[#ffc857] focus:border-[#ff6b35] focus:outline-none"
                  : "border-gray-200 bg-gray-50"
              }`}
              placeholder="Viết vài dòng về bạn..."
            />
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm mb-2 text-gray-700 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
          </div>

          {/* Points (Read-only) */}
          <div>
            <label className="block text-sm mb-2 text-gray-700">
              Số điểm hiện tại
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 bg-gradient-to-r from-[#ff6b35]/5 to-[#ffc857]/5">
                <div className="flex items-center gap-2">
                  <div className="bg-gradient-to-r from-[#ff6b35] to-[#ffc857] text-white px-3 py-1 rounded-full font-semibold">
                    {(user.points || 0).toLocaleString()}
                  </div>
                  <span className="text-sm text-gray-600">điểm</span>
                </div>
              </div>
              <button
                onClick={onViewPointsHistory}
                className="text-[#ff6b35] hover:text-[#f7931e] flex items-center gap-1 text-sm font-medium"
              >
                <History className="w-4 h-4" />
                Lịch sử
              </button>
            </div>
          </div>

          {/* Role (Read-only) */}
          <div>
            <label className="block text-sm mb-2 text-gray-700">
              Vai trò
            </label>
            <input
              type="text"
              value={user.role.toUpperCase()}
              disabled
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-500 uppercase font-semibold"
            />
          </div>

          {/* Joined Date (Read-only) */}
          <div>
            <label className="block text-sm mb-2 text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Ngày tham gia
            </label>
            <input
              type="text"
              value={user.joinDate}
              disabled
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            {isEditing ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg font-semibold"
                >
                  <Save className="w-5 h-5" />
                  Lưu thay đổi
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCancel}
                  className="px-8 bg-gray-200 text-gray-700 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold hover:bg-gray-300 transition-all"
                >
                  <X className="w-5 h-5" />
                  Hủy
                </motion.button>
              </>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsEditing(true)}
                className="flex-1 bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg font-semibold"
              >
                <Camera className="w-5 h-5" />
                Chỉnh sửa hồ sơ
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Right Column - Quick Actions */}
      <div className="space-y-6">
        {/* Check-in Card */}
        <div className="bg-gradient-to-br from-[#ff6b35] to-[#f7931e] rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl">Điểm danh hàng ngày</h3>
              <p className="text-white/80 text-sm">Nhận 10 điểm</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCheckIn}
            className="w-full bg-white text-[#ff6b35] py-3 rounded-xl font-semibold shadow-lg hover:bg-yellow-50 transition-all"
          >
            Điểm danh ngay
          </motion.button>
        </div>

        {/* Points History Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-[#ffc857]/30">
          <h3 className="text-lg mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-[#ff6b35]" />
            Lịch sử điểm
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Xem chi tiết lịch sử tích điểm, tặng điểm và sử dụng điểm của bạn
          </p>
          <button
            onClick={onViewPointsHistory}
            className="w-full border-2 border-[#ff6b35] text-[#ff6b35] py-2.5 rounded-xl hover:bg-[#ff6b35] hover:text-white transition-all font-medium"
          >
            Xem lịch sử
          </button>
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-[#ffc857]/30">
          <h3 className="text-lg mb-3">💡 Mẹo</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Cập nhật avatar để tăng uy tín</li>
            <li>• Viết tiểu sử thu hút để có thêm follower</li>
            <li>• Điểm danh hàng ngày để tích điểm</li>
          </ul>
        </div>
      </div>
    </div>
  );
}