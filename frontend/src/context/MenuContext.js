import React, { createContext, useReducer, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Bạn cần cài package uuid nếu frontend chưa có: npm install uuid

const MenuContext = createContext();

// Định nghĩa các actions
export const MENU_ACTIONS = {
    INIT_MENU: 'INIT_MENU', // Nạp data từ API vào state
    UPDATE_META: 'UPDATE_META', // Đổi tên, mô tả menu
    ADD_DAY: 'ADD_DAY',
    REMOVE_DAY: 'REMOVE_DAY',
    ADD_MEAL: 'ADD_MEAL',
    REMOVE_MEAL: 'REMOVE_MEAL',
    UPDATE_MEAL: 'UPDATE_MEAL',
    ADD_RECIPE: 'ADD_RECIPE', // Thêm món vào bữa
    REMOVE_RECIPE: 'REMOVE_RECIPE',
    UPDATE_SERVINGS: 'UPDATE_SERVINGS', // Đổi số lượng người ăn
    MOVE_RECIPE: 'MOVE_RECIPE', // Phục vụ kéo thả (Kéo từ bữa này sang bữa khác)
    OVERRIDE_DAYS: 'OVERRIDE_DAYS'
};

const initialState = {
    menu_id: null,
    name: '',
    description: '',
    is_public: false,
    days: []
};

// Reducer xử lý logic thao tác mảng/nested object
// [CODE TRƯỚC ĐÓ GIỮ NGUYÊN: Định nghĩa MENU_ACTIONS và initialState]

// THAY THẾ TOÀN BỘ HÀM menuReducer BẰNG ĐOẠN NÀY
const menuReducer = (state, action) => {
    switch (action.type) {
        case MENU_ACTIONS.INIT_MENU:
            return { ...action.payload };

        case MENU_ACTIONS.UPDATE_META:
            return { ...state, ...action.payload };

        case MENU_ACTIONS.ADD_DAY:
            const newDay = {
                day_id: uuidv4(),
                title: `Ngày ${state.days.length + 1}`,
                meals: [
                    { meal_id: uuidv4(), meal_type: 'breakfast', title: 'Bữa sáng', recipes: [] },
                    { meal_id: uuidv4(), meal_type: 'lunch', title: 'Bữa trưa', recipes: [] },
                    { meal_id: uuidv4(), meal_type: 'dinner', title: 'Bữa tối', recipes: [] }
                ]
            };
            return { ...state, days: [...state.days, newDay] };

        case MENU_ACTIONS.ADD_RECIPE: {
            const { dayId, mealId, recipe } = action.payload;
            return {
                ...state,
                days: state.days.map(day => day.day_id === dayId ? {
                    ...day,
                    meals: day.meals.map(meal => meal.meal_id === mealId ? {
                        ...meal,
                        // Thêm món ăn mới, mặc định khẩu phần = 1
                        recipes: [...meal.recipes, { ...recipe, servings_multiplier: 1.0 }]
                    } : meal)
                } : day)
            };
        }

        case MENU_ACTIONS.REMOVE_RECIPE: {
            const { dayId, mealId, recipeId } = action.payload;
            return {
                ...state,
                days: state.days.map(day => day.day_id === dayId ? {
                    ...day,
                    meals: day.meals.map(meal => meal.meal_id === mealId ? {
                        ...meal,
                        recipes: meal.recipes.filter(r => r.recipe_id !== recipeId)
                    } : meal)
                } : day)
            };
        }

        case MENU_ACTIONS.MOVE_RECIPE: {
            // Logic Kéo thả: Lấy món ở bữa cũ -> Xóa khỏi bữa cũ -> Thêm vào bữa mới
            const { fromDayId, fromMealId, toDayId, toMealId, recipeId } = action.payload;
            
            // 1. Tìm món ăn đang bị kéo
            let draggedRecipe = null;
            state.days.forEach(d => {
                if (d.day_id === fromDayId) {
                    d.meals.forEach(m => {
                        if (m.meal_id === fromMealId) {
                            draggedRecipe = m.recipes.find(r => r.recipe_id === recipeId);
                        }
                    });
                }
            });

            if (!draggedRecipe) return state;

            // 2. Clone state và thực hiện Xóa ở gốc, Thêm ở đích
            return {
                ...state,
                days: state.days.map(day => {
                    let newMeals = day.meals.map(meal => {
                        let newRecipes = [...meal.recipes];
                        // Xóa ở gốc
                        if (day.day_id === fromDayId && meal.meal_id === fromMealId) {
                            newRecipes = newRecipes.filter(r => r.recipe_id !== recipeId);
                        }
                        // Thêm ở đích
                        if (day.day_id === toDayId && meal.meal_id === toMealId) {
                            // Tránh trùng lặp nếu thả vào đúng chỗ cũ
                            if (!newRecipes.find(r => r.recipe_id === recipeId)) {
                                newRecipes.push(draggedRecipe);
                            }
                        }
                        return { ...meal, recipes: newRecipes };
                    });
                    return { ...day, meals: newMeals };
                })
            };
        }

        // [CÁC CASE CŨ GIỮ NGUYÊN]

        // THÊM CASE NÀY VÀO:
        case MENU_ACTIONS.UPDATE_SERVINGS: {
            const { dayId, mealId, recipeId, delta } = action.payload; // delta = 1 (tăng) hoặc -1 (giảm)
            return {
                ...state,
                days: state.days.map(day => day.day_id === dayId ? {
                    ...day,
                    meals: day.meals.map(meal => meal.meal_id === mealId ? {
                        ...meal,
                        recipes: meal.recipes.map(r => {
                            if (r.recipe_id === recipeId) {
                                // Khẩu phần tối thiểu là 1, tối đa là 20. Mỗi lần tăng giảm 1.
                                const currentServings = r.servings_multiplier || 1.0;
                                const newServings = Math.max(1, Math.min(20, currentServings + delta));
                                return { ...r, servings_multiplier: newServings };
                            }
                            return r;
                        })
                    } : meal)
                } : day)
            };
        }

        case MENU_ACTIONS.REMOVE_DAY:
            return {
                ...state,
                days: state.days.filter(d => d.day_id !== action.payload.dayId)
            };

        case MENU_ACTIONS.ADD_MEAL:
            return {
                ...state,
                days: state.days.map(day => day.day_id === action.payload.dayId ? {
                    ...day,
                    meals: [...day.meals, { 
                        meal_id: uuidv4(), 
                        meal_type: 'snack', // Mặc định bữa mới tạo là bữa phụ
                        title: 'Bữa phụ mới', 
                        recipes: [] 
                    }]
                } : day)
            };

        case MENU_ACTIONS.REMOVE_MEAL:
            return {
                ...state,
                days: state.days.map(day => day.day_id === action.payload.dayId ? {
                    ...day,
                    meals: day.meals.filter(m => m.meal_id !== action.payload.mealId)
                } : day)
            };

        case MENU_ACTIONS.UPDATE_MEAL:
            return {
                ...state,
                days: state.days.map(day => day.day_id === action.payload.dayId ? {
                    ...day,
                    meals: day.meals.map(m => m.meal_id === action.payload.mealId ? {
                        ...m, 
                        title: action.payload.title 
                    } : m)
                } : day)
            };
        case MENU_ACTIONS.OVERRIDE_DAYS:
            // Ghi đè toàn bộ mảng days bằng data AI trả về
            return {
                ...state,
                days: action.payload
            };


        default:
            return state;
    }
};

export const MenuProvider = ({ children }) => {
    const [menuState, dispatch] = useReducer(menuReducer, initialState);

    return (
        <MenuContext.Provider value={{ menuState, dispatch }}>
            {children}
        </MenuContext.Provider>
    );
};

export const useMenuState = () => {
    return useContext(MenuContext);
};