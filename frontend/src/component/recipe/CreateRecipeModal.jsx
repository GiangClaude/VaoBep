import { useState, useEffect } from "react";
import { X, Upload, Save, Eye, FileText, Clock, Users, Flame } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { IngredientInput } from "./IngredientInput";
import { StepInput } from "./StepInput";
import ImageWithFallBack from "../figma/ImageWithFallBack";
import TagSelector from "../common/TagSelector";

// Modal chính để tạo mới công thức nấu ăn
export function CreateRecipeModal({ isOpen, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    coverImage: "",
    servings: 1,
    cookTime: 60, // Giá trị mặc định
    totalCalo: "",
    status: "draft",
    ingredients: [],
    steps: [],
    coverImageFile: null,
    tags: [],
  });


useEffect(() => {
    if (isOpen) {
        if (initialData) {
            console.log("Initial Data mapping:", initialData);

            let existingImageUrl = "";
            if (initialData.cover_image) {
                // Nếu là URL online
                if (initialData.cover_image.startsWith('http')) {
                    existingImageUrl = initialData.cover_image;
                } else {
                    // Nếu là ảnh local, trỏ về đúng thư mục public/recipes
                    // Lưu ý: ID có thể là id hoặc recipe_id tùy lúc truyền vào
                    const rId = initialData.recipe_id || initialData.id;
                    existingImageUrl = `http://localhost:5000/public/recipes/${rId}/${initialData.cover_image}`;
                }
            }

            setFormData({
                title: initialData.title || "",
                description: initialData.description || "",
                coverImage: existingImageUrl,
                servings: initialData.servings || 1,
                cookTime: initialData.cookTime || initialData.cook_time || 60,
                totalCalo: initialData.totalCalo || initialData.total_calo || "",
                status: initialData.status || "draft",

                // --- SỬA ĐOẠN NÀY ---
                ingredients: initialData.ingredients ? initialData.ingredients.map(ing => ({
                    // Giữ lại ID nếu có, hoặc tạo random để làm key
                    id: ing.id || ing.ingredient_id || `existing-${Math.random()}`, 
                    
                    // Ưu tiên lấy key 'name' (do Hook trả về), nếu không có mới tìm 'ingredient_name' (đề phòng)
                    name: ing.name || ing.ingredient_name || "", 
                    
                    // Tương tự với Unit
                    unit: ing.unit || ing.unit_name || "",       
                    
                    // Tương tự với Amount/Quantity
                    amount: ing.amount || ing.quantity || "",      
                    
                    isNew: false
                })) : [],

                // --- Steps (Giữ nguyên hoặc fallback an toàn) ---
                steps: (initialData.instructions && typeof initialData.instructions === 'string')
                    ? initialData.instructions.split('\n\n').map(desc => ({ description: desc }))
                    : (initialData.steps || []), // Fallback nếu hook đã map sang mảng steps rồi
                
                coverImageFile: null,
                tags: initialData.tags || [],
            });
        } else {
            // Reset form (Giữ nguyên code cũ)
             setFormData({
                title: "",
                description: "",
                coverImage: "",
                servings: 1,
                cookTime: 60,
                totalCalo: "",
                status: "draft",
                ingredients: [],
                steps: [],
                coverImageFile: null, 
                tags: [],
            });
        }
    }
}, [isOpen, initialData]);

  // Xử lý upload ảnh bìa 
  const handleCoverImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const mockUrl = URL.createObjectURL(file);
      setFormData({ 
          ...formData, 
          coverImage: mockUrl,
          coverImageFile: file 
      });
    }
  };

  // --- HÀM MỚI: Xử lý xóa ảnh bìa ---
  const handleRemoveCoverImage = () => {
    setFormData({ 
        ...formData, 
        coverImage: "",       // Xóa ảnh xem trước
        coverImageFile: null  // QUAN TRỌNG: Xóa luôn file gốc để không gửi nhầm
    });
  };

