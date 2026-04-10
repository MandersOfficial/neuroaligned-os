import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const CATEGORIES = ['General', 'ADHD Support', 'Autism Support', 'Business Strategy', 'Burnout Recovery', 'Tools & Tips', 'Wins & Celebrations'];

export default function NewPostModal({ onSave, onClose }) {
  const [form, setForm] = useState({ title: '', content: '', category: 'General' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        onClick={e => e.stopPropagation()}
        className="bg-card rounded-2xl shadow-2xl w-full max-w-lg border border-border/60 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
          <h2 className="font-display font-bold text-base text-foreground">New Post</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Category */}
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">Category</label>
            <select
              value={form.category}
              onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              className="w-full text-sm px-3 py-2 rounded-xl border border-border bg-card focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">Title</label>
            <input
              className="w-full text-sm px-3 py-2.5 rounded-xl border border-border bg-card focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="What's on your mind?"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">Your message</label>
            <textarea
              rows={5}
              className="w-full text-sm px-3 py-2.5 rounded-xl border border-border bg-card focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              placeholder="Share your experience, ask a question, or celebrate a win..."
              value={form.content}
              onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
            />
          </div>

          <div className="bg-primary/5 border border-primary/10 rounded-xl px-3 py-2.5">
            <p className="text-xs text-muted-foreground">🤝 This is a safe, moderated community. Be kind — we're all figuring it out together.</p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border/40 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-secondary transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!form.title.trim() || !form.content.trim() || saving}
            className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? 'Posting...' : 'Post'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}