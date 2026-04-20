import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { ENERGY_STATES } from '@/components/dashboard/EnergyCheckIn';

export default function EnergyScheduler({ energy, onEnergyChange, tasks, onRecommend }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);

  const currentState = ENERGY_STATES.find(s => s.value === energy) || ENERGY_STATES[1];

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
      prompt: `You are an AI assistant for neurodivergent entrepreneurs. The user's current energy state is "${currentState.label}" — ${currentState.hint}

Here are their pending tasks:
${JSON.stringify(taskList, null, 2)}

Tasks they can handle at "${currentState.label}" state: energy_required values ${JSON.stringify(currentState.allowedEnergy)}.
For burnout_risk: recommend 0 tasks and focus on rest.

Return up to 5 prioritised task IDs with a brief one-sentence reason each. Also give a one-line scheduling tip.`,
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
      <div>
        <h3 className="font-display font-semibold text-sm text-foreground">Energy Filter</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{currentState.desc}</p>
      </div>

      {/* State pills */}
      <div className="flex flex-col gap-1.5">
        {ENERGY_STATES.map(state => (
          <button
            key={state.value}
            onClick={() => { onEnergyChange(state.value); setSuggestions(null); }}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border-2 text-left ${
              energy === state.value ? state.bg + ' ' + state.color : 'border-transparent hover:bg-secondary text-muted-foreground'
            }`}
          >
            <span className="text-base leading-none">{state.emoji}</span>
            <span>{state.label}</span>
          </button>
        ))}
      </div>

      {/* AI Suggest */}
      <button
        onClick={handleAISuggest}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-primary/20 text-primary text-sm font-semibold transition-all disabled:opacity-60 hover:bg-primary/5"
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