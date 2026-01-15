// frontend/src/api/interactionApi.js
import apiClient from "./index";

const interactionApi = {
    // 1. Lấy trạng thái tương tác ban đầu (Đã like chưa? Đã lưu chưa? Đánh giá mấy sao?)
    getInteractionState: async (postId, postType = 'recipe') => {
        const response = await apiClient.get('/interaction/state', {
            params: { postId, postType }
        });
        return response;
    },

    // 2. Like / Unlike
    toggleLike: async (postId, postType = 'recipe') => {
        const response = await apiClient.post('/interaction/like', { postId, postType });
        return response;
    },

    // 3. Save / Unsave (Bookmark)
    toggleSave: async (postId, postType = 'recipe') => {
        const response = await apiClient.post('/interaction/save', { postId, postType });
        return response;
    },

    // 4. Gửi bình luận
    postComment: async (postId, content, postType = 'recipe') => {
        const response = await apiClient.post('/interaction/comment', { postId, postType, content });
        return response;
    },

    // 5. Lấy danh sách bình luận (Có phân trang)
    getComments: async (postId, postType = 'recipe', page = 1) => {
        const response = await apiClient.get('/interaction/comments', {
            params: { postId, postType, page, limit: 10 }
        });
        return response;
    },

    // 6. Đánh giá (Rating)
    ratePost: async (postId, score, postType = 'recipe') => {
        const response = await apiClient.post('/interaction/rate', { postId, postType, score });
        return response;
    },

    followUser: async (followingId) => {
        // Backend yêu cầu body: { followingId: "..." }
        const response = await apiClient.post('/interaction/follow', { followingId });
        return response;
    }
};

export default interactionApi;