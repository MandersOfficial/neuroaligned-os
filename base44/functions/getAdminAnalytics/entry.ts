import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { isOwnerAdmin } from "../../shared/adminGate.ts";

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

/**
 * Returns the analytics aggregates the admin dashboard needs, computed from
 * ALL records via the service role. Personal entities are locked to owner-only
 * reads at the RLS level (admins only see their own on regular pages), so the
 * admin dashboard pulls platform-wide numbers through this function instead.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!isOwnerAdmin(user)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [users, tasks, profiles, subscriptions] = await Promise.all([
      base44.asServiceRole.entities.User.list('-created_date', 1000),
      base44.asServiceRole.entities.Task.list('-created_date', 1000),
      base44.asServiceRole.entities.UserProfile.list('-created_date', 1000),
      base44.asServiceRole.entities.Subscription.list('-created_date', 1000),
    ]);

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

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

    const nt = {};
    for (const p of profiles) {
      for (const n of (p.neurotypes || [])) {
        nt[n] = (nt[n] || 0) + 1;
      }
    }
    const neurotypeData = Object.entries(nt)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const planCounts = { trial: 0, starter: 0, pro: 0, cancelled: 0 };
    for (const s of subscriptions) {
      const plan = s.plan || 'trial';
      if (planCounts[plan] !== undefined) planCounts[plan]++;
      else planCounts.trial++;
    }
    const totalSubs = subscriptions.length || 1;
    const subBreakdown = [
      { label: 'Free Trial', count: planCounts.trial, pct: Math.round((planCounts.trial / totalSubs) * 100), color: 'bg-amber-400' },
      { label: 'Starter ($19.99)', count: planCounts.starter, pct: Math.round((planCounts.starter / totalSubs) * 100), color: 'bg-primary' },
      { label: 'Pro ($45.99)', count: planCounts.pro, pct: Math.round((planCounts.pro / totalSubs) * 100), color: 'bg-accent' },
    ];

    const checkins = profiles.reduce((sum, p) => sum + (p.session_count || 0), 0);

    return Response.json({
      users: users.length,
      tasks: tasks.length,
      checkins,
      tasksThisWeek,
      usersThisWeek,
      weekly,
      neurotypeData,
      subBreakdown,
      hasSubs: subscriptions.length > 0,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}