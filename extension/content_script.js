// VỊ TRÍ: extension/content_script.js

const API_BACKEND_URL = "http://localhost:5000";
const FRONTEND_URL = "http://localhost:3000"; 

function getImageUrl(recipeId, coverImage) {
    if (!coverImage || coverImage === 'default.png') return 'https://via.placeholder.com/60?text=Food';
    if (coverImage.startsWith('http') || coverImage.startsWith('blob:')) return coverImage;
    return `${API_BACKEND_URL}/public/recipes/${recipeId}/${coverImage}`;
}

// Xóa modal cũ nếu có
function removeModal() {
    const existingModal = document.getElementById('vaobep-ext-modal');
    if (existingModal) existingModal.remove();
}

// Xóa modal cũ nếu có
function removeModal() {
    const existingModal = document.getElementById('vaobep-ext-modal');
    if (existingModal) existingModal.remove();
}

// Hàm vẽ Modal lên màn hình
// function renderModal(titleText, contentHTML) {
//     removeModal();
    
//     // Tạo thẻ div bọc ngoài cùng
//     const modal = document.createElement('div');
//     modal.id = 'vaobep-ext-modal';
    
//     // CSS trực tiếp (Inline CSS) để không bị ảnh hưởng bởi CSS của web hiện tại
//     modal.style.cssText = `
//         position: fixed; top: 20px; right: 20px; width: 320px;
//         background: white; box-shadow: 0 10px 25px rgba(0,0,0,0.2);
//         border-radius: 12px; z-index: 9999999; font-family: Arial, sans-serif;
//         overflow: hidden; border: 1px solid #ddd;
//     `;

//     modal.innerHTML = `
//         <div style="background: #ff6b6b; color: white; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
//             <h3 style="margin: 0; font-size: 15px;">${titleText}</h3>
//             <button id="vaobep-close-btn" style="background: none; border: none; color: white; cursor: pointer; font-size: 18px;">✖</button>
//         </div>
//         <div style="padding: 10px; max-height: 400px; overflow-y: auto; color: #333;">
//             ${contentHTML}
//         </div>
//     `;

//     document.body.appendChild(modal);

//     // Sự kiện đóng Modal
//     document.getElementById('vaobep-close-btn').addEventListener('click', removeModal);

//     // Gắn sự kiện click cho các item (mở tab mới)
//     const items = modal.querySelectorAll('.vaobep-recipe-item');
//     items.forEach(item => {
//         item.addEventListener('click', () => {
//             window.open(`${FRONTEND_URL}/recipe/${item.dataset.id}`, '_blank');
//         });
//     });
// }
// Hàm vẽ Modal (Hỗ trợ truyền chuỗi HTML an toàn tĩnh hoặc DOM Node động)
function renderModal(titleText, contentData) {
    removeModal();
    
    const modal = document.createElement('div');
    modal.id = 'vaobep-ext-modal';
    modal.style.cssText = `
        position: fixed; top: 20px; right: 20px; width: 320px;
        background: white; box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        border-radius: 12px; z-index: 9999999; font-family: Arial, sans-serif;
        overflow: hidden; border: 1px solid #ddd;
    `;

    // Phần Header tĩnh (An toàn để dùng innerHTML)
    modal.innerHTML = `
        <div style="background: #ff6b6b; color: white; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
            <h3 id="vaobep-modal-title" style="margin: 0; font-size: 15px;"></h3>
            <button id="vaobep-close-btn" style="background: none; border: none; color: white; cursor: pointer; font-size: 18px;">✖</button>
        </div>
        <div id="vaobep-modal-body" style="padding: 10px; max-height: 400px; overflow-y: auto; color: #333;"></div>
    `;

    document.body.appendChild(modal);

    // Gán Text an toàn (Chống XSS từ title)
    document.getElementById('vaobep-modal-title').textContent = titleText;

    // Gán Content an toàn
    const bodyEl = document.getElementById('vaobep-modal-body');
    if (typeof contentData === 'string') {
        bodyEl.innerHTML = contentData; // Dùng cho các thẻ <div> tĩnh báo lỗi/loading
    } else {
        bodyEl.appendChild(contentData); // Dùng cho DOM Node (Chống XSS)
    }

    // Sự kiện đóng
    document.getElementById('vaobep-close-btn').addEventListener('click', removeModal);
}


