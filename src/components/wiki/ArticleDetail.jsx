import { motion } from 'framer-motion';
import { X, Clock, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ArticleDetail({ article, onClose }) {
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
        className="w-full max-w-lg bg-card h-full overflow-y-auto shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border/40 px-6 py-4 flex items-center justify-between gap-4 z-10">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            {article.readTime} read
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 flex-1 space-y-5">
          <div className="space-y-3">
            <span className="text-4xl">{article.emoji}</span>
            <h1 className="font-display font-bold text-xl text-foreground leading-snug">{article.title}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">{article.summary}</p>
            <div className="flex gap-2 flex-wrap">
              {article.tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 text-xs bg-primary/8 text-primary border border-primary/15 px-2.5 py-1 rounded-full">
                  <Tag className="w-2.5 h-2.5" />{tag}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t border-border/40 pt-5">
            <ReactMarkdown
              className="prose prose-sm prose-slate max-w-none
                [&_h2]:font-display [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:text-base [&_h2]:mt-6 [&_h2]:mb-2
                [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:text-sm [&_h3]:mt-4 [&_h3]:mb-1
                [&_p]:text-muted-foreground [&_p]:text-sm [&_p]:leading-relaxed
                [&_ul]:space-y-1 [&_li]:text-muted-foreground [&_li]:text-sm
                [&_ol]:space-y-1 [&_strong]:text-foreground [&_strong]:font-semibold"
            >
              {article.content}
            </ReactMarkdown>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}