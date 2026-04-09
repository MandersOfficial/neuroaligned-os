import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Flag, CheckCircle, Trash2, Eye, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  approved: { label: 'Approved', color: 'text-green-600 bg-green-50 border-green-200' },
  flagged: { label: 'Flagged', color: 'text-red-600 bg-red-50 border-red-200' },
  removed: { label: 'Removed', color: 'text-muted-foreground bg-secondary border-border' },
};

const FILTERS = ['all', 'pending', 'flagged', 'approved', 'removed'];

function PostCard({ post, onAction }) {
  const cfg = STATUS_CONFIG[post.status] || STATUS_CONFIG.pending;
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-card border border-border/60 rounded-2xl p-5"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`}>
              {cfg.label}
            </span>
            {post.category && (
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{post.category}</span>
            )}
          </div>
          <h4 className="font-semibold text-sm text-foreground truncate">{post.title}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            by {post.author_name || post.author_email} · {new Date(post.created_date).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Content preview */}
      <p className={`text-sm text-muted-foreground leading-relaxed mb-4 ${!expanded ? 'line-clamp-2' : ''}`}>
        {post.content}
      </p>
      {post.content?.length > 120 && (
        <button onClick={() => setExpanded(!expanded)} className="text-xs text-primary mb-4">
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}

      {post.flag_reason && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl mb-4">
          <Flag className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
          <p className="text-xs text-red-700">Flag reason: {post.flag_reason}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {post.status !== 'approved' && (
          <Button size="sm" onClick={() => onAction(post, 'approved')}
            className="h-8 text-xs bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-full px-3"
            variant="ghost">
            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
          </Button>
        )}
        {post.status !== 'flagged' && (
          <Button size="sm" onClick={() => onAction(post, 'flagged')}
            className="h-8 text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-3"
            variant="ghost">
            <Flag className="w-3.5 h-3.5 mr-1" /> Flag
          </Button>
        )}
        {post.status !== 'removed' && (
          <Button size="sm" onClick={() => onAction(post, 'removed')}
            className="h-8 text-xs bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-full px-3"
            variant="ghost">
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export default function ContentModeration() {
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.ForumPost.list('-created_date', 50).then(p => { setPosts(p); setLoading(false); });
  }, []);

  const handleAction = async (post, newStatus) => {
    const updated = await base44.entities.ForumPost.update(post.id, { status: newStatus });
    setPosts(posts.map(p => p.id === post.id ? { ...p, status: newStatus } : p));
  };

  const filtered = posts.filter(p => {
    const matchFilter = filter === 'all' || p.status === filter;
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.author_name?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === 'all' ? posts.length : posts.filter(p => p.status === f).length;
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display font-bold text-xl text-foreground">Content Moderation</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Review and manage community forum posts</p>
      </div>

      {/* Filter + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
                filter === f ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {f} {counts[f] > 0 && <span className="ml-1 opacity-70">({counts[f]})</span>}
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto w-full sm:w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-3xl mb-3">✨</p>
          <p className="text-sm">No posts match this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map(post => (
              <PostCard key={post.id} post={post} onAction={handleAction} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}