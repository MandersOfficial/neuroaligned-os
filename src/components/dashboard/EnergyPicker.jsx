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
    <div className="grid grid-cols-4 gap-2">
      {ENERGY_OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border-2 text-center transition-all ${
            energy === opt.value ? opt.bg + ' shadow-sm' : 'border-border bg-card hover:bg-secondary'
          }`}
        >
          <span className="text-xl leading-none">{opt.emoji}</span>
          <span className={`text-[10px] font-semibold leading-tight ${energy === opt.value ? opt.color : 'text-muted-foreground'}`}>
            {opt.label}
          </span>
        </button>
      ))}
    </div>
  );
}