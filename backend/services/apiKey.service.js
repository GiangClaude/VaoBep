// VỊ TRÍ TẠO FILE MỚI: backend/services/apiKey.service.js

const { createClient } = require('redis');

// Khởi tạo Redis client độc lập cho ApiKey Service
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisClient = createClient({ url: redisUrl });

redisClient.on('error', (err) => console.error('❌ Redis Error in API Key Service:', err.message));
redisClient.connect().catch(() => {});

// Lấy danh sách keys từ .env (Hỗ trợ fallback về GOOGLE_API_KEY cũ nếu quên setup)
const rawKeys = process.env.GEMINI_API_KEYS || process.env.GOOGLE_API_KEY;
const API_KEYS = rawKeys ? rawKeys.split(',').map(k => k.trim()).filter(Boolean) : [];
const MAX_REQ_PER_MIN = parseInt(process.env.GEMINI_RATE_LIMIT || '14', 10);

/**
 * Thuật toán lấy API Key khả dụng (Round-robin kết hợp Redis Rate Limit)
 */
async function getAvailableKey() {
  if (API_KEYS.length === 0) {
    throw new Error('Chưa cấu hình GEMINI_API_KEYS trong file .env');
  }

  // Nếu Redis không hoạt động, fallback chọn ngẫu nhiên một key để hệ thống không bị chết
  if (!redisClient.isOpen) {
    console.warn('⚠️ Redis không hoạt động, sử dụng Random API Key.');
    return API_KEYS[Math.floor(Math.random() * API_KEYS.length)];
  }

  // Lặp qua từng key để kiểm tra rate limit
  for (const key of API_KEYS) {
    // Lưu Redis key theo 6 ký tự cuối của API Key để dễ debug mà không lộ full key
    const redisKey = `ratelimit:gemini:${key.slice(-6)}`; 
    
    try {
      const currentCount = await redisClient.get(redisKey);
      
      // Nếu chưa có (0) hoặc vẫn nhỏ hơn hạn mức
      if (!currentCount || parseInt(currentCount) < MAX_REQ_PER_MIN) {
        // Dùng Multi để đảm bảo tính nguyên tử (Atomic) khi tăng biến đếm
        const multi = redisClient.multi();
        multi.incr(redisKey);
        
        // Nếu là request đầu tiên, set thời gian sống là 60 giây (1 phút)
        if (!currentCount) {
          multi.expire(redisKey, 60); 
        }
        
        await multi.exec();
        return key; // Trả về key hợp lệ này để dùng
      }
    } catch (err) {
      console.error('Lỗi khi check Redis API Key:', err.message);
      // Bỏ qua lỗi Redis của key này, thử tiếp key sau
    }
  }

  // Nếu vòng lặp chạy hết mà không return được -> TẤT CẢ KEYS ĐỀU QUÁ TẢI
  throw new Error('RATE_LIMIT_EXCEEDED: Hệ thống AI đang quá tải. Vui lòng thử lại sau 1 phút.');
}

module.exports = { getAvailableKey };