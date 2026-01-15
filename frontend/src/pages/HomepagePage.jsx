import {React, useState} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import {Eye, EyeOff, Mail, Lock} from 'lucide-react';
import apiClient from '../api';
import { useAuth } from '../AuthContext';

import  Header  from "../component/common/Header";
import { Slideshow } from "../component/homepage/Slideshow";
import { RecipeSection } from "../component/homepage/RecipeSection";
import { Footer } from "../component/common/Footer";
import {useRecentlyRecipes} from "../hooks/useRecentlyRecipes";
import {useOwnerRecipes} from "../hooks/useOwnerRecipes";

import { forYouRecipes, challengeRecipes } from "../data/recipe";

import DictionaryBanner from "../component/homepage/DictionaryBanner";
import ArticleSection from "../component/homepage/ArticleSection";
import  Sidebar  from '../component/homepage/Sidebar';
import ArticleCard from "../component/common/ArticleCard";
import { articles } from "../data/articles";

export default function HomePage() {
  const { recipes: latestRecipes, loading: latestLoading } = useRecentlyRecipes();
  const { recipes: ownerRecipes, loading: ownerLoading} = useOwnerRecipes();
  const navigate = useNavigate();

  const handleNavigateToDetail = (id) => {
    const recipe = (latestRecipes || []).find(r => String(r.id) === String(id)) || (ownerRecipes || []).find(r => String(r.id) === String(id)) || (forYouRecipes || []).find(r => String(r.id) === String(id));
    navigate(`/recipe/${id}`, { state: { recipe } });
  };
  const handleViewMoreRecipes = () => {
    // Chuyển hướng sang trang danh sách công thức (RecipesListPage)
    navigate('/recipes');
  };

  return (

    <div className="min-h-screen bg-[#fff9f0]">
      {/* <Header /> */}
        <div className="mb-16">
          <Slideshow />
        </div>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <RecipeSection title="For You" recipes={forYouRecipes} onRecipeClick={handleNavigateToDetail} onViewMoreClick={handleViewMoreRecipes}/>

          {/* Article Section */}
          <ArticleSection articles={articles} />
            

          {latestLoading ? (
           // Skeleton loading hoặc text đơn giản
           <div className="w-full h-64 flex items-center justify-center text-[#7d5a3f]">
              Đang tải công thức mới...
            </div>
          ) : (
            <RecipeSection title="Latest Recipes" recipes={latestRecipes} onRecipeClick={handleNavigateToDetail} onViewMoreClick={handleViewMoreRecipes}/>
          )}  

          {/* Dictionary Banner */}
          <DictionaryBanner />


          {/* Recipe Section - Your Recipes */}
          <RecipeSection title="Your Recipe" recipes={ownerRecipes} onRecipeClick={handleNavigateToDetail} onViewMoreClick={handleViewMoreRecipes}/>
          </div>

          {/* Right Column - Sidebar (35%) */}
          <div className="lg:col-span-4">
            <Sidebar />
          </div>
      </main>

      {/* <Footer /> */}
    </div>
  );
}