// const handleSubmit = (status) => {
//     // 1. Khởi tạo FormData (Bắt buộc để gửi file ảnh)
//     const submitData = new FormData();

//     // --- A. Append các trường văn bản cơ bản ---
//     submitData.append("title", formData.title);
//     submitData.append("description", formData.description);
//     submitData.append("servings", formData.servings);
//     submitData.append("cook_time", Number(formData.cookTime) || 60); // Lưu ý: Backend dùng key 'cook_time'
//     submitData.append("total_calo", formData.totalCalo);
//     submitData.append("status", status);

//     // --- B. Append Nguyên liệu (Ingredients) ---
//     // Vì FormData chỉ nhận string, ta phải chuyển mảng object thành chuỗi JSON
//     // Backend sẽ dùng JSON.parse(req.body.ingredients) để đọc lại
//     submitData.append("ingredients", JSON.stringify(formData.ingredients));

//     // --- C. Append Các bước (Instructions) ---
//     // Backend đang lưu instructions dạng Text dài, nên ta nối các bước lại
//     const instructionsString = formData.steps.map(s => s.description).join("\n\n");
//     submitData.append("instructions", instructionsString);

//     // --- D. Append Tags (MỚI) ---
//     // Chỉ lấy mảng các tag_id gửi lên server
//     // Ví dụ gửi lên: '["tag-uuid-1", "tag-uuid-2"]'
//     const tagIds = formData.tags.map(t => t.tag_id);
//     submitData.append("tags", JSON.stringify(tagIds)); 

//     // --- E. Append File Ảnh Bìa (Cover Image) ---
//     // Quan trọng: Chỉ append nếu người dùng có chọn file mới (formData.coverImageFile khác null)
//     if (formData.coverImageFile) {
//         submitData.append("cover_image", formData.coverImageFile);
//     }

