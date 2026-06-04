import { useState, useCallback } from 'react';
import menuApi from '../api/menuApi';

export const useMenu = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchMyMenus = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await menuApi.getMyMenus();
            return result.data; // Trả về mảng menus
        } catch (err) {
           setError(err.message);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchMenuDetail = useCallback(async (menuId) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await menuApi.getMenuById(menuId);
            return result.data; // Trả về object menu chi tiết
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createNewMenu = async (menuData) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await menuApi.createMenu(menuData);
            return { success: true, data: result.data };
        } catch (err) {
            setError(err.message);
            return { success: false, message: err.message };
        } finally {
            setIsLoading(false);
        }
    };

    const updateExistingMenu = async (menuId, menuData) => {
        setIsLoading(true);
        setError(null);
        try {
            await menuApi.updateMenu(menuId, menuData);
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, message: err.message };
        } finally {
            setIsLoading(false);
        }
    };

    const removeMenu = async (menuId) => {
        setIsLoading(true);
        setError(null);
        try {
            await menuApi.deleteMenu(menuId);
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, message: err.message };
        } finally {
            setIsLoading(false);
        }
    };

 // [TÌM ĐẾN CUỐI HÀM useMenu, TRƯỚC LÚC return]

    const fetchShoppingList = useCallback(async (menuId) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await menuApi.getShoppingList(menuId);
            return result.data; // Trả về object đã group theo category
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []); 

    // [THÊM 2 HÀM NÀY VÀO BÊN TRONG useMenu]
    
    const fetchPublicMenus = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await menuApi.getPublicMenus();
            return result.data;
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, []);

    const duplicateMenu = async (menuId) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await menuApi.cloneMenu(menuId);
            return { success: true, data: result.data };
        } catch (err) {
            setError(err.message);
            return { success: false, message: err.message };
        } finally {
            setIsLoading(false);
        }
    };

    // THÊM HÀM NÀY
    const fetchPublicMenusByUser = useCallback(async (userId) => {
        setIsLoading(true);
        try {
            const result = await menuApi.getPublicMenusByUser(userId);
            return result.data;
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, []);

    // THÊM VÀO BÊN TRONG HOOK
    const getAIConsultation = async (menuState) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await menuApi.consultAI(menuState);
            return result.data; // Trả về đoạn text của AI
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const autoGenerateMenu = async (prompt) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await menuApi.generateMenuAuto(prompt);
            return { success: true, data: result.data };
        } catch (err) {
            setError(err.message);
            return { success: false, message: err.message };
        } finally {
            setIsLoading(false);
        }
    };


    return {
        isLoading,
        error,
        fetchMyMenus,
        fetchMenuDetail,
        createNewMenu,
        updateExistingMenu,
        removeMenu,
        fetchShoppingList,
        fetchPublicMenus, // <--- Thêm dòng này
        duplicateMenu,
        fetchPublicMenusByUser,
        getAIConsultation,
        autoGenerateMenu
    };
};