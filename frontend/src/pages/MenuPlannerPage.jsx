import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMenu } from '../hooks/useMenu';
import { MenuProvider, useMenuState, MENU_ACTIONS } from '../context/MenuContext';
import { Trash2, GripVertical,Copy, User, ShoppingCart,Sparkles, X, Wand2} from 'lucide-react';
import Modal from '../component/common/modal'; // Trỏ đúng đường dẫn file modal.jsx của bạn
import RecipeSearchModal from '../component/menu/RecipeSearchModal';
import { getRecipeImageUrl } from '../utils/imageHelper';
import ShoppingListModal from '../component/menu/ShoppingListModal';
import { useAuth } from '../AuthContext';
import AiConsultModal from '../component/menu/AiConsultModal';
import AiGeneratorModal from '../component/menu/AiGeneratorModal';
// THAY THẾ TOÀN BỘ MenuPlannerBoard BẰNG ĐOẠN NÀY
const MenuPlannerBoard = () => {
    const { menuId } = useParams();
    const navigate = useNavigate();
    const { fetchMenuDetail, updateExistingMenu, duplicateMenu, isLoading } = useMenu();
    const { menuState, dispatch } = useMenuState();
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [isAiGenModalOpen, setIsAiGenModalOpen] = useState(false);
    // States cho UI
    const [modalConfig, setModalConfig] = useState({ isOpen: false });
    const [searchModalTarget, setSearchModalTarget] = useState(null); // { dayId, mealId }
    
    // State lưu giữ liệu món ăn đang được Kéo (Drag)
    const [draggedItem, setDraggedItem] = useState(null);

    const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);

    const { currentUser } = useAuth();
    const isOwner = currentUser?.id === menuState.user_id;
    useEffect(() => {
        const loadMenu = async () => {
            if (menuId) {
                const data = await fetchMenuDetail(menuId);
                if (data) dispatch({ type: MENU_ACTIONS.INIT_MENU, payload: data });
                else navigate('/menus');
            }
        };
        loadMenu();
    }, [menuId, fetchMenuDetail, navigate, dispatch]);



    // Hàm tính tổng calo của 1 ngày dựa trên multiplier
    const calculateDayCalo = (day) => {
        let total = 0;
        day.meals?.forEach(meal => {
            meal.recipes?.forEach(r => {
                total += (r.total_calo || 0) * (r.servings_multiplier || 1);
            });
        });
        return Math.round(total);
    };

    const handleSave = async () => {
        console.log("Saving menu with state: ", menuState);
        const result = await updateExistingMenu(menuId, menuState);
        if (result.success) {
            setModalConfig({
                isOpen: true,
                type: 'success',
                title: 'Thành công',
                message: 'Thực đơn đã được lưu an toàn!',
                actions: [{ label: 'Tuyệt vời', style: 'primary', onClick: () => setModalConfig({ isOpen: false }) }]
            });
        } else {
            setModalConfig({
                isOpen: true,
                type: 'error',
                title: 'Lỗi',
                message: 'Lưu thất bại: ' + result.message
            });
        }
    };

    // --- LOGIC KÉO THẢ (DRAG & DROP) ---
    const handleDragStart = (e, dayId, mealId, recipeId) => {
        setDraggedItem({ dayId, mealId, recipeId });
        e.dataTransfer.effectAllowed = 'move';
        // Hiệu ứng mờ đi khi kéo
        setTimeout(() => e.target.classList.add('opacity-50'), 0);
    };

    const handleDragEnd = (e) => {
        e.target.classList.remove('opacity-50');
        setDraggedItem(null);
    };

    const handleDragOver = (e) => {
        e.preventDefault(); // Cần thiết để cho phép Drop
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, targetDayId, targetMealId) => {
        e.preventDefault();
        if (!draggedItem) return;

        // Nếu kéo vào cùng một vị trí cũ thì bỏ qua
        if (draggedItem.dayId === targetDayId && draggedItem.mealId === targetMealId) return;

        dispatch({
            type: MENU_ACTIONS.MOVE_RECIPE,
            payload: {
                fromDayId: draggedItem.dayId,
                fromMealId: draggedItem.mealId,
                toDayId: targetDayId,
                toMealId: targetMealId,
                recipeId: draggedItem.recipeId
            }
        });
    };

    const handleClone = async () => {
        if (!currentUser) {
            alert("Bạn cần đăng nhập để lưu thực đơn này!");
            navigate('/login');
            return;
        }
        const result = await duplicateMenu(menuId);
        if (result.success) {
            setModalConfig({
                isOpen: true,
                type: 'success',
                title: 'Nhân bản thành công',
                message: 'Thực đơn đã được lưu vào danh sách của bạn. Bạn có thể thoải mái chỉnh sửa!',
                actions: [{ label: 'Tới thực đơn của tôi', style: 'primary', onClick: () => {
                    setModalConfig({ isOpen: false });
                    navigate(`/menus/planner/${result.data.menu_id}`);
                }}]
            });
        } else {
            alert("Lỗi: " + result.message);
        }
    };
    // ------------------------------------

    console.log("owner: ", isOwner, "menuState: ", menuState, "currentUser: ", currentUser);

    if (isLoading && !menuState.menu_id) return <div className="p-8 text-center text-[#ff6b35] font-bold">Đang tải cấu trúc...</div>;

    return (
        <div className="flex flex-col h-screen bg-gray-50/50">
            {/* Component Modal Thông Báo */}
            <Modal 
                isOpen={modalConfig.isOpen} 
                onClose={() => setModalConfig({ isOpen: false })}
                {...modalConfig}
            />

            {/* Component Modal Tìm Món Ăn */}
            <RecipeSearchModal 
                isOpen={!!searchModalTarget}
                onClose={() => setSearchModalTarget(null)}
                onSelectRecipe={(recipe) => {
                    dispatch({
                        type: MENU_ACTIONS.ADD_RECIPE,
                        payload: { dayId: searchModalTarget.dayId, mealId: searchModalTarget.mealId, recipe }
                    });
                    setSearchModalTarget(null); // Đóng modal
                }}
            />


                    

            {/* Component Modal Đi Chợ */}
            <ShoppingListModal 
                isOpen={isShoppingListOpen}
                onClose={() => setIsShoppingListOpen(false)}
                menuId={menuId}
            />

            <AiConsultModal 
                isOpen={isAiModalOpen} 
                onClose={() => setIsAiModalOpen(false)} 
                menuState={menuState} 
            />

            <AiGeneratorModal 
                isOpen={isAiGenModalOpen} 
                onClose={() => setIsAiGenModalOpen(false)} 
            />

            {/* HEADER */}
            <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center shrink-0 border-b border-gray-100">
                <div className="flex flex-col gap-1">
                    <input 
                        type="text" 
                        value={menuState.name} 
                        readOnly={!isOwner}
                        onChange={(e) => dispatch({ type: MENU_ACTIONS.UPDATE_META, payload: { name: e.target.value } })}
                        className={`text-2xl font-bold text-gray-900 bg-transparent border-none outline-none focus:ring-0 w-full min-w-[300px] p-0 ${!isOwner && 'cursor-default'}`}
                        placeholder="Nhập tên thực đơn..."
                    />

                     {/* Hiển thị tác giả nếu không phải chủ */}
                    {!isOwner && menuState.author_name && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <User className="w-4 h-4" />
                            Đăng bởi: <span className="font-semibold text-[#ff6b35]">{menuState.author_name}</span>
                        </div>
                    )}
                </div>