//     // 3. Gửi FormData về hàm cha (nơi gọi API)
//     onSubmit(submitData);
//     onClose();
//   };

  const handleSubmit = (status) => {
    // CHỈNH SỬA: Không tạo FormData ở đây nữa.
    // Gom dữ liệu thành object thuần (Plain Object) để gửi sang Hook.
    
    // Defensive coding: Đảm bảo tags luôn là mảng
    const safeTags = Array.isArray(formData.tags) ? formData.tags : [];

    const submitData = {
        title: formData.title,
        description: formData.description,
        servings: formData.servings,
        cookTime: Number(formData.cookTime) || 60,
        totalCalo: formData.totalCalo,
        status: status,
        ingredients: formData.ingredients,
        steps: formData.steps,
        tags: safeTags, // Gửi nguyên object tag (Hook sẽ tự map ra tag_id)
        
        // Ảnh: gửi file nếu có file mới, hoặc gửi null
        coverImageFile: formData.coverImageFile
    };

    // Gửi Object về hàm cha (nơi gọi API)
    onSubmit(submitData);
    onClose();
  };

  const isEditing = !!initialData;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-[#fff9f0] rounded-3xl shadow-2xl w-full max-w-5xl my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white p-6 rounded-t-3xl relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
                </div>
                
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h2>{isEditing ? "Chỉnh Sửa Công Thức" : "Đăng Công Thức Mới"}</h2>
                      <p className="text-white/80 text-sm">Chia sẻ công thức nấu ăn của bạn</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="bg-white/20 backdrop-blur-sm p-2 rounded-xl hover:bg-white/30 transition-all">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
                
                {/* 1. Phần Ảnh Bìa (Đã cập nhật nút Xóa) */}
                <div>
                  <label className="block text-lg mb-3 text-gray-800 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-[#ff6b35]" />
                    Ảnh đại diện công thức
                  </label>
                  
                  {formData.coverImage ? (
                    <div className="relative group">
                      <div className="aspect-video rounded-2xl overflow-hidden border-2 border-[#ffc857]/30">
                        <ImageWithFallBack
                          src={formData.coverImage}
                          alt="Cover"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={handleRemoveCoverImage}
                        className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="aspect-video border-2 border-dashed border-[#ff6b35] rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-orange-50/50 transition-all group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageUpload}
                        className="hidden"
                      />
                      <Upload className="w-12 h-12 text-[#ff6b35] mb-3 group-hover:scale-110 transition-transform" />
                      <span className="text-gray-700 font-medium mb-1">Click để tải ảnh đại diện</span>
                      <span className="text-sm text-gray-500">PNG, JPG (Max 5MB)</span>
                    </label>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tên & Mô tả (Giữ nguyên) */}
                  <div className="md:col-span-2">
                    <label className="block text-sm mb-2 text-gray-700">Tên công thức <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="VD: Gà nướng mật ong thơm lừng"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#ff6b35] focus:outline-none transition-all bg-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm mb-2 text-gray-700">Mô tả ngắn</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Mô tả ngắn gọn về món ăn..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#ff6b35] focus:outline-none transition-all resize-none bg-white"
                    />
                  </div>

                  {/* Khẩu phần */}
                  <div>
                    <label className="block text-sm mb-2 text-gray-700 flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#ff6b35]" />
                      Khẩu phần
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.servings}
                      onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#ff6b35] focus:outline-none transition-all bg-white"
                    />
                  </div>

                  {/* 2. Thời gian nấu  */}
                  <div>
                    <label className="block text-sm mb-2 text-gray-700 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#ff6b35]" />
                      Thời gian nấu (phút)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.cookTime}
                      onChange={(e) => setFormData({ ...formData, cookTime: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#ff6b35] focus:outline-none transition-all bg-white"
                    />
                  </div>

                  {/* Tổng Calo */}
                  <div>
                    <label className="block text-sm mb-2 text-gray-700 flex items-center gap-2">
                      <Flame className="w-4 h-4 text-[#ff6b35]" />
                      Tổng calo (kcal)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.totalCalo}
                      onChange={(e) => setFormData({ ...formData, totalCalo: e.target.value })}
                      placeholder="VD: 450"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#ff6b35] focus:outline-none transition-all bg-white"
                    />
                  </div>
                </div>

                <div>
                    <label className="block text-lg mb-3 text-gray-800 flex items-center gap-2">
                        🏷️ Thẻ (Tags)
                    </label>
                    <TagSelector 
                        selectedTags={formData.tags}
                        onChange={(newTags) => setFormData({...formData, tags: newTags})}
                    />
                </div>

                {/* Các phần khác giữ nguyên */}
                <div>
                  <label className="block text-lg mb-3 text-gray-800 flex items-center gap-2">
                    🥘 Nguyên liệu <span className="text-red-500">*</span>
                  </label>
                  <IngredientInput
                    ingredients={formData.ingredients}
                    onChange={(ingredients) => setFormData({ ...formData, ingredients })}
                  />
                </div>
                <div>
                  <label className="block text-lg mb-3 text-gray-800 flex items-center gap-2">
                    📝 Các bước thực hiện <span className="text-red-500">*</span>
                  </label>
                  <StepInput
                    steps={formData.steps}
                    onChange={(steps) => setFormData({ ...formData, steps })}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 bg-white border-t-2 border-gray-200 rounded-b-3xl flex gap-3">
                <motion.button onClick={onClose} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-medium">Hủy</motion.button>
                <motion.button
                  onClick={() => handleSubmit("draft")}
                  disabled={!formData.title || !formData.description}
                  className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all flex items-center justify-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" /> Lưu nháp
                </motion.button>
                <motion.button
                  onClick={() => handleSubmit("public")}
                  disabled={!formData.title || formData.ingredients.length === 0 || formData.steps.length === 0}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Eye className="w-5 h-5" /> Đăng công khai
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}