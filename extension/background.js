// VỊ TRÍ: extension/background.js

const API_URL = "http://localhost:5000/api/extension";

// 1. Tạo Menu Chuột Phải khi Extension được cài đặt
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "searchRecipeMenu",
    title: "Tìm công thức '%s' trên Vào Bếp",
    contexts: ["selection"] // Chỉ hiện khi bôi đen text
  });
});

// 2. Lắng nghe sự kiện click vào Menu
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "searchRecipeMenu") {
    const selectedText = info.selectionText;

    // Gửi thông báo cho Tab hiện tại hiển thị "Đang tìm kiếm..."
    chrome.tabs.sendMessage(tab.id, { 
        action: "show_search_loading", 
        text: selectedText 
    });

    // Gọi API Backend tìm kiếm món ăn (Sử dụng API Search đã tạo ở Bước 3)
    fetch(`${API_URL}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: selectedText })
    })
    .then(response => response.json())
    .then(data => {
      // Nhận kết quả xong, gửi lệnh sang content_script.js để hiển thị UI
      chrome.tabs.sendMessage(tab.id, { 
          action: "show_search_results", 
          query: selectedText,
          results: data.data 
      });
    })
    .catch(error => {
      console.error("Lỗi tìm kiếm:", error);
      chrome.tabs.sendMessage(tab.id, { 
          action: "show_search_error", 
          error: "Không thể kết nối đến máy chủ." 
      });
    });
  }
});

// ====== THÊM MỚI: XỬ LÝ ẢNH CẮT ======

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "capture_and_crop") {
        const coords = request.coords;
        const tabId = sender.tab.id;

        // Chụp toàn bộ màn hình của Tab hiện tại
        chrome.tabs.captureVisibleTab(null, { format: "jpeg", quality: 100 }, (dataUrl) => {
            if (chrome.runtime.lastError) {
                chrome.tabs.sendMessage(tabId, { action: "show_search_error", error: "Không thể chụp màn hình." });
                return;
            }

            // dataUrl là chuỗi Base64 của toàn bộ màn hình
            // Bắt đầu dùng OffscreenCanvas (Tính năng của Manifest V3) để cắt ảnh ngầm
            cropImageWithCanvas(dataUrl, coords)
                .then(croppedBase64 => {
                    // Gửi ảnh đã cắt lên Backend AI
                    return fetch(`${API_URL}/identify-image`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ image: croppedBase64 })
                    });
                })
                .then(res => res.json())
                .then(data => {
                    // Báo kết quả về lại trang web
                    if (data.success) {
                        chrome.tabs.sendMessage(tabId, { 
                            action: "show_search_results", 
                            query: `AI nhận diện ${data.dishName}`,
                            results: data.data 
                        });
                    } else {
                        chrome.tabs.sendMessage(tabId, { action: "show_search_error", error: data.message });
                    }
                })
                .catch(err => {
                    console.error("Lỗi cắt/gửi ảnh:", err);
                    chrome.tabs.sendMessage(tabId, { action: "show_search_error", error: "AI bận, vui lòng thử lại." });
                });
        });
    }
});

// Hàm hỗ trợ: Cắt ảnh bằng thẻ Canvas ảo
// VỊ TRÍ: extension/background.js (Thay thế hàm cũ ở dưới cùng)

async function cropImageWithCanvas(dataUrl, coords) {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const imageBitmap = await createImageBitmap(blob);
    
    // THÊM LOGIC NÉN ẢNH: Giới hạn kích thước tối đa là 800px để AI phân tích siêu nhanh
    const MAX_SIZE = 800;
    let targetWidth = coords.width;
    let targetHeight = coords.height;

    if (targetWidth > MAX_SIZE || targetHeight > MAX_SIZE) {
        const ratio = Math.min(MAX_SIZE / targetWidth, MAX_SIZE / targetHeight);
        targetWidth = Math.round(targetWidth * ratio);
        targetHeight = Math.round(targetHeight * ratio);
    }
    
    // Tạo Canvas với kích thước đã thu nhỏ
    const canvas = new OffscreenCanvas(targetWidth, targetHeight);
    const ctx = canvas.getContext('2d');
    
    // Vẽ và tự động thu nhỏ ảnh gốc vừa khít với Canvas mới
    ctx.drawImage(
        imageBitmap, 
        coords.x, coords.y, coords.width, coords.height, // Tọa độ cắt gốc
        0, 0, targetWidth, targetHeight                  // Tọa độ vẽ thu nhỏ
    );
    
    // Giảm chất lượng ảnh (Quality: 0.7 tương đương 70%) để giảm dung lượng file xuống cực nhẹ
    const croppedBlob = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.7 });
    
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(croppedBlob);
    });
}