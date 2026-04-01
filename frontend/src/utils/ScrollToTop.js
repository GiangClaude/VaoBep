import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Hàm ScrollToTop: Một React Component không render ra UI.
 * Nhiệm vụ: Lắng nghe sự thay đổi của pathname (URL) và gọi hàm cuộn trang lên vị trí tọa độ (0, 0).
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Thực hiện cuộn trang mượt mà lên đầu mỗi khi đường dẫn thay đổi
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth" // Nếu ông muốn nó giật lên ngay lập tức thì đổi thành "auto"
    });
  }, [pathname]);

  return null; // Component này chỉ chạy logic, không hiển thị gì cả
}