<               div className="flex space-x-3 items-center">

                                {/* NÚT AI TƯ VẤN */}
                    {isOwner && (
                        <button 
                            onClick={() => setIsAiModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-200 hover:brightness-110 transition-all"
                        >
                            <Sparkles className="w-5 h-5" />
                            AI Tư Vấn
                        </button>
                    )}

                    {isOwner && (
                        <button 
                            onClick={() => setIsAiGenModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-orange-50 border-2 border-orange-200 text-[#ff6b35] font-bold rounded-2xl hover:bg-orange-100 transition-all"
                        >
                            <Wand2 className="w-5 h-5" /> Auto Sinh Menu
                        </button>
                    )}


                    {/* NÚT DANH SÁCH ĐI CHỢ */}
                    <button 
                        onClick={() => setIsShoppingListOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-orange-50 border-2 border-orange-100 text-[#ff6b35] font-bold rounded-2xl hover:border-[#ff6b35] hover:bg-orange-100 transition-all"
                    >
                        <ShoppingCart className="w-5 h-5" />
                        Đi Chợ
                    </button>

                {isOwner ? (
                    <>
                        <button 
                            onClick={() => dispatch({ type: MENU_ACTIONS.ADD_DAY })}
                            className="px-5 py-2.5 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-2xl hover:border-[#ff6b35] hover:text-[#ff6b35] transition-all"
                        >
                        + Thêm Ngày Mới
                        </button>
                        <button
                        onClick={handleSave}
                        className="px-6 py-2.5 bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white font-bold rounded-2xl shadow-lg shadow-orange-200 hover:brightness-110 transition-all"
                        >
                            {isLoading ? 'Đang lưu...' : 'Lưu Thực Đơn'}
                        </button>        
                    </>
                ) : (
                        <button onClick={handleClone} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-200 to-orange-600 text-white font-bold rounded-2xl shadow-lg shadow-orange-200 hover:brightness-110 transition-all">
                            <Copy className="w-5 h-5" /> Nhân bản về máy
                        </button>
                )}

                </div>
            </header>
            <main className="flex-1 overflow-x-auto p-6">
                <div className="flex space-x-6 min-h-full items-start">
                    {menuState.days?.map((day, index) => (
                        <div key={day.day_id} className="w-80 shrink-0 bg-gray-100/80 rounded-2xl p-4 flex flex-col border border-gray-200 shadow-sm relative group">
                            
                            {/* Nút Xóa Ngày (Chỉ hiện khi hover vào ngày) */}
                            { isOwner && <button 
                                onClick={() => { if(window.confirm('Bạn có chắc muốn xóa ngày này?')) dispatch({ type: MENU_ACTIONS.REMOVE_DAY, payload: { dayId: day.day_id }}) }}
                                className="absolute -top-3 -right-3 bg-red-100 text-red-500 hover:bg-red-500 hover:text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm z-10"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            }

                            <div className="flex justify-between items-center mb-4 px-1">
                                {/* THAY VÌ <h3>, TA DÙNG <input> ĐỂ ĐỔI TÊN NGÀY */}
                                <input 
                                    type="text" 
                                    value={day.title}
                                    // Ghi chú: Cần thêm 1 case UPDATE_DAY_TITLE vào Context nếu muốn lưu thay đổi tên ngày,
                                    // Tạm thời ở đây user gõ thì UI cập nhật nhưng bạn cần nối dispatch UPDATE_DAY_TITLE nhé. (Tôi sẽ thêm vào nếu bạn cần, hoặc dùng tạm title cố định).
                                    // Để đơn giản, ta chỉ hiển thị, hoặc nếu bạn muốn đổi tên ngày, ta xử lý tương tự UPDATE_MEAL.
                                    readOnly // Tạm để readonly, nếu muốn đổi tên ngày, ta làm y hệt bữa ăn
                                    className="font-extrabold text-gray-800 bg-transparent border-none focus:ring-0 outline-none w-3/5 p-0"
                                />
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
                                            {/* ĐỔI TÊN BỮA ĂN (Tự động lưu vào Context) */}
                                            <input
                                                type="text"
                                                value={meal.title || (meal.meal_type === 'breakfast' ? 'Sáng' : meal.meal_type === 'lunch' ? 'Trưa' : meal.meal_type === 'dinner' ? 'Tối' : 'Bữa phụ')}
                                                onChange={(e) => dispatch({ type: MENU_ACTIONS.UPDATE_MEAL, payload: { dayId: day.day_id, mealId: meal.meal_id, title: e.target.value }})}
                                                readOnly={!isOwner}
                                                className="text-sm font-bold text-gray-700 bg-transparent border-none outline-none focus:ring-1 focus:ring-[#ff6b35] rounded px-1 w-24"
                                            />
                                            
                                            <div className="flex gap-2">
                                                {/* Nút Xóa Bữa */}
                                                {isOwner && (
                                                    <button 
                                                        onClick={() => dispatch({ type: MENU_ACTIONS.REMOVE_MEAL, payload: { dayId: day.day_id, mealId: meal.meal_id }})}
                                                        className="text-xs text-red-400 hover:text-red-600 font-bold px-1 hidden group-hover/meal:block"
                                                    >
                                                        Xóa
                                                    </button>
                                                )}
                                                {isOwner && (
                                                    <button 
                                                        onClick={() => setSearchModalTarget({ dayId: day.day_id, mealId: meal.meal_id })}
                                                        className="text-xs text-[#ff6b35] hover:text-[#f7931e] font-bold bg-orange-50 px-2 py-1 rounded-lg"
                                                    >
                                                        + Thêm Món
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="p-2 flex flex-col space-y-2 min-h-[60px]">
                                            {meal.recipes?.length === 0 ? (
                                                <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl py-4">
                                                    {isOwner? (
                                                        <span className="text-xs font-medium text-gray-400">Kéo thả món ăn vào đây</span>
                                                    ) : (
                                                        <span className="text-xs font-medium text-gray-400">Menu chưa có món ăn</span>
                                                    )}
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
                                                            <img 
                                                                src={recipe.cover_image ? `http://localhost:5000/uploads/recipes/${recipe.cover_image}` : '/default-recipe.png'} 
                                                                alt="" 
                                                                className="w-10 h-10 object-cover rounded-lg"
                                                            />
                                                            <div className="flex-1 overflow-hidden">
                                                                <h4 className="text-sm font-bold text-gray-800 line-clamp-1">{recipe.title}</h4>
                                                                <p className="text-[10px] text-gray-400 font-medium">
                                                                    {Math.round((recipe.total_calo || 0) * (recipe.servings_multiplier || 1))} Calo
                                                                </p>
                                                            </div>
                                                            {isOwner && (
                                                                <button 
                                                                    onClick={(e) => { e.stopPropagation(); dispatch({ type: MENU_ACTIONS.REMOVE_RECIPE, payload: { dayId: day.day_id, mealId: meal.meal_id, recipeId: recipe.recipe_id }})}}
                                                                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* CHỈNH KHẨU PHẦN */}
                                                        <div className="flex justify-between items-center bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                                                            <span className="text-xs text-gray-500 font-medium ml-1">Khẩu phần:</span>
                                                            <div className="flex items-center gap-2">
                                                                {isOwner && (
                                                                    <button 
                                                                        onClick={(e) => { e.stopPropagation(); dispatch({ type: MENU_ACTIONS.UPDATE_SERVINGS, payload: { dayId: day.day_id, mealId: meal.meal_id, recipeId: recipe.recipe_id, delta: -1 }})}}
                                                                        className="w-6 h-6 rounded flex items-center justify-center bg-white border border-gray-200 text-gray-600 hover:border-[#ff6b35] hover:text-[#ff6b35] font-bold"
                                                                    >-</button>
                                                                )}
                                                                <span className="text-xs font-bold text-gray-800 w-4 text-center">
                                                                    {recipe.servings_multiplier || 1}
                                                                </span>
                                                                {isOwner && (
                                                                    <button 
                                                                        onClick={(e) => { e.stopPropagation(); dispatch({ type: MENU_ACTIONS.UPDATE_SERVINGS, payload: { dayId: day.day_id, mealId: meal.meal_id, recipeId: recipe.recipe_id, delta: 1 }})}}
                                                                        className="w-6 h-6 rounded flex items-center justify-center bg-white border border-gray-200 text-gray-600 hover:border-[#ff6b35] hover:text-[#ff6b35] font-bold"
                                                                    >+</button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* NÚT THÊM BỮA ĂN VÀO NGÀY */}
                                {isOwner && (
                                    <button 
                                        onClick={() => dispatch({ type: MENU_ACTIONS.ADD_MEAL, payload: { dayId: day.day_id }})}
                                        className="w-full py-2.5 border-2 border-dashed border-gray-300 text-gray-500 font-bold rounded-xl hover:border-[#ff6b35] hover:text-[#ff6b35] hover:bg-orange-50 transition-all"
                                    >
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

// Hàm Wrapper bọc Provider để export ra ngoài dùng
const MenuPlannerWrapper = () => {
    return (
        <MenuProvider>
            <MenuPlannerBoard />
        </MenuProvider>
    );
};

export default MenuPlannerWrapper;