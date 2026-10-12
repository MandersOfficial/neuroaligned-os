const ENERGY_OPTIONS = [
  { value: 'hyperfocus', emoji: '⚡', label: 'Hyperfocus', color: 'text-violet-600', bg: 'bg-violet-50 border-violet-200' },
  { value: 'flow', emoji: '🌊', label: 'Flow', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  { value: 'sluggish', emoji: '🌧️', label: 'Sluggish', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  { value: 'burnout_risk', emoji: '🚨', label: 'Burnout Risk', color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
];

// Which task energy levels are visible per energy state
export const ENERGY_TASK_FILTER = {
  hyperfocus: ['high', 'medium', 'low'],
  flow: ['medium', 'low'],
  sluggish: ['low'],
  burnout_risk: [],
};

export default function EnergyPicker({ energy, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {ENERGY_OPTIONS.map(opt => {
        const active = energy === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-all ${
              active ? `${opt.bg} ${opt.color}` : 'border-border text-muted-foreground hover:bg-secondary'
            }`}
          >
            <span className="text-sm leading-none">{opt.emoji}</span>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}