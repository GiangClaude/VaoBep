const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Đây là nơi quyết định thư mục lưu trữ
    
    // --- SỬA ĐỔI BẮT ĐẦU ---
    // Logic cũ chỉ có recipeId
    // const recipeId = req.savedRecipeId; 
    
    let uploadPath = '';

    // 1. Kiểm tra nếu upload Avatar (Dựa vào fieldname 'avatar' gửi từ frontend)
    if (file.fieldname === 'avatar') {
        // Lấy userId từ req.user (được gán bởi middleware 'protect')
        const userId = req.user ? req.user.user_id : 'unknown';
        uploadPath = path.join(__dirname, '../public/user', userId);
    } 
    // 2. Kiểm tra nếu upload Recipe (Dựa vào req.savedRecipeId hoặc logic cũ)
    else if (req.savedRecipeId) {
        const recipeId = req.savedRecipeId;
        uploadPath = path.join(__dirname, '../public/recipes', recipeId);
    } else {
        // Fallback nếu không xác định được (tránh lỗi crash)
        uploadPath = path.join(__dirname, '../public/temp');
    }

    // Tạo thư mục nếu chưa tồn tại
    if (!fs.existsSync(uploadPath)){
        fs.mkdirSync(uploadPath, {recursive: true});
    }

    // 3. Báo cho Multer biết đường dẫn xong xuôi
    cb(null, uploadPath);
    // --- SỬA ĐỔI KẾT THÚC ---
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    
    // 2. Xác định tiền tố dựa trên tên trường (fieldname) gửi từ Frontend
    // --- SỬA ĐỔI BẮT ĐẦU ---
    // Code cũ: const prefix = file.fieldname === 'cover_image' ? 'cover' : 'result';
    
    let prefix = 'file';
    if (file.fieldname === 'cover_image') prefix = 'cover';
    else if (file.fieldname === 'result') prefix = 'result';
    else if (file.fieldname === 'avatar') prefix = 'avatar'; // Thêm case cho avatar

    // --- SỬA ĐỔI KẾT THÚC ---

    // 3. Tạo chuỗi ngẫu nhiên nhỏ để tránh trùng lặp nếu up nhiều ảnh cùng lúc
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    
    // 4. Ghép lại: cover_123456789.jpg
    cb(null, `${prefix}_${uniqueSuffix}${ext}`);
  }
});

const uploadLocal = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } 
});

// Lưu ý: Code cũ bạn export instance tạo mới, bỏ qua giới hạn file size ở trên. 
// Tui giữ nguyên export cũ nhưng khuyên bạn nên dùng biến uploadLocal đã config limit.
module.exports = multer({ storage: storage });