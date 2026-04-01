import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useAuth } from '../../AuthContext';
import { getAvatarUrl } from '../../utils/imageHelper';

export default function CommentInput({ onSubmit, placeholder = "Viết bình luận...", autoFocus = false }) {
    const [content, setContent] = useState('');
    const { currentUser } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        
        const success = await onSubmit(content);
        if (success) setContent('');
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-3 items-start w-full">
            {/* Avatar người dùng hiện tại */}
            <img 
                src={currentUser ? getAvatarUrl(currentUser.id, currentUser.avatar) || '/default-avatar.png' : '/default-avatar.png'} 
                alt="My Avatar" 
                className="w-8 h-8 rounded-full object-cover border border-[#7d5a3f]/20"
            />
            
            <div className="relative flex-1">
                <textarea
                    autoFocus={autoFocus}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={placeholder}
                    rows="2"
                    className="w-full bg-white border border-[#7d5a3f]/20 rounded-xl px-4 py-2 pr-12 focus:outline-none focus:ring-1 focus:ring-[#7d5a3f] text-[#7d5a3f] placeholder-[#7d5a3f]/50 resize-none transition-all"
                />
                <button
                    type="submit"
                    disabled={!content.trim()}
                    className="absolute right-2 bottom-2 p-2 text-[#7d5a3f] hover:bg-[#fff9f0] rounded-full disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                >
                    <Send size={18} />
                </button>
            </div>
        </form>
    );
}