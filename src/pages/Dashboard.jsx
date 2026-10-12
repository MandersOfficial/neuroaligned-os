import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAppRefresh } from '@/hooks/useAppRefresh';
import RegulationWidget from '@/components/regulation/RegulationWidget';
import TrialBanner from '@/components/subscription/TrialBanner';
import { trialDaysLeft as getTrialDaysLeft } from '@/lib/subscription';
import GoogleConnectWidget from '@/components/dashboard/GoogleConnectWidget';
import GettingStartedFlow, { DONE_KEY } from '@/components/getting-started/GettingStartedFlow';
import EnergyPicker from '@/components/dashboard/EnergyPicker';
import TodayFocusList from '@/components/dashboard/TodayFocusList';
import PersonalizedInsight from '@/components/dashboard/PersonalizedInsight';
import ActiveProjectsCard from '@/components/dashboard/ActiveProjectsCard';
import QuickActions from '@/components/dashboard/QuickActions';
import ProfileSummaryCard from '@/components/dashboard/ProfileSummaryCard';
import { InlineSpinner } from '@/components/workspace/LoadingScreen';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const { user } = useOutletContext();
  const [profile, setProfile] = useState(null);
  const [energy, setEnergy] = useState('flow');
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [trialDaysLeft, setTrialDaysLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGettingStarted, setShowGettingStarted] = useState(false);

  const load = async () => {
    const [t, subs, profiles, proj] = await Promise.all([
      base44.entities.Task.filter({ is_today: true }),
      base44.entities.Subscription.filter({ user_email: user.email }, '-created_date', 1),
      base44.entities.UserProfile.filter({ user_email: user.email }),
      base44.entities.Project.filter({ status: 'active' }, '-created_date', 5),
    ]);
    setTasks(t);
    setProjects(proj);
    if (profiles.length > 0) {
      const p = profiles[0];
      setProfile(p);
      if (p.last_brain_state) setEnergy(p.last_brain_state);
    }
    const sub = subs[0] || null;
    setSubscription(sub);
    // Founding members have free lifetime access, so no countdown for them.
    setTrialDaysLeft(getTrialDaysLeft(sub));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  // First post-login visit: launch the guided "how to use the app" flow.
  useEffect(() => {
    if (!localStorage.getItem(DONE_KEY)) setShowGettingStarted(true);
  }, []);
  useAppRefresh(load);

  const handleToggleTask = async (task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    const updated = await base44.entities.Task.update(task.id, { status: newStatus });
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, ...updated } : t));
  };

  const firstName = user?.full_name?.split(' ')[0] || 'there';

  if (loading) return <InlineSpinner />;

  return (
    <>
      {showGettingStarted && (
        <GettingStartedFlow user={user} onComplete={() => setShowGettingStarted(false)} />
      )}

      <div className="flex-1 overflow-y-auto">
        <TrialBanner daysLeft={trialDaysLeft} />

        <div className="max-w-3xl mx-auto px-5 lg:px-8 py-7 space-y-6">

          {/* Greeting */}
          <div>
            <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground mt-0.5">
              {getGreeting()}, {firstName} 👋
            </h1>
            {profile?.neurotypes?.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {profile.neurotypes.slice(0, 2).join(' · ')} · {profile.work_style || 'Your style'}
              </p>
            )}
          </div>

          {/* Energy check-in — one slim row of pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Energy right now</span>
            <EnergyPicker energy={energy} onChange={setEnergy} />
          </div>

          {/* Personalized insight */}
          <PersonalizedInsight profile={profile} energy={energy} />

          {/* Today's tasks */}
          <TodayFocusList tasks={tasks} energy={energy} onToggle={handleToggleTask} />

          {/* Projects */}
          <ActiveProjectsCard projects={projects} />

          {/* Quick actions — personalized based on onboarding */}
          <QuickActions profile={profile} />

          {/* Bottom widgets */}
          <div className="grid sm:grid-cols-2 gap-5">
            <GoogleConnectWidget />
            <ProfileSummaryCard profile={profile} subscription={subscription} onTakeTour={() => setShowGettingStarted(true)} />
          </div>

        </div>
      </div>

      <RegulationWidget />
    </>
  );
}