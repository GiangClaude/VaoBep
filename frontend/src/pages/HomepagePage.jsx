import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from "../component/common/Header";
import { Footer } from "../component/common/Footer";
import { Slideshow } from "../component/homepage/Slideshow";
import { RecipeSection } from "../component/homepage/RecipeSection";
import { MenuSection } from '../component/homepage/MenuSection';
import DictionaryBanner from "../component/homepage/DictionaryBanner";
import ArticleSection from "../component/homepage/ArticleSection";
import Sidebar from '../component/homepage/Sidebar';

// [MỚI] IMPORT CÁC QUERY HOOKS (Tuyệt đối không dùng hook cũ nữa)
import { useRecentRecipesQuery, useOwnerRecipesQuery } from '../hooks/queries/useRecipesQueries';
import { useFeaturedArticlesQuery } from '../hooks/queries/useArticlesQueries';
import { usePublicMenusQuery } from '../hooks/queries/useMenuQueries';

export default function HomePage() {
  const navigate = useNavigate();

  // [MỚI] Lấy data từ React Query (Cắm thẳng vào Cache)
  const { data: latestRecipes = [], isLoading: latestLoading } = useRecentRecipesQuery();
  const { data: ownerRecipes = [], isLoading: ownerLoading } = useOwnerRecipesQuery();
  const { data: featuredArticles = [], isLoading: featuredLoading } = useFeaturedArticlesQuery(3);
  const { data: latestMenus = [], isLoading: menuLoading } = usePublicMenusQuery();

  // Handle Navigation
  const handleNavigateToDetail = (id) => navigate(`/recipe/${id}`);
  const handleViewMoreRecipes = () => navigate('/recipes');

  return (
    <div className="min-h-screen bg-[#fff9f0]">
      <div className="mb-16">
        <Slideshow />
      </div>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 container mx-auto px-4">
        <div className="lg:col-span-8">
          
          {/* LATEST RECIPES */}
          {latestLoading ? (
            <div className="w-full h-64 flex items-center justify-center text-[#7d5a3f] animate-pulse">
              Đang tải công thức mới...
            </div>
          ) : (
            <RecipeSection 
              title="Mới Cập Nhật" 
              recipes={latestRecipes} 
              onRecipeClick={handleNavigateToDetail} 
              onViewMoreClick={handleViewMoreRecipes}
            />
          )} 
          
          {/* FEATURED ARTICLES */}
          {featuredLoading ? (
            <div className="w-full h-40 flex items-center justify-center text-[#7d5a3f] animate-pulse">
              Đang tải bài viết nổi bật...
            </div>
          ) : (
            <ArticleSection articles={featuredArticles} />
          )}

          {/* LATEST MENUS */}
          <MenuSection 
              title="Thực đơn mới nhất" 
              menus={latestMenus.slice(0, 5)} 
              isLoading={menuLoading} 
          /> 

          {/* DICTIONARY BANNER */}
          <DictionaryBanner />

          {/* OWNER RECIPES */}
          {ownerLoading ? (
            <div className="w-full h-64 flex items-center justify-center text-[#7d5a3f] animate-pulse">
              Đang tải công thức của bạn...
            </div>
          ) : (
             <RecipeSection 
              title="Công Thức Của Bạn" 
              recipes={ownerRecipes} 
              onRecipeClick={handleNavigateToDetail} 
              onViewMoreClick={handleViewMoreRecipes}
            />
          )}
        </div>

        {/* SIDEBAR */}
        <div className="lg:col-span-4">
          <Sidebar />
        </div>
      </main>
    </div>
  );
}