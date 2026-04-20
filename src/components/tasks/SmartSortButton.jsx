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

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an AI task prioritizer for neurodivergent entrepreneurs.

USER CONTEXT:
- Neurotypes: ${profile?.neurotypes?.join(', ') || 'not specified'}
- Energy peak window: ${profile?.energy_peak || 'unknown'}
- Work style: ${profile?.work_style || 'unknown'}
- Current energy state: ${energy}
- Minutes remaining in focus session: ${focusMinutes}

TASK LIST:
${JSON.stringify(taskList, null, 2)}

RULES:
1. Match task energy_required to the user's current energy state:
   - hyperfocus/flow → high and medium energy tasks first
   - sluggish → low energy tasks first, avoid high
   - burnout_risk → only self_care or very low tasks if any
2. If focus session has < 15 min left, prioritize tasks with short estimated_minutes
3. Respect neurotype: ADHD/Anxiety users benefit from quick wins first (low estimated_minutes); Autistic users prefer category clustering
4. Overdue tasks get a small priority boost
5. Return ALL task IDs in your preferred order, plus a very short reason (max 5 words) for the top 3

Return a JSON object.`,
      response_json_schema: {
        type: 'object',
        properties: {
          ordered_ids: { type: 'array', items: { type: 'string' } },
          reasons: {
            type: 'object',
            additionalProperties: { type: 'string' },
          },
        },
      },
    });

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