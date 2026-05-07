import { useMemo } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Zap, Leaf, Flame } from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';

const ENERGY_COLORS = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#f97316',
};

function buildDailyData(tasks, days = 14) {
  const buckets = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = format(subDays(new Date(), i), 'MMM d');
    buckets[d] = { date: d, completed: 0, low: 0, medium: 0, high: 0 };
  }

  tasks.forEach(task => {
    if (task.status !== 'done' || !task.completed_at) return;
    const d = format(startOfDay(new Date(task.completed_at)), 'MMM d');
    if (!buckets[d]) return;
    buckets[d].completed += 1;
    const energy = task.energy_required || 'medium';
    buckets[d][energy] = (buckets[d][energy] || 0) + 1;
  });

  return Object.values(buckets);
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border/60 rounded-xl px-4 py-3 shadow-lg text-xs space-y-1">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground capitalize">{p.dataKey}:</span>
          <span className="font-medium text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function ProductivityTrends({ tasks }) {
  const data = useMemo(() => buildDailyData(tasks, 14), [tasks]);

  const totalCompleted = data.reduce((s, d) => s + d.completed, 0);
  const bestDay = data.reduce((best, d) => d.completed > best.completed ? d : best, data[0] || {});
  const avgPerDay = totalCompleted > 0 ? (totalCompleted / 14).toFixed(1) : 0;

  const energyBreakdown = tasks.filter(t => t.status === 'done').reduce((acc, t) => {
    const e = t.energy_required || 'medium';
    acc[e] = (acc[e] || 0) + 1;
    return acc;
  }, { low: 0, medium: 0, high: 0 });
  const totalDone = Object.values(energyBreakdown).reduce((s, v) => s + v, 0);

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Completed (14d)', value: totalCompleted, icon: TrendingUp, color: 'text-primary' },
          { label: 'Daily Average', value: avgPerDay, icon: Zap, color: 'text-yellow-500' },
          { label: 'Best Day', value: bestDay?.completed || 0, sub: bestDay?.date, icon: Flame, color: 'text-orange-500' },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border/60 rounded-2xl p-4 space-y-1">
            <Icon className={`w-4 h-4 ${color}`} />
            <p className="font-display font-bold text-xl text-foreground">{value}</p>
            <p className="text-[11px] text-muted-foreground leading-tight">{label}</p>
            {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
          </div>
        ))}
      </div>

      {/* Completion trend chart */}
      <div className="bg-card border border-border/60 rounded-2xl p-5">
        <p className="text-sm font-semibold text-foreground mb-4">Task Completions — Last 14 Days</p>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} interval={2} />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="completed" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#completedGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Energy breakdown chart */}
      <div className="bg-card border border-border/60 rounded-2xl p-5">
        <p className="text-sm font-semibold text-foreground mb-1">Energy Level Breakdown</p>
        <p className="text-xs text-muted-foreground mb-4">Which energy-level tasks do you actually complete?</p>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} interval={2} />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="low" stackId="a" fill={ENERGY_COLORS.low} radius={[0, 0, 0, 0]} />
            <Bar dataKey="medium" stackId="a" fill={ENERGY_COLORS.medium} />
            <Bar dataKey="high" stackId="a" fill={ENERGY_COLORS.high} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        {/* Legend */}
        <div className="flex items-center gap-4 mt-3">
          {[['low', 'Low energy', ENERGY_COLORS.low], ['medium', 'Medium energy', ENERGY_COLORS.medium], ['high', 'High energy', ENERGY_COLORS.high]].map(([key, label, color]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
              <span className="text-xs text-muted-foreground">{label}</span>
              {totalDone > 0 && (
                <span className="text-xs font-semibold text-foreground">
                  {Math.round((energyBreakdown[key] / totalDone) * 100)}%
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}