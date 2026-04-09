import { useState } from 'react';
import { Sparkles, Zap, Leaf, Flame, Battery, ChevronDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';

const ENERGY_LEVELS = [
  { value: 1, label: 'Depleted 🪫', taskEnergy: ['low'], tip: 'Only low-energy tasks today' },
  { value: 2, label: 'Low 🔋', taskEnergy: ['low'], tip: 'Gentle tasks only' },
  { value: 3, label: 'Moderate ⚡', taskEnergy: ['low', 'medium'], tip: 'Good for medium tasks' },
  { value: 4, label: 'Good ✨', taskEnergy: ['low', 'medium', 'high'], tip: 'All tasks available' },
  { value: 5, label: 'Peak 🚀', taskEnergy: ['low', 'medium', 'high'], tip: 'Tackle your hardest work' },
];

export default function EnergyScheduler({ energy, onEnergyChange, tasks, onRecommend }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);

  const currentLevel = ENERGY_LEVELS.find(l => l.value === energy) || ENERGY_LEVELS[2];

  const handleAISuggest = async () => {
    setLoading(true);
    const taskList = tasks.filter(t => t.status !== 'done').slice(0, 20).map(t => ({
      id: t.id,
      title: t.title,
      energy_required: t.energy_required,
      category: t.category,
      due_date: t.due_date,
      estimated_minutes: t.estimated_minutes,
    }));

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an AI assistant for neurodivergent entrepreneurs. The user's current energy level is ${energy}/5 (${currentLevel.label}).

Here are their pending tasks:
${JSON.stringify(taskList, null, 2)}

Based on their energy level of ${energy}/5:
- Energy 1-2: Only recommend 'low' energy tasks
- Energy 3: Low and medium energy tasks
- Energy 4-5: All tasks, prioritize high-impact ones

Return a prioritized list of up to 5 task IDs to work on today, with a brief one-sentence reason for each. Also give a one-line overall scheduling tip.`,
      response_json_schema: {
        type: 'object',
        properties: {
          tip: { type: 'string' },
          recommended_tasks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                reason: { type: 'string' },
              },
            },
          },
        },
      },
    });

    setSuggestions(result);
    onRecommend(result.recommended_tasks?.map(r => r.id) || []);
    setLoading(false);
  };

  return (
    <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-4">
      {/* Energy Selector */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-display font-semibold text-sm text-foreground">Energy Level</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{currentLevel.tip}</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-secondary border border-border/40 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors"
          >
            {currentLevel.label}
            <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 top-full mt-1 z-20 bg-card border border-border rounded-xl shadow-xl py-1 min-w-[190px]"
              >
                {ENERGY_LEVELS.map(level => (
                  <button
                    key={level.value}
                    onClick={() => { onEnergyChange(level.value); setOpen(false); setSuggestions(null); }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-secondary ${energy === level.value ? 'bg-secondary font-semibold text-foreground' : 'text-muted-foreground'}`}
                  >
                    <span>{level.label}</span>
                    <span className="text-xs opacity-60">{level.value}/5</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Energy bar */}
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map(v => (
          <button
            key={v}
            onClick={() => { onEnergyChange(v); setSuggestions(null); }}
            className={`flex-1 h-2 rounded-full transition-all ${v <= energy ? 'bg-primary' : 'bg-secondary'}`}
          />
        ))}
      </div>

      {/* AI Suggest */}
      <button
        onClick={handleAISuggest}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/8 hover:bg-primary/12 border border-primary/20 text-primary text-sm font-semibold transition-all disabled:opacity-60"
        style={{ background: 'hsl(var(--primary) / 0.06)' }}
      >
        <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        {loading ? 'AI is thinking...' : 'Get AI Task Suggestions'}
      </button>

      {/* AI Result */}
      <AnimatePresence>
        {suggestions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border/40 pt-4 space-y-3 overflow-hidden"
          >
            {suggestions.tip && (
              <p className="text-xs text-primary font-medium bg-primary/5 px-3 py-2 rounded-xl border border-primary/10">
                💡 {suggestions.tip}
              </p>
            )}
            {suggestions.recommended_tasks?.map((rt, i) => (
              <div key={rt.id} className="flex gap-2 text-xs text-muted-foreground">
                <span className="font-bold text-primary shrink-0">{i + 1}.</span>
                <span>{rt.reason}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}