import { X, Upload, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ImageWithFallBack from "../figma/ImageWithFallBack";

// Component nhập danh sách các bước thực hiện
export function StepInput({ steps, onChange }) {
  
  // Thêm một bước trống mới vào danh sách
  const handleAddStep = () => {
    onChange([
      ...steps,
      { id: `step-${Date.now()}`, description: "", image: "" }
    ]);
  };

  // Cập nhật nội dung hoặc hình ảnh của một bước cụ thể
  const handleUpdateStep = (index, field, value) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = { ...updatedSteps[index], [field]: value };
    onChange(updatedSteps);
  };

  // Xóa một bước khỏi danh sách dựa trên index
  const handleRemoveStep = (index) => {
    onChange(steps.filter((_, i) => i !== index));
  };

  // Xử lý sự kiện upload ảnh minh họa cho bước
  const handleImageUpload = (index, event) => {
    const file = event.target.files?.[0];
    if (file) {
      // Mock upload - thực tế cần upload lên server lấy URL thật
      const mockUrl = URL.createObjectURL(file);
      handleUpdateStep(index, "image", mockUrl);
    }
  };

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-xl border-2 border-[#ffc857]/30 p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm">
                  {index + 1}
                </div>
                <h4 className="font-semibold text-gray-800">Bước {index + 1}</h4>
              </div>
              <button
                onClick={() => handleRemoveStep(index)}
                className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Ô nhập mô tả bước */}
              <div className="md:col-span-2">
                <label className="block text-sm mb-1.5 text-gray-700">
                  Mô tả chi tiết <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={step.description}
                  onChange={(e) => handleUpdateStep(index, "description", e.target.value)}
                  placeholder="Mô tả chi tiết cách thực hiện bước này..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#ff6b35] focus:outline-none transition-all resize-none"
                />
              </div>

              {/* Khu vực upload ảnh */}
              <div>
                <label className="block text-sm mb-1.5 text-gray-700">
                  Ảnh minh họa
                </label>
                
                {step.image ? (
                  <div className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border-2 border-[#ffc857]/30">
                      <ImageWithFallBack
                        src={step.image}
                        alt={`Step ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => handleUpdateStep(index, "image", "")}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#ff6b35] hover:bg-orange-50/50 transition-all group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(index, e)}
                      className="hidden"
                    />
                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-[#ff6b35] transition-all mb-2" />
                    <span className="text-xs text-gray-500 text-center px-2">
                      Click để tải ảnh
                    </span>
                  </label>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Nút thêm bước mới */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleAddStep}
        className="w-full border-2 border-dashed border-[#ff6b35] text-[#ff6b35] py-4 rounded-xl hover:bg-orange-50 transition-all flex items-center justify-center gap-2 font-medium"
      >
        <ImageIcon className="w-5 h-5" />
        Thêm bước mới
      </motion.button>
    </div>
  );
}