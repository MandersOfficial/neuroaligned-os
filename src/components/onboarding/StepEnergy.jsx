import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from 'lucide-react';

const ENERGY_PEAKS = [
  { value: 'Early morning (5-9am)', emoji: '🌅' },
  { value: 'Morning (9am-12pm)', emoji: '☀️' },
  { value: 'Afternoon (12-4pm)', emoji: '🌤️' },
  { value: 'Evening (4-8pm)', emoji: '🌆' },
  { value: 'Night (8pm+)', emoji: '🌙' },
  { value: "It varies — I'm unpredictable", emoji: '🎲' },
];

const WORK_STYLES = [
  { value: 'Deep focus blocks', emoji: '🔭', desc: '2-4 hour uninterrupted stretches' },
  { value: 'Short sprints with breaks', emoji: '⏱️', desc: 'Pomodoro-style, 25-45 min' },
  { value: 'Hyperfocus until done', emoji: '🌊', desc: 'All-in on one thing until complete' },
  { value: 'Flexible, mood-dependent', emoji: '🌈', desc: 'Varies based on how I feel' },
  { value: 'Structured routines', emoji: '📋', desc: 'Same schedule, predictable blocks' },
];

function SelectGrid({ options, selected, onSelect, cols = 2 }) {
  return (
    <div className={`grid gap-2.5 ${cols === 3 ? 'grid-cols-2 sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onSelect(opt.value)}
          className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all text-sm ${
            selected === opt.value
              ? 'border-primary/50 text-primary font-semibold'
              : 'border-border/60 bg-card hover:border-primary/30 text-foreground'
          }`}
          style={{ background: selected === opt.value ? 'hsl(var(--primary) / 0.06)' : undefined }}
        >
          <span className="text-xl mt-0.5">{opt.emoji}</span>
          <div>
            <div className={selected === opt.value ? 'text-primary font-semibold' : 'font-medium'}>{opt.value}</div>
            {opt.desc && <div className="text-xs text-muted-foreground mt-0.5 font-normal">{opt.desc}</div>}
          </div>
        </button>
      ))}
    </div>
  );
}

export default function StepEnergy({ data, onChange, onNext, onBack }) {
  const canProceed = data.energy_peak && data.work_style;

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-foreground leading-tight">
          When does your brain shine? ✨
        </h2>
        <p className="text-muted-foreground text-base">
          This is how NeuroAligned assigns your most important tasks to your peak windows — automatically. Your first tasks get matched to these answers, and every task you add later follows the same rhythm.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <p className="font-semibold text-foreground text-sm">When do you have the most mental energy?</p>
          <SelectGrid
            options={ENERGY_PEAKS}
            selected={data.energy_peak}
            onSelect={v => onChange('energy_peak', v)}
            cols={3}
          />
        </div>

        <div className="space-y-3">
          <p className="font-semibold text-foreground text-sm">How do you naturally prefer to work?</p>
          <SelectGrid
            options={WORK_STYLES}
            selected={data.work_style}
            onSelect={v => onChange('work_style', v)}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" size="lg" onClick={onBack} className="rounded-full px-6 py-6 border-border/60">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button
          size="lg"
          onClick={onNext}
          disabled={!canProceed}
          className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-10 py-6 text-base font-semibold group disabled:opacity-50"
        >
          Next: your tasks
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}