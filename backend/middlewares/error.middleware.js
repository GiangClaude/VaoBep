const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // In lỗi ra console để dev dễ debug
    console.error('🔥 [ERROR]', err.message);
    if (process.env.NODE_ENV !== 'production') {
        console.error(err.stack);
    }

    // Xử lý một số lỗi đặc thù của MySQL (Ví dụ lỗi Duplicate Data)
    if (err.code === 'ER_DUP_ENTRY') {
        err.statusCode = 400;
        err.message = 'Dữ liệu đã tồn tại trong hệ thống!';
    }

    res.status(err.statusCode).json({
        success: false,
        status: err.status,
        message: err.message,
        // Có thể mở comment dòng dưới để trả stack trace về cho FE nếu đang dev
        // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = errorHandler;