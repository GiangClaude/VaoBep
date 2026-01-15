import { useState, useEffect } from "react";
import { Clock, Users, Heart, Star, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"; // Thêm Loader2
import { motion, AnimatePresence } from "motion/react";
import ImageWithFallBack from "../figma/ImageWithFallBack";
import { useFeaturedRecipes } from "../../hooks/useFeaturedRecipe"; // Import hook mới

// XÓA mảng const slides = [...] cũ đi nhé

export function Slideshow() {
  // 1. Sử dụng Hook
  const { slides, loading } = useFeaturedRecipes();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // 2. Xử lý Logic Auto-play (Chỉ chạy khi có slides)
  useEffect(() => {
    if (slides.length === 0) return; // Không chạy nếu chưa có data

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]); // Thêm dependency slides.length

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

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8
    })
  };

  // 3. Hiển thị Loading State
  if (loading) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-gray-100 rounded-[30px]">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
      </div>
    );
  }

  // 4. Fallback nếu không có dữ liệu
  if (slides.length === 0) {
    return (
        <div className="w-full h-[500px] flex items-center justify-center bg-gray-100 rounded-[30px]">
           <p className="text-gray-500">Chưa có công thức nổi bật nào.</p>
        </div>
    );
  }

  // Phần return chính giữ nguyên, logic render dựa trên 'slides' từ hook
  return (
    <div className="relative w-full h-[500px] overflow-hidden rounded-[30px] bg-gradient-to-br from-[#ff6b35] to-[#f7931e] shadow-2xl">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex} // Key này quan trọng để animation chạy đúng
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          className="absolute inset-0"
        >
          {/* ... Giữ nguyên nội dung bên trong ... */}
             <div className="relative w-full h-full">
            <ImageWithFallBack
              src={slides[currentIndex].image}
              alt={slides[currentIndex].title}
              className="w-full h-full object-cover"
            />
            {/* ... Các phần overlay info giữ nguyên ... */}
             <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            
            {/* Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-white text-4xl mb-4"
              >
                {slides[currentIndex].title}
              </motion.h2>
            {/* ... Giữ nguyên phần render icon ... */}
             <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap items-center gap-4"
              >
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full">
                  <Clock className="w-5 h-5 text-white" />
                  <span className="text-white">{slides[currentIndex].cookTime}</span>
                </div>
                
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full">
                  <Users className="w-5 h-5 text-white" />
                  <span className="text-white">{slides[currentIndex].servings} khẩu phần</span>
                </div>
                
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full">
                  <Heart className="w-5 h-5 text-[#ffc857] fill-[#ffc857]" />
                  <span className="text-white">{slides[currentIndex].likes}</span>
                </div>
                
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full">
                  <Star className="w-5 h-5 text-[#ffc857] fill-[#ffc857]" />
                  <span className="text-white">{slides[currentIndex].rating}</span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* ... Giữ nguyên phần buttons navigation và dots ... */}
       {/* Navigation Buttons */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 backdrop-blur-md hover:bg-white/50 p-3 rounded-full transition-all shadow-lg"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 backdrop-blur-md hover:bg-white/50 p-3 rounded-full transition-all shadow-lg"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
            }}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentIndex
                ? "bg-white w-8"
                : "bg-white/50 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}