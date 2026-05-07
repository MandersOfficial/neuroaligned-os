import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles, Lightbulb, ListChecks, Tag, Trash2, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

const MOOD_META = {
  overwhelmed: { emoji: '🔴', label: 'Overwhelmed', color: 'text-red-500 bg-red-50 border-red-200' },
  low_energy:  { emoji: '🔵', label: 'Low Energy',  color: 'text-blue-500 bg-blue-50 border-blue-200' },
  scattered:   { emoji: '🟡', label: 'Scattered',   color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  neutral:     { emoji: '⚪', label: 'Neutral',      color: 'text-muted-foreground bg-secondary border-border' },
  focused:     { emoji: '🟢', label: 'Focused',      color: 'text-green-600 bg-green-50 border-green-200' },
};

export default function JournalEntryCard({ entry, onDelete, onActionAdded }) {
  const [expanded, setExpanded] = useState(false);
  const [addingStep, setAddingStep] = useState(null);
  const mood = MOOD_META[entry.mood] || MOOD_META.neutral;
  const dateLabel = entry.date ? format(new Date(entry.date), 'EEEE, MMMM d') : 'Today';

  const handleAddAsTask = async (step) => {
    setAddingStep(step);
    await base44.entities.Task.create({
      title: step,
      status: 'todo',
      energy_required: 'low',
      is_today: true,
    });
    setAddingStep(null);
    onActionAdded?.(step);
  };

  const handleDelete = async () => {
    await base44.entities.JournalEntry.delete(entry.id);
    onDelete(entry.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="bg-card border border-border/60 rounded-2xl overflow-hidden"
    >
      {/* Header row */}
      <div
        className="flex items-start justify-between gap-3 p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xl shrink-0">{mood.emoji}</span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-muted-foreground">{dateLabel}</p>
            <p className="text-sm text-foreground font-medium truncate mt-0.5">{entry.content.slice(0, 80)}{entry.content.length > 80 ? '…' : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {entry.analyzed && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">AI ✓</span>
          )}
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-border/40 pt-4">
              {/* Full content */}
              <div className="bg-secondary/40 rounded-xl p-3">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{entry.content}</p>
              </div>

              {/* Themes */}
              {entry.ai_themes?.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    <Tag className="w-3.5 h-3.5" /> Detected Themes
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {entry.ai_themes.map((t, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 bg-primary/8 text-primary border border-primary/20 rounded-full font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Insights */}
              {entry.ai_insights?.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Key Insights
                  </div>
                  <ul className="space-y-2">
                    {entry.ai_insights.map((ins, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        {ins}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action steps */}
              {entry.ai_action_steps?.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    <ListChecks className="w-3.5 h-3.5 text-green-500" /> Suggested Action Steps
                  </div>
                  <ul className="space-y-2">
                    {entry.ai_action_steps.map((step, i) => (
                      <li key={i} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-secondary/50 border border-border/40">
                        <span className="text-sm text-foreground flex-1">{step}</span>
                        <button
                          onClick={() => handleAddAsTask(step)}
                          disabled={addingStep === step}
                          className="shrink-0 flex items-center gap-1 text-xs font-semibold text-primary hover:bg-primary/10 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {addingStep === step
                            ? <><CheckCircle2 className="w-3.5 h-3.5" /> Added</>
                            : <>+ Add to Tasks</>
                          }
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Delete */}
              <div className="flex justify-end pt-1">
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete entry
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}