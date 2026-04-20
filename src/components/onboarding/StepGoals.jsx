import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, Plus, X } from 'lucide-react';

const SUGGESTIONS = [
  'Finish my website homepage',
  'Send 3 client proposals',
  'Set up my weekly review routine',
  'Complete my product launch checklist',
  'Reach out to 5 potential clients',
];

export default function StepGoals({ data, onChange, onNext, onBack }) {
  const goals = data.initial_goals || [];
  const [input, setInput] = useState('');

  const addGoal = (text) => {
    const trimmed = text.trim();
    if (!trimmed || goals.includes(trimmed) || goals.length >= 3) return;
    onChange('initial_goals', [...goals, trimmed]);
    setInput('');
  };

  const removeGoal = (g) => onChange('initial_goals', goals.filter(x => x !== g));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addGoal(input); }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-foreground leading-tight">
          What are you working on right now? 🎯
        </h2>
        <p className="text-muted-foreground text-base leading-relaxed">
          Add up to 3 goals or tasks. These will appear in your dashboard the moment you log in — no blank slate paralysis.
        </p>
      </div>

      {/* Added goals */}
      {goals.length > 0 && (
        <div className="space-y-2">
          {goals.map((g, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/6 border border-primary/20" style={{ background: 'hsl(var(--primary) / 0.06)' }}>
              <span className="text-primary font-bold text-sm shrink-0">{i + 1}</span>
              <span className="flex-1 text-sm text-foreground">{g}</span>
              <button onClick={() => removeGoal(g)} className="text-muted-foreground hover:text-destructive transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      {goals.length < 3 && (
        <div className="flex gap-2">
          <Input
            placeholder="Type a task or goal..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-12 text-sm border-border/60 focus-visible:ring-primary"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => addGoal(input)}
            disabled={!input.trim()}
            className="h-12 w-12 rounded-xl border-border/60 shrink-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Suggestions */}
      {goals.length < 3 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Or pick a suggestion:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.filter(s => !goals.includes(s)).map(s => (
              <button
                key={s}
                onClick={() => addGoal(s)}
                className="px-3 py-1.5 rounded-full text-xs font-medium border border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary transition-all"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" size="lg" onClick={onBack} className="rounded-full px-6 py-6 border-border/60">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button
          size="lg"
          onClick={onNext}
          className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-10 py-6 text-base font-semibold group"
        >
          {goals.length === 0 ? 'Skip for now' : 'Continue'}
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}