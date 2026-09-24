/**
 * Mini palette preview for a theme card — renders the same palette twice,
 * once in its light set and once in its dark set, so both are visible
 * before the user commits to a choice.
 */
export default function ThemePreview({ theme, darkMode }) {
  const panels = [
    { label: 'Light', vars: theme.vars, active: !darkMode },
    { label: 'Dark', vars: theme.darkVars, active: !!darkMode },
  ];

  return (
    <div className="flex gap-2 mt-3">
      {panels.map(({ label, vars, active }) => (
        <div
          key={label}
          className={`flex-1 rounded-lg border border-border/50 px-2 py-2 ${
            active ? 'ring-1 ring-primary/40' : ''
          }`}
          style={{ background: `hsl(${vars['--background']})` }}
        >
          <div className="flex items-center gap-1.5">
            <span
              className="w-4 h-4 rounded-md shrink-0"
              style={{ background: `hsl(${vars['--primary']})` }}
            />
            <span
              className="text-[11px] font-semibold"
              style={{ color: `hsl(${vars['--foreground']})` }}
            >
              Aa
            </span>
            <span
              className="ml-auto text-[9px] uppercase tracking-wider font-semibold"
              style={{ color: `hsl(${vars['--muted-foreground']})` }}
            >
              {label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}