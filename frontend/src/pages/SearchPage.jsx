import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Search, Users, FileText, ChefHat, LayoutGrid, ChevronLeft, ChevronRight } from "lucide-react"; 

import Header from "../component/common/Header";
import { Footer } from "../component/common/Footer";
import { RecipeCard } from "../component/common/RecipeCard";
import ArticleCard from "../component/common/ArticleCard";
import UserCard from "../component/common/UserCard";
import { RecipeFilter } from "../component/common/RecipeFilter";
// [1] Import RecipeSection
import { RecipeSection } from "../component/homepage/RecipeSection"; 

import { useSearchData } from "../hooks/useSearchData"; // Giả sử bạn đã có hook này từ bước trước

const Sidebar = ({ activeTab, onTabChange }) => {
    const [isOpen, setIsOpen] = useState(true);
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
                // Gọi prop onTabChange thay vì setActiveTab trực tiếp
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
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const keyword = searchParams.get("keyword") || "";

  const initialTab = searchParams.get("tab") || "all";
  const [activeTab, setActiveTab] = useState("all");
  const [userSort, setUserSort] = useState("newest");
  const [recipeFilter, setRecipeFilter] = useState({});

  const { users, recipes, articles, loading, handleFollowUser } = useSearchData({
      keyword,
      activeTab,
      userSort,
      recipeFilter
  });

  console.log("SearchPage: ", recipes);

  const handleFilterChange = useCallback((newFilter) => {
    setRecipeFilter(newFilter);
  }, []);

  const handleCardClick = useCallback((id) => {
    navigate(`/recipe/${id}`);
  }, [navigate]);

  // [2] Hàm chuẩn hóa dữ liệu Recipe trước khi đưa vào RecipeSection
  // Vì RecipeSection chỉ spread props {...recipe} nên cần map đúng key mà RecipeCard cần
  const normalizeRecipesForSection = (rawRecipes) => {
    return rawRecipes.map(recipe => ({
        ...recipe,
        id: recipe.recipe_id, // RecipeCard cần prop 'id'
        image: recipe.cover_image, // RecipeCard cần prop 'image'
        userId: recipe.author_id,
        userName: recipe.author_name, // RecipeCard cần prop 'userName'
        userAvatar: recipe.author_avatar, // RecipeCard cần prop 'userAvatar'
        cookTime: recipe.cook_time ? `${recipe.cook_time} phút` : "N/A",
        servings: recipe.servings ? `${recipe.servings} người` : "N/A",
        likes: recipe.like_count || 0,
        rating: recipe.rating_avg_score || 0
    }));
  };

  // const Sidebar = () => {
  //   const [isOpen, setIsOpen] = useState(true);
  //   const tabs = [
  //     { id: "all", label: "Tất cả", icon: LayoutGrid },
  //     { id: "user", label: "Mọi người", icon: Users },
  //     { id: "article", label: "Bài viết", icon: FileText },
  //     { id: "recipe", label: "Món ăn", icon: ChefHat },
  //   ];
  //   const displayedTabs = isOpen ? tabs : tabs.filter(t => t.id === activeTab);

  //   return (
  //     <motion.div animate={{ width: isOpen ? "100%" : "auto" }} className="bg-white rounded-2xl shadow-sm p-4 transition-all">
  //       <div className="flex items-center justify-between mb-4 px-2">
  //         <h3 className="font-bold text-gray-800 text-lg whitespace-nowrap">Tìm kiếm theo</h3>
  //         <button onClick={() => setIsOpen(!isOpen)} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 ml-auto">
  //           {isOpen ? <ChevronLeft className="w-5 h-5"/> : <ChevronRight className="w-5 h-5"/>}
  //         </button>
  //       </div>
  //       <div className="flex flex-col gap-2">
  //         {displayedTabs.map((tab) => {
  //           const Icon = tab.icon;
  //           return (
  //             <button
  //               key={tab.id}
  //               onClick={() => { setActiveTab(tab.id); if (!isOpen) setIsOpen(true); }}
  //               className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-left whitespace-nowrap ${
  //                 activeTab === tab.id ? "bg-[#ff6b35] text-white shadow-md shadow-orange-200" : "text-gray-600 hover:bg-[#fff9f0] hover:text-[#ff6b35]"
  //               }`}
  //             >
  //               <Icon className="w-5 h-5 flex-shrink-0" />
  //               <span>{tab.label}</span>
  //             </button>
  //           );
  //         })}
  //       </div>
  //     </motion.div>
  //   );
  // };

  const UserGrid = ({ data, isHorizontal = false }) => {
    if (data.length === 0) return <EmptyState text="Không tìm thấy người dùng phù hợp" />;

    if (isHorizontal) {
      return (
        <div className="flex overflow-x-auto pb-6 gap-4 scrollbar-hide -mx-4 px-4">
          {data.map((user) => (
            <div key={user.user_id} className="w-64 flex-shrink-0">
              <UserCard 
                id={user.user_id}
                fullName={user.full_name}
                avatar={user.avatar} 
                bio={user.bio}
                followersCount={user.followers_count}
                isFollowing={user.isFollowing} 
            
               onFollow={() => handleFollowUser(user.user_id)}
              />
            </div>
          ))}
          <div className="flex items-center justify-center min-w-[100px]">
             <button onClick={() => setActiveTab('user')} className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#ff6b35] hover:text-white transition-all">
                <LayoutGrid className="w-6 h-6"/>
             </button>
          </div>
        </div>
      );
    }
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
            
             onFollow={() => handleFollowUser(user.user_id)}
          />
        ))}
      </div>
    );
  };

  const ArticleList = ({ data }) => {
    if (data.length === 0) return <EmptyState text="Không tìm thấy bài viết" />;
    return (
      <div className="flex flex-col gap-4">
        {data.map((article) => (
          <ArticleCard key={article.id} {...article} />
        ))}
      </div>
    );
  };

  // RecipeGrid dùng cho tab "Món ăn" (hiển thị dạng lưới dọc)
  const RecipeGrid = ({ data }) => {
    if (data.length === 0) return <EmptyState text="Không tìm thấy món ăn nào" />;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
        {data.map((recipe) => (
          <div key={recipe.recipe_id} className="hover:z-50 transition-all duration-200">
             <RecipeCard 
              // 1. Truyền ID
                  id={recipe.recipe_id}
                  
                  // 2. Truyền thông tin cơ bản (Hook đã map sẵn title, description...)
                  title={recipe.title}
                  description={recipe.description}
                  
                  // 3. Truyền ảnh (Dùng key đã chuẩn hóa URL từ Hook)
                  image={recipe.cover_image} 
                  
                  // 4. Truyền tác giả
                  userId = {recipe.author_id}
                  userName={recipe.author_name}
                  userAvatar={recipe.author_avatar} // Dùng key đã chuẩn hóa
                  
                  // 5. Truyền Stats (Hook đã chuẩn hóa displayCookTime, displayServings)
                  // Tuy nhiên RecipeCard cần 'cookTime' chứ ko phải 'displayCookTime'
                  // Ta lấy giá trị hiển thị truyền vào
                  cookTime={recipe.displayCookTime} 
                  servings={recipe.displayServings}
                  calories={recipe.total_calo} // DB là total_calo
                  
                  // 6. Truyền tương tác
                  likes={recipe.like_count || 0}
                  rating={recipe.rating_avg_score || 0}
                  commentCount={recipe.comment_count || 0}
                  
                  // 7. Truyền trạng thái (Map từ field DB trả về)
                  isLiked={!!recipe.is_liked}
                  isSaved={!!recipe.is_saved}
                  
                  // 8. Sự kiện click
                  onClick={() => handleCardClick(recipe.recipe_id)}
             />
          </div>
        ))}
      </div>
    );
  };

  const EmptyState = ({ text }) => (
    <div className="bg-white rounded-2xl p-10 text-center border-2 border-dashed border-gray-200">
        <div className="text-4xl mb-3">🕵️‍♀️</div>
        <p className="text-gray-500">{text}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
                Kết quả tìm kiếm cho "{keyword}"
            </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3 transition-all duration-300">
            <div className="sticky top-24 space-y-6">
                <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
                {(activeTab === 'recipe') && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                        <RecipeFilter onFilterChange={handleFilterChange} />
                    </motion.div>
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
                                    <button onClick={() => setActiveTab('user')} className="text-sm text-[#ff6b35] hover:underline">Xem thêm</button>
                                </div>
                                <UserGrid data={users} isHorizontal={true} />
                            </section>

                            <hr className="border-gray-200" />

                            {/* [3] THAY THẾ RECIPE SECTION TẠI ĐÂY */}
                            <RecipeSection 
                                title="Công thức" 
                                recipes={normalizeRecipesForSection(recipes)} 
                                onRecipeClick={(id) => navigate(`/recipe/${id}`)}
                            />

                            <hr className="border-gray-200" />

                            <section>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                        <FileText className="text-[#ff6b35]"/> Bài viết học thuật
                                    </h2>
                                    <button onClick={() => setActiveTab('article')} className="text-sm text-[#ff6b35] hover:underline">Xem thêm</button>
                                </div>
                                <ArticleList data={articles.slice(0, 3)} />
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
                            {/* Ở tab riêng thì vẫn giữ dạng lưới dọc để xem được nhiều */}
                            <RecipeGrid data={recipes} />
                        </div>
                    )}

                    {/* TAB: ARTICLE */}
                    {activeTab === 'article' && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Bài viết học thuật</h2>
                            <ArticleList data={articles} />
                        </div>
                    )}
               </div>
          </div>
        </div>
      </main>
    </div>
  );
}