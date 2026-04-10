import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import PostCard from '../components/forum/PostCard';
import NewPostModal from '../components/forum/NewPostModal';
import ThreadView from '../components/forum/ThreadView';
import { Plus, Search, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['All', 'General', 'ADHD Support', 'Autism Support', 'Business Strategy', 'Burnout Recovery', 'Tools & Tips', 'Wins & Celebrations'];

export default function Forum() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [showNew, setShowNew] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    Promise.all([base44.auth.me(), base44.entities.ForumPost.filter({ status: 'approved' }, '-created_date', 50)])
      .then(([u, p]) => { setUser(u); setPosts(p); setLoading(false); });
  }, []);

  const filtered = posts.filter(p => {
    const matchesCat = category === 'All' || p.category === category;
    const q = search.toLowerCase();
    const matchesSearch = !q || p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const handleNewPost = async (data) => {
    const post = await base44.entities.ForumPost.create({
      ...data,
      author_email: user.email,
      author_name: user.full_name,
      status: 'approved', // auto-approve for now
      likes: 0,
      replies_count: 0,
    });
    setPosts(prev => [post, ...prev]);
    setShowNew(false);
  };

  const handleLike = async (post) => {
    const updated = await base44.entities.ForumPost.update(post.id, { likes: (post.likes || 0) + 1 });
    setPosts(prev => prev.map(p => p.id === post.id ? updated : p));
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <DashboardSidebar user={user} />

      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="max-w-3xl mx-auto px-5 lg:px-8 py-7 space-y-5">

          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display font-bold text-2xl text-foreground">Community</h1>
              <p className="text-sm text-muted-foreground mt-1">A safe space for neurodivergent entrepreneurs. Ask, share, celebrate.</p>
            </div>
            <button
              onClick={() => setShowNew(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-sm font-semibold transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" /> New Post
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Search posts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  category === cat
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:text-foreground bg-card'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Posts */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No posts yet in this category.</p>
              <button onClick={() => setShowNew(true)} className="text-sm text-primary font-semibold hover:underline">Be the first to post →</button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((post, i) => (
                <motion.div key={post.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <PostCard
                    post={post}
                    currentUser={user}
                    onOpen={() => setSelectedPost(post)}
                    onLike={() => handleLike(post)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {showNew && <NewPostModal onSave={handleNewPost} onClose={() => setShowNew(false)} />}
        {selectedPost && (
          <ThreadView
            post={selectedPost}
            currentUser={user}
            onClose={() => setSelectedPost(null)}
            onLike={() => handleLike(selectedPost)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}