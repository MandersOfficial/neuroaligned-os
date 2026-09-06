import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * AI Smart Sort — reorders tasks based on energy peak, neurotype, and focus session time.
 *
 * Props:
 *   tasks          — array of task objects
 *   profile        — UserProfile record { neurotypes, energy_peak, work_style }
 *   energy         — current energy state string ('hyperfocus' | 'flow' | 'sluggish' | 'burnout_risk')
 *   focusMinutes   — minutes remaining in current focus session (optional, defaults to 25)
 *   onSorted       — callback(sortedTasks, reasonMap) where reasonMap = { taskId: shortReason }
 *   onReset        — callback to restore original order
 *   isSorted       — whether sort is currently applied
 */
export default function SmartSortButton({ tasks, profile, energy, focusMinutes = 25, onSorted, onReset, isSorted }) {
  const [loading, setLoading] = useState(false);

  const pendingTasks = tasks.filter(t => t.status !== 'done');

  const handleSort = async () => {
    if (pendingTasks.length === 0) return;
    setLoading(true);

    const taskList = pendingTasks.slice(0, 30).map(t => ({
      id: t.id,
      title: t.title,
      energy_required: t.energy_required || 'medium',
      category: t.category || null,
      estimated_minutes: t.estimated_minutes || null,
      due_date: t.due_date || null,
    }));

    const res = await base44.functions.invoke('smartSortTasks', {
      tasks: taskList,
      profile: {
        neurotypes: profile?.neurotypes,
        energy_peak: profile?.energy_peak,
        work_style: profile?.work_style,
      },
      energy,
      focusMinutes,
    });
    const result = res.data;
    if (result?.ordered_ids?.length > 0) {
      // Build a map for fast lookup
      const taskMap = Object.fromEntries(tasks.map(t => [t.id, t]));
      const sortedPending = result.ordered_ids
        .map(id => taskMap[id])
        .filter(Boolean);
      // Append any tasks not in the AI response at the end (safety net)
      const includedIds = new Set(result.ordered_ids);
      const remaining = pendingTasks.filter(t => !includedIds.has(t.id));
      const doneTasks = tasks.filter(t => t.status === 'done');

      onSorted([...sortedPending, ...remaining, ...doneTasks], result.reasons || {});
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center gap-2">
      <AnimatePresence mode="wait">
        {isSorted ? (
          <motion.button
            key="reset"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border/60 text-muted-foreground hover:text-foreground hover:border-border transition-all"
          >
            <RotateCcw className="w-3 h-3" />
            Reset order
          </motion.button>
        ) : (
          <motion.button
            key="sort"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={handleSort}
            disabled={loading || pendingTasks.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Sorting...' : 'AI Smart Sort'}
          </motion.button>
        )}
      </AnimatePresence>

      {isSorted && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-primary font-medium flex items-center gap-1"
        >
          <Sparkles className="w-3 h-3" /> AI sorted
        </motion.span>
      )}
    </div>
  );
}