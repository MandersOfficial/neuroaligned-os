import { ChevronDown } from 'lucide-react';

export default function DatabaseSelect({ databases, value, onChange, loading }) {
  return (
    <div className="relative">
      <select
        className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary appearance-none disabled:opacity-50"
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={loading || databases.length === 0}
      >
        <option value="">Select a database…</option>
        {databases.map(db => (
          <option key={db.id} value={db.id}>{db.name}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
    </div>
  );
}