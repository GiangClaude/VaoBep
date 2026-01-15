import Header from "../component/common/Header";
import { Footer } from "../component/common/Footer"; 
import { motion } from "motion/react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Heart, Star, Clock, Users, ChefHat, Flame, Calendar, MessageCircle, Send, ArrowLeft, Bookmark, TrendingUp
} from "lucide-react";
import ImageWithFallBack from "../component/figma/ImageWithFallBack";
import useRecipeDetail from '../hooks/useRecipeDetail';
import Modal from "../component/common/modal"; // [THÊM IMPORT MODAL]

const getAvatarUrl = (user) => {
    if (user.avatar && user.avatar.startsWith('http')) return user.avatar;
    return user.avatar 
        ? `http://localhost:5000/public/user/${user.user_id}/${user.avatar}` 
        : '/avatar_default.png';
};

export default function RecipeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const recipeFromState = location.state?.recipe;

  const {
    recipeState,
    loading,
    isLiked,
    isSaved,
    userRating,
    comments,
    commentInput,
    setCommentInput,
    handleLike,
    handleSave,
    handleRating,
    handleCommentSubmit,
    loadingComments,
    requireLogin,   // [LẤY TỪ HOOK]
    setRequireLogin // [LẤY TỪ HOOK]
  } = useRecipeDetail({ id, initialRecipe: recipeFromState });

  // --- LOADING / ERROR STATES ---
  if (loading && !recipeState) return <div className="min-h-screen bg-[#fff9f0] flex items-center justify-center text-[#7d5a3f]">Đang tải...</div>;
  if (!recipeState) return <div className="min-h-screen bg-[#fff9f0] text-center pt-20">Không tìm thấy công thức</div>;

  const { detailedDescription, detailedIngredients, detailedSteps } = recipeState;

  return (
    <div className="min-h-screen bg-[#fff9f0]">
      
      {/* [THÊM MODAL VÀO ĐÂY] */}
      <Modal 
        isOpen={requireLogin}
        onClose={() => setRequireLogin(false)}
        title="Yêu cầu đăng nhập"
        message="Bạn cần đăng nhập để thực hiện hành động này."
        type="warning"
        actions={[
            { 
                label: "Hủy bỏ", 
                onClick: () => setRequireLogin(false),
                style: "secondary"
            },
            { 
                label: "Đăng nhập ngay", 
                onClick: () => navigate('/login'),
                style: "primary"
            }
        ]}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Nút Back */}
        <button onClick={() => navigate('/recipes')} className="flex items-center gap-2 text-[#ff6b35] hover:text-[#f7931e] transition-colors mb-6 font-medium">
          <ArrowLeft className="w-5 h-5" /> <span>Quay lại danh sách</span>
        </button>

        {/* --- 1. HERO SECTION --- */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[30px] shadow-xl overflow-hidden mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative h-[400px] lg:h-[500px]">
              <ImageWithFallBack src={recipeState.image} alt={recipeState.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              <div className="absolute top-6 right-6 flex gap-3 items-center">
                <motion.button onClick={handleLike} whileTap={{ scale: 0.9 }} className={`p-3 rounded-full backdrop-blur-md shadow-lg ${isLiked ? "bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white" : "bg-white/90 text-[#7d5a3f]"}`}>
                  <Heart className="w-6 h-6" fill={isLiked ? "currentColor" : "none"} />
                </motion.button>
                <motion.button onClick={handleSave} whileTap={{ scale: 0.9 }} className={`p-3 rounded-full backdrop-blur-md shadow-lg ${isSaved ? "bg-[#ffc857] text-white" : "bg-white/90 text-[#7d5a3f]"}`}>
                  <Bookmark className="w-6 h-6" fill={isSaved ? "currentColor" : "none"} />
                </motion.button>
              </div>
            </div>

            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <h1 className="text-4xl mb-4 font-bold text-gray-800 leading-tight">{recipeState.title}</h1>
              <div className="flex items-center gap-3 mb-8">
                <ImageWithFallBack src={recipeState.userAvatar} alt={recipeState.userName} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                <div><p className="text-[#7d5a3f] text-xs font-bold uppercase tracking-wider">Tác giả</p><p className="font-semibold text-lg">{recipeState.userName}</p></div>
                <div className="ml-auto flex items-center gap-2 text-sm text-[#7d5a3f] bg-[#fff9f0] px-3 py-1 rounded-full"><Calendar className="w-4 h-4" /> {recipeState.createdAt}</div>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-8">
                <div className="bg-[#fff9f0] p-3 rounded-2xl text-center"><Clock className="w-6 h-6 text-[#ff6b35] mx-auto mb-1" /><p className="text-xs text-[#7d5a3f]">Thời gian</p><p className="font-bold text-gray-800">{recipeState.cookTime}</p></div>
                <div className="bg-[#fff9f0] p-3 rounded-2xl text-center"><Users className="w-6 h-6 text-[#ff6b35] mx-auto mb-1" /><p className="text-xs text-[#7d5a3f]">Khẩu phần</p><p className="font-bold text-gray-800">{recipeState.servings}</p></div>
                <div className="bg-[#fff9f0] p-3 rounded-2xl text-center"><Flame className="w-6 h-6 text-[#ff6b35] mx-auto mb-1" /><p className="text-xs text-[#7d5a3f]">Calories</p><p className="font-bold text-gray-800">{recipeState.calories || "--"}</p></div>
                <div className="bg-[#fff9f0] p-3 rounded-2xl text-center"><Star className="w-6 h-6 text-[#ffc857] mx-auto mb-1" /><p className="text-xs text-[#7d5a3f]">Đánh giá</p><p className="font-bold text-gray-800">{recipeState.rating}</p></div>
              </div>

              <div className="bg-[#fff9f0] p-6 rounded-2xl border border-[#ffc857]/20">
                <h3 className="text-lg mb-2 font-bold text-gray-800 flex items-center gap-2"><MessageCircle className="w-5 h-5 text-[#ff6b35]" /> Giới Thiệu</h3>
                <p className="text-[#7d5a3f] leading-relaxed whitespace-pre-line text-sm">{detailedDescription}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* --- 2. MAIN CONTENT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Ingredients */}
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

            {/* Steps */}
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
            
            {/* Comment Section */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-[25px] shadow-lg p-8">
                <h2 className="text-2xl mb-6 flex items-center gap-3 font-bold text-gray-800"><MessageCircle className="w-8 h-8 text-[#ff6b35]" /> Bình Luận ({comments.length})</h2>
                <div className="flex gap-3 mb-8">
                    <input 
                        type="text" 
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit()}
                        placeholder="Chia sẻ cảm nghĩ của bạn về món này..." 
                        className="flex-grow px-5 py-3 rounded-full bg-[#fff9f0] border border-[#ffc857]/30 focus:outline-none focus:border-[#ff6b35] transition-colors"
                    />
                    <button onClick={handleCommentSubmit} disabled={loadingComments} className="bg-[#ff6b35] hover:bg-[#e65a2d] text-white px-6 py-3 rounded-full font-bold shadow-md transition-transform active:scale-95 disabled:opacity-50">
                        {loadingComments ? '...' : <Send className="w-5 h-5" />}
                    </button>
                </div>
                <div className="space-y-6">
                    {comments.map((cmt, idx) => (
                        <div key={idx} className="flex gap-4">
                            <ImageWithFallBack src={getAvatarUrl(cmt)} className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-gray-200" />
                            <div>
                                <div className="bg-[#f8f9fa] px-4 py-3 rounded-2xl rounded-tl-none">
                                    <p className="font-bold text-gray-900 text-sm">{cmt.full_name || "Người dùng"}</p>
                                    <p className="text-gray-700 mt-1">{cmt.content}</p>
                                </div>
                                <span className="text-xs text-gray-400 ml-2 mt-1 inline-block">{new Date(cmt.created_at).toLocaleString('vi-VN')}</span>
                            </div>
                        </div>
                    ))}
                    {comments.length === 0 && <p className="text-center text-gray-400 italic py-4">Chưa có bình luận nào.</p>}
                </div>
            </motion.div>
          </div>

          {/* --- 3. SIDEBAR --- */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
                {/* Nutrition */}
                <div className="bg-white rounded-[25px] shadow-lg p-6">
                    <h3 className="text-xl mb-4 flex items-center gap-2 font-bold text-gray-800"><Flame className="w-6 h-6 text-[#ff6b35]" /> Dinh Dưỡng</h3>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[#7d5a3f] font-medium">Calories</span>
                            <span className="font-bold text-[#ff6b35] text-lg">{recipeState.calories ? recipeState.calories : 0} kcal</span>
                        </div>
                        <div className="w-full h-3 bg-[#fff9f0] rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#ff6b35] to-[#f7931e] w-3/4 rounded-full"></div> 
                        </div>
                        <p className="text-xs text-gray-400 mt-3 text-center">*Số liệu tính trên mỗi khẩu phần</p>
                    </div>
                </div>

                {/* Rating */}
                <div className="bg-white rounded-[25px] shadow-lg p-6">
                    <h3 className="text-xl mb-4 flex items-center gap-2 font-bold text-gray-800"><Star className="w-6 h-6 text-[#ffc857] fill-[#ffc857]" /> Đánh Giá</h3>
                    <div className="flex justify-center gap-2">
                        {[1,2,3,4,5].map(star => (
                            <button key={star} onClick={() => handleRating(star)} className="transition-transform hover:scale-110 focus:outline-none">
                                <Star className={`w-8 h-8 ${star <= userRating ? 'text-[#ffc857] fill-[#ffc857]' : 'text-gray-300'}`} />
                            </button>
                        ))}
                    </div>
                    {userRating > 0 && <p className="text-center text-[#ff6b35] font-bold mt-3">Bạn đã chấm {userRating} sao!</p>}
                </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}