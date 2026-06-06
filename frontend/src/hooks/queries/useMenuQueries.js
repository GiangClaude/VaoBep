// VỊ TRÍ: frontend/src/hooks/queries/useMenuQueries.js

import { useQuery } from '@tanstack/react-query';
import menuApi from '../../api/menuApi';
import { QUERY_KEYS } from '../../config/queryKeys';

export const useMyMenusQuery = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.MENUS, 'my_menus'],
        queryFn: async () => {
            const response = await menuApi.getMyMenus();
            return response.success ? response.data : [];
        }
    });
};

export const useMenuDetailQuery = (menuId) => {
    return useQuery({
        queryKey: [QUERY_KEYS.MENU_DETAIL, menuId],
        queryFn: async () => {
            const response = await menuApi.getMenuById(menuId);
            if (response.success) return response.data;
            throw new Error(response.message || 'Lỗi tải chi tiết thực đơn');
        },
        enabled: !!menuId
    });
};

export const useShoppingListQuery = (menuId) => {
    return useQuery({
        queryKey: [QUERY_KEYS.SHOPPING_LIST, menuId],
        queryFn: async () => {
            const response = await menuApi.getShoppingList(menuId);
            return response.success ? response.data : null;
        },
        enabled: !!menuId
    });
};

export const usePublicMenusQuery = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.MENUS, 'public'],
        queryFn: async () => {
            const response = await menuApi.getPublicMenus();
            return response.success ? response.data : [];
        }
    });
};

export const usePublicMenusByUserQuery = (userId) => {
    return useQuery({
        queryKey: [QUERY_KEYS.MENUS, 'public', userId],
        queryFn: async () => {
            const response = await menuApi.getPublicMenusByUser(userId);
            return response.success ? response.data : [];
        },
        enabled: !!userId // Chỉ chạy khi có userId
    });
};
