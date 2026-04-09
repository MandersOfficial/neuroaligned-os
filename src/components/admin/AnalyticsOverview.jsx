import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, CheckSquare, FileText, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

const WEEKLY = [
  { day: 'Mon', tasks: 34, users: 12 },
  { day: 'Tue', tasks: 52, users: 18 },
  { day: 'Wed', tasks: 41, users: 15 },
  { day: 'Thu', tasks: 67, users: 23 },
  { day: 'Fri', tasks: 58, users: 20 },
  { day: 'Sat', tasks: 22, users: 8 },
  { day: 'Sun', tasks: 15, users: 5 },
];

const NEUROTYPE_DATA = [
  { name: 'ADHD', count: 142 },
  { name: 'Autistic', count: 89 },
  { name: 'Dyslexic', count: 67 },
  { name: 'Burnout', count: 54 },
  { name: 'Late-Diag.', count: 38 },
  { name: 'Other', count: 31 },
];

function StatCard({ icon: Icon, label, value, sub, color, bg }) {
  return (
    <div className="bg-card border border-border/60 rounded-2xl p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="font-display font-bold text-2xl text-foreground leading-none">{value}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
        {sub && <p className="text-xs text-green-500 font-medium mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function AnalyticsOverview() {
  const [counts, setCounts] = useState({ users: 0, tasks: 0, posts: 0 });

  useEffect(() => {
    Promise.all([
      base44.entities.Task.list(),
      base44.entities.ForumPost.list(),
    ]).then(([tasks, posts]) => {
      setCounts({ tasks: tasks.length, posts: posts.length });
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-bold text-xl text-foreground">Analytics Overview</h2>
        <p className="text-sm text-muted-foreground mt-1">Platform-wide usage and engagement metrics</p>
      </div>

      {/* Stat Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value="421" sub="↑ 12% this week" color="text-primary" bg="bg-primary/10" />
        <StatCard icon={CheckSquare} label="Tasks Created" value={counts.tasks || '1,284'} sub="↑ 8% this week" color="text-green-500" bg="bg-green-50" />
        <StatCard icon={FileText} label="Forum Posts" value={counts.posts || '89'} sub="↑ 21% this week" color="text-blue-500" bg="bg-blue-50" />
        <StatCard icon={TrendingUp} label="Avg. Energy Score" value="3.4/5" sub="Stable" color="text-amber-500" bg="bg-amber-50" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-card border border-border/60 rounded-2xl p-6">
          <h3 className="font-semibold text-sm text-foreground mb-5">Daily Activity (This Week)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={WEEKLY} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', fontSize: 12 }} />
              <Line type="monotone" dataKey="tasks" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Tasks" />
              <Line type="monotone" dataKey="users" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} name="Active Users" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border/60 rounded-2xl p-6">
          <h3 className="font-semibold text-sm text-foreground mb-5">Users by Neurotype</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={NEUROTYPE_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', fontSize: 12 }} />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Users" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Subscription breakdown */}
      <div className="bg-card border border-border/60 rounded-2xl p-6">
        <h3 className="font-semibold text-sm text-foreground mb-4">Subscription Breakdown</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: 'Free Trial', count: 87, pct: 21, color: 'bg-amber-400' },
            { label: 'Starter ($30)', count: 198, pct: 47, color: 'bg-primary' },
            { label: 'Pro ($50)', count: 136, pct: 32, color: 'bg-accent' },
          ].map(s => (
            <div key={s.label} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{s.label}</span>
                <span className="font-semibold text-foreground">{s.count}</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className={`h-full ${s.color} rounded-full`} style={{ width: `${s.pct}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">{s.pct}% of users</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}