import { useState, useMemo } from "react";
import { useGlobalModal } from "../../../context/ModalContext";

// Import Hooks chuẩn
import { useOwnerRecipesQuery } from "../../queries/useRecipesQueries";
import { useFetchRecipeDetailAsync } from "../../queries/useRecipeDetailQuery"; // <-- IMPORT TỪ ĐÂY
import { useDeleteRecipeMutation, useChangeRecipeStatusMutation } from "../../mutations/useContentMutations";

export const useMyRecipesUI = ({ isPublicView, publicRecipes }) => {
    const { showModal } = useGlobalModal();

    const [filter, setFilter] = useState("all");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingRecipe, setEditingRecipe] = useState(null);

    const { data: ownerRecipes = [], isLoading: isLoadingRecipes } = useOwnerRecipesQuery();
    const deleteMutation = useDeleteRecipeMutation();
    const statusMutation = useChangeRecipeStatusMutation();
    
    // Gọi hook để lấy cái hàm fetch
    const fetchRecipeDetailAsync = useFetchRecipeDetailAsync();

    const displayRecipes = useMemo(() => {
        let result = isPublicView ? publicRecipes : ownerRecipes;
        if (isPublicView) {
            result = result.filter(r => r.status === 'public');
        } else if (filter !== "all") {
            result = result.filter(r => r.status === filter);
        }
        return result;
    }, [isPublicView, publicRecipes, ownerRecipes, filter]);

    const handleCreateNew = () => {
        setEditingRecipe(null);
        setIsCreateModalOpen(true);
    };

    // Khi User bấm Edit -> Gọi hàm, đợi kết quả, nhét vào state, mở Modal. Clean & clear!
    const handleEditRecipe = async (id) => {
        try {
            const recipeData = await fetchRecipeDetailAsync(id); 
            console.log("Editing Recipe Data: ", recipeData);
            setEditingRecipe(recipeData);
            setIsCreateModalOpen(true);
        } catch (error) {
            showModal({ title: "Lỗi", message: "Không thể tải dữ liệu công thức!", type: "error" });
        }
    };

    const handleConfirmDelete = (recipeId) => {
        showModal({
            title: "Xác nhận xóa",
            message: "Bạn có chắc chắn muốn xóa công thức này?",
            type: "warning",
            actions: [
                { label: "Hủy", style: "secondary" },
                {
                    label: "Xóa", style: "danger",
                    onClick: () => deleteMutation.mutate(recipeId, {
                        onSuccess: () => showModal({ title: "Thành công", message: "Đã xóa công thức!", type: "success" })
                    })
                }
            ]
        });
    };

    const handleToggleVisibility = (recipe) => {
        const newStatus = recipe.status === 'hidden' ? 'public' : 'hidden';
        statusMutation.mutate({ recipeId: recipe.id, status: newStatus });
    };

    return {
        filter, setFilter,
        isCreateModalOpen, setIsCreateModalOpen,
        editingRecipe,
        isLoadingRecipes,
        displayRecipes,
        handleCreateNew,
        handleEditRecipe,
        handleConfirmDelete,
        handleToggleVisibility
    };
};