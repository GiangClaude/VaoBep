import { Calendar, User, ArrowRight, Clock } from "lucide-react";
import { motion } from "motion/react";
import ImageWithFallback from "../figma/ImageWithFallBack";

export default function ArticleCard({ image, title, author, date, readTime, excerpt, category }) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
    >
      <div className="flex gap-4 p-4">
        {/* Thumbnail */}
        <div className="w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden relative">
          <ImageWithFallback
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {category && (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white text-xs px-2 py-1 rounded-full">
              {category}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          <h3 className="text-base mb-2 line-clamp-2 group-hover:text-[#ff6b35] transition-colors">
            {title}
          </h3>
          
          <p className="text-sm text-gray-600 line-clamp-2 mb-3 flex-grow">
            {excerpt}
          </p>

          {/* Meta Info */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-[#ff6b35]" />
              <span>{author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#ffc857]" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#f7931e]" />
              <span>{readTime}</span>
            </div>
          </div>
        </div>

        {/* Arrow Icon */}
        <div className="flex items-center">
          <ArrowRight className="w-5 h-5 text-[#ff6b35] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </motion.article>
  );
}
