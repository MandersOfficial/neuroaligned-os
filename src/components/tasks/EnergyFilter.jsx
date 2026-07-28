import { Leaf, Zap, Flame } from 'lucide-react';

const OPTIONS = [
  { value: 'all', label: 'All', icon: null },
  { value: 'low', label: 'Low', icon: Leaf, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  { value: 'medium', label: 'Medium', icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
  { value: 'high', label: 'High', icon: Flame, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
];

export default function EnergyFilter({ value, onChange, tasks }) {
  const counts = { all: 0, low: 0, medium: 0, high: 0 };
  tasks.forEach(t => {
    if (t.status === 'done') return;
    counts.all++;
    const e = t.energy_required || 'medium';
    if (counts[e] !== undefined) counts[e]++;
  });

  return (
    <div className="flex items-center gap-2 px-6 py-2.5 border-b border-border/40 overflow-x-auto shrink-0">
      <span className="text-xs font-medium text-muted-foreground shrink-0 mr-1">Energy</span>
      {OPTIONS.map(opt => {
        const Icon = opt.icon;
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              active
                ? opt.value === 'all'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : `${opt.bg} ${opt.color}`
                : 'border-border text-muted-foreground hover:text-foreground bg-card'
            }`}
          >
            {Icon && <Icon className="w-3 h-3" />}
            {opt.label}
            <span className={`ml-0.5 text-[10px] ${active ? 'opacity-70' : 'opacity-50'}`}>{counts[opt.value]}</span>
          </button>
        );
      })}
    </div>
  );
}