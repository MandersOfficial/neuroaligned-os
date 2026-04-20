import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from 'lucide-react';

const FOCUS_PRESETS = [
  {
    value: 'adhd_flow',
    emoji: '⚡',
    label: 'ADHD Flow',
    desc: '25 min sprints, short breaks, one task at a time',
    best_for: ['ADHD', 'Anxiety'],
    work_block_minutes: 25,
    break_minutes: 5,
    show_one_task: true,
  },
  {
    value: 'deep_focus',
    emoji: '🔭',
    label: 'Deep Focus',
    desc: '90 min blocks, long breaks, minimal interruptions',
    best_for: ['Autistic', 'Dyslexic'],
    work_block_minutes: 90,
    break_minutes: 20,
    show_one_task: false,
  },
  {
    value: 'gentle_start',
    emoji: '🌱',
    label: 'Gentle Start',
    desc: 'Short 15 min bursts, frequent breaks, low pressure',
    best_for: ['Burnout Survivor', 'OCD'],
    work_block_minutes: 15,
    break_minutes: 10,
    show_one_task: true,
  },
  {
    value: 'hyperfocus',
    emoji: '🌊',
    label: 'Hyperfocus Mode',
    desc: 'Ride the wave — open-ended blocks until natural stop',
    best_for: ['Late-Diagnosed', 'Other'],
    work_block_minutes: 120,
    break_minutes: 15,
    show_one_task: false,
  },
];

const DASHBOARD_WIDGETS = [
  { value: 'energy_checkin', emoji: '⚡', label: 'Daily energy check-in' },
  { value: 'burnout_score', emoji: '🛡️', label: 'Burnout risk score' },
  { value: 'ai_insight', emoji: '🧠', label: 'AI daily insight' },
  { value: 'regulation_tools', emoji: '🌬️', label: 'Nervous system tools' },
];

export default function StepPersonalize({ data, onChange, onNext, onBack }) {
  const selectedPreset = data.focus_preset || '';
  const selectedWidgets = data.dashboard_widgets || ['energy_checkin', 'ai_insight'];

  const toggleWidget = (w) => {
    if (selectedWidgets.includes(w)) {
      if (selectedWidgets.length > 1) onChange('dashboard_widgets', selectedWidgets.filter(x => x !== w));
    } else {
      onChange('dashboard_widgets', [...selectedWidgets, w]);
    }
  };

  // Suggest a preset based on neurotype
  const neurotypes = data.neurotypes || [];
  const suggested = FOCUS_PRESETS.find(p => p.best_for.some(n => neurotypes.includes(n)));

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-foreground leading-tight">
          Tune your workspace 🎛️
        </h2>
        <p className="text-muted-foreground text-base leading-relaxed">
          Choose a default focus mode and what you want to see on your dashboard. You can change everything later.
        </p>
      </div>

      {/* Focus Presets */}
      <div className="space-y-3">
        <p className="font-semibold text-foreground text-sm">Default focus mode</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {FOCUS_PRESETS.map(preset => {
            const isSelected = selectedPreset === preset.value;
            const isSuggested = suggested?.value === preset.value;
            return (
              <button
                key={preset.value}
                onClick={() => onChange('focus_preset', preset.value)}
                className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? 'border-primary/50 shadow-sm'
                    : 'border-border/60 bg-card hover:border-primary/30'
                }`}
                style={{ background: isSelected ? 'hsl(var(--primary) / 0.06)' : undefined }}
              >
                {isSuggested && !isSelected && (
                  <span className="absolute top-2 right-2 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    Suggested
                  </span>
                )}
                <span className="text-2xl">{preset.emoji}</span>
                <div>
                  <div className={`font-semibold text-sm ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                    {preset.label}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{preset.desc}</div>
                </div>
                <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                  isSelected ? 'border-primary bg-primary' : 'border-border'
                }`}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dashboard Widgets */}
      <div className="space-y-3">
        <p className="font-semibold text-foreground text-sm">What do you want on your dashboard?</p>
        <div className="grid grid-cols-2 gap-2.5">
          {DASHBOARD_WIDGETS.map(w => {
            const isOn = selectedWidgets.includes(w.value);
            return (
              <button
                key={w.value}
                onClick={() => toggleWidget(w.value)}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all text-sm ${
                  isOn
                    ? 'border-primary/50 font-semibold'
                    : 'border-border/60 bg-card hover:border-primary/30 text-muted-foreground'
                }`}
                style={{ background: isOn ? 'hsl(var(--primary) / 0.06)' : undefined }}
              >
                <span className="text-lg">{w.emoji}</span>
                <span className={isOn ? 'text-primary' : 'text-foreground'}>{w.label}</span>
                <div className={`ml-auto w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-all ${
                  isOn ? 'border-primary bg-primary' : 'border-border'
                }`}>
                  {isOn && <div className="w-1.5 h-1.5 rounded-sm bg-white" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" size="lg" onClick={onBack} className="rounded-full px-6 py-6 border-border/60">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button
          size="lg"
          onClick={onNext}
          disabled={!selectedPreset}
          className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-10 py-6 text-base font-semibold group disabled:opacity-50"
        >
          Almost done!
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}

export { FOCUS_PRESETS };