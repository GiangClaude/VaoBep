// frontend/src/pages/RecipeDetailPage.jsx
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Star, Clock, Users, ChefHat, Flame, Calendar, MessageCircle, Share2, ArrowLeft, Bookmark, TrendingUp, AlertCircle, Tag } from "lucide-react";
import ImageWithFallBack from "../component/figma/ImageWithFallBack";
import CommentSection from "../component/comment/CommentSection";
import AiSummaryBanner from "../component/common/AiSummaryBanner";
import { Footer } from "../component/common/Footer";
import { handleTagClick } from "../utils/tagUtils";
// [MỚI] Sử dụng các Hook độc lập
import { useRecipeDetailQuery } from '../hooks/queries/useRecipeDetailQuery';
import { useInteractionStateQuery } from '../hooks/queries/useInteractionQueries';
import { usePostActions } from '../hooks/ui/interaction/usePostActions';
import { useAuth } from '../AuthContext';

export default function RecipeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // 1. Fetch dữ liệu bài viết tĩnh (Nhanh, có thể cache lâu)
  const { data: recipe, isLoading, error } = useRecipeDetailQuery(id);
  console.log("Fetched Recipe Detail:", recipe);

  // Tách riêng detailedIngredients và detailedSteps để dễ sử dụng
  const detailedIngredients = recipe?.detailedIngredients || [];
  const detailedSteps = recipe?.detailedSteps || [];
  
  // [MỚI] Khai báo an toàn mảng các tag từ dữ liệu trả về của server
  const tags = recipe?.tags || []; 

  // 2. Fetch trạng thái cá nhân (isLiked, isSaved) độc lập (Chỉ fetch khi có User)
  const { data: interactionState } = useInteractionStateQuery(id, 'recipe', !!currentUser);
  const isLiked = interactionState?.liked !== undefined ? interactionState.liked : (recipe?.isLiked || false);
  const isSaved = interactionState?.saved !== undefined ? interactionState.saved : (recipe?.isSaved || false);
  const likesCount = recipe?.likes || 0;
  
  // 3. Khởi tạo Hook tương tác
  const { handleLike, handleSave, handleShare, handleReport } = usePostActions({
    id,
    type: 'recipe',
    isLiked: isLiked || false,
    likesCount: likesCount,
    isSaved: isSaved || false
  });

  if (isLoading) return <div className="min-h-screen bg-[#fff9f0] flex items-center justify-center">Đang tải...</div>;
  if (error || !recipe) return <div className="min-h-screen bg-[#fff9f0] flex items-center justify-center text-red-500">Lỗi: Không tìm thấy công thức</div>;

  const isAuthor = currentUser?.id === recipe.userId;

  return (
    <div className="min-h-screen bg-[#fff9f0]">
      <main className="container mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#ff6b35] mb-6">
          <ArrowLeft className="w-5 h-5" /> <span>Quay lại</span>
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[30px] shadow-xl overflow-hidden mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* ẢNH & NÚT BẤM (GỌI HÀM TỪ usePostActions) */}
            <div className="relative h-[400px] lg:h-[500px]">
              <ImageWithFallBack src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              <div className="absolute top-6 right-6 flex gap-3 items-center">
                <button onClick={handleLike} className={`p-3 rounded-full backdrop-blur-md shadow-lg ${isLiked ? "bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white" : "bg-white/90 text-[#7d5a3f]"}`}>
                  <Heart className="w-6 h-6" fill={isLiked ? "currentColor" : "none"} />
                </button>
                <button onClick={handleSave} className={`p-3 rounded-full backdrop-blur-md shadow-lg ${isSaved ? "bg-[#ffc857] text-white" : "bg-white/90 text-[#7d5a3f]"}`}>
                  <Bookmark className="w-6 h-6" fill={isSaved ? "currentColor" : "none"} />
                </button>
                <button onClick={isAuthor ? undefined : handleReport} disabled={isAuthor} className={`p-3 rounded-full backdrop-blur-md shadow-lg ${isAuthor ? 'opacity-50 cursor-not-allowed' : 'bg-white/90 text-red-500 hover:bg-red-50'}`}>
                  <AlertCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* THÔNG TIN CHI TIẾT CÔNG THỨC */}
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <h1 className="text-4xl mb-4 font-bold text-gray-800">{recipe.title}</h1>
              <div className="flex items-center gap-3 mb-6"> {/* Giảm mb từ 8 xuống 6 cho thoáng mắt */}
                <ImageWithFallBack src={recipe.userAvatar} alt="Author" className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                <div><p className="text-[#7d5a3f] text-xs font-bold uppercase">Tác giả</p><p className="font-semibold text-lg">{recipe.userName}</p></div>
              </div>

              {/* [THÊM MỚI] Hiển thị danh sách thẻ tags của món ăn dưới dạng chip */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6 items-center">
                  <Tag className="w-4 h-4 text-[#ff6b35] mr-1" />
                  {tags.map((tag) => (
                    <span 
                      key={tag.tag_id} 
                      onClick={() => handleTagClick(navigate, tag.tag_id, 'recipes')}
                      className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#ff6b35]/10 text-[#ff6b35] text-xs font-bold border border-[#ff6b35]/20 shadow-sm transition-all hover:brightness-95 cursor-default"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              <div className="bg-[#fff9f0] p-6 rounded-2xl border border-[#ffc857]/20">
                <p className="text-[#7d5a3f] whitespace-pre-line text-sm">{recipe.detailedDescription}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* NỘI DUNG CHÍNH (NGUYÊN LIỆU & BƯỚC NẤU & BÌNH LUẬN) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-[25px] shadow-lg p-8">
              <h2 className="text-2xl mb-6 flex items-center gap-3 font-bold text-gray-800"><ChefHat className="w-8 h-8 text-[#ff6b35]" /> Nguyên Liệu</h2>
              {detailedIngredients && detailedIngredients.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {detailedIngredients.map((ingredient, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-[#fff9f0] rounded-xl border border-transparent hover:border-[#ffc857]/50 transition-colors">
                        <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-[#ff6b35]" /><span className="font-medium text-gray-700">{ingredient.name}</span></div>
                        <span className="text-[#ff6b35] font-bold">{ingredient.amount}</span>
                      </div>
                    ))}
                  </div>
              ) : ( <p className="text-[#7d5a3f] italic">Chưa cập nhật nguyên liệu.</p> )}
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-[25px] shadow-lg p-8">
              <h2 className="text-2xl mb-6 flex items-center gap-3 font-bold text-gray-800"><TrendingUp className="w-8 h-8 text-[#ff6b35]" /> Hướng Dẫn Thực Hiện</h2>
              <div className="space-y-8">
                {detailedSteps && detailedSteps.length > 0 ? (
                    detailedSteps.map((step) => (
                      <div key={step.step} className="flex gap-5">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#ff6b35] to-[#f7931e] text-white flex items-center justify-center font-bold text-xl shadow-lg border-4 border-[#fff9f0]">{step.step}</div>
                        <div className="flex-grow">
                            <div className="bg-[#fff9f0] rounded-2xl p-6 relative">
                                <div className="absolute top-6 left-[-10px] w-4 h-4 bg-[#fff9f0] transform rotate-45"></div>
                                <p className="text-gray-800 leading-relaxed whitespace-pre-line font-medium">{step.description}</p>
                            </div>
                        </div>
                      </div>
                    ))
                ) : ( <p className="text-[#7d5a3f] italic">Chưa cập nhật hướng dẫn.</p> )}
              </div>
            </motion.div>
            
            <CommentSection postId={id} postType="recipe" />
          </div>

          <div className="lg:col-span-1">
             <AiSummaryBanner contextText={`Món: ${recipe.title}. Hướng dẫn: ${JSON.stringify(recipe.detailedSteps)}`} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}