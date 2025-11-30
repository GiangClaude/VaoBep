const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Đây là nơi quyết định thư mục lưu trữ
    
    // 1. Lấy ID từ 'chiếc giỏ' req mà chúng ta đã bàn
    const recipeId = req.savedRecipeId; 

    const recipePath = path.join(__dirname, '../public/recipes', recipeId);

    if (!fs.existsSync(recipePath)){
        fs.mkdirSync(recipePath, {recursive: true});
    }
    // 2. Tạo đường dẫn thư mục: public/recipes/{recipeId}
    // ... logic tạo thư mục ...

    // 3. Báo cho Multer biết đường dẫn xong xuôi
    cb(null, path_to_folder);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    
    // 2. Xác định tiền tố dựa trên tên trường (fieldname) gửi từ Frontend
    // Nếu là 'cover_image' thì đặt là 'cover', ngược lại là 'result'
    const prefix = file.fieldname === 'cover_image' ? 'cover' : 'result';

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

module.exports = multer({ storage: storage });