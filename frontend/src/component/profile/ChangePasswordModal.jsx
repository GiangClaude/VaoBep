export const ChangePasswordModal = ({ isOpen, onClose, onSubmit, loading, formData, setFormData, errors }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md p-6">
                <h2 className="text-xl font-bold mb-4">Đổi Mật Khẩu</h2>
                
                {/* Hiển thị lỗi từ API nếu có */}
                {errors.api && <div className="bg-red-50 text-red-500 p-2 rounded mb-4 text-sm">{errors.api}</div>}

                <div className="space-y-4">
                    {/* Input Mật khẩu cũ */}
                    <div>
                        <input 
                            type="password"
                            placeholder="Mật khẩu hiện tại"
                            className={`w-full p-2 border rounded ${errors.oldPassword ? 'border-red-500' : ''}`}
                            value={formData.oldPassword}
                            onChange={(e) => setFormData({...formData, oldPassword: e.target.value})}
                        />
                        {errors.oldPassword && <p className="text-red-500 text-xs">{errors.oldPassword}</p>}
                    </div>

                    {/* Input Mật khẩu mới */}
                    <div>
                        <input 
                            type="password"
                            placeholder="Mật khẩu mới"
                            className={`w-full p-2 border rounded ${errors.newPassword ? 'border-red-500' : ''}`}
                            value={formData.newPassword}
                            onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                        />
                        {errors.newPassword && <p className="text-red-500 text-xs">{errors.newPassword}</p>}
                    </div>

                    {/* Input Xác nhận */}
                    <div>
                        <input 
                            type="password"
                            placeholder="Xác nhận mật khẩu mới"
                            className={`w-full p-2 border rounded ${errors.confirmPassword ? 'border-red-500' : ''}`}
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        />
                        {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}
                    </div>

                    <button 
                        onClick={onSubmit}
                        disabled={loading}
                        className="w-full bg-orange-500 text-white py-2 rounded-lg font-bold"
                    >
                        {loading ? "Đang xử lý..." : "Cập nhật"}
                    </button>
                    <button onClick={onClose} className="w-full text-gray-500 mt-2">Hủy</button>
                </div>
            </div>
        </div>
    );
};