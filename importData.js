// Chuỗi dữ liệu thô bà cung cấp
const rawData = `source_recipe_id,linked_post_id,linked_post_type
1be77414-6e5c-4c6e-9876-a6286cb3b677,0fd39fbe-c112-4da2-ba48-a9ae91ca62c8,recipe
1be77414-6e5c-4c6e-9876-a6286cb3b677,16b2c3d4-d0a2-11f0-8b2b-0a002700000f,recipe
1be77414-6e5c-4c6e-9876-a6286cb3b677,49e5f607-d0a5-11f0-8b2b-0a002700000f,recipe
1be77414-6e5c-4c6e-9876-a6286cb3b677,4ff576cc-cafa-11f0-a5ac-0a002700000f,recipe
1be77414-6e5c-4c6e-9876-a6286cb3b677,5af60718-d0a6-11f0-8b2b-0a002700000f,recipe
1be77414-6e5c-4c6e-9876-a6286cb3b677,c5301c53-f248-11f0-bb4f-0a002700000f,recipe
34d45a8a-d0b4-442a-bf70-0b9307e0e986,86086e1f-cafa-11f0-a5ac-0a002700000f,recipe
3dbde6bc-8437-4637-aa1e-e9e2cfdd1f2c,0fd39fbe-c112-4da2-ba48-a9ae91ca62c8,recipe
6eaecb4f-f10b-4206-a5de-12f672a3a784,0fd39fbe-c112-4da2-ba48-a9ae91ca62c8,recipe
896aafd6-2a55-423f-853d-a77c14008a1a,0fd39fbe-c112-4da2-ba48-a9ae91ca62c8,recipe
896aafd6-2a55-423f-853d-a77c14008a1a,c5301eed-f248-11f0-bb4f-0a002700000f,recipe
a6a6a91d-4f9b-4e4a-8d44-fab194dcd2d5,0fd39fbe-c112-4da2-ba48-a9ae91ca62c8,recipe
b5eee0b0-8ab2-479b-9966-05590dfcd4b3,c52fbc39-f248-11f0-bb4f-0a002700000f,recipe
dff8ee70-c0f0-4bbc-a4e2-81cf36fb1301,082f84f4-5f3f-4369-a8f4-1b1bb27c5efa,recipe
f1a97c23-a8e9-4062-a912-0cb60f06ce91,5af60718-d0a6-11f0-8b2b-0a002700000f,recipe
f67733c3-77c1-4f59-bec6-d636218a97fa,0fd39fbe-c112-4da2-ba48-a9ae91ca62c8,recipe
f74efdec-d602-431d-bc85-867cc836d3c4,5af60718-d0a6-11f0-8b2b-0a002700000f,c`;

// Hàm này tách chuỗi CSV thành mảng, lặp qua từng dòng, hoán đổi 2 ID và trả về mảng các câu lệnh UPDATE SQL tương ứng.
function generateSwapQueries(csvData, tableName) {
    // Tách dòng và bỏ qua dòng tiêu đề đầu tiên
    const lines = csvData.trim().split('\n').slice(1);
    
    return lines.map(line => {
        // Tách các cột theo dấu phẩy
        const [sourceId, linkedId, type] = line.split(',');
        
        // Trả về câu lệnh UPDATE: Gán source mới = linked cũ, linked mới = source cũ, type = 'article', điều kiện WHERE là các ID cũ để tìm đúng dòng
        return `UPDATE ${tableName} SET source_recipe_id = '${linkedId.trim()}', linked_post_id = '${sourceId.trim()}', linked_post_type = 'article' WHERE source_recipe_id = '${sourceId.trim()}' AND linked_post_id = '${linkedId.trim()}';`;
    });
}

// Thay 'ten_bang_cua_ba' bằng tên bảng thực tế trong database
const queries = generateSwapQueries(rawData, 'Recipe_Post_Links');

// In kết quả ra console
console.log(queries.join('\n'));