// src/components/ui/TagItem.jsx
import { Tag } from "lucide-react";

/**
 * Component hiển thị một thẻ tag đơn lẻ.
 * Hỗ trợ nhận className từ bên ngoài để linh hoạt đổi màu/style (OCP).
 */
export function TagItem({ name, onClick, className }) {
  // CSS mặc định nếu không truyền gì (giống ở RecipeCard)
  const defaultClass = "px-2.5 py-1 bg-[#ffc857]/20 text-[#7d5a3f] text-xs rounded-md font-medium border border-[#ffc857]/30";
  
  // Kiểm tra xem có onClick không để thêm cursor-pointer
  const interactionClass = onClick ? "cursor-pointer hover:brightness-95" : "cursor-default";

  return (
    <span 
      onClick={onClick}
      className={`inline-flex items-center gap-1 transition-all ${className || defaultClass} ${interactionClass}`}
    >
      <Tag className="w-3 h-3" />
      {name}
    </span>
  );
}