import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Heart, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function ThreadView({ post, currentUser, onClose, onLike }) {
  const [replies, setReplies] = useState([
    { id: 'r1', author: 'Alex M.', content: 'This really resonates with me. I had the same experience last month — took three weeks to recover properly.', time: '2h ago' },
    { id: 'r2', author: 'Jordan T.', content: 'Thanks for sharing! Body doubling changed everything for my morning routine. Virtual coworking sessions are underrated.', time: '45m ago' },
  ]);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const sendReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 400));
    setReplies(prev => [...prev, {
      id: Date.now().toString(),
      author: currentUser?.full_name || 'You',
      content: replyText,
      time: 'just now',
      isOwn: true,
    }]);
    setReplyText('');
    setSending(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 z-50 flex justify-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg bg-card h-full flex flex-col shadow-2xl border-l border-border/40"
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border/40 px-5 py-4 flex items-center justify-between z-10">
          <p className="text-sm font-semibold text-foreground truncate pr-4">{post.title}</p>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scroll area */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {/* Original post */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                {getInitials(post.author_name)}
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">{post.author_name}</p>
                <p className="text-xs text-muted-foreground">
                  {post.created_date ? formatDistanceToNow(new Date(post.created_date), { addSuffix: true }) : ''}
                </p>
              </div>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{post.content}</p>
            <button
              onClick={onLike}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-500 transition-colors"
            >
              <Heart className="w-3.5 h-3.5" /> {post.likes || 0} likes
            </button>
          </div>

          {/* Replies */}
          {replies.length > 0 && (
            <div className="space-y-4 border-t border-border/40 pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{replies.length} Replies</p>
              {replies.map(reply => (
                <div key={reply.id} className={`flex gap-3 ${reply.isOwn ? 'flex-row-reverse' : ''}`}>
                  <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                    {getInitials(reply.author)}
                  </div>
                  <div className={`flex-1 space-y-1 ${reply.isOwn ? 'items-end' : ''}`}>
                    <p className={`text-xs text-muted-foreground ${reply.isOwn ? 'text-right' : ''}`}>
                      {reply.isOwn ? 'You' : reply.author} · {reply.time}
                    </p>
                    <div className={`text-sm text-foreground bg-secondary rounded-2xl px-4 py-2.5 leading-relaxed inline-block ${reply.isOwn ? 'bg-primary/10 text-primary' : ''}`}>
                      {reply.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reply input */}
        <div className="border-t border-border/40 px-5 py-4">
          <div className="flex gap-3 items-end">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
              {getInitials(currentUser?.full_name)}
            </div>
            <div className="flex-1 relative">
              <textarea
                rows={2}
                className="w-full text-sm px-3 py-2.5 pr-10 rounded-xl border border-border bg-card focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                placeholder="Add a reply..."
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
              />
              <button
                onClick={sendReply}
                disabled={!replyText.trim() || sending}
                className="absolute bottom-2.5 right-2.5 p-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}