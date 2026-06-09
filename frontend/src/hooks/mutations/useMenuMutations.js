// VỊ TRÍ: frontend/src/hooks/mutations/useMenuMutations.js

import { useMutation, useQueryClient } from '@tanstack/react-query';
import menuApi from '../../api/menuApi';
import { QUERY_KEYS } from '../../config/queryKeys';

export const useCreateMenuMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (menuData) => menuApi.createMenu(menuData),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MENUS] })
    });
};

export const useUpdateMenuMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ menuId, menuData }) => menuApi.updateMenu(menuId, menuData),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MENUS] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MENU_DETAIL, variables.menuId] });
        }
    });
};

export const useDeleteMenuMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (menuId) => menuApi.deleteMenu(menuId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MENUS] })
    });
};

export const useCloneMenuMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (menuId) => menuApi.cloneMenu(menuId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MENUS] })
    });
};

export const useAiConsultationMutation = () => {
    return useMutation({
        mutationFn: (menuState) => menuApi.consultAI(menuState)
    });
};

export const useAutoGenerateMenuMutation = () => {
    return useMutation({
        mutationFn: (prompt) => menuApi.generateMenuAuto(prompt)
    });
};