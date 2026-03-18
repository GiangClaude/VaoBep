import React from 'react';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import ImageWithFallback from '../figma/ImageWithFallBack';

export default function ArticlePostCard({ id, author, authorAvatar, date, content, image, onClick }) {
  return (
    <article onClick={onClick} className="bg-white rounded-2xl shadow-md p-4 cursor-pointer hover:shadow-xl transition-all">
      <div className="flex items-start gap-4">
        <img src={authorAvatar} alt={author} className="w-12 h-12 rounded-full object-cover" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-800">{author}</div>
              <div className="text-xs text-[#7d5a3f]">{date}</div>
            </div>
          </div>
          <div className="mt-3 text-[#3b3b3b] leading-relaxed whitespace-pre-line">{content}</div>
          {image && (
            <div className="mt-3 rounded-xl overflow-hidden">
              <ImageWithFallback src={image} alt="article image" className="w-full h-64 object-cover rounded-xl" />
            </div>
          )}

          <div className="mt-4 flex items-center gap-6 text-sm text-[#7d5a3f]">
            <button className="flex items-center gap-2 hover:text-[#ff6b35] transition-colors"><Heart className="w-4 h-4" /> Thích</button>
            <button className="flex items-center gap-2 hover:text-[#ff6b35] transition-colors"><MessageCircle className="w-4 h-4" /> Bình luận</button>
            <button className="flex items-center gap-2 hover:text-[#ff6b35] transition-colors"><Share2 className="w-4 h-4" /> Chia sẻ</button>
          </div>
        </div>
      </div>
    </article>
  );
}
