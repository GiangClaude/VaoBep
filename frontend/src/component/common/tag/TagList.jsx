// src/components/ui/TagList.jsx
import { getDisplayTags } from "../../../utils/tagUtils"; // Hàm bà đã tạo sẵn
import { TagItem } from "./TagItem";

/**
 * Component quản lý danh sách thẻ tag.
 * Cho phép truyền tagClassName và onTagClick để tùy biến theo từng trang.
 */
export function TagList({ 
  tags = [], 
  maxDisplay = 2, 
  onTagClick, 
  tagClassName,
  containerClassName = "flex flex-wrap gap-2 mt-3" 
}) {
  const { displayedTags, hiddenCount } = getDisplayTags(tags, maxDisplay);

  if (displayedTags.length === 0) return null;

  return (
    <div className={containerClassName}>
      {displayedTags.map((tag) => (
        <TagItem 
          key={tag.tag_id || tag.id} 
          name={tag.name} 
          onClick={onTagClick ? () => onTagClick(tag) : undefined}
          className={tagClassName}
        />
      ))}
      
      {/* Hiển thị số lượng tag bị ẩn */}
      {hiddenCount > 0 && (
        <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md font-medium border border-gray-200 flex items-center">
          +{hiddenCount}
        </span>
      )}
    </div>
  );
}