// Lắng nghe Message từ background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "show_search_loading") {
        renderModal(`Tìm kiếm: ${request.text}`, `<div style="text-align: center; padding: 20px;">Đang tìm công thức... 🍳</div>`);
    }

    if (request.action === "show_search_results") {
        const recipes = request.results;
        
        if (!recipes || recipes.length === 0) {
            renderModal(`Tìm kiếm: ${request.query}`, `<div style="padding: 15px; text-align: center;">Không tìm thấy món nào phù hợp.</div>`);
            return;
        }

        // TẠO DOM NODES THỦ CÔNG ĐỂ CHỐNG XSS
        const listContainer = document.createElement('div');

        recipes.forEach(r => {
            const itemDiv = document.createElement('div');
            itemDiv.className = "vaobep-recipe-item";
            itemDiv.style.cssText = "display: flex; padding: 8px; border-bottom: 1px solid #eee; cursor: pointer; transition: 0.2s;";
            
            // Xử lý sự kiện click an toàn
            itemDiv.addEventListener('click', () => {
                window.open(`${FRONTEND_URL}/recipe/${r.recipe_id}`, '_blank');
            });

            const img = document.createElement('img');
            img.src = getImageUrl(r.recipe_id, r.cover_image);
            img.style.cssText = "width: 50px; height: 50px; border-radius: 6px; object-fit: cover; margin-right: 10px;";

            const textDiv = document.createElement('div');

            const titleH4 = document.createElement('h4');
            titleH4.style.cssText = "margin: 0 0 5px 0; font-size: 14px; font-weight: bold; color: #111;";
            titleH4.textContent = r.title; // CHỐNG XSS: Render text thô, không biên dịch HTML

            const infoSpan = document.createElement('span');
            infoSpan.style.cssText = "font-size: 12px; color: #666;";
            infoSpan.textContent = `⏱ ${r.cook_time} phút | 🔥 ${r.total_calo || '?'} calo`; // CHỐNG XSS

            textDiv.appendChild(titleH4);
            textDiv.appendChild(infoSpan);
            itemDiv.appendChild(img);
            itemDiv.appendChild(textDiv);
            
            listContainer.appendChild(itemDiv);
        });

         renderModal(`Kết quả: ${request.query}`, listContainer);
    }

    if (request.action === "show_search_error") {
        renderModal("Lỗi", `<div style="color: red; padding: 15px;">${request.error}</div>`);
    }

    if (request.action === "start_crop_mode") {
        initCropMode();
    }

    if (request.action === "extract_main_text") {
        let extractedText = "";
        
        // Thuật toán Mini Readability: Ưu tiên lấy chữ trong vùng Nội dung chính
        const mainContent = document.querySelector('article') || document.querySelector('main');
        
        if (mainContent) {
            extractedText = mainContent.innerText;
        } else {
            // Nếu không có thẻ cấu trúc chuẩn, quét lấy tất cả các đoạn văn bản dài
            const pTags = document.querySelectorAll('p');
            pTags.forEach(p => {
                if (p.innerText.length > 50) { // Bỏ qua mấy đoạn chú thích vụn vặt
                    extractedText += p.innerText + "\n";
                }
            });
        }

        // Cắt lấy tối đa 15,000 ký tự (Khoảng 3500 token) để tránh AI bị quá tải (Rate limit)
        const finalText = extractedText.substring(0, 15000).trim();
        
        // Trả kết quả về cho Popup
        sendResponse({ text: finalText });
    }

    return true;
});



// ====== PHẦN CHỨC NĂNG CẮT ẢNH ======

let cropOverlay = null;
let cropBox = null;
let startX = 0, startY = 0;
let isDragging = false;

function initCropMode() {
    // Nếu đang có thì xóa đi làm lại
    if (cropOverlay) cropOverlay.remove();
    
    // Tạo lớp phủ toàn màn hình
    cropOverlay = document.createElement('div');
    cropOverlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.5); z-index: 2147483647; cursor: crosshair;
    `;
    
    // Tạo khung sáng (vùng cắt)
    cropBox = document.createElement('div');
    cropBox.style.cssText = `
        position: absolute; border: 2px dashed #fff; background: rgba(255,255,255,0.1);
        display: none; box-shadow: 0 0 0 9999px rgba(0,0,0,0.5);
    `;
    
    cropOverlay.appendChild(cropBox);
    document.body.appendChild(cropOverlay);

    // Lắng nghe sự kiện chuột
    cropOverlay.addEventListener('mousedown', onMouseDown);
    cropOverlay.addEventListener('mousemove', onMouseMove);
    cropOverlay.addEventListener('mouseup', onMouseUp);
}

function onMouseDown(e) {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    
    cropBox.style.left = startX + 'px';
    cropBox.style.top = startY + 'px';
    cropBox.style.width = '0px';
    cropBox.style.height = '0px';
    cropBox.style.display = 'block';
}

function onMouseMove(e) {
    if (!isDragging) return;
    
    const currentX = e.clientX;
    const currentY = e.clientY;
    
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);
    const left = Math.min(currentX, startX);
    const top = Math.min(currentY, startY);
    
    cropBox.style.width = width + 'px';
    cropBox.style.height = height + 'px';
    cropBox.style.left = left + 'px';
    cropBox.style.top = top + 'px';
}

function onMouseUp(e) {
    isDragging = false;
    
    const rect = cropBox.getBoundingClientRect();
    
    // Nếu người dùng chỉ click chuột chứ ko kéo thì hủy
    if (rect.width < 10 || rect.height < 10) {
        cancelCropMode();
        return;
    }

    // Lấy tỷ lệ pixel của màn hình (ví dụ màn hình Retina trên Macbook)
    const dpr = window.devicePixelRatio;

    // Tọa độ chuẩn bị cắt ảnh (nhân với dpr để cắt chính xác trên màn hình độ phân giải cao)
    const coords = {
        x: rect.left * dpr,
        y: rect.top * dpr,
        width: rect.width * dpr,
        height: rect.height * dpr
    };

    // Ẩn lớp phủ đi trước khi chụp màn hình (để ảnh chụp không bị tối)
    cropOverlay.style.background = 'transparent';
    cropBox.style.boxShadow = 'none';
    cropBox.style.border = 'none';

    // Đợi 100ms cho UI cập nhật, rồi báo background chụp ảnh
    setTimeout(() => {
        chrome.runtime.sendMessage({ action: "capture_and_crop", coords: coords });
        cancelCropMode(); 
        // Hiển thị khung chờ ngay sau khi cắt
        renderModal("AI Đang phân tích ảnh", `<div style="text-align: center; padding: 20px;">Vui lòng đợi vài giây... 🤖🍳</div>`);
    }, 100);
}

function cancelCropMode() {
    if (cropOverlay) {
        cropOverlay.remove();
        cropOverlay = null;
        cropBox = null;
    }
}
