import { useState } from "react";
import interactionApi from "../api/interactionApi";

const repliesCache = {};
export default function useCommentData() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 1. Lấy danh sách comment gốc (có phân trang)
    const getRootComments = async (postId, postType, page = 1) => {
        setLoading(true);
        try {
            const res = await interactionApi.getComments(postId, postType, page);
            return res.data; // { comments, total }
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // 2. Lấy danh sách phản hồi (Lazy Load)
    const getReplies = async (parentId) => {

        if (repliesCache[parentId]) {
            return repliesCache[parentId];
        }

        setLoading(true);
        try {
            const res = await interactionApi.getReplies(parentId);
            const data = res.data.data;
            repliesCache[parentId] = data; // Lưu vào cache
            return data;
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const clearReplyCache = (parentId) => {
        delete repliesCache[parentId];
    };

    const updateReplyCache = (parentId, newReply) => {
        if (repliesCache[parentId]) {
            repliesCache[parentId] = [...repliesCache[parentId], newReply];
        } else {
            repliesCache[parentId] = [newReply];
        }
    };

    return {
        loading,
        error,
        getRootComments,
        getReplies,
        updateReplyCache,
        clearReplyCache
    };
}