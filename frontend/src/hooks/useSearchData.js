import { useState, useEffect } from "react";
import userApi from "../api/userApi";
import recipeApi from "../api/recipeApi";
import interactionApi from "../api/interactionApi";
import { mockUsers, mockRecipes, mockArticles } from "../data/mockSearchData";
import { getAvatarUrl, getRecipeImageUrl } from "../utils/imageHelper";
// Cấu hình URL Backend (theo các file bạn gửi là port 5000)
const API_BASE_URL = "http://localhost:5000";

export const useSearchData = ({ keyword, activeTab, userSort, recipeFilter }) => {
  const [users, setUsers] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // Nếu không có keyword thì không search (hoặc tùy logic của bạn)
      if (!keyword) return;

      setLoading(true);
      try {
        const USE_MOCK_DATA = false; // Toggle mock data tại đây

        if (USE_MOCK_DATA) {
            setTimeout(() => {
                setUsers(mockUsers);
                setRecipes(mockRecipes);
                setArticles(mockArticles);
                setLoading(false);
            }, 800);
        } else {
            // Logic tính limit dựa trên activeTab (giữ nguyên logic cũ)
            const limitUser = activeTab === "user" ? 12 : 10;
            const limitRecipe = activeTab === "recipe" ? 12 : 8;

            // Gọi API song song
            const [userRes, recipeRes] = await Promise.all([
                // 1. Search Users
                userApi.searchUsers({ 
                    keyword: keyword, 
                    limit: limitUser, 
                    sort: userSort 
                }),
                
                // 2. Search Recipes
                recipeApi.getAllRecipes({ 
                    keyword: keyword, 
                    limit: limitRecipe, 
                    ...recipeFilter 
                })
            ]);

            // --- CHUẨN HÓA DỮ LIỆU USER ---
            const normalizedUsers = (userRes.data.data || []).map(user => ({
                ...user,
                // Xử lý avatar user
            }));

            // --- CHUẨN HÓA DỮ LIỆU RECIPE ---
            const normalizedRecipes = (recipeRes.data.data || []).map(recipe => ({
                ...recipe,
                // Xử lý ảnh bìa recipe
                // Xử lý avatar tác giả trong recipe
                // Format lại các trường hiển thị khác
                displayCookTime: recipe.cook_time ? `${recipe.cook_time} phút` : "N/A",
                displayServings: recipe.servings ? `${recipe.servings} người` : "N/A"
            }));

            setUsers(normalizedUsers);
            setRecipes(normalizedRecipes);
            setArticles(mockArticles); // Article chưa có API search nên dùng mock
        }
      } catch (error) {
        console.error("Search Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [keyword, activeTab, userSort, recipeFilter]);

  const handleFollowUser = async (userId) => {
    // A. Optimistic Update: Cập nhật giao diện ngay lập tức
    setUsers((prevUsers) =>
      prevUsers.map((u) => {
        if (u.user_id === userId) {
          const isNowFollowing = !u.isFollowing;
          return {
            ...u,
            isFollowing: isNowFollowing,
            // Tự động tăng/giảm số follower để UI mượt mà
            followers_count: u.followers_count + (isNowFollowing ? 1 : -1),
          };
        }
        return u;
      })
    );
    try {
      await interactionApi.followUser(userId);
    } catch (error) {
      console.error("Lỗi follow:", error);
      // C. Revert (Hoàn tác) nếu lỗi
      setUsers((prevUsers) =>
        prevUsers.map((u) => {
          if (u.user_id === userId) {
            const isRevertedFollowing = !u.isFollowing;
            return {
              ...u,
              isFollowing: isRevertedFollowing,
              followers_count: u.followers_count + (isRevertedFollowing ? 1 : -1),
            };
          }
          return u;
        })
      );
      alert("Có lỗi xảy ra, vui lòng thử lại.");
    }
  };


  return { users, recipes, articles, loading, handleFollowUser };
};