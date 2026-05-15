// VỊ TRÍ: extension/popup.js

const API_BACKEND_URL = "http://localhost:5000";
const FRONTEND_URL = "http://localhost:3000"; // Link React web của bạn

// Hàm xử lý đường dẫn ảnh (Giống hệt logic trong web của bạn)
function getRecipeImageUrl(recipeId, cover_image) {
    if (!cover_image || cover_image === 'default.png') return 'https://via.placeholder.com/60?text=Food';
    if (cover_image.startsWith('http') || cover_image.startsWith('blob:')) return cover_image;
    return `${API_BACKEND_URL}/public/recipes/${recipeId}/${cover_image}`;
}

document.addEventListener('DOMContentLoaded', () => {
    const suggestList = document.getElementById('suggestList');
    const loadingSuggest = document.getElementById('loadingSuggest');

    // Gọi API lấy 3 món ngẫu nhiên
    fetch(`${API_BACKEND_URL}/api/extension/suggest`)
        .then(res => res.json())
        .then(data => {
            loadingSuggest.style.display = 'none';
            if (data.success && data.data.length > 0) {
                data.data.forEach(recipe => {
                    // Tạo Element cho từng món ăn
                    const card = document.createElement('div');
                    card.className = 'recipe-card';
                    card.innerHTML = `
                        <img class="recipe-img" src="${getRecipeImageUrl(recipe.recipe_id, recipe.cover_image)}" alt="${recipe.title}">
                        <div class="recipe-info">
                            <h4>${recipe.title}</h4>
                            <p>⏱ ${recipe.cook_time} phút | 🔥 ${recipe.total_calo || '?'} calo</p>
                        </div>
                    `;
                    
                    // Khi click vào món ăn -> Mở tab mới dẫn về trang web
                    card.addEventListener('click', () => {
                        chrome.tabs.create({ url: `${FRONTEND_URL}/recipe/${recipe.recipe_id}` });
                    });

                    suggestList.appendChild(card);
                });
            } else {
                suggestList.innerHTML = '<p class="loading">Không có dữ liệu.</p>';
            }
        })
        .catch(err => {
            loadingSuggest.innerHTML = 'Lỗi kết nối máy chủ.';
            console.error(err);
        });
});

// ... code fetch suggest cũ ...

    // THÊM MỚI: Bắt sự kiện bấm nút Quét Ảnh
    const btnCropImage = document.getElementById('btnCropImage');
    if (btnCropImage) {
        btnCropImage.addEventListener('click', () => {
            // Lấy ID của tab hiện tại mà người dùng đang mở
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs.length === 0) return;
                const activeTab = tabs[0];
                
                // Gửi lệnh xuống content_script bảo nó bật chế độ cắt ảnh
                chrome.tabs.sendMessage(activeTab.id, { action: "start_crop_mode" });
                
                // Đóng popup Extension đi để người dùng thao tác trên màn hình web
                window.close(); 
            });
        });
    }
// ====== CHỨC NĂNG AI ĐỌC BÁO (CONTEXT Q&A) ======

let currentWebText = ""; // Biến lưu tạm nội dung trang web

document.addEventListener('DOMContentLoaded', () => {
    // (Phần code suggest món ăn cũ của bạn đang nằm ở đây, giữ nguyên)

    const btnAskAi = document.getElementById('btnAskAi');
    const aiQuestionInput = document.getElementById('aiQuestionInput');
    const aiResponseBox = document.getElementById('aiResponseBox');

    // 1. Ngay khi mở Popup, yêu cầu Content Script bóc chữ trang web hiện tại
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) return;
        chrome.tabs.sendMessage(tabs[0].id, { action: "extract_main_text" }, (response) => {
            if (response && response.text) {
                currentWebText = response.text;
                console.log("Đã bóc tách được", currentWebText.length, "ký tự.");
            }
        });
    });

    // 2. Xử lý khi bấm nút "Hỏi" (Hoặc bấm phím Enter)
    const handleAskAi = () => {
        const question = aiQuestionInput.value.trim();
        if (!question) return;

        // Hiện trạng thái Loading
        aiResponseBox.style.display = 'block';
        aiResponseBox.innerHTML = '<em>Đang suy nghĩ... 🤔</em>';
        aiQuestionInput.value = ''; // Xóa trắng ô input

        // Gọi API Backend
        fetch(`${API_BACKEND_URL}/api/extension/ask-context`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                context: currentWebText,
                question: question
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                console.log("AI trả lời:", data.text);
                // Hiển thị câu trả lời (Dùng Regex để chuyển xuống dòng \n thành <br>)
                aiResponseBox.innerHTML = `<strong>AI:</strong> ${data.text.replace(/\n/g, '<br>')}`;
            } else {
                aiResponseBox.innerHTML = `<span style="color:red">Lỗi: ${data.message}</span>`;
            }
        })
        .catch(err => {
            aiResponseBox.innerHTML = `<span style="color:red">Lỗi kết nối máy chủ.</span>`;
            console.error("Lỗi Q&A:", err);
        });
    };

    if (btnAskAi) btnAskAi.addEventListener('click', handleAskAi);
    
    // Cho phép bấm Enter để gửi
    if (aiQuestionInput) {
        aiQuestionInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleAskAi();
        });
    }
});