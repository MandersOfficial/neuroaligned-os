import { Heart, MessageSquare, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const CATEGORY_COLORS = {
  'ADHD Support': 'bg-blue-50 text-blue-700 border-blue-200',
  'Autism Support': 'bg-violet-50 text-violet-700 border-violet-200',
  'Business Strategy': 'bg-amber-50 text-amber-700 border-amber-200',
  'Burnout Recovery': 'bg-orange-50 text-orange-700 border-orange-200',
  'Tools & Tips': 'bg-green-50 text-green-700 border-green-200',
  'Wins & Celebrations': 'bg-pink-50 text-pink-700 border-pink-200',
  'General': 'bg-secondary text-muted-foreground border-border',
};

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function PostCard({ post, currentUser, onOpen, onLike }) {
  const catColor = CATEGORY_COLORS[post.category] || CATEGORY_COLORS['General'];
  const isOwn = post.author_email === currentUser?.email;

  return (
    <div
      onClick={onOpen}
      className="bg-card border border-border/60 rounded-2xl p-4 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer group space-y-3"
    >
      {/* Author + category */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
            {getInitials(post.author_name)}
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">{isOwn ? 'You' : post.author_name}</p>
            <p className="text-xs text-muted-foreground">
              {post.created_date ? formatDistanceToNow(new Date(post.created_date), { addSuffix: true }) : 'recently'}
            </p>
          </div>
        </div>
        {post.category && (
          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${catColor}`}>
            {post.category}
          </span>
        )}
      </div>

      {/* Content */}
      <div>
        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">{post.title}</p>
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">{post.content}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={e => { e.stopPropagation(); onLike(); }}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-500 transition-colors"
          >
            <Heart className="w-3.5 h-3.5" /> {post.likes || 0}
          </button>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MessageSquare className="w-3.5 h-3.5" /> {post.replies_count || 0} replies
          </span>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </div>
  );
}