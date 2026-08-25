import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, CheckSquare, FileText, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

function buildWeek() {
  const days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push({
      date: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      tasks: 0,
      users: 0,
    });
  }
  return days;
}

function dayKey(ts) {
  if (!ts) return null;
  return String(ts).slice(0, 10);
}

function StatCard({ icon: Icon, label, value, sub, color, bg }) {
  return (
    <div className="bg-card border border-border/60 rounded-2xl p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="font-display font-bold text-2xl text-foreground leading-none">{value}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
        {sub && <p className="text-xs text-muted-foreground font-medium mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function AnalyticsOverview() {
  const [data, setData] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.User.list('-created_date', 1000),
      base44.entities.Task.list('-created_date', 1000),
      base44.entities.ForumPost.list('-created_date', 1000),
      base44.entities.UserProfile.list('-created_date', 1000),
      base44.entities.Subscription.list('-created_date', 1000),
    ]).then(([users, tasks, posts, profiles, subscriptions]) => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Daily activity (last 7 days)
      const weekly = buildWeek();
      const dayMap = Object.fromEntries(weekly.map(d => [d.date, d]));
      for (const t of tasks) {
        const k = dayKey(t.created_date);
        if (dayMap[k]) dayMap[k].tasks++;
      }
      for (const u of users) {
        const k = dayKey(u.created_date);
        if (dayMap[k]) dayMap[k].users++;
      }

      const tasksThisWeek = tasks.filter(t => dayKey(t.created_date) && dayKey(t.created_date) >= weekAgo).length;
      const usersThisWeek = users.filter(u => dayKey(u.created_date) && dayKey(u.created_date) >= weekAgo).length;

      // Neurotype breakdown from real profiles
      const nt = {};
      for (const p of profiles) {
        for (const n of (p.neurotypes || [])) {
          nt[n] = (nt[n] || 0) + 1;
        }
      }
      const neurotypeData = Object.entries(nt)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      // Subscription breakdown from real subscriptions
      const planCounts = { trial: 0, starter: 0, pro: 0, cancelled: 0 };
      for (const s of subscriptions) {
        const plan = s.plan || 'trial';
        if (planCounts[plan] !== undefined) planCounts[plan]++;
        else planCounts.trial++;
      }
      const totalSubs = subscriptions.length || 1;
      const subBreakdown = [
        { label: 'Free Trial', count: planCounts.trial, pct: Math.round((planCounts.trial / totalSubs) * 100), color: 'bg-amber-400' },
        { label: 'Starter ($30)', count: planCounts.starter, pct: Math.round((planCounts.starter / totalSubs) * 100), color: 'bg-primary' },
        { label: 'Pro ($50)', count: planCounts.pro, pct: Math.round((planCounts.pro / totalSubs) * 100), color: 'bg-accent' },
      ];

      const checkins = profiles.reduce((sum, p) => sum + (p.session_count || 0), 0);

      setData({
        users: users.length,
        tasks: tasks.length,
        posts: posts.length,
        checkins,
        tasksThisWeek,
        usersThisWeek,
        weekly,
        neurotypeData,
        subBreakdown,
        hasSubs: subscriptions.length > 0,
      });
    }).catch(() => setData(null));
  }, []);

  const loading = !data;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-bold text-xl text-foreground">Analytics Overview</h2>
        <p className="text-sm text-muted-foreground mt-1">Platform-wide usage and engagement metrics</p>
      </div>

      {/* Stat Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={loading ? '—' : data.users} sub={loading ? '' : `${data.usersThisWeek} new this week`} color="text-primary" bg="bg-primary/10" />
        <StatCard icon={CheckSquare} label="Tasks Created" value={loading ? '—' : data.tasks} sub={loading ? '' : `${data.tasksThisWeek} this week`} color="text-green-500" bg="bg-green-50" />
        <StatCard icon={FileText} label="Forum Posts" value={loading ? '—' : data.posts} sub={loading ? '' : 'All time'} color="text-blue-500" bg="bg-blue-50" />
        <StatCard icon={Activity} label="Check-ins" value={loading ? '—' : data.checkins} sub={loading ? '' : 'Total sessions'} color="text-amber-500" bg="bg-amber-50" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-card border border-border/60 rounded-2xl p-6">
          <h3 className="font-semibold text-sm text-foreground mb-5">Daily Activity (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={loading ? [] : data.weekly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', fontSize: 12 }} />
              <Line type="monotone" dataKey="tasks" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Tasks created" />
              <Line type="monotone" dataKey="users" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} name="New users" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border/60 rounded-2xl p-6">
          <h3 className="font-semibold text-sm text-foreground mb-5">Users by Neurotype</h3>
          {loading || data.neurotypeData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
              No profile data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.neurotypeData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', fontSize: 12 }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Users" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Subscription breakdown */}
      <div className="bg-card border border-border/60 rounded-2xl p-6">
        <h3 className="font-semibold text-sm text-foreground mb-4">Subscription Breakdown</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {(loading ? [] : data.subBreakdown).map(s => (
            <div key={s.label} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{s.label}</span>
                <span className="font-semibold text-foreground">{s.count}</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className={`h-full ${s.color} rounded-full`} style={{ width: `${data.hasSubs ? s.pct : 0}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">{data.hasSubs ? s.pct : 0}% of subscribers</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}