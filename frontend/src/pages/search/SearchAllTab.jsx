import { useNavigate, useSearchParams } from "react-router-dom";
import { Users, FileText } from "lucide-react";
import { UserGrid, ArticleList } from "../../component/search/SearchShared";
import { RecipeSection } from "../../component/homepage/RecipeSection";
import { useSearchUsersQuery, useSearchRecipesQuery, useSearchArticlesQuery } from "../../hooks/queries/useSearchQueries";

export default function SearchAllTab() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const keyword = searchParams.get("keyword") || "";

    // Lấy 3 API cùng lúc
    const { data: userData, isFetching: loadingU } = useSearchUsersQuery({ keyword, page: 1, limit: 8, enabled: true });
    const { data: recipeData, isFetching: loadingR } = useSearchRecipesQuery({ keyword, page: 1, limit: 8, enabled: true });
    const { data: articleData, isFetching: loadingA } = useSearchArticlesQuery({ keyword, page: 1, limit: 3, enabled: true });

    const loading = loadingU || loadingR || loadingA;

    if (loading) return <div className="py-20 text-center animate-pulse text-[#ff6b35] font-bold">Đang tìm kiếm...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2"><Users className="text-[#ff6b35]"/> Mọi người</h2>
                    <button onClick={() => navigate(`/search/users?keyword=${keyword}`)} className="text-sm text-[#ff6b35] hover:underline">Xem thêm</button>
                </div>
                <UserGrid data={userData?.data || []} isHorizontal={true} onTabChange={() => navigate(`/search/users?keyword=${keyword}`)} />
            </section>
            <hr className="border-gray-200" />
            <RecipeSection title="Công thức" recipes={recipeData?.data || []} onRecipeClick={(id) => navigate(`/recipe/${id}`)} />
            <hr className="border-gray-200" />
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2"><FileText className="text-[#ff6b35]"/> Bài viết học thuật</h2>
                    <button onClick={() => navigate(`/search/articles?keyword=${keyword}`)} className="text-sm text-[#ff6b35] hover:underline">Xem thêm</button>
                </div>
                <ArticleList data={(articleData?.data || []).slice(0, 3)} onCardClick={(id) => navigate(`/article/${id}`)} />
            </section>
        </div>
    );
}