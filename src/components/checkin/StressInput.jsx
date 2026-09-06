import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function StressInput({ brainState, onSteps }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBreakdown = async () => {
    if (!text.trim()) return;
    setLoading(true);
    const result = await base44.functions.invoke('coachBreakdown', { brainState, text: text.trim() });
    setLoading(false);
    onSteps(result.data?.steps || [], text.trim());
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-5">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-center text-muted-foreground text-sm mb-5">
          You don't have to solve it all. Just name it.
        </p>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="What's on your mind right now?"
          rows={4}
          className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
        />
      </motion.div>

      <button
        onClick={handleBreakdown}
        disabled={!text.trim() || loading}
        className="w-full py-3.5 bg-primary text-primary-foreground rounded-2xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Breaking it down...
          </>
        ) : 'Break it down for me'}
      </button>

      <button
        onClick={() => onSteps([], '')}
        className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
      >
        Skip — just show me my tasks
      </button>
    </div>
  );
}