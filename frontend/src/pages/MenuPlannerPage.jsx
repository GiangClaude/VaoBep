// VỊ TRÍ: frontend/src/pages/MenuPlannerPage.jsx

import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MenuProvider, useMenuState, MENU_ACTIONS } from '../context/MenuContext';
import { Trash2, GripVertical, Copy, User, ShoppingCart, Sparkles, Wand2 } from 'lucide-react';
import { getRecipeImageUrl } from '../utils/imageHelper';
import { useAuth } from '../AuthContext';

// Import Modals
import RecipeSearchModal from '../component/menu/RecipeSearchModal';
import ShoppingListModal from '../component/menu/ShoppingListModal';
import AiConsultModal from '../component/menu/AiConsultModal';
import AiGeneratorModal from '../component/menu/AiGeneratorModal';

// [MỚI] Import Hooks Kiến trúc mới
import { useMenuDetailQuery } from '../hooks/queries/useMenuQueries';
import { useMenuPlannerUI } from '../hooks/ui/menu/useMenuPlannerUI';

const MenuPlannerBoard = () => {
    const { menuId } = useParams();
    const { currentUser } = useAuth();
    const { menuState, dispatch } = useMenuState();

    // 1. Fetch dữ liệu thực đơn tự động bằng Query
    const { data: fetchedMenu, isLoading } = useMenuDetailQuery(menuId);
    const hasInitialized = useRef(false);
    // 2. Cập nhật Context khi tải xong dữ liệu từ API
    useEffect(() => {
        if (fetchedMenu && !hasInitialized.current) {
            dispatch({ type: MENU_ACTIONS.INIT_MENU, payload: fetchedMenu });
            hasInitialized.current = true;
        }
    }, [fetchedMenu, dispatch]);

    console.log("Menu: ", menuState);
    // Kiểm tra quyền chủ sở hữu
    const isOwner = currentUser?.id === menuState?.user_id;

    // 3. Kéo toàn bộ State UI & Hàm xử lý từ Hook UI vào đây
    const {
        searchModalTarget, setSearchModalTarget,
        isShoppingListOpen, setIsShoppingListOpen,
        isAiModalOpen, setIsAiModalOpen,
        isAiGenModalOpen, setIsAiGenModalOpen,
        isSaving, isCloning,
        handleSave, handleClone,
        handleDragStart, handleDragEnd, handleDragOver, handleDrop
    } = useMenuPlannerUI(menuId, menuState, dispatch, currentUser, isOwner);

    // Hàm tiện ích: Tính tổng calo trong ngày (chỉ liên quan đến hiển thị nên giữ ở component)
    const calculateDayCalo = (day) => {
        let total = 0;
        day.meals?.forEach(meal => {
            meal.recipes?.forEach(r => {
                total += (r.total_calo || 0) * (r.servings_multiplier || 1);
            });
        });
        return Math.round(total);
    };

    if (isLoading && !menuState.menu_id) {
        return <div className="p-8 text-center text-[#ff6b35] font-bold mt-10">Đang tải cấu trúc thực đơn...</div>;
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50/50">
            {/* CÁC MODAL ĐƯỢC GIỮ NGUYÊN HOÀN TOÀN TỪ CODE CŨ CỦA BẠN */}
            <RecipeSearchModal 
                isOpen={!!searchModalTarget}
                onClose={() => setSearchModalTarget(null)}
                onSelectRecipe={(recipe) => {
                   const menuFormattedRecipe = {
                        recipe_id: recipe.id || recipe.recipe_id,
                        title: recipe.title,
                        cover_image: recipe.image || recipe.cover_image, // Lấy ảnh từ normalize
                        total_calo: recipe.calories || recipe.total_calo,
                        servings_multiplier: 1 // Khởi tạo khẩu phần mặc định
                    };

                    dispatch({
                        type: MENU_ACTIONS.ADD_RECIPE,
                        payload: { 
                            dayId: searchModalTarget.dayId, 
                            mealId: searchModalTarget.mealId, 
                            recipe: menuFormattedRecipe 
                        }
                    });
        setSearchModalTarget(null);
                }}
            />
            <ShoppingListModal isOpen={isShoppingListOpen} onClose={() => setIsShoppingListOpen(false)} menuId={menuId} />
            <AiConsultModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} menuState={menuState} />
            <AiGeneratorModal isOpen={isAiGenModalOpen} onClose={() => setIsAiGenModalOpen(false)} />

            {/* HEADER */}
            <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center shrink-0 border-b border-gray-100">
                <div className="flex flex-col gap-1">
                    <input 
                        type="text" 
                        value={menuState.name || ""} 
                        readOnly={!isOwner}
                        onChange={(e) => dispatch({ type: MENU_ACTIONS.UPDATE_META, payload: { name: e.target.value } })}
                        className={`text-2xl font-bold text-gray-900 bg-transparent border-none outline-none focus:ring-0 w-full min-w-[300px] p-0 ${!isOwner && 'cursor-default'}`}
                        placeholder="Nhập tên thực đơn..."
                    />
                    {!isOwner && menuState.author_name && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <User className="w-4 h-4" />
                            Đăng bởi: <span className="font-semibold text-[#ff6b35]">{menuState.author_name}</span>
                        </div>
                    )}
                </div>

                <div className="flex space-x-3 items-center">
                    {/* BUTTONS MỞ CÁC CHỨC NĂNG (GẮN VÀO STATE CỦA UI HOOK) */}
                    {isOwner && (
                        <button onClick={() => setIsAiModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-200 hover:brightness-110 transition-all">
                            <Sparkles className="w-5 h-5" /> AI Tư Vấn
                        </button>
                    )}
                    {isOwner && (
                        <button onClick={() => setIsAiGenModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-orange-50 border-2 border-orange-200 text-[#ff6b35] font-bold rounded-2xl hover:bg-orange-100 transition-all">
                            <Wand2 className="w-5 h-5" /> Auto Sinh Menu
                        </button>
                    )}
                    <button onClick={() => setIsShoppingListOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-orange-50 border-2 border-orange-100 text-[#ff6b35] font-bold rounded-2xl hover:border-[#ff6b35] hover:bg-orange-100 transition-all">
                        <ShoppingCart className="w-5 h-5" /> Đi Chợ
                    </button>

                    {isOwner ? (
                        <>
                            <button onClick={() => dispatch({ type: MENU_ACTIONS.ADD_DAY })} className="px-5 py-2.5 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-2xl hover:border-[#ff6b35] hover:text-[#ff6b35] transition-all">
                                + Thêm Ngày Mới
                            </button>
                            <button onClick={handleSave} disabled={isSaving} className="px-6 py-2.5 bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white font-bold rounded-2xl shadow-lg shadow-orange-200 hover:brightness-110 transition-all disabled:opacity-50">
                                {isSaving ? 'Đang lưu...' : 'Lưu Thực Đơn'}
                            </button>        
                        </>
                    ) : (
                        <button onClick={handleClone} disabled={isCloning} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-200 to-orange-600 text-white font-bold rounded-2xl shadow-lg shadow-orange-200 hover:brightness-110 transition-all disabled:opacity-50">
                            <Copy className="w-5 h-5" /> {isCloning ? 'Đang lưu...' : 'Nhân bản về máy'}
                        </button>
                    )}
                </div>
            </header>

            {/* KHU VỰC KANBAN BOARD */}
            <main className="flex-1 overflow-x-auto p-6">
                <div className="flex space-x-6 min-h-full items-start">
                    {menuState.days?.map((day) => (
                        <div key={day.day_id} className="w-80 shrink-0 bg-gray-100/80 rounded-2xl p-4 flex flex-col border border-gray-200 shadow-sm relative group">
                            
                            {isOwner && (
                                <button onClick={() => { if(window.confirm('Bạn có chắc muốn xóa ngày này?')) dispatch({ type: MENU_ACTIONS.REMOVE_DAY, payload: { dayId: day.day_id }}) }} className="absolute -top-3 -right-3 bg-red-100 text-red-500 hover:bg-red-500 hover:text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm z-10">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}

                            <div className="flex justify-between items-center mb-4 px-1">
                                <input type="text" value={day.title || ""} readOnly className="font-extrabold text-gray-800 bg-transparent border-none focus:ring-0 outline-none w-3/5 p-0" />
                                <span className="text-xs font-bold bg-[#ff6b35]/10 text-[#ff6b35] px-2 py-1 rounded-lg">
                                    {calculateDayCalo(day)} Calo
                                </span>
                            </div>
                            
                            <div className="flex flex-col space-y-4">
                                {day.meals?.map((meal) => (
                                    <div 
                                        key={meal.meal_id} 
                                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative group/meal"
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, day.day_id, meal.meal_id)}
                                    >
                                        <div className="flex justify-between items-center p-3 bg-gray-50/50 border-b border-gray-50">
                                            <input
                                                type="text"
                                                value={meal.title || (meal.meal_type === 'breakfast' ? 'Sáng' : meal.meal_type === 'lunch' ? 'Trưa' : meal.meal_type === 'dinner' ? 'Tối' : 'Bữa phụ')}
                                                onChange={(e) => dispatch({ type: MENU_ACTIONS.UPDATE_MEAL, payload: { dayId: day.day_id, mealId: meal.meal_id, title: e.target.value }})}
                                                readOnly={!isOwner}
                                                className="text-sm font-bold text-gray-700 bg-transparent border-none outline-none focus:ring-1 focus:ring-[#ff6b35] rounded px-1 w-24"
                                            />
                                            <div className="flex gap-2">
                                                {isOwner && <button onClick={() => dispatch({ type: MENU_ACTIONS.REMOVE_MEAL, payload: { dayId: day.day_id, mealId: meal.meal_id }})} className="text-xs text-red-400 hover:text-red-600 font-bold px-1 hidden group-hover/meal:block">Xóa</button>}
                                                {isOwner && <button onClick={() => setSearchModalTarget({ dayId: day.day_id, mealId: meal.meal_id })} className="text-xs text-[#ff6b35] hover:text-[#f7931e] font-bold bg-orange-50 px-2 py-1 rounded-lg">+ Thêm Món</button>}
                                            </div>
                                        </div>
                                        
                                        <div className="p-2 flex flex-col space-y-2 min-h-[60px]">
                                            {(!meal.recipes || meal.recipes.length === 0) ? (
                                                <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl py-4">
                                                    <span className="text-xs font-medium text-gray-400">{isOwner ? 'Kéo thả món ăn vào đây' : 'Menu chưa có món ăn'}</span>
                                                </div>
                                            ) : (
                                                meal.recipes?.map(recipe => (
                                                    <div 
                                                        key={recipe.recipe_id}
                                                        draggable={isOwner}
                                                        onDragStart={(e) => isOwner && handleDragStart(e, day.day_id, meal.meal_id, recipe.recipe_id)}
                                                        onDragEnd={isOwner ? handleDragEnd : undefined}
                                                        className="group bg-white border border-gray-100 p-2 rounded-xl flex flex-col gap-2 shadow-sm hover:border-[#ff6b35] hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
                                                    >
                                                        <div className="flex items-center gap-3 w-full">
                                                            <GripVertical className="w-4 h-4 text-gray-300" />
                                                            <img src={recipe.cover_image ? getRecipeImageUrl(recipe.recipe_id,recipe.cover_image) : '/assets/recipe_placeholder.png'} alt="" className="w-10 h-10 object-cover rounded-lg" />
                                                            <div className="flex-1 overflow-hidden">
                                                                <h4 className="text-sm font-bold text-gray-800 line-clamp-1">{recipe.title}</h4>
                                                                <p className="text-[10px] text-gray-400 font-medium">{Math.round((recipe.total_calo || 0) * (recipe.servings_multiplier || 1))} Calo</p>
                                                            </div>
                                                            {isOwner && (
                                                                <button onClick={(e) => { e.stopPropagation(); dispatch({ type: MENU_ACTIONS.REMOVE_RECIPE, payload: { dayId: day.day_id, mealId: meal.meal_id, recipeId: recipe.recipe_id }})}} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                                                            )}
                                                        </div>

                                                        {/* CHỈNH KHẨU PHẦN */}
                                                        <div className="flex justify-between items-center bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                                                            <span className="text-xs text-gray-500 font-medium ml-1">Khẩu phần:</span>
                                                            <div className="flex items-center gap-2">
                                                                {isOwner && <button onClick={(e) => { e.stopPropagation(); dispatch({ type: MENU_ACTIONS.UPDATE_SERVINGS, payload: { dayId: day.day_id, mealId: meal.meal_id, recipeId: recipe.recipe_id, delta: -1 }})}} className="w-6 h-6 rounded flex items-center justify-center bg-white border border-gray-200 text-gray-600 hover:border-[#ff6b35] hover:text-[#ff6b35] font-bold">-</button>}
                                                                <span className="text-xs font-bold text-gray-800 w-4 text-center">{recipe.servings_multiplier || 1}</span>
                                                                {isOwner && <button onClick={(e) => { e.stopPropagation(); dispatch({ type: MENU_ACTIONS.UPDATE_SERVINGS, payload: { dayId: day.day_id, mealId: meal.meal_id, recipeId: recipe.recipe_id, delta: 1 }})}} className="w-6 h-6 rounded flex items-center justify-center bg-white border border-gray-200 text-gray-600 hover:border-[#ff6b35] hover:text-[#ff6b35] font-bold">+</button>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {isOwner && (
                                    <button onClick={() => dispatch({ type: MENU_ACTIONS.ADD_MEAL, payload: { dayId: day.day_id }})} className="w-full py-2.5 border-2 border-dashed border-gray-300 text-gray-500 font-bold rounded-xl hover:border-[#ff6b35] hover:text-[#ff6b35] hover:bg-orange-50 transition-all">
                                        + Thêm Bữa Mới
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {(!menuState.days || menuState.days.length === 0) && (
                        <div className="flex items-center justify-center w-full h-40 text-gray-400 border-2 border-dashed border-gray-300 rounded-xl">
                            Hãy bấm "+ Thêm Ngày Mới" để bắt đầu lên thực đơn
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

// Wrapper để xuất ra ngoài
const MenuPlannerWrapper = () => (
    <MenuProvider>
        <MenuPlannerBoard />
    </MenuProvider>
);

export default MenuPlannerWrapper;