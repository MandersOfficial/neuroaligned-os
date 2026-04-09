import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from 'lucide-react';

const BUSINESS_TYPES = [
  { value: 'Freelancer / Consultant', emoji: '💼' },
  { value: 'Agency / Studio', emoji: '🏢' },
  { value: 'Product Business', emoji: '📦' },
  { value: 'Coaching / Mentoring', emoji: '🎯' },
  { value: 'Creator / Content', emoji: '🎨' },
  { value: 'Non-profit / Social enterprise', emoji: '🌍' },
  { value: 'Early-stage startup', emoji: '🚀' },
  { value: 'Other', emoji: '✨' },
];

const CHALLENGES = [
  { value: 'Task initiation & getting started', emoji: '🚦' },
  { value: 'Staying focused & avoiding distractions', emoji: '🎯' },
  { value: 'Managing energy & avoiding burnout', emoji: '🔋' },
  { value: 'Context-switching between roles', emoji: '🔀' },
  { value: 'Client communication & deadlines', emoji: '📅' },
  { value: 'Consistent revenue & business growth', emoji: '📈' },
  { value: 'Work-life separation', emoji: '⚖️' },
];

function SelectGrid({ options, selected, onSelect }) {
  return (
    <div className="grid sm:grid-cols-2 gap-2.5">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onSelect(opt.value)}
          className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all text-sm ${
            selected === opt.value
              ? 'border-primary/50 text-primary font-semibold'
              : 'border-border/60 bg-card hover:border-primary/30 text-foreground'
          }`}
          style={{ background: selected === opt.value ? 'hsl(var(--primary) / 0.06)' : undefined }}
        >
          <span className="text-xl">{opt.emoji}</span>
          {opt.value}
          <div className={`ml-auto w-4 h-4 rounded-full border-2 shrink-0 transition-all ${
            selected === opt.value ? 'border-primary bg-primary' : 'border-border'
          }`} />
        </button>
      ))}
    </div>
  );
}

export default function StepBusiness({ data, onChange, onNext, onBack }) {
  const canProceed = data.business_type && data.biggest_challenge;

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-foreground leading-tight">
          Tell us about your business
        </h2>
        <p className="text-muted-foreground text-base">
          We'll use this to surface the most relevant features first — not bury you in options.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <p className="font-semibold text-foreground text-sm">What kind of business do you run?</p>
          <SelectGrid
            options={BUSINESS_TYPES}
            selected={data.business_type}
            onSelect={v => onChange('business_type', v)}
          />
        </div>

        <div className="space-y-3">
          <p className="font-semibold text-foreground text-sm">What's your #1 biggest challenge right now?</p>
          <SelectGrid
            options={CHALLENGES}
            selected={data.biggest_challenge}
            onSelect={v => onChange('biggest_challenge', v)}
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
          Continue
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}