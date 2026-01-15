import { useState, useEffect } from "react";
import { X, Plus, Tag as TagIcon } from "lucide-react";
import tagApi from "../../api/tagApi"; // Import api bạn đã gửi

let cachedTags = null;

export default function TagSelector({ selectedTags, onChange }) {
  const [availableTags, setAvailableTags] = useState([]); // List tag từ server
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 1. Lấy danh sách tags từ server khi mount
  useEffect(() => {

    if (cachedTags && cachedTags.length > 0) {
          setAvailableTags(cachedTags);
          return;
      }
    const fetchTags = async () => {
      try {
        const res = await tagApi.getAllTags();
        if (res.data && res.data.success) {
          cachedTags = res.data.data;
           setAvailableTags(res.data.data);
        }
      } catch (err) {
        console.error("Lỗi tải tags:", err);
      }
    };
    fetchTags();
  }, []);

  // 2. Xử lý thêm tag
  const handleAddTag = (tag) => {
    // Kiểm tra xem đã chọn chưa
    if (!selectedTags.some(t => t.tag_id === tag.tag_id)) {
      onChange([...selectedTags, tag]);
    }
    setInputValue("");
    setShowSuggestions(false);
  };

  // 3. Xử lý xóa tag
  const handleRemoveTag = (tagId) => {
    onChange(selectedTags.filter(t => t.tag_id !== tagId));
  };

  // Lọc danh sách gợi ý theo input
  const filteredTags = availableTags.filter(tag => 
     tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
     !selectedTags.some(selected => selected.tag_id === tag.tag_id)
  );

  return (
    <div className="space-y-3">
      {/* Input Area */}
      <div className="relative">
        <div className="flex items-center gap-2 border-2 border-gray-200 rounded-xl px-4 py-3 bg-white focus-within:border-[#ff6b35] transition-all">
            <TagIcon className="w-5 h-5 text-gray-400" />
            <input 
                type="text"
                value={inputValue}
                onChange={(e) => {
                    setInputValue(e.target.value);
                    setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Tìm kiếm hoặc chọn thẻ..."
                className="flex-1 outline-none text-gray-700 bg-transparent"
            />
        </div>

        {/* Dropdown Gợi ý */}
        {showSuggestions && inputValue && (
            <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto">
                {filteredTags.length > 0 ? (
                    filteredTags.map(tag => (
                        <button
                            key={tag.tag_id}
                            onClick={() => handleAddTag(tag)}
                            className="w-full text-left px-4 py-3 hover:bg-[#fff9f0] hover:text-[#ff6b35] transition-colors flex justify-between items-center"
                        >
                            <span>{tag.name}</span>
                            <Plus className="w-4 h-4 opacity-50" />
                        </button>
                    ))
                ) : (
                    <div className="px-4 py-3 text-gray-400 italic text-sm">
                        Không tìm thấy thẻ phù hợp
                    </div>
                )}
            </div>
        )}
        
        {/* Click ra ngoài để tắt gợi ý (Bạn có thể dùng hook useOnClickOutside để xịn hơn) */}
        {showSuggestions && <div className="fixed inset-0 z-0" onClick={() => setShowSuggestions(false)} />}
      </div>

      {/* Selected Tags Display (Chips) */}
      <div className="flex flex-wrap gap-2">
        {selectedTags.map(tag => (
            <span key={tag.tag_id} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#ff6b35]/10 text-[#ff6b35] text-sm font-medium border border-[#ff6b35]/20">
                {tag.name}
                <button onClick={() => handleRemoveTag(tag.tag_id)} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                </button>
            </span>
        ))}
      </div>
    </div>
  );
}