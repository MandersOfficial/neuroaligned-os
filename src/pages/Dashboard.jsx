import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import EnergyCheckIn from '../components/dashboard/EnergyCheckIn';
import TodayTasks from '../components/dashboard/TodayTasks';
import RegulationTools from '../components/dashboard/RegulationTools';
import DailyInsight from '../components/dashboard/DailyInsight';
import QuickStats from '../components/dashboard/QuickStats';
import RegulationWidget from '../components/regulation/RegulationWidget';
import TrialBanner from '../components/subscription/TrialBanner';
import EisenhowerMatrix from '../components/dashboard/EisenhowerMatrix';
import RegulationZoneWidget from '../components/dashboard/RegulationZoneWidget';

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
  const [profile, setProfile] = useState(null);
  const [energy, setEnergy] = useState('flow');
  const [trialDaysLeft, setTrialDaysLeft] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const u = await base44.auth.me();
      setUser(u);
      const [t, subs, profiles] = await Promise.all([
        base44.entities.Task.filter({ is_today: true }),
        base44.entities.Subscription.filter({ created_by: u.email }, '-created_date', 1),
        base44.entities.UserProfile.filter({ user_email: u.email }),
      ]);
      setTasks(t);
      if (profiles.length > 0) setProfile(profiles[0]);
      const sub = subs[0];
      if (sub?.trial_end_date) {
        const days = Math.max(0, Math.ceil((new Date(sub.trial_end_date) - new Date()) / (1000 * 60 * 60 * 24)));
        setTrialDaysLeft(days);
      }
      setLoading(false);
    };
    load();
  }, []);

  const navigate = useNavigate();
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

          {/* Quick actions row */}
          <div className="grid sm:grid-cols-2 gap-3">
            <Link
              to="/check-in"
              className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-primary/5 border border-primary/15 hover:bg-primary/10 transition-colors group"
            >
              <span className="text-xl">🧠</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">How's your brain right now?</p>
                <p className="text-xs text-muted-foreground">Start your session with a check-in</p>
              </div>
              <span className="text-muted-foreground group-hover:text-foreground transition-colors text-sm">→</span>
            </Link>
            <button
              onClick={() => navigate('/body-doubling')}
              className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-green-500/5 border border-green-500/20 hover:bg-green-500/10 transition-colors group text-left"
            >
              <span className="text-xl">👥</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Start Body Doubling</p>
                <p className="text-xs text-muted-foreground">25-min focus sprint with a peer</p>
              </div>
              <span className="text-muted-foreground group-hover:text-foreground transition-colors text-sm">→</span>
            </button>
          </div>

          {/* Insight */}
          <DailyInsight energy={energy} />

          {/* Quick Stats */}
          <QuickStats tasks={tasks} />

          {/* Eisenhower Matrix */}
          <EisenhowerMatrix tasks={tasks} />

          {/* Main content grid */}
          <div className="grid lg:grid-cols-[1fr_300px] gap-5">
            {/* Tasks */}
            <TodayTasks tasks={tasks} onTasksChange={setTasks} energy={energy} profile={profile} />

            {/* Sidebar tools */}
            <div className="space-y-5">
              <RegulationZoneWidget lastBrainState={profile?.last_brain_state} />
              <RegulationTools />

              {/* Profile Summary */}
              <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-3">
                <h4 className="font-display font-semibold text-sm text-foreground">Your Profile</h4>
                <div className="space-y-2">
                  {[
                    ['Neurotype', profile?.neurotypes?.length > 0 ? profile.neurotypes.slice(0, 2).join(' · ') : 'Not set'],
                    ['Peak Window', profile?.energy_peak || 'Not set'],
                    ['Work Style', profile?.work_style || 'Not set'],
                    ['Plan', trialDaysLeft != null ? `Trial · ${trialDaysLeft}d left` : 'Active'],
                  ].map(([label, val]) => (
                    <div key={label} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium text-foreground truncate ml-2 text-right max-w-[130px]">{val}</span>
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