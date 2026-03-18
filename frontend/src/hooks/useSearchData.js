import { useState, useEffect } from "react";
import userApi from "../api/userApi";
import recipeApi from "../api/recipeApi";
import interactionApi from "../api/interactionApi";
import articleApi from "../api/articleApi";
import { mockUsers, mockRecipes, mockArticles } from "../data/mockSearchData";
import { getAvatarUrl, getRecipeImageUrl } from "../utils/imageHelper";
import { normalizeRecipeList } from "../utils/normalizeRecipe";
import { normalizeArticleList } from "../utils/normalizeArticle"; 
export const useSearchData = ({ keyword, activeTab, userSort, recipeFilter, articleFilter, page = 1 }) => {
  const [users, setUsers] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // Nếu không có keyword thì không search (hoặc tùy logic của bạn)
      if (!keyword) return;

      setLoading(true);
      try {
        const USE_MOCK_DATA = false; // Toggle mock data tại đây
            const limit = activeTab === "all" ? 8 : 12;
            // Logic tính limit dựa trên activeTab (giữ nguyên logic cũ)
            const limitUser = activeTab === "user" ? 12 : 10;
            const limitRecipe = activeTab === "recipe" ? 12 : 8;


            const normRecipeFilter = {
              ...recipeFilter,
              tags: recipeFilter?.tags?.join(','),
            };

            const normArticleFilter = {
              q: keyword,
              sort: articleFilter?.sort || 'newest',
              tags: articleFilter?.tags?.join(','),
              limit,
              page
            };

            const promises = [];

            if (activeTab === 'all' || activeTab === 'user') {
                promises.push(userApi.searchUsers({ keyword, limit, sort: userSort, page }));
            } else promises.push(Promise.resolve(null));

            if (activeTab === 'all' || activeTab === 'recipe') {
                promises.push(recipeApi.getAllRecipes({ keyword, limit, ...normRecipeFilter, page }));
            } else promises.push(Promise.resolve(null));

            if (activeTab === 'all' || activeTab === 'article') {
                promises.push(articleApi.getPublicArticles(normArticleFilter));
            } else promises.push(Promise.resolve(null));

            // Chuẩn hóa filter trước khi truyền vào API
            // const normalizedFilter = {
            //   ...recipeFilter,
            //   tags: Array.isArray(recipeFilter.tags) && recipeFilter.tags.length > 0 ? recipeFilter.tags.join(',') : undefined,
            //   cookingTime: recipeFilter.cookingTime || undefined,
            //   minRating: recipeFilter.minRating > 0 ? recipeFilter.minRating : undefined
            // };

            // Gọi API song song
            const [userRes, recipeRes, articleRes] = await Promise.all(promises);

            // --- CHUẨN HÓA DỮ LIỆU USER ---
            if (userRes) setUsers(userRes.data.data || []);
            if (recipeRes) setRecipes(normalizeRecipeList(recipeRes.data.data || []));
            
            if (articleRes) {
                setArticles(normalizeArticleList(articleRes.data.data || []));
                // Lưu thông tin phân trang từ Backend trả về
                setPagination(articleRes.data.pagination || {});
            }
      } catch (error) {
        console.error("Search Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [keyword, activeTab, userSort, recipeFilter, articleFilter, page]);

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


  return { users, recipes, articles, pagination, loading, handleFollowUser };
};