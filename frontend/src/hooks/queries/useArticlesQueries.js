// VỊ TRÍ: frontend/src/hooks/queries/useArticlesQueries.js

import { useQuery } from '@tanstack/react-query';
import articleApi from '../../api/articleApi';
import { QUERY_KEYS } from '../../config/queryKeys';
import { normalizeArticleList, normalizeArticle } from '../../utils/normalizeArticle';

export const useArticlesListQuery = (params) => {
    return useQuery({
        queryKey: [QUERY_KEYS.PUBLIC_ARTICLES, params],
        queryFn: async () => {
            const response = await articleApi.getPublicArticles(params);
            if (response.success) {
                return {
                    data: normalizeArticleList(response.data),
                    pagination: response.meta
                };
            }
            throw new Error('Lỗi tải bài viết');
        }
    });
};

export const useArticleDetailQuery = (id) => {
    return useQuery({
        queryKey: [QUERY_KEYS.ARTICLE_DETAIL, id],
        queryFn: async () => {
            const response = await articleApi.getArticleById(id);
            if (response.success) {
                // Do normalizeArticleList trả về mảng, ta lấy phần tử đầu tiên
                return normalizeArticleList([response.data])[0];
            }
            throw new Error('Lỗi tải chi tiết bài viết');
        },
        enabled: !!id
    });
};

export const useFeaturedArticlesQuery = (limit = 3) => {
    return useQuery({
        queryKey: [QUERY_KEYS.FEATURED_ARTICLES, limit],
        queryFn: async () => {
            const response = await articleApi.getFeaturedArticles({ limit });
            return response.success ? normalizeArticleList(response.data) : [];
        }
    });
};

export const useOwnerArticlesQuery = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.OWNER_ARTICLES],
        queryFn: async () => {
            const response = await articleApi.getOwnerArticles();
            return response.success ? normalizeArticleList(response.data) : [];
        }
    });
};

export const useSavedArticlesQuery = (page = 1) => {
    return useQuery({
        queryKey: [QUERY_KEYS.SAVED_ARTICLES, page],
        queryFn: async () => {
            const response = await articleApi.getSavedArticles({ page, limit: 6 });
            if (response.success) {
                return {
                    data: normalizeArticleList(response.data),
                    pagination: response.meta
                };
            }
            return { data: [], pagination: null };
        }
    });
};