import { BookOpen, ArrowRight } from "lucide-react";
import ArticleCard from "../common/ArticleCard";

export default function ArticleSection({ articles }) {
  return (
    <section className="mb-12">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-[#ff6b35] to-[#f7931e] p-2.5 rounded-xl">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl relative inline-block">
              Bài Viết Nổi Bật
              <div className="absolute -bottom-2 left-0 w-20 h-1.5 bg-gradient-to-r from-[#ff6b35] to-[#f7931e] rounded-full" />
            </h2>
            <p className="text-sm text-gray-600 mt-1">Kiến thức và mẹo vặt nấu ăn</p>
          </div>
        </div>
        
        <button className="flex items-center gap-2 text-[#ff6b35] hover:gap-3 transition-all">
          <span>Xem tất cả</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 gap-4">
        {articles.slice(0, 3).map((article) => (
          <ArticleCard
            key={article.id}
            image={article.image}
            title={article.title}
            author={article.author}
            date={article.date}
            readTime={article.readTime}
            excerpt={article.excerpt}
            category={article.category}
          />
        ))}
      </div>
    </section>
  );
}
