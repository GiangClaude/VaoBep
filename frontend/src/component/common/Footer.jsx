import { Facebook, MessageCircle, Send, Video } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-[#2d1b0e] to-[#4a3426] text-white py-12 mt-20">
      <div className="w-full px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Contact Form */}
          <div>
            <h3 className="text-2xl mb-4">Liên hệ với chúng tôi</h3>
            <p className="text-white/80 mb-6">
              Gửi ý kiến đóng góp hoặc câu hỏi của bạn cho chúng tôi
            </p>
            
            <form className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Họ và tên"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-[#ffc857] focus:outline-none focus:bg-white/15 transition-all placeholder:text-white/50"
                />
              </div>
              
              <div>
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-[#ffc857] focus:outline-none focus:bg-white/15 transition-all placeholder:text-white/50"
                />
              </div>
              
              <div>
                <textarea
                  placeholder="Nội dung tin nhắn..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-[#ffc857] focus:outline-none focus:bg-white/15 transition-all resize-none placeholder:text-white/50"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#ff6b35] to-[#f7931e] hover:from-[#f7931e] hover:to-[#ff6b35] text-white py-3 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                <span>Gửi tin nhắn</span>
              </button>
            </form>
          </div>

          {/* Social Links & Info */}
          <div className="flex flex-col justify-between">
            <div>
              <h3 className="text-2xl mb-4">Kết nối với chúng tôi</h3>
              <p className="text-white/80 mb-6">
                Theo dõi VaoBep.com trên các nền tảng mạng xã hội để cập nhật công thức mới nhất
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <a
                href="#"
                className="flex items-center gap-3 bg-white/10 hover:bg-[#1877f2] backdrop-blur-sm px-6 py-3 rounded-xl transition-all group border border-white/20 hover:border-[#1877f2]"
              >
                <Facebook className="w-6 h-6" />
                <span className="hidden sm:inline">Facebook</span>
              </a>
              
              <a
                href="#"
                className="flex items-center gap-3 bg-white/10 hover:bg-[#5865f2] backdrop-blur-sm px-6 py-3 rounded-xl transition-all group border border-white/20 hover:border-[#5865f2]"
              >
                <MessageCircle className="w-6 h-6" />
                <span className="hidden sm:inline">Discord</span>
              </a>
              
              <a
                href="#"
                className="flex items-center gap-3 bg-white/10 hover:bg-[#0068ff] backdrop-blur-sm px-6 py-3 rounded-xl transition-all group border border-white/20 hover:border-[#0068ff]"
              >
                <div className="w-6 h-6 rounded-full bg-white text-[#0068ff] flex items-center justify-center text-sm">
                  Z
                </div>
                <span className="hidden sm:inline">Zalo</span>
              </a>
              
              <a
                href="#"
                className="flex items-center gap-3 bg-white/10 hover:bg-black backdrop-blur-sm px-6 py-3 rounded-xl transition-all group border border-white/20 hover:border-black"
              >
                <Video className="w-6 h-6" />
                <span className="hidden sm:inline">TikTok</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8 text-center">
          <p className="text-white/60">
            © 2024 VaoBep.com - Nền tảng chia sẻ công thức nấu ăn hàng đầu Việt Nam
          </p>
        </div>
      </div>
    </footer>
  );
}