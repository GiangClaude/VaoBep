// VỊ TRÍ: component/homepage/Slideshow.jsx

import { useState, useEffect } from "react";
import { Clock, Users, Heart, Star, ChevronLeft, ChevronRight, Loader2, Sparkles } from "lucide-react"; 
import { motion, AnimatePresence } from "motion/react";
import ImageWithFallBack from "../figma/ImageWithFallBack";
import { useFeaturedRecipesQuery } from "../../hooks/queries/useRecipesQueries"; 
import { useNavigate } from "react-router-dom";

export function Slideshow() {
  const { data: slides = [], isLoading } = useFeaturedRecipesQuery();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (!slides || slides.length === 0) return; 

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides]); 

  const handlePrev = () => {
    if (slides.length === 0) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    if (slides.length === 0) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handleClick = () => {
    if (slides.length === 0) return;
    navigate(`/recipe/${slides[currentIndex].id}`);
  }

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
      rotateY: direction > 0 ? 15 : -15
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0
    },
    exit: (direction) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
      rotateY: direction < 0 ? -15 : 15
    })
  };

  if (isLoading) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-orange-50 rounded-[40px] border-4 border-dashed border-orange-200">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-12 h-12 animate-spin text-[#ff751f]" />
          <p className="text-orange-500 font-extrabold animate-pulse">Đang nướng món ngon...</p>
        </div>
      </div>
    );
  }

  if (!slides || slides.length === 0) {
    return (
        <div className="w-full h-[500px] flex items-center justify-center bg-orange-50 rounded-[40px] border-4 border-dashed border-orange-200">
           <p className="text-gray-500 font-extrabold text-lg flex items-center gap-2">
             <Sparkles className="w-5 h-5 text-yellow-500" /> Chưa có công thức nổi bật nào.
           </p>
        </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] overflow-hidden rounded-[40px] bg-gradient-to-br from-[#ff751f] to-yellow-400 shadow-[0_16px_40px_-15px_rgba(255,117,31,0.5)] group">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex} 
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.3 },
            rotateY: { duration: 0.3 }
          }}
          className="absolute inset-0"
        >
          <div className="relative w-full h-full cursor-pointer overflow-hidden" onClick={handleClick}>
            <ImageWithFallBack
              src={slides[currentIndex].image}
              alt={slides[currentIndex].title}
              className="w-full h-full object-cover transition-transform duration-[10s] ease-out hover:scale-110"
            />
            
            {/* Overlay Gradient (Đen mờ ở dưới để nổi chữ, cam mờ ở trên cho ngọt ngào) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-orange-900/10" />
            
            {/* Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-10 pb-12">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-[#ff751f] text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-3 shadow-lg"
              >
                <Sparkles className="w-3.5 h-3.5" /> Món ngon nổi bật
              </motion.div>

              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-white text-4xl md:text-5xl mb-6 font-extrabold drop-shadow-lg leading-tight hover:text-yellow-300 transition-colors"
              >
                {slides[currentIndex].title}
              </motion.h2>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap items-center gap-3"
              >
                <div className="flex items-center gap-2 bg-white/20 hover:bg-[#ff751f]/80 backdrop-blur-md px-4 py-2.5 rounded-2xl transition-colors border border-white/30">
                  <Clock className="w-4 h-4 text-yellow-300" />
                  <span className="text-white font-bold text-sm">{slides[currentIndex].cookTime}</span>
                </div>
                
                <div className="flex items-center gap-2 bg-white/20 hover:bg-[#ff751f]/80 backdrop-blur-md px-4 py-2.5 rounded-2xl transition-colors border border-white/30">
                  <Users className="w-4 h-4 text-yellow-300" />
                  <span className="text-white font-bold text-sm">{slides[currentIndex].servings}</span>
                </div>
                
                <div className="flex items-center gap-2 bg-white/20 hover:bg-[#ff751f]/80 backdrop-blur-md px-4 py-2.5 rounded-2xl transition-colors border border-white/30">
                  <Heart className="w-4 h-4 text-red-400 fill-red-400" />
                  <span className="text-white font-bold text-sm">{slides[currentIndex].likes} thích</span>
                </div>
                
                <div className="flex items-center gap-2 bg-white/20 hover:bg-[#ff751f]/80 backdrop-blur-md px-4 py-2.5 rounded-2xl transition-colors border border-white/30">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-bold text-sm">{slides[currentIndex].rating} / 5</span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Navigation Buttons (Vuốt/Ấn là nảy) */}
      <button
        onClick={handlePrev}
        className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md hover:bg-[#ff751f] hover:text-white text-[#ff751f] p-3.5 rounded-full transition-all duration-300 shadow-xl z-10 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <button
        onClick={handleNext}
        className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md hover:bg-[#ff751f] hover:text-white text-[#ff751f] p-3.5 rounded-full transition-all duration-300 shadow-xl z-10 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Indicator (Chấm lấp lánh như viên kẹo) */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2.5 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
            }}
            className={`h-2.5 rounded-full transition-all duration-500 shadow-sm ${
              index === currentIndex
                ? "bg-yellow-400 w-8"
                : "bg-white/50 hover:bg-white w-2.5"
            }`}
          />
        ))}
      </div>
    </div>
  );
}