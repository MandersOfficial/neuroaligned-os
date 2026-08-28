import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, CheckSquare, FileText, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';


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
    // Personal entities are owner-only at the RLS level, so platform-wide
    // numbers come from the service-role admin analytics function.
    base44.functions.invoke('getAdminAnalytics')
      .then(res => { setData(res?.data ?? res); })
      .catch(() => setData(null));
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