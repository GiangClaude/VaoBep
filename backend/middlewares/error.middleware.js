// VỊ TRÍ: backend/middlewares/error.middleware.js

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // In lỗi ra console để dev dễ debug
    console.error('🔥 [ERROR]', err.message);
    if (process.env.NODE_ENV !== 'production') {
        console.error(err.stack);
    }

    // 1. Lỗi trùng lặp dữ liệu của MySQL
    if (err.code === 'ER_DUP_ENTRY') {
        err.statusCode = 400;
        err.message = 'Dữ liệu này đã tồn tại trong hệ thống!';
    }

    // 2. Lỗi Token xác thực (JWT)
    if (err.name === 'TokenExpiredError') {
        err.statusCode = 401;
        err.message = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    }
    if (err.name === 'JsonWebTokenError') {
        err.statusCode = 401;
        err.message = 'Token xác thực không hợp lệ hoặc đã bị thay đổi.';
    }

    // 3. Lỗi Upload File (Multer)
    if (err.name === 'MulterError') {
        err.statusCode = 400;
        if (err.code === 'LIMIT_FILE_SIZE') {
            err.message = 'Kích thước file quá lớn. Vui lòng upload file dưới 5MB.';
        } else {
            err.message = `Lỗi tải file: ${err.message}`;
        }
    }

    // Trả về response chuẩn
    res.status(err.statusCode).json({
        success: false,
        status: err.status,
        message: err.message,
        // Có thể mở comment dòng dưới để trả stack trace về cho FE nếu đang ở môi trường DEV
        // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = errorHandler;