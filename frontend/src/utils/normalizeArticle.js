import { getAvatarUrl, getArticleImageUrl, getRecipeImageUrl } from "./imageHelper";

// Hàm chuẩn hóa 1 object bài viết từ DB sang định dạng Frontend cần
export function normalizeArticle(a) {
  if (!a) return null;
  
  // Chuẩn hóa danh sách recipes gắn kèm (nếu có)
  const rawRecipes = a.linked_recipes || a.recipes || [];
  const normalizedRecipes = rawRecipes.map(r => ({
    id: r.recipe_id || r.id,
    title: r.title || r.name || r.recipe_title || '',
    image: getRecipeImageUrl(r.recipe_id || r.id, r.cover_image || r.coverImage),
    authorName: r.author_name || r.authorName || ''
  }));

  return {
    id: a.article_id || a.id,
    title: a.title || "",
    excerpt: a.description || "", // Đổi tên 'description' thành 'excerpt' cho khớp ArticleCard
    content: a.content || "",
    image: a.cover_image ? getArticleImageUrl(a.article_id || a.id, a.cover_image) : (a.image || null),
    status: a.status || "public",
    readTime: a.read_time ? `${a.read_time} phút` : "1 phút",
    tags: (a.tags || []).map(t => ({
      id: t.tag_id || t.id,
      name: t.name
    })),
    createdAt: a.created_at || null,
    recipes: normalizedRecipes,
    // Format ngày tháng sang chuẩn Việt Nam (VD: 25/10/2023)
    date: a.created_at ? new Date(a.created_at).toLocaleDateString('vi-VN') : "",
    
    // Gắn thêm chữ "phút đọc" vào sau số phút lấy từ DB
    
    author: {
      id: a.author_id || a.user_id,
      name: a.author_name || "Chuyên gia",
      avatar: getAvatarUrl(a.author_id || a.user_id, a.author_avatar)
    },
    reportCount: a.report_count !== undefined ? Number(a.report_count) : 0,
    
    // Lấy tên của Tag đầu tiên làm Category. Nếu không có tag nào thì để mặc định
    category: (a.tags && a.tags.length > 0) ? a.tags[0].name : "Ẩm thực",
    
    // Giữ lại mảng tags gốc nguyên bản phòng khi trang Detail cần dùng
    // rawTags: a.tags || [],
    // Thêm nội dung đầy đủ và bình luận nếu có để trang detail dùng
    comments: a.comments || [],
    totalComments: a.total_comments || (a.comment_count !== undefined ? Number(a.comment_count) : 0),
    // Ngày thô để hiển thị theo nhiều định dạng nếu cần
    // createdAtRaw: a.created_at || null,
    linkedRecipes: a.linked_recipes || [] // Thêm trường này để lưu công thức liên kết nếu có
  };
}

// Hàm chuẩn hóa 1 mảng các bài viết
export function normalizeArticleList(arr) {
  return Array.isArray(arr) ? arr.map(normalizeArticle) : [];
}