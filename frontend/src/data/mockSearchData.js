// frontend/src/data/mockSearchData.js

export const mockUsers = [
  {
    user_id: "u1",
    full_name: "Hoàng Thái A",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    bio: "Đam mê nấu ăn và chia sẻ công thức ngon mỗi ngày.",
    followers_count: 120,
    created_at: "2024-01-01"
  },
  {
    user_id: "u2",
    full_name: "Bếp Của Mẹ",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    bio: "Chuyên các món ăn gia đình truyền thống Việt Nam.",
    followers_count: 3500,
    created_at: "2023-05-15"
  },
  {
    user_id: "u3",
    full_name: "Chef Tùng",
    avatar: "https://i.pravatar.cc/150?u=a04258114e29026302d",
    bio: "Đầu bếp chuyên nghiệp 5 sao.",
    followers_count: 890,
    created_at: "2024-02-20"
  }
];

export const mockRecipes = [
  {
    recipe_id: "r1",
    title: "Gà Nướng Mật Ong",
    description: "Món gà nướng thơm lừng, da giòn thịt mềm, thấm đẫm sốt mật ong ngọt ngào.",
    cover_image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    author_name: "Hoàng Thái A",
    author_avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    cook_time: 45,
    servings: 4,
    like_count: 250,
    rating_avg_score: 4.8,
    total_calo: 500,
    status: "public"
  },
  {
    recipe_id: "r2",
    title: "Thịt Kho Tàu",
    description: "Món ăn không thể thiếu trong ngày Tết, thịt mềm rục, trứng thấm vị.",
    cover_image: "https://images.unsplash.com/photo-1696472496228-206236b27429?q=80&w=2574&auto=format&fit=crop",
    author_name: "Bếp Của Mẹ",
    author_avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    cook_time: 90,
    servings: 6,
    like_count: 1200,
    rating_avg_score: 5.0,
    total_calo: 650,
    status: "public"
  },
  {
    recipe_id: "r3",
    title: "Phở Gà Hà Nội",
    description: "Nước dùng thanh ngọt, bánh phở mềm dai, thịt gà ta xé phay hấp dẫn.",
    cover_image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    author_name: "Chef Tùng",
    author_avatar: "https://i.pravatar.cc/150?u=a04258114e29026302d",
    cook_time: 120,
    servings: 4,
    like_count: 560,
    rating_avg_score: 4.5,
    total_calo: 450,
    status: "public"
  }
];

export const mockArticles = [
  {
    id: "a1",
    title: "Lợi ích của thịt gà đối với sức khỏe",
    author: "Dinh Dưỡng Học",
    date: "12/05/2025",
    readTime: "5 phút",
    excerpt: "Thịt gà là nguồn cung cấp protein tuyệt vời, ít chất béo và giàu vitamin...",
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "a2",
    title: "Cách chọn thịt heo tươi ngon",
    author: "Mẹo Vặt",
    date: "10/05/2025",
    readTime: "3 phút",
    excerpt: "Bí quyết chọn thịt heo ngon, không chất bảo quản, đảm bảo an toàn vệ sinh...",
    image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
  }
];