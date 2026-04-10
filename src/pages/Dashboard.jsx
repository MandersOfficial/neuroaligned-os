import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import EnergyCheckIn from '../components/dashboard/EnergyCheckIn';
import TodayTasks from '../components/dashboard/TodayTasks';
import RegulationTools from '../components/dashboard/RegulationTools';
import DailyInsight from '../components/dashboard/DailyInsight';
import QuickStats from '../components/dashboard/QuickStats';
import RegulationWidget from '../components/regulation/RegulationWidget';
import TrialBanner from '../components/subscription/TrialBanner';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getDate() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [energy, setEnergy] = useState(3);
  const [trialDaysLeft, setTrialDaysLeft] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [u, t, subs] = await Promise.all([
        base44.auth.me(),
        base44.entities.Task.filter({ is_today: true }),
        base44.entities.Subscription.list('-created_date', 1),
      ]);
      setUser(u);
      setTasks(t);
      const sub = subs.find(s => s.user_email === u.email);
      if (sub?.trial_end_date) {
        const days = Math.max(0, Math.ceil((new Date(sub.trial_end_date) - new Date()) / (1000 * 60 * 60 * 24)));
        setTrialDaysLeft(days);
      } else if (!sub || sub.plan === 'trial') {
        setTrialDaysLeft(10); // default mock
      }
      setLoading(false);
    };
    load();
  }, []);

  const firstName = user?.full_name?.split(' ')[0] || 'there';

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <DashboardSidebar user={user} />

      {/* Main */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <TrialBanner daysLeft={trialDaysLeft} />
        <div className="max-w-5xl mx-auto px-5 lg:px-8 py-7 space-y-6">

          {/* Top bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{getDate()}</p>
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground mt-0.5">
                {getGreeting()}, {firstName} 👋
              </h1>
            </div>
            <EnergyCheckIn energy={energy} onEnergyChange={setEnergy} />
          </div>

          {/* Insight */}
          <DailyInsight energy={energy} />

          {/* Quick Stats */}
          <QuickStats tasks={tasks} />

          {/* Main content grid */}
          <div className="grid lg:grid-cols-[1fr_300px] gap-5">
            {/* Tasks */}
            <TodayTasks tasks={tasks} onTasksChange={setTasks} />

            {/* Sidebar tools */}
            <div className="space-y-5">
              <RegulationTools />

              {/* Brain Tip */}
              <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-3">
                <h4 className="font-display font-semibold text-sm text-foreground">Your Profile</h4>
                <div className="space-y-2">
                  {[
                    ['Neurotype', 'ADHD · Autistic'],
                    ['Peak Window', 'Morning 9–12pm'],
                    ['Work Style', 'Deep focus blocks'],
                    ['Plan', 'Pro · 14-day trial'],
                  ].map(([label, val]) => (
                    <div key={label} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium text-foreground">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <RegulationWidget />
    </div>
  );
}