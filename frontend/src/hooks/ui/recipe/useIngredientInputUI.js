import { useState, useRef, useEffect } from "react";
// Gọi các Query có sẵn để tận dụng Cache
import { useIngredientsQuery, useUnitsQuery } from "../../queries/useMiscQueries";

export const useIngredientInputUI = (ingredients, onChange) => {
    // 1. Lấy dữ liệu từ React Query
    const { data: dbIngredients = [], isLoading: loadingIngs } = useIngredientsQuery();
    const { data: dbUnits = [], isLoading: loadingUnits } = useUnitsQuery();
    const isLoading = loadingIngs || loadingUnits;

    // 2. Local States cho giao diện
    const [searchTerm, setSearchTerm] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const [currentIngredient, setCurrentIngredient] = useState({
        id: "", name: "", amount: "", unit: "", isNew: false
    });

    // 3. Logic lọc kết quả tìm kiếm tại Client
    const filteredIngredients = dbIngredients.filter(ing =>
        ing.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 4. Logic UI: Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 5. Actions xử lý Dữ liệu
    const handleSelectIngredient = (ing, isNew = false) => {
        setCurrentIngredient(prev => ({
            ...prev,
            id: ing.ingredient_id || `new-${Date.now()}`,
            name: ing.name,
            isNew
        }));
        setSearchTerm(ing.name);
        setShowDropdown(false);
    };

    const handleAddIngredient = () => {
        if (currentIngredient.name && currentIngredient.amount && currentIngredient.unit) {
            onChange([...ingredients, { ...currentIngredient }]);
            // Reset form sau khi add
            setCurrentIngredient({ id: "", name: "", amount: "", unit: "", isNew: false });
            setSearchTerm("");
        }
    };

    const handleRemoveIngredient = (index) => {
        onChange(ingredients.filter((_, i) => i !== index));
    };

    return {
        isLoading,
        dbUnits,
        searchTerm, setSearchTerm,
        showDropdown, setShowDropdown,
        dropdownRef,
        currentIngredient, setCurrentIngredient,
        filteredIngredients,
        handleSelectIngredient,
        handleAddIngredient,
        handleRemoveIngredient
    };
};