import MobileSelect from '@/components/ui/MobileSelect';

export default function DatabaseSelect({ databases, value, onChange, loading }) {
  return (
    <MobileSelect
      value={value}
      onChange={onChange}
      options={[{ value: '', label: 'Select a database…' }, ...databases.map(db => ({ value: db.id, label: db.name }))]}
      placeholder={loading ? 'Loading databases…' : 'Select a database…'}
      label="Notion database"
      className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground"
    />
  );
}