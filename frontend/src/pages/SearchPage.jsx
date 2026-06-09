import { useSearchParams, useNavigate } from "react-router-dom";
import { Users, FileText } from "lucide-react"; 
import { motion } from "framer-motion";

// Khung chung
import Header from "../component/common/Header";
import { Footer } from "../component/common/Footer";
import Pagination from "../component/common/Pagination";

// Phần nội dung chia nhỏ đã tách (Chuẩn SRP)
import SearchSidebar from "../component/search/SearchSidebar";
import { EmptyState, UserGrid, ArticleList } from "../component/search/SearchShared";
import { RecipeFilter } from "../component/common/RecipeFilter";
import { ArticleFilter } from "../component/common/ArticleFilter"; 
import { RecipeSection } from "../component/homepage/RecipeSection"; 
import { RecipeCard } from "../component/common/RecipeCard";

// Hooks
import { useSearchUI } from "../hooks/ui/search/useSearchUI";
import { useSearchUsersQuery, useSearchRecipesQuery, useSearchArticlesQuery } from "../hooks/queries/useSearchQueries";

export default function SearchPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const keyword = searchParams.get("keyword") || "";

    // 1. KẾT NỐI UI HOOK
    const {
        activeTab, currentPage, userSort, setUserSort, 
        recipeFilter, articleFilter, handleTabChange, 
        handleFilterChange, handlePageChange
    } = useSearchUI(keyword);

    // 2. KẾT NỐI DATA QUERIES
    const isAllTab = activeTab === "all";
    
    const userQuery = useSearchUsersQuery({ keyword, page: currentPage, sort: userSort, limit: isAllTab ? 8 : 12, enabled: isAllTab || activeTab === "user" });
    const recipeQuery = useSearchRecipesQuery({ keyword, page: currentPage, filters: recipeFilter, limit: isAllTab ? 8 : 12, enabled: isAllTab || activeTab === "recipe" });
    const articleQuery = useSearchArticlesQuery({ keyword, page: currentPage, filters: articleFilter, limit: isAllTab ? 3 : 10, enabled: isAllTab || activeTab === "article" });

    // 3. MAP DATA
    const users = userQuery.data?.data || [];
    const recipes = recipeQuery.data?.data || [];
    const articles = articleQuery.data?.data || [];
    
    let pagination = {};
    if (activeTab === 'user') pagination = userQuery.data?.pagination || {};
    if (activeTab === 'recipe') pagination = recipeQuery.data?.pagination || {};
    if (activeTab === 'article') pagination = articleQuery.data?.pagination || {};

    const loading = userQuery.isFetching || recipeQuery.isFetching || articleQuery.isFetching;

    return (
        <div className="min-h-screen">
            <main className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Kết quả tìm kiếm cho "{keyword}"</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* CỘT TRÁI: SIDEBAR & BỘ LỌC */}
                    <div className="lg:col-span-3 transition-all duration-300">
                        <div className="sticky top-24 space-y-6">
                            <SearchSidebar activeTab={activeTab} onTabChange={handleTabChange} />
                            
                            {activeTab === 'recipe' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                                    <RecipeFilter filters={recipeFilter} onFilterChange={(f) => handleFilterChange('recipe', f)} />
                                </motion.div>
                            )}

                            {activeTab === 'article' && (
                                <ArticleFilter filters={articleFilter} onFilterChange={(f) => handleFilterChange('article', f)} />
                            )}
                        </div>
                    </div>

                    {/* CỘT PHẢI: KẾT QUẢ */}
                    <div className="lg:col-span-9 space-y-8 relative min-h-[500px]">
                        {loading && (
                            <div className="absolute inset-0 z-20 bg-white/50 backdrop-blur-[1px] rounded-2xl flex items-start justify-center pt-20 transition-all duration-300">
                                <div className="sticky top-40 bg-white p-3 rounded-full shadow-lg">
                                    <div className="w-8 h-8 border-4 border-[#ff6b35] border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            </div>
                        )}

                        <div className={`transition-opacity duration-300 ${loading ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                            {/* TAB: TẤT CẢ */}
                            {activeTab === 'all' && (
                                <>
                                    <section>
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Users className="text-[#ff6b35]"/> Mọi người</h2>
                                            <button onClick={() => handleTabChange('user')} className="text-sm text-[#ff6b35] hover:underline">Xem thêm</button>
                                        </div>
                                        <UserGrid data={users} isHorizontal={true} onTabChange={handleTabChange} />
                                    </section>
                                    <hr className="border-gray-200" />
                                    <RecipeSection title="Công thức" recipes={recipes} onRecipeClick={(id) => navigate(`/recipe/${id}`)} />
                                    <hr className="border-gray-200" />
                                    <section>
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><FileText className="text-[#ff6b35]"/> Bài viết học thuật</h2>
                                            <button onClick={() => handleTabChange('article')} className="text-sm text-[#ff6b35] hover:underline">Xem thêm</button>
                                        </div>
                                        <ArticleList data={articles.slice(0, 3)} onCardClick={(id) => navigate(`/article/${id}`)} />
                                    </section>
                                </>
                            )}

                            {/* TAB: USER */}
                            {activeTab === 'user' && (
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold text-gray-800">Mọi người</h2>
                                        <select value={userSort} onChange={(e) => setUserSort(e.target.value)} className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg p-2.5 outline-none focus:ring-[#ff6b35] focus:border-[#ff6b35]">
                                            <option value="newest">Mới nhất</option>
                                            <option value="oldest">Cũ nhất</option>
                                            <option value="most_followed">Nhiều follow nhất</option>
                                        </select>
                                    </div>
                                    <UserGrid data={users} />
                                    <Pagination pagination={pagination} onPageChange={handlePageChange} />
                                </div>
                            )}

                            {/* TAB: RECIPE */}
                            {activeTab === 'recipe' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Công thức nấu ăn</h2>
                                    {recipes.length > 0 ? (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {recipes.map(r => <RecipeCard key={r.id} recipe={r} onClick={() => navigate(`/recipe/${r.id}`)} />)}
                                            </div>
                                            <Pagination pagination={pagination} onPageChange={handlePageChange} />
                                        </>
                                    ) : <EmptyState text="Không tìm thấy món ăn nào phù hợp với bộ lọc." />}
                                </div>
                            )}

                            {/* TAB: ARTICLE */}
                            {activeTab === 'article' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Bài viết học thuật</h2>
                                    {articles.length > 0 ? (
                                        <>
                                            <ArticleList data={articles} onCardClick={(id) => navigate(`/article/${id}`)} />
                                            <Pagination pagination={pagination} onPageChange={handlePageChange} />
                                        </>
                                    ) : <EmptyState text="Không tìm thấy bài viết nào phù hợp với bộ lọc." />}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}