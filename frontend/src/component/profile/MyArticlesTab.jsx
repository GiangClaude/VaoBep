import { useState } from 'react';
import { Edit, Trash2, Eye, EyeOff, FileText, Plus } from 'lucide-react';
import ArticleEditorModal from '../article/ArticleEditorModal';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import ArticleCard from '../common/ArticleCard';
import ImageWithFallBack from '../figma/ImageWithFallBack';
import Modal from '../common/modal';
import useOwnerArticles from '../../hooks/useOwnerArticles';
import useArticleAction from '../../hooks/useArticleAction';

export function MyArticlesTab({ isPublicView = false }) {
  const navigate = useNavigate();
  const { articles, loading, fetchOwnerArticles } = useOwnerArticles();

  const { removeArticle, updateExistingArticle } = useArticleAction();

  const [filter, setFilter] = useState('public');
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', type: 'info', actions: [] });
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorInitial, setEditorInitial] = useState(null);

  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  const filtered = (articles || []).filter(a => {
    if (filter === 'all') return true;
    return (a.status || 'public') === filter;
  });


  const goToArticle = (id) => navigate(`/article/${id}`);

  const confirmDelete = (id) => {
    setModalConfig({
      isOpen: true,
      title: 'Xác nhận xóa',
      message: 'Bạn chắc chắn muốn xóa bài viết này? Hành động không thể hoàn tác.',
      type: 'warning',
      actions: [
        { label: 'Hủy', onClick: closeModal, style: 'secondary' },
        { label: 'Xóa', onClick: async () => { await removeArticle(id); await fetchOwnerArticles(); closeModal(); }, style: 'danger' }
      ]
    });
  };

  const toggleVisibility = async (article) => {
    const newStatus = article.status === 'hidden' ? 'public' : 'hidden';
    await updateExistingArticle(article.id || article.article_id, { status: newStatus });
    await fetchOwnerArticles();
  };

  const openCreate = () => {
    setEditorInitial(null);
    setEditorOpen(true);
  };

  const openEdit = (id) => {
    const art = (articles || []).find(a => (a.id || a.article_id) === id);
    if (!art) return;
    // prepare initial data mapping expected by the editor
    console.log("Debug openEdit article:", art);
    const initial = {
      id: art.id || art.article_id,
      title: art.title,
      excerpt: art.excerpt || art.description,
      content: art.content || art.rawContent || art.html || '',
      image: art.image,
      status: art.status,
      readTime: art.readTime || art.read_time,
      tags: art.rawTags || art.tags || [],
      recipes: art.linkedRecipes || art.recipes || []
    };
    setEditorInitial(initial);
    setEditorOpen(true);
  };

  const onEditorSaved = async () => {
    setEditorOpen(false);
    await fetchOwnerArticles();
  };

  return (
    <div>
      <Modal isOpen={modalConfig.isOpen} onClose={closeModal} title={modalConfig.title} message={modalConfig.message} type={modalConfig.type} actions={modalConfig.actions} />
      <ArticleEditorModal 
        isOpen={editorOpen} 
        onClose={() => setEditorOpen(false)} 
        initialData={editorInitial} 
        onSaved={onEditorSaved} 
      />
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {['all','public', 'draft', 'banned'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full ${filter === f ? 'bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
              {f === 'all' && 'Tất cả'}
              {f === 'public' && 'Công khai'}
              {f === 'draft' && 'Nháp'}
              {f === 'banned' && 'Bị ban'}
              
            </button>
          ))}
        </div>

        {!isPublicView && (
          <div className="flex items-center gap-3">
            <button onClick={openCreate} className="bg-white border px-3 py-2 rounded-full flex items-center gap-2 text-sm hover:bg-gray-50">
              <Plus className="w-4 h-4" /> Tạo bài viết
            </button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white px-5 py-2 rounded-full flex items-center gap-2" onClick={() => navigate('/articles') }>
              <FileText className="w-4 h-4" /> Quản lý bài viết
            </motion.button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#7d5a3f]">Đang tải...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-[#7d5a3f]">Chưa có bài viết phù hợp.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map(a => (
            <ArticleCard
              key={a.id}
              id={a.id}
              author={a.author}
              authorAvatar={a.authorAvatar}
              date={a.date}
              readTime={a.readTime}
              title={a.title}
              excerpt={a.excerpt}
              tags={a.rawTags || a.tags || []}
              image={a.image}
            //   category={a.category}
              commentCount={a.commentCount}
              status={a.status}
              isOwnerView={true}
              onClick={() => goToArticle(a.id)}
              onEdit={(id) => openEdit(id)}
              onDelete={(id) => confirmDelete(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
