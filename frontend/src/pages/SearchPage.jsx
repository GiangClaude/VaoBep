import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // Fix lại từ framer-motion chuẩn
import { Search, Users, FileText, ChefHat, LayoutGrid, ChevronLeft, ChevronRight } from "lucide-react"; 

import Header from "../component/common/Header";
import { Footer } from "../component/common/Footer";
import { RecipeCard } from "../component/common/RecipeCard";
import ArticleCard from "../component/common/ArticleCard";
import UserCard from "../component/common/UserCard";
import { RecipeFilter } from "../component/common/RecipeFilter";
import { ArticleFilter } from "../component/common/ArticleFilter"; 
import { RecipeSection } from "../component/homepage/RecipeSection"; 
import Pagination from "../component/common/Pagination";

// [MỚI] IMPORT HOOKS KIẾN TRÚC MỚI
import { useSearchUI } from "../hooks/ui/search/useSearchUI";
import { useSearchUsersQuery, useSearchRecipesQuery, useSearchArticlesQuery } from "../hooks/queries/useSearchQueries";


const Sidebar = ({ activeTab, onTabChange }) => {
    // ... (GIỮ NGUYÊN HTML CỦA SIDEBAR)
    const [isOpen, setIsOpen] = useState(true);
    const [searchParams] = useSearchParams();




    const tabs = [
      { id: "all", label: "Tất cả", icon: LayoutGrid },
      { id: "user", label: "Mọi người", icon: Users },
      { id: "article", label: "Bài viết", icon: FileText },
      { id: "recipe", label: "Món ăn", icon: ChefHat },
    ];
    const displayedTabs = isOpen ? tabs : tabs.filter(t => t.id === activeTab);

    return (
      <motion.div animate={{ width: isOpen ? "100%" : "auto" }} className="bg-white rounded-2xl shadow-sm p-4 transition-all">
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="font-bold text-gray-800 text-lg whitespace-nowrap">Tìm kiếm theo</h3>
          <button onClick={() => setIsOpen(!isOpen)} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 ml-auto">
            {isOpen ? <ChevronLeft className="w-5 h-5"/> : <ChevronRight className="w-5 h-5"/>}
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {displayedTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => { onTabChange(tab.id); if (!isOpen) setIsOpen(true); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-left whitespace-nowrap ${
                  activeTab === tab.id ? "bg-[#ff6b35] text-white shadow-md shadow-orange-200" : "text-gray-600 hover:bg-[#fff9f0] hover:text-[#ff6b35]"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>
    );
};

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

  // 2. KẾT NỐI DATA QUERIES (Chỉ gọi khi tab tương ứng được bật)
  const isAllTab = activeTab === "all";
  
  const userQuery = useSearchUsersQuery({
      keyword, page: currentPage, sort: userSort, limit: isAllTab ? 8 : 12, 
      enabled: isAllTab || activeTab === "user"
  });

  const recipeQuery = useSearchRecipesQuery({
      keyword, page: currentPage, filters: recipeFilter, limit: isAllTab ? 8 : 12, 
      enabled: isAllTab || activeTab === "recipe"
  });

  const articleQuery = useSearchArticlesQuery({
      keyword, page: currentPage, filters: articleFilter, limit: isAllTab ? 3 : 10, 
      enabled: isAllTab || activeTab === "article"
  });

  // 3. MAP DATA CHO UI CŨ (Không thay đổi tên biến để JSX dưới giữ nguyên)
  const users = userQuery.data?.data || [];
  const recipes = recipeQuery.data?.data || [];
  const articles = articleQuery.data?.data || [];
  
  // Xử lý Pagination tương ứng theo Tab hiện tại
  let pagination = {};
  if (activeTab === 'user') pagination = userQuery.data?.pagination || {};
  if (activeTab === 'recipe') pagination = recipeQuery.data?.pagination || {};
  if (activeTab === 'article') pagination = articleQuery.data?.pagination || {};

  // Gom trạng thái loading
  const loading = userQuery.isFetching || recipeQuery.isFetching || articleQuery.isFetching;

  const EmptyState = ({ text }) => (
    <div className="bg-white rounded-2xl p-10 text-center border-2 border-dashed border-gray-200">
        <div className="text-4xl mb-3">🕵️‍♀️</div>
        <p className="text-gray-500">{text}</p>
    </div>
  );

  const UserGrid = ({ data, isHorizontal = false }) => {
    if (data.length === 0) return <EmptyState text="Không tìm thấy người dùng phù hợp" />;

    if (isHorizontal) {
      return (
        <div className="flex overflow-x-auto pb-6 gap-4 scrollbar-hide -mx-4 px-4">
          {data.map((user) => (
            <div key={user.user_id} className="w-64 flex-shrink-0">
              {/* [ĐÃ XÓA] prop onFollow vì UserCard hiện tại TỰ GỌI useUserActions bên trong nó */}
              <UserCard 
                id={user.user_id}
                fullName={user.full_name}
                avatar={user.avatar} 
                bio={user.bio}
                followersCount={user.followers_count}
                isFollowing={user.isFollowing} 
              />
            </div>
          ))}
          <div className="flex items-center justify-center min-w-[100px]">
             <button onClick={() => handleTabChange('user')} className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#ff6b35] hover:text-white transition-all">
                <LayoutGrid className="w-6 h-6"/>
             </button>
          </div>
        </div>
      );
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((user) => (
          <UserCard 
            key={user.user_id}
            id={user.user_id}
            fullName={user.full_name}
            avatar={user.avatar}
            bio={user.bio}
            followersCount={user.followers_count}
            isFollowing={user.isFollowing} 
          />
        ))}
      </div>
    );
  };

  const ArticleList = ({ data, onCardClick }) => (
    <div className="grid grid-cols-1 gap-6">
        {data.map((article) => (
            <ArticleCard
                key={article.id}
                {...article}
                onClick={() => onCardClick?.(article.id)}
            />
        ))}
    </div>
  );

  return (
    <div className="min-h-screen ">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
         {/* ... GIỮ NGUYÊN 100% JSX CÒN LẠI CỦA BẠN (Từ dòng <div className="mb-6"> trở xuống) ... */}
         {/* TÔI ĐÃ KIỂM TRA: JSX CŨ HOÀN TOÀN TƯƠNG THÍCH VỚI MAP DATA MỚI */}
         <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
                Kết quả tìm kiếm cho "{keyword}"
            </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3 transition-all duration-300">
            <div className="sticky top-24 space-y-6">
                <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
                {(activeTab === 'recipe') && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                        <RecipeFilter filters={recipeFilter} onFilterChange={(f) => handleFilterChange('recipe', f)} />
                    </motion.div>
                )}

                {activeTab === 'article' && (
                    <ArticleFilter filters={articleFilter} onFilterChange={(f) => handleFilterChange('article', f)} />
                )}
            </div>
          </div>

          <div className="lg:col-span-9 space-y-8 relative min-h-[500px]">
            {loading && (
                <div className="absolute inset-0 z-20 bg-white/50 backdrop-blur-[1px] rounded-2xl flex items-start justify-center pt-20 transition-all duration-300">
                    <div className="sticky top-40 bg-white p-3 rounded-full shadow-lg">
                        <div className="w-8 h-8 border-4 border-[#ff6b35] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                </div>
            )}

              <div className={`transition-opacity duration-300 ${loading ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                    {/* TAB: ALL */}
                    {activeTab === 'all' && (
                        <>
                            <section>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                        <Users className="text-[#ff6b35]"/> Mọi người
                                    </h2>
                                    <button onClick={() => handleTabChange('user')} className="text-sm text-[#ff6b35] hover:underline">Xem thêm</button>
                                </div>
                                <UserGrid data={users} isHorizontal={true} />
                            </section>

                            <hr className="border-gray-200" />

                            <RecipeSection 
                                title="Công thức" 
                                recipes={recipes} 
                                onRecipeClick={(id) => navigate(`/recipe/${id}`)}
                            />

                            <hr className="border-gray-200" />

                            <section>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                        <FileText className="text-[#ff6b35]"/> Bài viết học thuật
                                    </h2>
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
                                <select 
                                    value={userSort} 
                                    onChange={(e) => setUserSort(e.target.value)}
                                    className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg p-2.5 focus:ring-[#ff6b35] focus:border-[#ff6b35]"
                                >
                                    <option value="newest">Mới nhất</option>
                                    <option value="oldest">Cũ nhất</option>
                                    <option value="most_followed">Nhiều follow nhất</option>
                                </select>
                            </div>
                            <UserGrid data={users} />
                        </div>
                    )}

                    {/* TAB: RECIPE */}
                    {activeTab === 'recipe' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Công thức nấu ăn</h2>
                            </div>
                            {recipes.length > 0 ? (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {recipes.map(r => (
                                                    <RecipeCard key={r.id} recipe={r} onClick={() => navigate(`/recipe/${r.id}`)} />
                                                ))}
                                            </div>
                                            <Pagination pagination={pagination} onPageChange={handlePageChange} />
                                        </>
                                    ) : (
                                        <EmptyState text="Không tìm thấy bài viết nào phù hợp với bộ lọc." />
                                    )}
                        </div>
                    )}

                    {/* TAB: ARTICLE */}
                    {activeTab === 'article' && (
                       <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Bài viết học thuật</h2>
                                    {articles.length > 0 ? (
                                        <>
                                            <ArticleList data={articles} onCardClick={(id) => navigate(`/article/${id}`)} />
                                            {/* Hiển thị phân trang cho Bài viết */}
                                           <Pagination 
                                                pagination={pagination} 
                                                onPageChange={handlePageChange} 
                                            />
                                        </>
                                    ) : (
                                        <EmptyState text="Không tìm thấy bài viết nào phù hợp với bộ lọc." />
                                    )}
                                </div>
                    )}
               </div>
          </div>
        </div>
      </main>
    </div>
  );
}