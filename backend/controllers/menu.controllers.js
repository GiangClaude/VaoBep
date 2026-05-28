const MenuService = require('../services/menu.service');
const asyncHandler = require('../utils/asyncHandler');

const createMenu = asyncHandler(async (req, res) => {
    const userId = req.user?.user_id; 
    const menuData = req.body;

    const newMenu = await MenuService.createMenu(userId, menuData);

    res.status(201).json({
        success: true,
        message: 'Tạo thực đơn thành công!',
        data: newMenu
    });
});

const getUserMenus = asyncHandler(async (req, res) => {
    const userId = req.user.user_id;
    const menus = await MenuService.getUserMenus(userId);

    res.status(200).json({
        success: true,
        message: 'Lấy danh sách thực đơn thành công',
        data: menus
    });
});

const getMenuById = asyncHandler(async (req, res) => {
    const { menuId } = req.params;
    const menu = await MenuService.getMenuById(menuId);

    res.status(200).json({ success: true, data: menu });
});

const updateMenu = asyncHandler(async (req, res) => {
    const { menuId } = req.params;
    const userId = req.user.user_id;
    const menuData = req.body;

    await MenuService.updateMenu(menuId, userId, menuData);

    res.status(200).json({ success: true, message: 'Cập nhật thực đơn thành công!' });
});

const deleteMenu = asyncHandler(async (req, res) => {
    const { menuId } = req.params;
    const userId = req.user.user_id;

    await MenuService.deleteMenu(menuId, userId);

    res.status(200).json({ success: true, message: 'Đã xóa thực đơn!' });
});

const getShoppingList = asyncHandler(async (req, res) => {
    const { menuId } = req.params;
    const list = await MenuService.getShoppingList(menuId);

    res.status(200).json({ success: true, data: list });
});

const getPublicMenus = asyncHandler(async (req, res) => {
    const menus = await MenuService.getPublicMenus();
    res.status(200).json({ success: true, data: menus });
});

const cloneMenu = asyncHandler(async (req, res) => {
    const { menuId } = req.params;
    const userId = req.user.user_id;

    const clonedMenu = await MenuService.cloneMenu(menuId, userId);

    res.status(201).json({ success: true, message: 'Nhân bản thực đơn thành công!', data: clonedMenu });
});

const getPublicMenusByUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const menus = await MenuService.getPublicMenusByUser(userId);
    res.status(200).json({ success: true, data: menus });
});

const consultMenuAI = asyncHandler(async (req, res) => {
    const aiResponseText = await MenuService.consultMenuAI(req.body);
    res.status(200).json({ success: true, data: aiResponseText });
});

const generateMenuAI = asyncHandler(async (req, res) => {
    const { prompt } = req.body;
    const daysData = await MenuService.generateMenuAI(prompt);
    res.status(200).json({ success: true, data: daysData });
});

module.exports = {
    createMenu, getUserMenus, getMenuById, updateMenu, deleteMenu,
    getShoppingList, getPublicMenus, cloneMenu, getPublicMenusByUser,
    consultMenuAI, generateMenuAI
};