import { useQuery } from '@tanstack/react-query';
import userApi from '../../api/userApi';
import recipeApi from '../../api/recipeApi';
import articleApi from '../../api/articleApi';
import { QUERY_KEYS } from '../../config/queryKeys';
import { normalizeRecipeList } from '../../utils/normalizeRecipe';
import { normalizeArticleList } from '../../utils/normalizeArticle';

export const useSearchUsersQuery = ({ keyword, limit, sort, page, enabled }) => {
    return useQuery({
        queryKey: [QUERY_KEYS.SEARCH_USERS, { keyword, limit, sort, page }],
        queryFn: async () => {
            if (!keyword) return { data: [], pagination: {} };
            const res = await userApi.searchUsers({ keyword, limit, sort, page });
            return { data: res.data || [], pagination: res.meta || {} };
        },
        enabled: enabled && !!keyword,
    });
};

export const useSearchRecipesQuery = ({ keyword, limit, filters, page, enabled }) => {
    return useQuery({
        // Tái sử dụng key RECIPES_LIST nhưng gán thêm mác 'search' để tách biệt cache
        queryKey: [QUERY_KEYS.RECIPES_LIST, 'search', { keyword, limit, ...filters, page }],
        queryFn: async () => {
            if (!keyword) return { data: [], pagination: {} };
            const normFilters = {
                ...filters,
                tags: filters?.tags?.join(',') || undefined
            };
            const res = await recipeApi.getAllRecipes({ keyword, limit, ...normFilters, page });
            return {
                data: normalizeRecipeList(res.data?.data || res.data || []),
                pagination: res.data?.pagination || res.meta || {}
            };
        },
        enabled: enabled && !!keyword,
    });
};

export const useSearchArticlesQuery = ({ keyword, limit, filters, page, enabled }) => {
    return useQuery({
        queryKey: [QUERY_KEYS.PUBLIC_ARTICLES, 'search', { keyword, limit, ...filters, page }],
        queryFn: async () => {
            if (!keyword) return { data: [], pagination: {} };
            const params = {
                q: keyword,
                sort: filters?.sort || 'newest',
                tags: filters?.tags?.join(',') || undefined,
                limit,
                page
            };
            const res = await articleApi.getPublicArticles(params);
            return {
                data: normalizeArticleList(res.data || []),
                pagination: res.meta || {}
            };
        },
        enabled: enabled && !!keyword,
    });
};