import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from 'lucide-react';

const NEUROTYPES = [
  { value: 'ADHD', emoji: '⚡', desc: 'Attention & focus variations' },
  { value: 'Autistic', emoji: '🌀', desc: 'Autistic spectrum' },
  { value: 'Dyslexic', emoji: '📖', desc: 'Reading & processing differences' },
  { value: 'Dyscalculia', emoji: '🔢', desc: 'Number processing differences' },
  { value: 'Burnout Survivor', emoji: '🌱', desc: 'Recovering from chronic burnout' },
  { value: 'Late-Diagnosed', emoji: '💡', desc: 'Recently discovered your neurotype' },
  { value: 'OCD', emoji: '🔄', desc: 'OCD traits' },
  { value: 'Anxiety', emoji: '🌊', desc: 'Anxiety patterns' },
  { value: 'Other', emoji: '✨', desc: 'Something else or multiple' },
  { value: 'Prefer not to say', emoji: '🤍', desc: 'Private for now' },
];

export default function StepNeurotype({ data, onChange, onNext, onBack, name }) {
  const selected = data.neurotypes || [];

  const toggle = (value) => {
    if (value === 'Prefer not to say') {
      onChange('neurotypes', ['Prefer not to say']);
      return;
    }
    const filtered = selected.filter(v => v !== 'Prefer not to say');
    if (filtered.includes(value)) {
      onChange('neurotypes', filtered.filter(v => v !== value));
    } else {
      onChange('neurotypes', [...filtered, value]);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-foreground leading-tight">
          Hey {name}! How does your brain roll? 🧠
        </h2>
        <p className="text-muted-foreground text-base leading-relaxed">
          Select everything that resonates. This helps NeuroAligned personalize your experience. 
          You can always update this later — and we never share this data.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {NEUROTYPES.map(n => {
          const isSelected = selected.includes(n.value);
          return (
            <button
              key={n.value}
              onClick={() => toggle(n.value)}
              className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-primary/50 bg-primary/8 shadow-sm shadow-primary/10'
                  : 'border-border/60 bg-card hover:border-primary/30 hover:bg-primary/5'
              }`}
              style={{ background: isSelected ? 'hsl(var(--primary) / 0.06)' : undefined }}
            >
              <span className="text-2xl">{n.emoji}</span>
              <div>
                <div className={`font-semibold text-sm ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                  {n.value}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{n.desc}</div>
              </div>
              <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                isSelected ? 'border-primary bg-primary' : 'border-border'
              }`}>
                {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" size="lg" onClick={onBack} className="rounded-full px-6 py-6 border-border/60">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button
          size="lg"
          onClick={onNext}
          disabled={selected.length === 0}
          className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-10 py-6 text-base font-semibold group disabled:opacity-50"
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}